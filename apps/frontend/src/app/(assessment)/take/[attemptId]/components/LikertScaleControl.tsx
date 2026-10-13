"use client";

import { QuestionType } from "@prisma/client";

interface LikertScaleControlProps {
  questionId: string;
  category?: string;
  questionType: QuestionType;
  sectionTitle: string;
  currentValue?: number | null;
  onChange: (value: { value: number }) => void;
  disabled?: boolean;
}

export default function LikertScaleControl({
  questionId,
  category,
  questionType,
  sectionTitle,
  currentValue,
  onChange,
  disabled = false,
}: LikertScaleControlProps) {
  // Determine if RIASEC / Interests anchors or Personality/Competency anchors apply
  const isInterests =
    questionType === QuestionType.RATING_5 ||
    sectionTitle.toLowerCase().includes("interest") ||
    [
      "realistic",
      "investigative",
      "artistic",
      "social",
      "enterprising",
      "conventional",
    ].includes((category || "").toLowerCase());

  const scaleItems = isInterests
    ? [
        { point: 1, label: "Would dislike it", subtext: "Strongly dislike" },
        { point: 2, label: "Dislike", subtext: "Prefer to avoid" },
        { point: 3, label: "Neutral", subtext: "Indifferent" },
        { point: 4, label: "Enjoy", subtext: "Would like it" },
        { point: 5, label: "Would love it", subtext: "Strongly enjoy" },
      ]
    : [
        { point: 1, label: "Strongly Disagree", subtext: "Not at all me" },
        { point: 2, label: "Disagree", subtext: "Rarely true" },
        { point: 3, label: "Neutral", subtext: "Sometimes true" },
        { point: 4, label: "Agree", subtext: "Usually true" },
        { point: 5, label: "Strongly Agree", subtext: "Very accurately me" },
      ];

  const leftAnchor = isInterests ? "← Would dislike it" : "← Strongly Disagree";
  const rightAnchor = isInterests ? "Would love it →" : "Strongly Agree →";

  return (
    <div className="space-y-2.5">
      {/* 5-Point Segmented / Card Control */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-2.5">
        {scaleItems.map((item) => {
          const isSelected = currentValue === item.point;

          return (
            <button
              key={`${questionId}-${item.point}`}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ value: item.point })}
              className={`group p-2.5 sm:p-3 rounded-xl border transition-all flex flex-row sm:flex-col items-center justify-between sm:justify-between gap-2.5 sm:gap-2 cursor-pointer touch-manipulation active:scale-[0.99] text-left sm:text-center ${
                disabled ? "opacity-60 cursor-not-allowed" : ""
              } ${
                isSelected
                  ? "bg-[#FFF8F5] border-[#FF6B6B] ring-2 sm:ring-3 ring-[#FF6B6B]/15 shadow-xs sm:scale-[1.01]"
                  : "bg-white border-[#E2E8F0] hover:border-[#FF6B6B]/40 hover:bg-[#FAF9F7]"
              }`}
            >
              {/* Left group on mobile / Top on desktop: Badge + Label */}
              <div className="flex sm:flex-col items-center gap-2.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
                {/* Point Badge */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "bg-[#FF6B6B] text-white shadow-xs ring-2 ring-white"
                      : "bg-[#F1F5F9] text-[#718096] group-hover:bg-[#E2E8F0] group-hover:text-[#191F2D]"
                  }`}
                >
                  {item.point}
                </div>

                {/* Label & Descriptive Subtext */}
                <div className="space-y-0.5 min-w-0">
                  <span
                    className={`block text-xs font-bold leading-tight ${
                      isSelected ? "text-[#FF6B6B]" : "text-[#191F2D]"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="block text-[10px] text-[#A0AEC0] leading-tight">
                    {item.subtext}
                  </span>
                </div>
              </div>

              {/* Mobile-only selection radio indicator */}
              <div
                className={`sm:hidden w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "border-[#FF6B6B] bg-[#FF6B6B]" : "border-[#CBD5E1] bg-white"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Anchor Bounds Label */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#8C95A6] px-1 pt-1 border-t border-[#F1F5F9]">
        <span>{leftAnchor}</span>
        <span className="hidden sm:inline text-[11px] text-[#CBD5E1]">5-point scale</span>
        <span>{rightAnchor}</span>
      </div>
    </div>
  );
}
