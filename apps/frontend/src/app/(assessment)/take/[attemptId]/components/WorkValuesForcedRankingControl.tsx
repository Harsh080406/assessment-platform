"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown, Sparkles } from "lucide-react";

interface Question {
  id: string;
  sectionId: string;
  version: number;
  questionText: string;
  category?: string;
  displayOrder: number;
  required: boolean;
}

interface WorkValuesForcedRankingControlProps {
  questions: Question[];
  answers: Record<string, any>;
  onRankChange: (questionId: string, questionVersion: number, rank: number) => void;
  disabled?: boolean;
}

export default function WorkValuesForcedRankingControl({
  questions,
  answers,
  onRankChange,
  disabled = false,
}: WorkValuesForcedRankingControlProps) {
  // Extract currently assigned rank for each question (1 to 10)
  const currentRanks = useMemo(() => {
    const map: Record<string, number | null> = {};
    questions.forEach((q) => {
      const raw = answers[q.id];
      const val = typeof raw === "number" ? raw : raw?.rank;
      map[q.id] = typeof val === "number" && val >= 1 && val <= 10 ? val : null;
    });
    return map;
  }, [questions, answers]);

  // Track rank frequency and detect any duplicates
  const { rankCounts, assignedRanks, missingRanks, isAllUnique } = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let r = 1; r <= 10; r++) counts[r] = 0;

    Object.values(currentRanks).forEach((r) => {
      if (r !== null) counts[r] = (counts[r] || 0) + 1;
    });

    const assigned = Object.values(currentRanks).filter((r): r is number => r !== null);
    const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((r) => counts[r] === 0);
    const uniqueAssigned = new Set(assigned);

    const complete =
      assigned.length === 10 &&
      uniqueAssigned.size === 10 &&
      missing.length === 0;

    return {
      rankCounts: counts,
      assignedRanks: assigned,
      missingRanks: missing,
      isAllUnique: complete,
    };
  }, [currentRanks]);

  // Handle assigning a rank with smart swap to eliminate duplicate conflicts
  const handleAssignRank = (targetQId: string, targetVersion: number, newRank: number) => {
    if (disabled) return;

    const oldRankOfTarget = currentRanks[targetQId];

    // Check if another item already holds this newRank
    const conflictingQ = questions.find(
      (q) => q.id !== targetQId && currentRanks[q.id] === newRank
    );

    if (conflictingQ) {
      // Swap: Assign target's previous rank (if any) to conflicting item
      if (oldRankOfTarget !== null) {
        onRankChange(conflictingQ.id, conflictingQ.version, oldRankOfTarget);
      }
    }

    onRankChange(targetQId, targetVersion, newRank);
  };

  const handleNudgeRank = (qId: string, version: number, direction: "up" | "down") => {
    if (disabled) return;
    const current = currentRanks[qId];
    if (current === null) {
      const firstAvailable = missingRanks[0] || (direction === "up" ? 1 : 10);
      handleAssignRank(qId, version, firstAvailable);
      return;
    }

    const targetRank = direction === "up" ? current - 1 : current + 1;
    if (targetRank < 1 || targetRank > 10) return;

    handleAssignRank(qId, version, targetRank);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Instructions Header */}
      <div className="p-5 rounded-3xl bg-[#FFF8F5] border border-[#F4E3DC] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B6B] text-white flex items-center justify-center font-bold">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#191F2D] uppercase tracking-wide">
                Work Values Ranking Matrix (10 Items)
              </h3>
              <p className="text-xs text-[#718096]">
                Rank each value from <strong>1 (Highest Priority)</strong> to <strong>10 (Lowest Priority)</strong>.
              </p>
            </div>
          </div>

          {/* Validation Status Pill */}
          <div className="shrink-0">
            {isAllUnique ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>10 of 10 Ranked (Valid)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{assignedRanks.length} of 10 Ranked</span>
              </span>
            )}
          </div>
        </div>

        {/* Missing Ranks Helper */}
        {missingRanks.length > 0 && (
          <div className="pt-2 border-t border-[#F4E3DC]/80 flex flex-wrap items-center gap-1.5 text-xs text-[#718096]">
            <span className="font-semibold text-[#191F2D]">Unassigned ranks:</span>
            {missingRanks.map((r) => (
              <span
                key={r}
                className="w-5 h-5 rounded-md bg-white border border-[#E2E8F0] font-bold text-[11px] flex items-center justify-center text-[#FF6B6B]"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 10 Work Values Cards */}
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const rank = currentRanks[q.id];
          const isRanked = rank !== null;
          const isDuplicate = rank !== null && (rankCounts[rank] || 0) > 1;

          let cardStyle = "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]";
          if (isDuplicate) {
            cardStyle = "bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20";
          } else if (isRanked) {
            cardStyle = "bg-[#FCFAF8] border-[#FF6B6B]/40 shadow-xs";
          }

          return (
            <div
              key={q.id}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all ${cardStyle}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
                {/* Left: Category Badge & Statement */}
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                  {/* Assigned Rank Number Pill */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex flex-col items-center justify-center shrink-0 transition-all font-black ${
                      isRanked
                        ? "bg-[#191F2D] text-white shadow-xs ring-2 ring-[#FF6B6B]/30"
                        : "bg-[#F1F5F9] text-[#A0AEC0] border border-dashed border-[#CBD5E1]"
                    }`}
                  >
                    <span className="text-[7px] sm:text-[8px] uppercase tracking-wider font-bold text-[#A0AEC0]">
                      Rank
                    </span>
                    <span className="text-xs sm:text-sm leading-none">
                      {isRanked ? `#${rank}` : "—"}
                    </span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF2EE] text-[#FF6B6B] font-extrabold text-[10px] sm:text-[11px]">
                        {q.category || `Value ${idx + 1}`}
                      </span>
                      {isDuplicate && (
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Duplicate Rank
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#191F2D] leading-snug">
                      {q.questionText}
                    </p>
                  </div>
                </div>

                {/* Right: Quick Rank 1–10 Pill Selector with Nudge */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pt-2 lg:pt-0 border-t border-[#E2E8F0]/70 lg:border-0 w-full lg:w-auto justify-between lg:justify-end">
                  {/* Up / Down Nudger */}
                  <div className="flex items-center border border-[#E2E8F0] rounded-lg sm:rounded-xl bg-white overflow-hidden shrink-0">
                    <button
                      type="button"
                      disabled={disabled || rank === 1 || rank === null}
                      onClick={() => handleNudgeRank(q.id, q.version, "up")}
                      title="Move up in rank (closer to #1)"
                      className="p-1.5 sm:p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#191F2D] touch-manipulation active:bg-gray-200"
                    >
                      <ChevronUp className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                    <div className="w-[1px] h-4 bg-[#E2E8F0]" />
                    <button
                      type="button"
                      disabled={disabled || rank === 10 || rank === null}
                      onClick={() => handleNudgeRank(q.id, q.version, "down")}
                      title="Move down in rank (closer to #10)"
                      className="p-1.5 sm:p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#191F2D] touch-manipulation active:bg-gray-200"
                    >
                      <ChevronDown className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                  {/* 1..10 Pills (horizontally scrollable without breaking on 360px phones) */}
                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isChosen = rank === num;

                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleAssignRank(q.id, q.version, num)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                            isChosen
                              ? "bg-[#FF6B6B] text-white shadow-xs ring-2 ring-[#FF6B6B]/25 scale-105"
                              : "bg-white border border-[#E2E8F0] text-[#718096] hover:border-[#FF6B6B]/40 hover:text-[#191F2D]"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
