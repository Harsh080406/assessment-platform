import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Brain,
  User,
  Target,
  Compass,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import StartAssessmentButton from "@/components/StartAssessmentButton";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import StudentStatusPill from "@/components/student/StudentStatusPill";
import StudentProgressBar from "@/components/student/StudentProgressBar";
import AssessmentSubmitCard from "@/components/student/AssessmentSubmitCard";
import { AssessmentStatus, AttemptStatus } from "@prisma/client";
import { checkStudentProfileCompletion } from "@/lib/profile";

export default async function StudentAssessmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/assessments");
  }

  const userId = session.user.id;

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

  const attempts = user?.attempts || [];
  const completedAttempt = attempts.find(
    (a) =>
      a.status === AttemptStatus.SUBMITTED ||
      a.status === AttemptStatus.UNDER_REVIEW ||
      a.status === AttemptStatus.REPORT_IN_PREP ||
      a.status === AttemptStatus.PENDING_APPROVAL ||
      a.status === AttemptStatus.PUBLISHED
  );
  const activeAttempt = attempts.find(
    (a) => a.status === AttemptStatus.IN_PROGRESS || a.status === AttemptStatus.NOT_STARTED
  );

  const targetAttempt = activeAttempt || completedAttempt || null;
  const isSubmitted = Boolean(completedAttempt && !activeAttempt);
  const isOverallCompleted = isSubmitted;

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

  const trackTemplates = [
    {
      id: "psychometric-diagnostic",
      title: "Psychometric Assessment",
      subtitle: "Module A • Personality, Interests & Values",
      description:
        "Calibrates core personality traits, vocational interests, and intrinsic work value hierarchy.",
      icon: Brain,
      fallbackQuestions: 42,
      duration: "25 mins",
      tags: ["Big Five Personality", "RIASEC Interests", "Work Values"],
    },
    {
      id: "personality-work-style",
      title: "Competency Self-Report",
      subtitle: "Module B • Behavioral Competencies",
      description:
        "Evaluates foundational workplace competencies, analytical problem-solving, and resilience.",
      icon: User,
      fallbackQuestions: 16,
      duration: "15 mins",
      tags: ["Analytical Thinking", "Resilience", "Integrity & Ethics"],
    },
    {
      id: "cognitive-analytical",
      title: "Situational Judgment Test",
      subtitle: "Module C • Workplace Scenarios",
      description:
        "Measures real-world judgment and behavioral choices across professional decision-making dilemmas.",
      icon: Target,
      fallbackQuestions: 38,
      duration: "30 mins",
      tags: ["Workplace Scenarios", "Ethical Judgment", "Critical Decisions"],
    },
    {
      id: "career-domain-fit",
      title: "Cognitive Aptitude & Reasoning",
      subtitle: "Module D • Cognitive Reasoning",
      description:
        "Objective aptitude battery evaluating verbal deduction, numerical problem-solving, and logical speed.",
      icon: Compass,
      fallbackQuestions: 30,
      duration: "35 mins",
      tags: ["Verbal Reasoning", "Numerical Aptitude", "Logical Reasoning"],
    },
  ];

  const tracks = trackTemplates.map((template, trackIdx) => {
    const section = sections[trackIdx] || null;
    const totalQuestions = section?._count?.questions ?? template.fallbackQuestions;
    const answeredCount = isOverallCompleted
      ? totalQuestions
      : section
      ? answeredCountBySectionId.get(section.id) ?? 0
      : 0;

    const isCompleted =
      isOverallCompleted || (totalQuestions > 0 && answeredCount >= totalQuestions);
    const isInProgress = !isCompleted && answeredCount > 0;
    const progress = isCompleted
      ? 100
      : totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

    return {
      ...template,
      questions: totalQuestions,
      answeredCount,
      progress,
      isCompleted,
      isInProgress,
      status: isCompleted ? "COMPLETED" : isInProgress ? "IN_PROGRESS" : "READY",
    };
  });



  // Calculate profile completeness
  const profileCheck = checkStudentProfileCompletion(user?.studentProfile, user?.phone);

  // Calculate module completion counts for report preparation submission
  const allModulesCompleted = tracks.length > 0 && tracks.every((t) => t.isCompleted);
  const completedModulesCount = tracks.filter((t) => t.isCompleted).length;

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Standard Unified Header */}
      <StudentPageHeader
        title="Assessment modules"
        description="Four foundational evaluation modules calibrated to map your cognitive and leadership potential."
      />

      {/* Assessment Final Submission & Report Preparation Card */}
      <AssessmentSubmitCard
        attemptId={targetAttempt?.id || null}
        allModulesCompleted={allModulesCompleted}
        completedCount={completedModulesCount}
        totalCount={tracks.length}
        isProfileComplete={profileCheck.isComplete}
        missingProfileFields={profileCheck.missingFields}
        profilePercentage={profileCheck.percentage}
        isSubmitted={isSubmitted}
        submittedAt={completedAttempt?.submittedAt || null}
      />

      {/* 2-Column Responsive Card Grid (1 col mobile, 2 cols tablet & laptop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {tracks.map((track, trackIdx) => {
          const Icon = track.icon;
          const isCompleted = track.status === "COMPLETED";
          const isInProgress = track.status === "IN_PROGRESS";

          const buttonLabel = isCompleted
            ? "Review responses"
            : isInProgress
            ? "Continue module"
            : "Start module";

          return (
            <div
              key={track.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3.5">
                {/* Top Row: Neutral Icon Tile + Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#0F172A]" />
                  </div>

                  <StudentStatusPill status={track.status} />
                </div>

                {/* Subtitle & Title */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    {track.subtitle}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mt-0.5 tracking-tight">
                    {track.title}
                  </h2>
                </div>

                {/* 2-line Description */}
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-2">
                  {track.description}
                </p>

                {/* Up to 3 Quiet Topic Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {track.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Launch Row */}
              <div className="space-y-3.5 pt-4 mt-4 border-t border-[#F1F5F9]">
                {/* Meta Row: Duration + Questions */}
                <div className="flex items-center gap-3 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {track.duration}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {track.questions} questions
                  </span>
                </div>

                {/* Progress bar */}
                <StudentProgressBar
                  value={track.progress}
                  detail={
                    isCompleted
                      ? "100% complete"
                      : isInProgress
                      ? `${track.answeredCount} of ${track.questions} answered`
                      : "Ready to start"
                  }
                  showPercentage={true}
                />

                {/* Single State-Dependent Action Button */}
                <div className="pt-1">
                  <StartAssessmentButton
                    label={buttonLabel}
                    variant={isCompleted ? "secondary" : "primary"}
                    className="w-full text-xs font-semibold"
                    sectionIndex={trackIdx}
                    moduleId={track.id}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
