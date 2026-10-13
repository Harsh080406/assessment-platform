/**
 * SLA Due-Date Calculation Helper Module
 *
 * Computes turnaround due dates and SLA statuses (On Track, Due Soon, Overdue).
 * Default SLA is 4 days (96 hours).
 *
 * // TODO: read DEFAULT_SLA_DAYS from SystemConfig (Priority 9)
 */

export const DEFAULT_SLA_DAYS = 4;

export type SlaStatus = "ON_TRACK" | "DUE_SOON" | "OVERDUE";

export interface SlaInfo {
  dueDate: Date;
  status: SlaStatus;
  label: string;
  hoursRemaining: number;
  isOverdue: boolean;
}

/**
 * Calculates due date and SLA status based on submittedAt timestamp and SLA duration in days.
 */
export function computeSlaInfo(
  submittedAtInput: string | null | Date | undefined,
  slaDays: number = DEFAULT_SLA_DAYS
): SlaInfo | null {
  if (!submittedAtInput) return null;

  const submittedAt = new Date(submittedAtInput);
  if (isNaN(submittedAt.getTime())) return null;

  // dueDate = submittedAt + (slaDays * 24h in ms)
  const dueDate = new Date(submittedAt.getTime() + slaDays * 24 * 60 * 60 * 1000);
  const now = new Date();

  const msRemaining = dueDate.getTime() - now.getTime();
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    const overdueHours = Math.abs(Math.floor(hoursRemaining));
    const overdueDays = Math.floor(overdueHours / 24);
    const timeText = overdueDays > 0 ? `${overdueDays}d overdue` : `${overdueHours}h overdue`;

    return {
      dueDate,
      status: "OVERDUE",
      label: `Overdue (${timeText})`,
      hoursRemaining,
      isOverdue: true,
    };
  }

  if (hoursRemaining <= 24) {
    const hrs = Math.max(1, Math.floor(hoursRemaining));
    return {
      dueDate,
      status: "DUE_SOON",
      label: `Due Soon (${hrs}h left)`,
      hoursRemaining,
      isOverdue: false,
    };
  }

  const daysLeft = Math.floor(hoursRemaining / 24);
  return {
    dueDate,
    status: "ON_TRACK",
    label: `On Track (${daysLeft}d left)`,
    hoursRemaining,
    isOverdue: false,
  };
}
