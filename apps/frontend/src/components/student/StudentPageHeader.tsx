import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StudentPageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  backHref?: string;
  backLabel?: string;
}

export default function StudentPageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
}: StudentPageHeaderProps) {
  return (
    <div className="w-full pb-1 border-b border-[#E2E8F0] space-y-2">
      {backHref && (
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1 max-w-3xl">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[#475569] leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0 pt-1 sm:pt-0">
            <Link
              href={action.href}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] transition-colors shadow-2xs cursor-pointer min-h-[40px]"
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
