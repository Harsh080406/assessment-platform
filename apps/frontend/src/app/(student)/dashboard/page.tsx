import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  Compass,
  BarChart3,
  ArrowRight,
  Brain,
  User,
  Sparkles,
  BookOpen,
  Users,
  GraduationCap,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Shield,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";
import StartAssessmentButton from "@/components/StartAssessmentButton";
import { AttemptStatus } from "@prisma/client";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = session.user.id;

  // Fetch student user & profile data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      attempts: {
        include: {
          assessment: true,
          responses: true,
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  const studentName = user?.studentProfile
    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`.trim()
    : session.user.name || "Alex Student";

  const firstName = user?.studentProfile?.firstName || studentName.split(" ")[0] || "Alex";
  const studentEmail = user?.email || session.user.email || "student@aurapath.com";
  const gradeLevel = user?.studentProfile?.grade || user?.studentProfile?.educationLevel || "Class 12";
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

  const completedCount = completedAttempts.length;
  const inProgressCount = activeAttempt ? 1 : 0;
  const totalJourneyAssessments = 4;
  const remainingCount = Math.max(0, totalJourneyAssessments - completedCount - inProgressCount);
  const overallProgress = Math.min(
    100,
    Math.round(((completedCount * 1.0 + inProgressCount * 0.6) / totalJourneyAssessments) * 100)
  );

  // Missing profile items calculation
  const missingItems = [];
  if (!location) missingItems.push("Country / Location");
  if (!bio) missingItems.push("Target Career Aspirations");
  if (!user?.phone && !user?.studentProfile?.phone) missingItems.push("Phone Number");

  return (
    <div className="w-full">
      {/* 2-COLUMN EXPANSIVE SAAS DASHBOARD GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT / MAIN COLUMN (8 cols on XL screens)                                 */}
        {/* ========================================================================= */}
        <div className="xl:col-span-8 space-y-8 min-w-0">
          {/* 1. PRODUCT-ORIENTED WELCOME SECTION */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <span>{timeGreeting},</span>
                  <span className="font-bold text-[#0F172A]">{firstName}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                  Continue your journey toward career clarity.
                </h1>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Your responses are calibrated by licensed career psychologists to map your cognitive instincts into high-growth horizons.
                </p>

                {/* Primary & Secondary Actions */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  {activeAttempt ? (
                    <StartAssessmentButton
                      label="Resume Active Quest"
                      className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-xs whitespace-nowrap"
                    />
                  ) : (
                    <StartAssessmentButton
                      label="Start Next Assessment"
                      className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-xs whitespace-nowrap"
                    />
                  )}

                  <Link
                    href="/dashboard/assessments"
                    className="px-4 py-2.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-xs sm:text-sm font-semibold transition-colors shadow-xs whitespace-nowrap"
                  >
                    View All Quests
                  </Link>
                </div>
              </div>

              {/* Status Badge Accent */}
              <div className="hidden lg:flex flex-col items-center justify-center p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center shrink-0 w-44">
                <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center mb-2">
                  <Brain className="w-5 h-5 text-[#FF6B6B]" />
                </div>
                <div className="text-xs font-bold text-[#0F172A]">Stage {completedCount + inProgressCount} of 4</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">
                  {inProgressCount > 0 ? "Active Evaluation" : "Diagnostic Ready"}
                </div>
              </div>
            </div>
          </section>

          {/* 2. OVERALL PROGRESS & SUPPORTING DATA STRIP */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Evaluation Progress
              </h2>
              <Link
                href="/dashboard/results"
                className="text-xs font-semibold text-[#FF6B6B] hover:underline flex items-center gap-1"
              >
                <span>View Results Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Central Progress Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-sm font-semibold text-[#0F172A]">
                    Overall Journey Completion
                  </div>
                  <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {overallProgress}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B6B] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              {/* 3 Status Breakdowns */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#F1F5F9] text-xs">
                <div>
                  <div className="text-black font-bold">Completed</div>
                  <div className="text-base font-extrabold text-black mt-0.5">
                    {completedCount} <span className="text-xs font-bold text-black">/ 4 Modules</span>
                  </div>
                </div>
                <div>
                  <div className="text-black font-bold">Active Session</div>
                  <div className="text-base font-extrabold text-black mt-0.5">
                    {inProgressCount} Module
                  </div>
                </div>
                <div>
                  <div className="text-black font-bold">Remaining</div>
                  <div className="text-base font-extrabold text-black mt-0.5">
                    {remainingCount} Modules
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Clean Metric Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Tests Done
                </div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1.5">{completedCount}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified data</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Profile Depth
                </div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1.5">75%</div>
                <div className="text-[11px] text-[#64748B] mt-1">Sufficient for report</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Career Matches
                </div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1.5">5</div>
                <div className="text-[11px] text-[#4F46E5] font-medium mt-1">High confidence</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Turnaround
                </div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1.5">48h</div>
                <div className="text-[11px] text-[#64748B] mt-1">Psychologist review</div>
              </div>
            </div>
          </section>

          {/* 3. ASSESSMENT JOURNEY (4 ACTIONABLE QUESTS) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                  Assessment Journey Track
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Core psychometric modules required to calibrate your report.
                </p>
              </div>

              <Link
                href="/dashboard/assessments"
                className="text-xs font-semibold text-[#FF6B6B] hover:underline flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Module A */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 flex flex-col justify-between hover:border-black transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-black">
                      Module A
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        completedCount > 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold"
                          : "bg-[#F1F5F9] text-black border-[#CBD5E1]"
                      }`}
                    >
                      {completedCount > 0 ? "Completed" : "Ready"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-black">
                      Psychometric Assessment
                    </h3>
                    <p className="text-xs text-black font-semibold leading-relaxed mt-1">
                      Core cognitive styles, analytical instincts, and intrinsic motivators.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs text-black font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    ~15 mins
                  </span>
                  <StartAssessmentButton
                    label={completedCount > 0 ? "Review Responses" : "Start Module A →"}
                    className="px-4 py-2 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Module B */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 flex flex-col justify-between hover:border-black transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-black">
                      Module B
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        inProgressCount > 0
                          ? "bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FE] font-extrabold"
                          : "bg-[#F1F5F9] text-black border-[#CBD5E1]"
                      }`}
                    >
                      {inProgressCount > 0 ? "In Progress" : "Available"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-black">
                      Competency Self-Report
                    </h3>
                    <p className="text-xs text-black font-semibold leading-relaxed mt-1">
                      Behavioral competencies, work preferences, and leadership traits.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs text-black font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    ~20 mins
                  </span>
                  <StartAssessmentButton
                    label={inProgressCount > 0 ? "Resume Module B →" : "Start Module B →"}
                    className="px-4 py-2 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Module C */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 flex flex-col justify-between hover:border-black transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-black">
                      Module C
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#F1F5F9] text-black border-[#CBD5E1]">
                      Available
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-black">
                      Situational Judgment Test
                    </h3>
                    <p className="text-xs text-black font-semibold leading-relaxed mt-1">
                      Real-world workplace dilemma scenarios and decision-making dynamics.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs text-black font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    ~15 mins
                  </span>
                  <StartAssessmentButton
                    label="Start Module C →"
                    className="px-4 py-2 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Module D */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 flex flex-col justify-between hover:border-black transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-black">
                      Module D
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#F1F5F9] text-black border-[#CBD5E1]">
                      Available
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-black">
                      Aptitude: Verbal Reasoning
                    </h3>
                    <p className="text-xs text-black font-semibold leading-relaxed mt-1">
                      Verbal comprehension, passage deduction, and logical reasoning.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs text-black font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    ~18 mins
                  </span>
                  <StartAssessmentButton
                    label="Start Quest →"
                    className="px-4 py-2 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 4. RECOMMENDED CAREER PATHWAYS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                  Recommended Career Trajectories
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Top calibrated career domains based on your current evaluation data.
                </p>
              </div>

              <Link
                href="/dashboard/careers"
                className="text-xs font-semibold text-[#FF6B6B] hover:underline flex items-center gap-1"
              >
                <span>Explore All Pathways</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/dashboard/careers"
                className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider bg-[#EEF2FF] px-2 py-0.5 rounded-md">
                      STEM & Tech
                    </span>
                    <span className="text-xs font-bold text-[#0F172A]">94% Match</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#FF6B6B] transition-colors">
                    AI Systems Architect
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    Design scalable neural computing and autonomous models.
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-[#F8FAFC] flex items-center justify-between text-[11px] text-[#64748B] font-medium">
                  <span>+32% 10-Yr Demand</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FF6B6B]" />
                </div>
              </Link>

              <Link
                href="/dashboard/careers"
                className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#9333EA] uppercase tracking-wider bg-[#FAF5FF] px-2 py-0.5 rounded-md">
                      Product & Strategy
                    </span>
                    <span className="text-xs font-bold text-[#0F172A]">89% Match</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#FF6B6B] transition-colors">
                    Venture Product Strategist
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    Lead product commercialization and venture scaling teams.
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-[#F8FAFC] flex items-center justify-between text-[11px] text-[#64748B] font-medium">
                  <span>+24% 10-Yr Demand</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FF6B6B]" />
                </div>
              </Link>

              <Link
                href="/dashboard/careers"
                className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider bg-[#F0FDF4] px-2 py-0.5 rounded-md">
                      Health Sciences
                    </span>
                    <span className="text-xs font-bold text-[#0F172A]">86% Match</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#FF6B6B] transition-colors">
                    Biomedical Engineer
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    Interface biological computation and neuro-sensors.
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-[#F8FAFC] flex items-center justify-between text-[11px] text-[#64748B] font-medium">
                  <span>+28% 10-Yr Demand</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FF6B6B]" />
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN / CONTEXT RAIL (4 cols on XL screens)                        */}
        {/* ========================================================================= */}
        <div className="xl:col-span-4 space-y-6">
          {/* PROFILE COMPLETION CARD */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">Profile Calibration</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>

            {/* Circular Progress + Meta */}
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
                    className="text-emerald-500"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-xs text-[#0F172A]">75%</span>
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-bold text-[#0F172A]">Profile Health: Good</div>
                <p className="text-[11px] text-[#64748B]">
                  Complete background data for deeper report accuracy.
                </p>
              </div>
            </div>

            {/* Missing items checklist if any */}
            {missingItems.length > 0 && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Recommended Details:
                </div>
                {missingItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[#64748B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Add {item}</span>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/dashboard/settings"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] transition-colors shadow-xs"
            >
              <span>Edit Profile Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
            </Link>
          </div>

          {/* RECENT ACTIVITY TIMELINE */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#64748B]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Recent Activity</h3>
              </div>
            </div>

            {/* Clean Chronological Timeline */}
            <div className="space-y-4 pt-2 relative before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#F1F5F9]">
              <div className="flex items-start gap-3.5 relative pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-white" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Completed Psychometric Diagnostic
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">2 days ago • Verified</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 relative pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] mt-1 shrink-0 ring-4 ring-white" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Started Personality & Work Style
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">4 days ago • In progress</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 relative pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8] mt-1 shrink-0 ring-4 ring-white" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Joined AuraPath Platform
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">1 week ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* METHODOLOGY INFO PANEL */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Shield className="w-4 h-4 text-[#FF6B6B]" />
              <span>Evidence-Based Psychometrics</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              AuraPath evaluations synthesize situational adaptability, cognitive reasoning, and behavioral indicators. Final diagnostic reports undergo certified human review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
