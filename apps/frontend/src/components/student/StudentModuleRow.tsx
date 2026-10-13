"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  User,
  Target,
  Compass,
  BookOpen,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import StudentStatusPill from "./StudentStatusPill";
import { startOrResumeAssessmentAction } from "@/app/actions/assessment";

interface StudentModuleRowProps {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  duration: string;
  sectionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  progress: number;
  isCompleted: boolean;
  isInProgress: boolean;
  status: string;
}

const getModuleIcon = (id: string, index: number) => {
  if (id.includes("psychometric") || index === 0) return Brain;
  if (id.includes("personality") || index === 1) return User;
  if (id.includes("cognitive") || index === 2) return Target;
  if (id.includes("career") || id.includes("aptitude") || index === 3) return Compass;
  return BookOpen;
};

export default function StudentModuleRow({
  id,
  subtitle,
  title,
  description,
  duration,
  sectionIndex,
  totalQuestions,
  answeredCount,
  progress,
  isCompleted,
  isInProgress,
  status,
}: StudentModuleRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const Icon = getModuleIcon(id, sectionIndex);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await startOrResumeAssessmentAction();
      if (res.success && res.data) {
        router.push(`/take/${res.data.attemptId}?section=${sectionIndex}`);
      } else {
        router.push("/dashboard/assessments");
      }
    } catch {
      router.push("/dashboard/assessments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full text-left bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
    >
      {/* Left: Icon Tile + Title & Description */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#4F46E5]" />
          ) : (
            <Icon className="w-5 h-5 text-[#0F172A]" />
          )}
        </div>

        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              {subtitle}
            </span>
            <span className="text-xs text-[#CBD5E1] hidden sm:inline">•</span>
            <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors truncate">
              {title}
            </span>
          </div>
          <p className="text-xs text-[#64748B] line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      {/* Right: Progress bar + Status Pill + Duration + Chevron */}
      <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F1F5F9]">
        {/* Progress bar info */}
        <div className="w-32 sm:w-36 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
            <span className="font-semibold text-[#0F172A] tabular-nums">{progress}%</span>
            <span>
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? "bg-emerald-600" : isInProgress ? "bg-[#4F46E5]" : "bg-slate-300"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Pill */}
        <StudentStatusPill status={status} />

        {/* Duration */}
        <span className="hidden lg:inline-flex items-center gap-1 text-xs text-[#64748B] whitespace-nowrap">
          <Clock className="w-3 h-3 text-[#94A3B8]" />
          <span>{duration}</span>
        </span>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0F172A] group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}
