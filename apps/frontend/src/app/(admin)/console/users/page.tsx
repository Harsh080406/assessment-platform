import { auth } from "@/auth";
import { getAdminUsersAction } from "@/app/actions/admin";
import AdminUsersClient from "./AdminUsersClient";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  await auth();
  const res = await getAdminUsersAction();
  const users = res.success && res.data ? res.data.users : [];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          <Users className="w-4 h-4" /> Identity & RBAC Governance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          User & Candidate Management
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Manage user accounts across the platform. Search candidate databases, disable or re-enable accounts, inspect attempt counts, and trigger password access reset routines.
        </p>
      </div>

      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
