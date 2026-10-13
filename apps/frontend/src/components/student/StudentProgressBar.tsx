interface StudentProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  detail?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function StudentProgressBar({
  value,
  label,
  detail,
  showPercentage = true,
  className = "",
}: StudentProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage || detail) && (
        <div className="flex items-center justify-between text-xs text-[#475569]">
          {label ? (
            <span className="font-semibold text-[#0F172A]">{label}</span>
          ) : detail ? (
            <span className="font-medium text-[#64748B]">{detail}</span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {detail && label && (
              <span className="font-medium text-[#64748B] text-[11px]">{detail}</span>
            )}
            {showPercentage && (
              <span className="font-bold text-[#0F172A] tabular-nums">{clamped}%</span>
            )}
          </div>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
        className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-[#4F46E5] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
