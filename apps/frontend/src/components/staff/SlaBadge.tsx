import { computeSlaInfo } from "@/lib/sla";

interface SlaBadgeProps {
  submittedAt: string | null | Date | undefined;
  slaDays?: number;
  className?: string;
}

export default function SlaBadge({ submittedAt, slaDays, className = "" }: SlaBadgeProps) {
  const sla = computeSlaInfo(submittedAt, slaDays);
  if (!sla) {
    return <span className="text-xs text-[#94A3B8]">—</span>;
  }

  const formattedDueDate = sla.dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract clean text without redundant parentheses
  // e.g., if sla.label is "Overdue (7d overdue)" -> show "7d overdue"
  // e.g., if "Due Soon (12h left)" -> show "12h left"
  // e.g., if "On Track (3d left)" -> show "3d left"
  const match = sla.label.match(/\(([^)]+)\)/);
  const cleanDuration = match ? match[1] : sla.label;

  switch (sla.status) {
    case "OVERDUE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-red-700 ${className}`}
          title={`Target Due Date: ${formattedDueDate}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
          <span>{cleanDuration}</span>
        </span>
      );

    case "DUE_SOON":
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 ${className}`}
          title={`Target Due Date: ${formattedDueDate}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>{cleanDuration}</span>
        </span>
      );

    case "ON_TRACK":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs text-[#64748B] ${className}`}
          title={`Target Due Date: ${formattedDueDate}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{cleanDuration}</span>
        </span>
      );
  }
}
