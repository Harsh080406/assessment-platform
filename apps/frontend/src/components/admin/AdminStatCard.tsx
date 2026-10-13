import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: "neutral" | "warning" | "danger" | "success";
  className?: string;
}

export default function AdminStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = "neutral",
  className = "",
}: AdminStatCardProps) {
  // Only alert when variant is warning/danger
  const valueColorClass = {
    neutral: "text-[#0F172A]",
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  }[variant];

  return (
    <div
      className={`bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 flex flex-col justify-between transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${valueColorClass}`}>
        {value}
      </div>

      {subtext && (
        <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
