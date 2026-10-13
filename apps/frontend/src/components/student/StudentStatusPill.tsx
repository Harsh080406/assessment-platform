export type StudentStatusType =
  | "NOT_STARTED"
  | "READY"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "PUBLISHED";

interface StudentStatusPillProps {
  status: StudentStatusType | string;
  labelOverride?: string;
  className?: string;
}

export default function StudentStatusPill({
  status,
  labelOverride,
  className = "",
}: StudentStatusPillProps) {
  const norm = (status || "").toUpperCase();

  let dotColor = "bg-slate-400";
  let textColor = "text-[#334155]";
  let bgColor = "bg-slate-50";
  let borderColor = "border-[#E2E8F0]";
  let label = labelOverride || "Not started";

  switch (norm) {
    case "COMPLETED":
    case "PUBLISHED":
      dotColor = "bg-emerald-600";
      textColor = "text-emerald-800";
      bgColor = "bg-emerald-50";
      borderColor = "border-emerald-200";
      label = labelOverride || "Completed";
      break;

    case "IN_PROGRESS":
      dotColor = "bg-[#4F46E5]";
      textColor = "text-[#3730A3]";
      bgColor = "bg-[#EEF2FF]";
      borderColor = "border-[#C7D2FE]";
      label = labelOverride || "In progress";
      break;

    case "UNDER_REVIEW":
    case "REPORT_IN_PREP":
    case "PENDING_APPROVAL":
    case "SUBMITTED":
      dotColor = "bg-[#4F46E5]";
      textColor = "text-[#3730A3]";
      bgColor = "bg-[#F5F3FF]";
      borderColor = "border-[#DDD6FE]";
      label = labelOverride || "Under review";
      break;

    case "READY":
      dotColor = "bg-blue-500";
      textColor = "text-blue-800";
      bgColor = "bg-blue-50";
      borderColor = "border-blue-200";
      label = labelOverride || "Ready";
      break;

    case "NOT_STARTED":
    default:
      dotColor = "bg-slate-400";
      textColor = "text-[#475569]";
      bgColor = "bg-slate-100";
      borderColor = "border-slate-200";
      label = labelOverride || "Not started";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgColor} ${borderColor} ${textColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
