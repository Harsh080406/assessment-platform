"use client";

import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface QuestionOption {
  id: string;
  optionText: string;
  displayOrder: number;
}

interface SJTDualSelectControlProps {
  questionId: string;
  questionVersion: number;
  questionText?: string;
  options: QuestionOption[];
  currentAnswer?: { selected?: string; mostEffective?: string; leastEffective?: string } | string | null;
  onChange: (answer: { selected: string; mostEffective?: string; leastEffective?: string }) => void;
  disabled?: boolean;
}

export default function SJTDualSelectControl({
  questionId,
  questionVersion,
  questionText,
  options,
  currentAnswer,
  onChange,
  disabled = false,
}: SJTDualSelectControlProps) {
  const selectedOptionId =
    typeof currentAnswer === "string"
      ? currentAnswer
      : currentAnswer?.selected || currentAnswer?.mostEffective || undefined;

  const handleSelectOption = (optionId: string) => {
    if (disabled) return;
    onChange({
      selected: optionId,
      mostEffective: optionId,
    });
  };

  const isComplete = Boolean(selectedOptionId);

  return (
    <div className="space-y-3">
      {/* Scenario Instruction Banner */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-snug">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Situational Judgment:</span> Read the scenario carefully and select the single best course of action.
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((option, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectOption(option.id)}
              className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer touch-manipulation active:scale-[0.99] ${
                disabled ? "opacity-60 cursor-not-allowed" : ""
              } ${
                isSelected
                  ? "bg-[#FFF8F5] border-[#FF6B6B] ring-2 ring-[#FF6B6B]/20 shadow-xs"
                  : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/50"
              }`}
            >
              {/* Option Letter & Text */}
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? "bg-[#FF6B6B] text-white shadow-xs"
                      : "bg-[#F1F5F9] text-[#718096]"
                  }`}
                >
                  {letter}
                </span>
                <p
                  className={`text-xs sm:text-sm font-medium leading-relaxed ${
                    isSelected ? "text-[#191F2D] font-bold" : "text-[#334155]"
                  }`}
                >
                  {option.optionText}
                </p>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "border-[#FF6B6B] bg-[#FF6B6B]" : "border-[#CBD5E1] bg-white"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Status Pill */}
      <div className="flex items-center justify-between text-xs px-1">
        {isComplete ? (
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Response selected. Ready to continue.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Select the single best response for this scenario.</span>
          </div>
        )}
      </div>
    </div>
  );
}
