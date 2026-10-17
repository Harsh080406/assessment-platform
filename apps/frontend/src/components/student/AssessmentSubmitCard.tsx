"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  FileCheck2,
  Sparkles,
  X,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { submitAssessmentAction } from "@/app/actions/assessment";

interface AssessmentSubmitCardProps {
  attemptId: string | null;
  allModulesCompleted: boolean;
  completedCount: number;
  totalCount: number;
  isProfileComplete?: boolean;
  missingProfileFields?: string[];
  profilePercentage?: number;
  isSubmitted: boolean;
  submittedAt?: Date | string | null;
}

export default function AssessmentSubmitCard({
  attemptId,
  allModulesCompleted,
  completedCount,
  totalCount,
  isProfileComplete = false,
  missingProfileFields = [],
  profilePercentage = 0,
  isSubmitted,
  submittedAt,
}: AssessmentSubmitCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = allModulesCompleted && isProfileComplete;

  const formattedSubmittedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleConfirmSubmit = () => {
    if (!attemptId) {
      setErrorMessage("No active assessment attempt found to submit.");
      return;
    }

    if (!canSubmit) {
      if (!isProfileComplete && !allModulesCompleted) {
        setErrorMessage("Please complete your student profile and all 4 assessment modules before submitting.");
      } else if (!isProfileComplete) {
        setErrorMessage(`Please complete your student profile first (missing: ${missingProfileFields.join(", ")}).`);
      } else {
        setErrorMessage(`Please finish all 4 evaluation modules (${completedCount} of ${totalCount} completed).`);
      }
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await submitAssessmentAction({ attemptId });
        if (res.success) {
          setIsOpen(false);
          router.push("/dashboard/results");
          router.refresh();
        } else {
          setErrorMessage(res.message || "Failed to submit assessment.");
        }
      } catch (err) {
        console.error("Submission error:", err);
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    });
  };

  // State 1: Already Submitted
  if (isSubmitted) {
    return (
      <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Submitted & Locked
              </span>
              {formattedSubmittedDate && (
                <span className="text-xs text-[#64748B]">
                  • Submitted on {formattedSubmittedDate}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Assessment submitted for report preparation
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Your responses are locked and currently in the official evaluation pipeline.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/results"
          className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer min-h-[44px] shrink-0"
        >
          <span>Track Report Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // State 2 & 3: Pending submission (either all completed -> ENABLED, or incomplete -> DISABLED)
  return (
    <>
      <div
        className={`w-full rounded-2xl p-5 sm:p-6 border transition-all ${
          canSubmit
            ? "bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 border-emerald-200 shadow-xs"
            : "bg-white border-[#E2E8F0] shadow-xs"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Info & Status */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                canSubmit
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-2xs"
                  : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
              }`}
            >
              {canSubmit ? (
                <Sparkles className="w-5 h-5 text-emerald-700" />
              ) : (
                <Lock className="w-5 h-5 text-[#94A3B8]" />
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {canSubmit ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Profile & All 4 Modules Complete • Ready to Submit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Submission Locked • Requirements Pending
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                {canSubmit
                  ? "Submit Assessment for Report Preparation"
                  : "Complete your profile and all 4 modules to unlock evaluation submission"}
              </h3>

              <p className="text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed">
                {canSubmit
                  ? "Great job! Your student profile is verified and all 4 evaluation modules are 100% completed. You may now submit your responses for formal expert assessment and career dossier generation."
                  : "Our certified psychologists require both your calibrated student profile background and all 4 assessment batteries to produce your individualized evaluation dossier."}
              </p>

              {/* Prerequisites Checklist */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl">
                {/* Requirement 1: Student Profile */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isProfileComplete
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isProfileComplete
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isProfileComplete ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold">1</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold block truncate">
                        1. Student Profile
                      </span>
                      <span className="text-[11px] text-[#64748B] block truncate">
                        {isProfileComplete
                          ? "Complete (100%)"
                          : `Incomplete (${profilePercentage}% complete)`}
                      </span>
                    </div>
                  </div>

                  {!isProfileComplete && (
                    <Link
                      href="/dashboard/settings"
                      className="text-[11px] font-bold text-[#FF6B6B] hover:text-[#E05353] hover:underline flex items-center shrink-0"
                    >
                      Fill profile <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Requirement 2: 4 Modules */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    allModulesCompleted
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        allModulesCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {allModulesCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold">2</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold block truncate">
                        2. Four Evaluation Modules
                      </span>
                      <span className="text-[11px] text-[#64748B] block truncate">
                        {allModulesCompleted
                          ? "All 4 Modules Finished"
                          : `${completedCount} of ${totalCount} Modules Complete`}
                      </span>
                    </div>
                  </div>

                  {!allModulesCompleted && attemptId && (
                    <Link
                      href={`/take/${attemptId}`}
                      className="text-[11px] font-bold text-[#FF6B6B] hover:text-[#E05353] hover:underline flex items-center shrink-0"
                    >
                      Continue <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Submit Button */}
          <div className="flex items-center lg:justify-end shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={() => setIsOpen(true)}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-2 min-h-[44px] ${
                canSubmit
                  ? "bg-[#FF6B6B] hover:bg-[#E05353] text-white shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
                  : "bg-slate-100 text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed"
              }`}
            >
              {canSubmit ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Report Preparation</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#94A3B8]" />
                  <span>
                    {!isProfileComplete && !allModulesCompleted
                      ? "Complete Profile & 4 Modules to Submit"
                      : !isProfileComplete
                      ? "Complete Profile to Unlock Submission"
                      : "Complete All 4 Modules to Submit"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="confirm-modal-title" className="text-lg font-bold text-[#0F172A]">
                    Submit & Confirm Assessment
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Prepare official report dossier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isPending) setIsOpen(false);
                }}
                disabled={isPending}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message if Any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Body Confirmation Information */}
            <div className="space-y-3 text-xs sm:text-sm text-[#475569]">
              <p>
                Please confirm that you want to finalize and submit all{" "}
                <strong className="text-[#0F172A]">4 assessment modules</strong> along with your verified student profile for expert report evaluation.
              </p>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 text-xs text-[#334155]">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>
                    <strong>Student Profile Verified:</strong> Demographic background and academic context calibrated.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>
                    <strong>All 4 Modules Complete:</strong> All psychometric and cognitive items answered.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">🔒</span>
                  <span>
                    <strong>Permanent Response Lock:</strong> Once confirmed, responses cannot be edited or reset.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">📊</span>
                  <span>
                    <strong>Evaluation Pipeline Initiated:</strong> Your dossier enters the certified psychologist queue.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer min-h-[42px]"
              >
                Cancel & Review
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#FF6B6B] hover:bg-[#E05353] text-white shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer min-h-[42px] disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Assessment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
