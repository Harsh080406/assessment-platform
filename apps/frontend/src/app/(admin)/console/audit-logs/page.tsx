import { auth } from "@/auth";
import { getAdminAuditLogsAction } from "@/app/actions/admin";
import AdminAuditLogsClient from "./AdminAuditLogsClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminAuditLogsPage() {
  await auth();
  const res = await getAdminAuditLogsAction();
  const logs = res.success && res.data ? res.data.logs : [];

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Audit Trail"
        description="Inspect cryptographic system event records, access state transitions, and audit logs."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminAuditLogsClient initialLogs={logs} />
    </div>
  );
}
