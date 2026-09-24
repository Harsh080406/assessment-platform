import { auth } from "@/auth";
import { getAdminAuditLogsAction } from "@/app/actions/admin";
import AdminAuditLogsClient from "./AdminAuditLogsClient";
import { ScrollText } from "lucide-react";

export default async function AdminAuditLogsPage() {
  await auth();
  const res = await getAdminAuditLogsAction();
  const logs = res.success && res.data ? res.data.logs : [];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
          <ScrollText className="w-4 h-4" /> System Traceability & Audit Ledger
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Immutable Audit Log Viewer
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Cryptographic system audit logs recording logins, report approvals, publishing state transitions, user status mutations, and question copy-on-write version events.
        </p>
      </div>

      <AdminAuditLogsClient initialLogs={logs} />
    </div>
  );
}
