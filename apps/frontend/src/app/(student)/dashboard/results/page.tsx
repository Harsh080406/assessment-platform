import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Lock,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import StudentStatusPill from "@/components/student/StudentStatusPill";
import { AttemptStatus } from "@prisma/client";

export default async function StudentResultsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/results");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attempts: {
        include: {
          assessment: true,
          responses: true,
          reports: {
            orderBy: { version: "desc" },
            take: 1,
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  const attempts = user?.attempts || [];
  const submittedAttempts = attempts.filter(
    (a) =>
      a.status === AttemptStatus.SUBMITTED ||
      a.status === AttemptStatus.UNDER_REVIEW ||
      a.status === AttemptStatus.REPORT_IN_PREP ||
      a.status === AttemptStatus.PENDING_APPROVAL ||
      a.status === AttemptStatus.PUBLISHED
  );

  const latestSubmitted = submittedAttempts[0] || null;

  // Determine current active pipeline stage (0-indexed, -1 if no submission)
  let currentStageIndex = -1;
  if (latestSubmitted) {
    switch (latestSubmitted.status) {
      case AttemptStatus.SUBMITTED:
        currentStageIndex = 0;
        break;
      case AttemptStatus.UNDER_REVIEW:
        currentStageIndex = 1;
        break;
      case AttemptStatus.REPORT_IN_PREP:
        currentStageIndex = 2;
        break;
      case AttemptStatus.PENDING_APPROVAL:
        currentStageIndex = 3;
        break;
      case AttemptStatus.PUBLISHED:
        currentStageIndex = 4;
        break;
      default:
        currentStageIndex = -1;
    }
  }

  const pipelineSteps = [
    { title: "Secured & Submitted", desc: "Responses locked and saved for review" },
    { title: "Psychometric Review", desc: "Expert evaluates trajectories" },
    { title: "Report In Preparation", desc: "Customized guidance synthesis" },
    { title: "Editorial Sign-Off", desc: "Quality and standards audit" },
    { title: "Published & Ready", desc: "Certified report available" },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Standard Unified Header */}
      <StudentPageHeader
        title="Results & reports"
        description="Track evaluation milestones for your submitted assessments and download certified reports."
      />

      {/* 5-Stage Evaluation Pipeline Stepper */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">
            Evaluation pipeline workflow
          </h2>
          {latestSubmitted && (
            <span className="text-xs text-[#64748B]">
              Latest attempt: <strong className="text-[#0F172A] font-semibold">{latestSubmitted.assessment.title.slice(0, 24)}...</strong>
            </span>
          )}
        </div>

        {/* Responsive Stepper: horizontal on laptop, vertical on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {pipelineSteps.map((step, idx) => {
            const isCompleted = currentStageIndex > idx || (currentStageIndex === 4 && idx === 4);
            const isCurrent = currentStageIndex === idx && currentStageIndex !== 4;

            let stepCardClass = "bg-white border-[#E2E8F0] text-[#64748B]";
            let numberClass = "bg-[#F1F5F9] text-[#64748B]";
            let titleClass = "text-[#475569]";

            if (isCompleted) {
              stepCardClass = "bg-emerald-50/50 border-emerald-200 text-[#0F172A]";
              numberClass = "bg-emerald-600 text-white";
              titleClass = "text-emerald-950 font-semibold";
            } else if (isCurrent) {
              stepCardClass = "bg-[#EEF2FF] border-[#C7D2FE] ring-2 ring-[#4F46E5]/10 text-[#0F172A]";
              numberClass = "bg-[#4F46E5] text-white";
              titleClass = "text-[#3730A3] font-bold";
            }

            return (
              <div
                key={step.title}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${stepCardClass}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${numberClass}`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </span>
                  <span className={`text-xs leading-tight ${titleClass}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed pl-7">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Submissions & Reports Cards */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#0F172A]">
          Your submissions & reports ({submittedAttempts.length})
        </h2>

        {submittedAttempts.length === 0 ? (
          /* Empty State: neutral icon, plain explanation, primary coral CTA */
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#94A3B8] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#0F172A]">
                No submissions yet
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                Once you complete and submit an assessment module, its evaluation status and certified report will appear here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/assessments"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E05353] text-white font-semibold text-xs transition-colors shadow-2xs min-h-[44px]"
              >
                <span>Go to assessments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Submissions Cards List */
          <div className="space-y-3.5">
            {submittedAttempts.map((attempt) => {
              const isPublished = attempt.status === AttemptStatus.PUBLISHED;

              return (
                <div
                  key={attempt.id}
                  className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StudentStatusPill status={attempt.status} />
                      <span className="text-xs font-mono text-[#94A3B8]">
                        ID: {attempt.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                      {attempt.assessment.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "Recently"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#94A3B8]" />
                        {attempt.responses.length} responses secured
                      </span>
                      <span className="flex items-center gap-1 font-medium text-[#4F46E5]">
                        <Lock className="w-3.5 h-3.5" />
                        Responses locked
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#F1F5F9]">
                    {isPublished && attempt.reports?.[0] ? (
                      <a
                        href={`/api/reports/download?fileReference=${encodeURIComponent(
                          attempt.reports[0].fileReference
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white font-semibold text-xs transition-colors shadow-2xs min-h-[44px]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download report (PDF)</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#475569]">
                        <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>In evaluation review</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
