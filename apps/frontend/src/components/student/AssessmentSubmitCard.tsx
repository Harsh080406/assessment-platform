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
} from "lucide-react";
import Link from "next/link";
import { submitAssessmentAction } from "@/app/actions/assessment";

interface AssessmentSubmitCardProps {
  attemptId: string | null;
  allModulesCompleted: boolean;
  completedCount: number;
  totalCount: number;
  isSubmitted: boolean;
  submittedAt?: Date | string | null;
}

export default function AssessmentSubmitCard({
  attemptId,
  allModulesCompleted,
  completedCount,
  totalCount,
  isSubmitted,
  submittedAt,
}: AssessmentSubmitCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          allModulesCompleted
            ? "bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 border-emerald-200 shadow-xs"
            : "bg-white border-[#E2E8F0] shadow-xs"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Info & Status */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                allModulesCompleted
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-2xs"
                  : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
              }`}
            >
              {allModulesCompleted ? (
                <Sparkles className="w-5 h-5 text-emerald-700" />
              ) : (
                <Lock className="w-5 h-5 text-[#94A3B8]" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {allModulesCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    All 4 Modules Finished • Ready to Submit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-[#475569] border border-[#CBD5E1]">
                    {completedCount} of {totalCount} Modules Completed
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                {allModulesCompleted
                  ? "Submit Assessment for Report Preparation"
                  : "Complete all 4 modules to unlock submission"}
              </h3>

              <p className="text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed">
                {allModulesCompleted
                  ? "Great job! You have completed all 4 evaluation modules. Submit and confirm your assessment to initiate expert analysis and dossier preparation."
                  : "Finish all 4 modules (Psychometric, Competency, Situational Judgment, and Cognitive Aptitude) to enable final submission for report generation."}
              </p>
            </div>
          </div>

          {/* Right: Submit Button */}
          <div className="flex items-center lg:justify-end shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              disabled={!allModulesCompleted || isPending}
              onClick={() => setIsOpen(true)}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-2 min-h-[44px] ${
                allModulesCompleted
                  ? "bg-[#FF6B6B] hover:bg-[#E05353] text-white shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
                  : "bg-slate-100 text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Submit for Report Preparation</span>
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
                <strong className="text-[#0F172A]">4 assessment modules</strong> for
                report preparation.
              </p>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 text-xs text-[#334155]">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>
                    <strong>All 4 modules complete:</strong> All answers will be archived and calibrated.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">🔒</span>
                  <span>
                    <strong>Permanent response lock:</strong> Once confirmed, responses cannot be edited or reset.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">📊</span>
                  <span>
                    <strong>Report pipeline initiated:</strong> Your profile advances directly to our expert counseling evaluation queue.
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
