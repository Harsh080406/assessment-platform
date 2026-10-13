"use client";

interface QuestionOption {
  id: string;
  optionText: string;
  displayOrder: number;
}

interface MCQSingleCorrectControlProps {
  questionId: string;
  questionVersion: number;
  options: QuestionOption[];
  selectedOptionId?: string | null;
  onChange: (value: { selected: string }) => void;
  disabled?: boolean;
}

export default function MCQSingleCorrectControl({
  questionId,
  questionVersion,
  options,
  selectedOptionId,
  onChange,
  disabled = false,
}: MCQSingleCorrectControlProps) {
  return (
    <div className="space-y-2 sm:space-y-2.5">
      {options.map((option, optIdx) => {
        const optionLetter = String.fromCharCode(65 + optIdx);
        const isSelected = selectedOptionId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ selected: option.id })}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer touch-manipulation active:scale-[0.99] ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            } ${
              isSelected
                ? "bg-[#FFF8F5] border-[#FF6B6B] ring-2 sm:ring-3 ring-[#FF6B6B]/15 shadow-xs"
                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#FF6B6B] text-white shadow-xs"
                    : "bg-[#F1F5F9] text-[#718096]"
                }`}
              >
                {optionLetter}
              </span>
              <span
                className={`text-xs sm:text-sm font-medium leading-snug ${
                  isSelected ? "text-[#191F2D] font-bold" : "text-[#334155]"
                }`}
              >
                {option.optionText}
              </span>
            </div>

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
  );
}
