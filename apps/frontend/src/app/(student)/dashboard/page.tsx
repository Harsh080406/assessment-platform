import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import StartAssessmentButton from "@/components/StartAssessmentButton";
import StudentProgressBar from "@/components/student/StudentProgressBar";
import StudentModuleRow from "@/components/student/StudentModuleRow";
import { AssessmentStatus, AttemptStatus } from "@prisma/client";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = session.user.id;

  // Fetch student user, attempts, responses & active assessment definition
  const [user, activeAssessment] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        attempts: {
          include: {
            assessment: {
              include: {
                sections: {
                  orderBy: { displayOrder: "asc" },
                  include: {
                    _count: {
                      select: { questions: true },
                    },
                  },
                },
              },
            },
            responses: {
              select: {
                questionId: true,
                answer: true,
                question: {
                  select: {
                    sectionId: true,
                  },
                },
              },
            },
          },
          orderBy: { startedAt: "desc" },
        },
      },
    }),
    prisma.assessment.findFirst({
      where: { status: AssessmentStatus.ACTIVE },
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
    }),
  ]);

  const studentName = user?.studentProfile
    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`.trim()
    : session.user.name || "Alex Student";

  const firstName = user?.studentProfile?.firstName || studentName.split(" ")[0] || "Alex";
  const location = user?.studentProfile?.country || null;
  const bio = user?.studentProfile?.bio || null;

  // Dynamic greeting based on current time
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // Determine active and completed attempts
  const attempts = user?.attempts || [];
  const completedAttempts = attempts.filter(
    (a) => a.status === AttemptStatus.SUBMITTED || a.status === AttemptStatus.PUBLISHED
  );
  const activeAttempt = attempts.find(
    (a) => a.status === AttemptStatus.IN_PROGRESS || a.status === AttemptStatus.NOT_STARTED
  );

  const completedAttempt = completedAttempts[0] || null;
  const targetAttempt = activeAttempt || completedAttempt || null;
  const isOverallCompleted = !activeAttempt && !!completedAttempt;

  const sections =
    targetAttempt?.assessment?.sections ||
    activeAssessment?.sections ||
    [];

  // Map each section ID to the count of unique answered questions
  const answeredCountBySectionId = new Map<string, number>();
  if (targetAttempt?.responses) {
    const answeredMap = new Map<string, Set<string>>();
    for (const resp of targetAttempt.responses) {
      if (resp.answer !== null && resp.answer !== undefined && resp.question?.sectionId) {
        const sId = resp.question.sectionId;
        const set = answeredMap.get(sId) || new Set<string>();
        set.add(resp.questionId);
        answeredMap.set(sId, set);
      }
    }
    for (const [sId, set] of answeredMap.entries()) {
      answeredCountBySectionId.set(sId, set.size);
    }
  }

  const moduleTemplates = [
    {
      id: "psychometric-diagnostic",
      subtitle: "Module A",
      title: "Psychometric Assessment",
      description: "Core cognitive styles, analytical instincts, and intrinsic motivators.",
      duration: "~25 mins",
      fallbackQuestions: 42,
    },
    {
      id: "personality-work-style",
      subtitle: "Module B",
      title: "Competency Self-Report",
      description: "Behavioral competencies, work preferences, and leadership traits.",
      duration: "~15 mins",
      fallbackQuestions: 16,
    },
    {
      id: "cognitive-analytical",
      subtitle: "Module C",
      title: "Situational Judgment Test",
      description: "Real-world workplace dilemma scenarios and decision-making dynamics.",
      duration: "~30 mins",
      fallbackQuestions: 38,
    },
    {
      id: "career-domain-fit",
      subtitle: "Module D",
      title: "Aptitude: Verbal, Numerical & Logical Reasoning",
      description: "Objective cognitive aptitude battery measuring verbal deduction and reasoning.",
      duration: "~35 mins",
      fallbackQuestions: 30,
    },
  ];

  const modules = moduleTemplates.map((template, idx) => {
    const section = sections[idx] || null;
    const totalQuestions = section?._count?.questions ?? template.fallbackQuestions;
    const answeredCount = isOverallCompleted
      ? totalQuestions
      : section
      ? answeredCountBySectionId.get(section.id) ?? 0
      : 0;

    const isCompleted = isOverallCompleted || (totalQuestions > 0 && answeredCount >= totalQuestions);
    const isInProgress = !isCompleted && answeredCount > 0;
    const progress = isCompleted
      ? 100
      : totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

    return {
      ...template,
      sectionIndex: idx,
      totalQuestions,
      answeredCount,
      progress,
      isCompleted,
      isInProgress,
      status: isCompleted ? "COMPLETED" : isInProgress ? "IN_PROGRESS" : "READY",
    };
  });

  const completedCount = modules.filter((m) => m.isCompleted).length;
  const inProgressCount = modules.filter((m) => m.isInProgress).length;
  const totalJourneyAssessments = 4;
  const remainingCount = Math.max(0, totalJourneyAssessments - completedCount - inProgressCount);

  // Overall journey progress: based on total answered questions across all modules
  const totalQuestionsAll = modules.reduce((sum, m) => sum + m.totalQuestions, 0);
  const totalAnsweredAll = modules.reduce((sum, m) => sum + m.answeredCount, 0);
  const overallProgress = isOverallCompleted
    ? 100
    : totalQuestionsAll > 0
    ? Math.min(100, Math.round((totalAnsweredAll / totalQuestionsAll) * 100))
    : 0;

  // Current focal module for the "Continue" card
  const currentModule =
    modules.find((m) => m.isInProgress) ||
    modules.find((m) => !m.isCompleted) ||
    modules[0];

  // Missing profile items calculation
  const missingItems = [];
  if (!location) missingItems.push("Country / Location");
  if (!bio) missingItems.push("Target Career Aspirations");
  if (!user?.phone && !user?.studentProfile?.phone) missingItems.push("Phone Number");

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 2-Column Responsive Layout: 8 cols main + 4 cols context rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* ========================================================================= */}
        {/* MAIN COLUMN (8 of 12 cols on desktop)                                     */}
        {/* ========================================================================= */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* 1. CONTINUE WHERE YOU LEFT OFF CARD (Hero Replacement) */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="space-y-4">
              {/* Greeting */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748B]">
                  {timeGreeting}, <span className="font-semibold text-[#0F172A]">{firstName}</span>
                </span>
                <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
                  Active Journey
                </span>
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                  {isOverallCompleted
                    ? "Your assessment is complete."
                    : "Continue your journey toward career clarity."}
                </h1>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mt-1">
                  {isOverallCompleted
                    ? "Your responses are in evaluation. Track review milestones and download certified reports."
                    : `Next up: ${currentModule.subtitle} — ${currentModule.title}. Complete your questions to calibrate your leadership report.`}
                </p>
              </div>

              {/* Active Module Progress Strip */}
              {!isOverallCompleted && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A]">
                      {currentModule.subtitle}: {currentModule.title}
                    </span>
                    <span className="text-[#64748B] tabular-nums font-medium">
                      {currentModule.answeredCount} of {currentModule.totalQuestions} questions
                    </span>
                  </div>

                  <StudentProgressBar
                    value={currentModule.progress}
                    showPercentage={false}
                  />

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      Estimated time: {currentModule.duration}
                    </span>
                    <span className="font-semibold text-[#0F172A] tabular-nums">
                      {currentModule.progress}% complete
                    </span>
                  </div>
                </div>
              )}

              {/* ONE Single Primary Coral Action Button + Secondary Link */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                {isOverallCompleted ? (
                  <Link
                    href="/dashboard/results"
                    className="px-5 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E05353] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <span>View Certified Results</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <StartAssessmentButton
                    label="Continue assessment"
                    variant="primary"
                    className="px-5 py-2.5 text-xs sm:text-sm"
                    sectionIndex={currentModule.sectionIndex}
                    moduleId={currentModule.id}
                  />
                )}

                <Link
                  href="/dashboard/assessments"
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition-colors inline-flex items-center gap-1 min-h-[44px]"
                >
                  <span>View all modules</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                </Link>
              </div>
            </div>
          </section>

          {/* 2. YOUR PROGRESS CARD */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                  Your progress
                </h2>
                <p className="text-xs text-[#64748B]">
                  Overall completion across all 4 evaluation modules
                </p>
              </div>

              <Link
                href="/dashboard/results"
                className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
              >
                <span>View results pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Central Progress Bar */}
            <StudentProgressBar
              value={overallProgress}
              label="Overall journey completion"
              showPercentage={true}
            />

            {/* 3 Inline Figures + Quiet Secondary Metric Strip */}
            <div className="pt-3 border-t border-[#F1F5F9] grid grid-cols-3 gap-3 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Completed
                </span>
                <div className="text-base sm:text-lg font-bold text-[#0F172A] mt-0.5 tabular-nums">
                  {completedCount} <span className="text-xs font-normal text-[#64748B]">/ 4 modules</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  In progress
                </span>
                <div className="text-base sm:text-lg font-bold text-[#4F46E5] mt-0.5 tabular-nums">
                  {inProgressCount} <span className="text-xs font-normal text-[#64748B]">module{inProgressCount === 1 ? "" : "s"}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Remaining
                </span>
                <div className="text-base sm:text-lg font-bold text-[#0F172A] mt-0.5 tabular-nums">
                  {remainingCount} <span className="text-xs font-normal text-[#64748B]">module{remainingCount === 1 ? "" : "s"}</span>
                </div>
              </div>
            </div>

            {/* Folded Quiet Metrics Row */}
            <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Tests done: <strong className="text-[#0F172A] font-semibold">{completedCount}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Profile depth: <strong className="text-[#0F172A] font-semibold">75%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Turnaround: <strong className="text-[#0F172A] font-semibold">48h after submission</strong>
              </span>
            </div>
          </section>

          {/* 3. MODULES COMPACT LIST ROWS */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                  Assessment modules
                </h2>
                <p className="text-xs text-[#64748B]">
                  Select any module to begin or resume your responses.
                </p>
              </div>

              <Link
                href="/dashboard/assessments"
                className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
              >
                <span>View all modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {modules.map((mod) => (
                <StudentModuleRow
                  key={mod.id}
                  id={mod.id}
                  subtitle={mod.subtitle}
                  title={mod.title}
                  description={mod.description}
                  duration={mod.duration}
                  sectionIndex={mod.sectionIndex}
                  totalQuestions={mod.totalQuestions}
                  answeredCount={mod.answeredCount}
                  progress={mod.progress}
                  isCompleted={mod.isCompleted}
                  isInProgress={mod.isInProgress}
                  status={mod.status}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT RAIL (4 of 12 cols on desktop; 4th and 5th on mobile)              */}
        {/* ========================================================================= */}
        <div className="xl:col-span-4 space-y-6 min-w-0">
          {/* 4. PROFILE COMPLETENESS CARD */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Profile completeness
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>

            {/* Profile Ring with 75% */}
            <div className="flex items-center gap-4 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E2E8F0]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-600"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-xs text-[#0F172A] tabular-nums">75%</span>
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-semibold text-[#0F172A]">
                  Good profile depth
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Completing background data improves report customization.
                </p>
              </div>
            </div>

            {/* Checklist of Recommended Details */}
            {missingItems.length > 0 && (
              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Recommended details:
                </span>
                <ul className="space-y-1.5">
                  {missingItems.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[#475569]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>Add {item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Secondary Action Button */}
            <Link
              href="/dashboard/settings"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] transition-colors shadow-2xs min-h-[44px]"
            >
              <span>Edit profile</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
            </Link>
          </section>

          {/* 5. RECENT ACTIVITY TIMELINE */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Recent activity
              </h3>
            </div>

            {/* Vertical timeline: neutral dots; green only for completed */}
            <div className="space-y-3.5 pt-1 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F1F5F9]">
              <div className="flex items-start gap-3 relative pl-0.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 mt-0.5 shrink-0 ring-4 ring-white" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#0F172A]">
                    {isOverallCompleted
                      ? "Completed all 4 modules"
                      : "Account active on Alderwood Vantage"}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {isOverallCompleted ? "Verified responses" : "Active session"}
                  </div>
                </div>
              </div>

              {activeAttempt && (
                <div className="flex items-start gap-3 relative pl-0.5">
                  <span className="w-3 h-3 rounded-full bg-[#4F46E5] mt-0.5 shrink-0 ring-4 ring-white" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#0F172A]">
                      In progress: {currentModule.title}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {currentModule.answeredCount} questions recorded
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 relative pl-0.5">
                <span className="w-3 h-3 rounded-full bg-slate-400 mt-0.5 shrink-0 ring-4 ring-white" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Student Profile Created
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Ready for evaluation
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
