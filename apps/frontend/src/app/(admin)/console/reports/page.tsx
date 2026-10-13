import { auth } from "@/auth";
import { getAdminReportQueueAction } from "@/app/actions/admin";
import AdminReportsClient from "./AdminReportsClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminReportQueuePage() {
  await auth();
  const res = await getAdminReportQueueAction();
  const reports = res.success && res.data ? res.data.reports : [];

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Report Approvals"
        description="Inspect uploaded PDF reports, preview document formatting, approve expert evaluations, or publish certified reports."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminReportsClient initialReports={reports} />
    </div>
  );
}
