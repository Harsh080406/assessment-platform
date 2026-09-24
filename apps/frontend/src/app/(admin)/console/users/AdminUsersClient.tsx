"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Filter,
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserStatusAction, resetUserAccessAction } from "@/app/actions/admin";

interface UserItem {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  name: string;
  school: string | null;
  grade: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  attemptsCount: number;
}

interface AdminUsersClientProps {
  initialUsers: UserItem[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.school && u.school.toLowerCase().includes(q));

    return matchesRole && matchesStatus && matchesQuery;
  });

  const handleStatusToggle = (userId: string, currentStatus: UserStatus) => {
    const nextStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    setMessage(null);

    startTransition(async () => {
      const res = await updateUserStatusAction(userId, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
        setMessage({ text: res.message, type: "success" });
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  const handleResetAccess = (userId: string) => {
    setMessage(null);
    startTransition(async () => {
      const res = await resetUserAccessAction(userId);
      if (res.success) {
        setMessage({ text: res.message, type: "success" });
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="ALL">All Roles</option>
            <option value={UserRole.STUDENT}>Students</option>
            <option value={UserRole.STAFF}>Staff Evaluators</option>
            <option value={UserRole.ADMIN}>Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value={UserStatus.ACTIVE}>Active Accounts</option>
            <option value={UserStatus.SUSPENDED}>Disabled / Suspended</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Filter className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#0F172A]">No users match criteria</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              There are currently no registered users matching your search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">School & Grade</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Attempts</th>
                  <th className="py-3.5 px-6 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium">
                {filteredUsers.map((u) => {
                  const initials = u.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "US";

                  return (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#0F172A] text-sm">{u.name}</div>
                            <div className="text-[11px] text-[#64748B]">{u.email || u.phone || "No contact"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                            u.role === UserRole.ADMIN
                              ? "bg-red-50 text-red-700 border-red-200"
                              : u.role === UserRole.STAFF
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#475569]">
                        <div className="font-semibold text-[#0F172A]">{u.school || "Unspecified"}</div>
                        <div className="text-[11px] text-[#64748B]">{u.grade || "N/A"}</div>
                      </td>

                      <td className="py-4 px-4">
                        {u.status === UserStatus.ACTIVE ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-[#0F172A]">
                        {u.attemptsCount} attempts
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetAccess(u.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] transition-colors"
                            title="Reset Access / Force Password Reset"
                          >
                            <KeyRound className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              u.status === UserStatus.ACTIVE
                                ? "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            }`}
                          >
                            {u.status === UserStatus.ACTIVE ? "Disable Account" : "Re-Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
