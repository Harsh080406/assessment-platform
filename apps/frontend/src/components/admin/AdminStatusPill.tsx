import React from "react";

export type AdminPillVariant = "neutral" | "info" | "success" | "warning" | "danger";

interface AdminStatusPillProps {
  label: string;
  variant?: AdminPillVariant;
  dot?: boolean;
  className?: string;
}

const pillVariantStyles: Record<AdminPillVariant, { container: string; dot: string }> = {
  neutral: {
    container: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  },
  info: {
    container: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-600",
  },
  success: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-600",
  },
  warning: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-600",
  },
  danger: {
    container: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-600",
  },
};

export default function AdminStatusPill({
  label,
  variant = "neutral",
  dot = true,
  className = "",
}: AdminStatusPillProps) {
  const styles = pillVariantStyles[variant] || pillVariantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}

interface AdminTagProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTag({ children, className = "" }: AdminTagProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] ${className}`}
    >
      {children}
    </span>
  );
}
