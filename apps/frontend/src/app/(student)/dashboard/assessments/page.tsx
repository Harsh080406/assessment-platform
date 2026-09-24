import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Brain,
  User,
  Target,
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import StartAssessmentButton from "@/components/StartAssessmentButton";
import { AttemptStatus } from "@prisma/client";

export default async function StudentAssessmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/assessments");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attempts: {
        include: {
          assessment: true,
          responses: true,
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  const attempts = user?.attempts || [];
  const completedAttempts = attempts.filter(
    (a) => a.status === AttemptStatus.SUBMITTED || a.status === AttemptStatus.PUBLISHED
  );
  const activeAttempt = attempts.find(
    (a) => a.status === AttemptStatus.IN_PROGRESS || a.status === AttemptStatus.NOT_STARTED
  );

  const isFirstCompleted = completedAttempts.length > 0;
  const isSecondActive = !!activeAttempt;

  const tracks = [
    {
      id: "psychometric-diagnostic",
      title: "Psychometric Assessment",
      subtitle: "Module A • Cognitive Architecture",
      description:
        "Calibrate core cognitive styles, analytical instincts, and intrinsic motivators across structured psychometric dimensions.",
      icon: Brain,
      iconBg: "bg-[#FFF2EE]",
      iconColor: "text-[#FF6B6B]",
      questions: 12,
      duration: "15 mins",
      version: "1.0",
      status: isFirstCompleted ? "COMPLETED" : "READY",
      progress: isFirstCompleted ? 100 : 0,
      tags: ["Cognitive Style", "Analytical Instinct", "Motivation Index"],
    },
    {
      id: "personality-work-style",
      title: "Competency Self-Report",
      subtitle: "Module B • Behavioral Matrix",
      description:
        "Self-report behavioral competencies, stress response mechanisms, collaboration style, and leadership tendencies.",
      icon: User,
      iconBg: "bg-[#F3F4FD]",
      iconColor: "text-[#6366F1]",
      questions: 15,
      duration: "20 mins",
      version: "1.0",
      status: isSecondActive ? "IN_PROGRESS" : "READY",
      progress: isSecondActive ? 60 : 0,
      tags: ["Work Preferences", "Behavioral Matrix", "Leadership"],
    },
    {
      id: "cognitive-analytical",
      title: "Situational Judgment Test",
      subtitle: "Module C • Scenario Engine",
      description:
        "Tackle real-world workplace scenario dilemmas, ethical trade-offs, and critical decision-making dynamics.",
      icon: Target,
      iconBg: "bg-[#FFF8EE]",
      iconColor: "text-[#F59E0B]",
      questions: 10,
      duration: "15 mins",
      version: "1.0",
      status: "READY",
      progress: 0,
      tags: ["Scenario Dilemmas", "Ethical Judgment", "Critical Thinking"],
    },
    {
      id: "career-domain-fit",
      title: "Aptitude: Verbal Reasoning",
      subtitle: "Module D • Verbal & Logic Calibration",
      description:
        "Assess verbal comprehension, complex passage deduction, logical inference, and conceptual reasoning precision.",
      icon: Compass,
      iconBg: "bg-[#F0F9FF]",
      iconColor: "text-[#0284C7]",
      questions: 14,
      duration: "18 mins",
      version: "1.0",
      status: "READY",
      progress: 0,
      tags: ["Verbal Deduction", "Comprehension", "Logical Inference"],
    },
  ];

  return (
    <main className="w-full space-y-8">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-[#FF6B6B] rounded-full inline-block" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Assessment Center
          </h1>
        </div>
        <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
          The 4 core evaluation modules designed to diagnose cognitive tendencies, behavioral competencies, situational judgment, and verbal reasoning capabilities.
        </p>
      </div>

      {/* Methodology Alert Banner */}
      <div className="bg-[#FFF8F5] border border-[#FED7CC] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF6B6B] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-black">
              Certified Human-Led Evaluation Methodology
            </h3>
            <p className="text-xs text-black font-bold mt-0.5 leading-relaxed max-w-2xl">
              Unlike automated bot tests, your submitted responses are reviewed by licensed career counselors and psychometric experts to formulate your customized guidance report.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#FCD2C7] text-xs font-bold text-black">
          <Sparkles className="w-4 h-4 text-black" />
          <span className="text-black font-bold">Manual Expert Signoff</span>
        </div>
      </div>

      {/* Assessment Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isCompleted = track.status === "COMPLETED";
          const isInProgress = track.status === "IN_PROGRESS";

          return (
            <div
              key={track.id}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:border-[#FF6B6B]/60 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${track.iconBg} ${track.iconColor} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold"
                        : isInProgress
                        ? "bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FE] font-extrabold"
                        : "bg-gray-50 text-black border-gray-300"
                    }`}
                  >
                    {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Available"}
                  </span>
                </div>

                {/* Subtitle & Title */}
                <div className="text-[11px] font-black uppercase tracking-wider text-black mb-1">
                  {track.subtitle}
                </div>
                <h2 className="text-lg font-extrabold text-black mb-2 tracking-tight">
                  {track.title}
                </h2>
                <p className="text-xs sm:text-sm text-black font-semibold leading-relaxed mb-4">
                  {track.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Launch Bar */}
              <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                {/* Meta details */}
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {track.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {track.questions} Questions
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#94A3B8]">v{track.version}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-emerald-500 w-full" : isInProgress ? "bg-[#4F46E5] w-3/5" : "w-0"
                    }`}
                  />
                </div>

                {/* Action Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {isCompleted ? "100% Completed" : isInProgress ? "60% Completed" : "Ready to Begin"}
                  </span>
                  <StartAssessmentButton
                    label={isCompleted ? "Review Responses" : isInProgress ? "Resume Quest" : "Start Quest"}
                    className="px-4 py-2 text-xs rounded-lg shadow-xs"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
