import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Download,
  AlertCircle,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
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

  const steps = [
    { title: "Secured & Submitted", desc: "Responses locked and archived" },
    { title: "Psychometric Review", desc: "Licensed expert evaluates trajectories" },
    { title: "Report In Preparation", desc: "Formulating customized guidance" },
    { title: "Editorial Sign-Off", desc: "Admin certification" },
    { title: "Published & Ready", desc: "Available for student & parent" },
  ];

  return (
    <main className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-[#FF6B6B] rounded-full inline-block" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Results & Evaluation Tracking
          </h1>
        </div>
        <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
          Track the real-time expert evaluation status of your submitted psychometric assessments and download your certified guidance reports.
        </p>
      </div>

      {/* Evaluation State Machine Tracker */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF6B6B]" />
            <h2 className="text-base font-extrabold text-black">
              Evaluation Pipeline Workflow
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full border border-[#E0E7FE]">
            100% Human Expert Led
          </span>
        </div>

        {/* 5-Step Process Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`p-4 rounded-xl border transition-all ${
                idx === 0
                  ? "bg-[#FFF8F5] border-[#FF6B6B]/40 ring-2 ring-[#FF6B6B]/10"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    idx === 0
                      ? "bg-[#FF6B6B] text-white"
                      : "bg-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-[#0F172A] leading-tight">
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-tight">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Assessments & Reports List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0F172A]">
          Your Submissions & Reports ({submittedAttempts.length})
        </h3>

        {submittedAttempts.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-gray-100 text-[#94A3B8] rounded-xl flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#0F172A]">No Submitted Assessments Yet</h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                Once you complete and submit your assessment quests, they will appear here along with expert evaluation tracking and certified reports.
              </p>
            </div>
            <Link
              href="/dashboard/assessments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white font-semibold text-xs shadow-xs transition-all"
            >
              <span>Go to Assessment Center</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submittedAttempts.map((attempt) => {
              const isPublished = attempt.status === AttemptStatus.PUBLISHED;

              return (
                <div
                  key={attempt.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {attempt.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-mono">
                        Attempt ID: {attempt.id.slice(0, 8)}...
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-[#0F172A]">
                      {attempt.assessment.title} (v{attempt.assessmentVersion})
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "Just now"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {attempt.responses.length} Responses Secured
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#FF6B6B]">
                        <Lock className="w-3.5 h-3.5" /> Locked for Review
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
                    {isPublished && attempt.reports?.[0] ? (
                      <a
                        href={`/api/reports/download?fileReference=${encodeURIComponent(
                          attempt.reports[0].fileReference
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Certified Report (PDF)</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF8F5] border border-[#FED7CC] text-xs font-semibold text-[#FF6B6B]">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>In Expert Evaluation Queue</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
