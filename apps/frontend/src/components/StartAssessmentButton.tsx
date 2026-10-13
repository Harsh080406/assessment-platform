"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Play, RotateCcw } from "lucide-react";
import { startOrResumeAssessmentAction } from "@/app/actions/assessment";
import { useAuth } from "@/context/AuthContext";

interface StartAssessmentButtonProps {
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "card";
  assessmentId?: string;
  sectionIndex?: number;
  sectionId?: string;
  moduleId?: string;
}

export default function StartAssessmentButton({
  className = "",
  label,
  variant = "primary",
  assessmentId,
  sectionIndex,
  sectionId,
  moduleId,
}: StartAssessmentButtonProps) {
  const router = useRouter();
  const { openAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const res = await startOrResumeAssessmentAction(assessmentId);
      if (res.success && res.data) {
        const queryParam =
          sectionIndex !== undefined
            ? `?section=${sectionIndex}`
            : sectionId
            ? `?section=${sectionId}`
            : moduleId
            ? `?module=${moduleId}`
            : "";
        router.push(`/take/${res.data.attemptId}${queryParam}`);
      } else {
        if (res.message?.toLowerCase().includes("unauthorized") || res.message?.toLowerCase().includes("sign in")) {
          openAuth("login");
        } else {
          alert(res.message || "Failed to start assessment.");
        }
      }
    } catch (err) {
      console.error("Start assessment error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        suppressHydrationWarning
        onClick={handleStart}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 text-xs font-extrabold text-[#FF6B6B] hover:text-[#F95858] hover:underline cursor-pointer disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading Session...</span>
          </>
        ) : (
          <>
            <span>{label || "Launch Assessment Session →"}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={handleStart}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all cursor-pointer min-h-[44px] disabled:opacity-60 ${
        variant === "secondary"
          ? "bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] shadow-2xs"
          : "bg-[#FF6B6B] hover:bg-[#E05353] text-white shadow-2xs active:scale-[0.99]"
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Starting Session...</span>
        </>
      ) : (
        <>
          <span>{label || "Start Assessment"}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </>
      )}
    </button>
  );
}
