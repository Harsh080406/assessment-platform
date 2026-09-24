import { auth } from "@/auth";
import { getAdminStaffWorkloadAction } from "@/app/actions/admin";
import AdminStaffClient from "./AdminStaffClient";
import { UserCog } from "lucide-react";

export default async function AdminStaffPage() {
  await auth();
  const res = await getAdminStaffWorkloadAction();
  const staffList = res.success && res.data ? res.data.staffList : [];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
          <UserCog className="w-4 h-4" /> Evaluator Capacity & RBAC Controls
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Staff Management & Workload Tracking
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Monitor staff evaluator open assignments, review capacity, published report volume, and reassign system permissions (Student, Staff, Admin).
        </p>
      </div>

      <AdminStaffClient initialStaff={staffList} />
    </div>
  );
}
