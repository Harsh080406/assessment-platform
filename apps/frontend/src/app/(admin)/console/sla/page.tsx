import { getAdminSlaMonitoringAction } from "@/app/actions/admin";
import AdminSlaClient from "./AdminSlaClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminSlaMonitoringPage() {
  const res = await getAdminSlaMonitoringAction();

  const summary = res.success && res.data
    ? res.data.summary
    : { totalOverdue: 0, totalDueToday: 0, avgTurnaroundDays: 0, totalInProgress: 0 };

  const evaluations = res.success && res.data ? res.data.evaluations : [];
  const staffMembers = res.success && res.data ? res.data.staffMembers : [];

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="SLA Monitoring"
        description="Track clinical evaluation turnaround times, identify pipeline bottlenecks, and reassign stalled candidate submissions."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminSlaClient
        initialSummary={summary}
        initialEvaluations={evaluations}
        staffMembers={staffMembers}
      />
    </div>
  );
}
