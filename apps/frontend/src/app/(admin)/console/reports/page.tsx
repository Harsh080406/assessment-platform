import { auth } from "@/auth";
import { getAdminReportQueueAction } from "@/app/actions/admin";
import AdminReportsClient from "./AdminReportsClient";
import { FileCheck } from "lucide-react";

export default async function AdminReportQueuePage() {
  await auth();
  const res = await getAdminReportQueueAction();
  const reports = res.success && res.data ? res.data.reports : [];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
          <FileCheck className="w-4 h-4" /> Approval & Publishing Workflow
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Report Approval & Publishing Queue
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Inspect uploaded candidate PDF reports, preview document formatting, approve expert submissions, or publish certified reports directly to student dashboards.
        </p>
      </div>

      <AdminReportsClient initialReports={reports} />
    </div>
  );
}
