import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StaffPageHeaderProps {
  title: string;
  description: string;
  count?: number | string;
  countLabel?: string;
  backHref?: string;
  backLabel?: string;
}

export default function StaffPageHeader({
  title,
  description,
  count,
  countLabel,
  backHref,
  backLabel,
}: StaffPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#E2E8F0]">
      <div className="space-y-1 max-w-2xl min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors mb-1 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{backLabel || "Back to Live Queue"}</span>
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0F172A]">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-2 sm:line-clamp-1">
          {description}
        </p>
      </div>

      {count !== undefined && countLabel && (
        <div className="flex items-baseline gap-1.5 shrink-0 sm:self-center">
          <span className="text-lg sm:text-xl font-bold tabular-nums text-[#0F172A]">
            {count}
          </span>
          <span className="text-xs text-[#64748B] font-medium">
            {countLabel}
          </span>
        </div>
      )}
    </div>
  );
}
