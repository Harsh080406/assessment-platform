"use client";

import { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  LogOut,
  Mail,
  Clock,
  Search,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Users,
  Timer,
  Lock,
  X,
} from "lucide-react";
import {
  AdminSecurityData,
  PrivilegedAccountSecurityInfo,
  adminForceLogoutUserAction,
} from "@/app/actions/admin";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminStatusPill, { AdminTag } from "@/components/admin/AdminStatusPill";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";
import {
  AdminTableToolbar,
  AdminTablePagination,
  AdminRowActions,
  AdminEmptyState,
  pluralize,
} from "@/components/admin/AdminDataTable";

interface AdminSecurityClientProps {
  initialData: AdminSecurityData;
}

export default function AdminSecurityClient({ initialData }: AdminSecurityClientProps) {
  const [data, setData] = useState<AdminSecurityData>(initialData);
  const [activeTab, setActiveTab] = useState<"accounts" | "invites">("accounts");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [terminatingAccount, setTerminatingAccount] = useState<PrivilegedAccountSecurityInfo | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleExecuteForceLogout = async () => {
    if (!terminatingAccount) return;

    setIsTerminating(true);
    setBannerFeedback(null);

    try {
      const res = await adminForceLogoutUserAction(terminatingAccount.id);
      if (res.success) {
        setBannerFeedback({ type: "success", text: res.message });
        setData((prev) => ({
          ...prev,
          accounts: prev.accounts.map((a) =>
            a.id === terminatingAccount.id ? { ...a, sessionVersion: a.sessionVersion + 1 } : a
          ),
        }));
        setTerminatingAccount(null);
      } else {
        setBannerFeedback({ type: "error", text: res.message || "Failed to terminate sessions." });
      }
    } catch (err: any) {
      setBannerFeedback({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsTerminating(false);
    }
  };

  const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return "never";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  };

  const currentList = activeTab === "accounts" ? data.accounts : data.accounts.filter((a) => a.isPendingActivation);

  const filteredAccounts = currentList.filter((acc) => {
    const matchesSearch =
      (acc.email || "").toLowerCase().includes(search.toLowerCase()) ||
      acc.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const paginatedAccounts = filteredAccounts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Feedback Banner */}
      {bannerFeedback && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            bannerFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{bannerFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Stat Cards: Neutral by default; MFA enrolled highlighted amber with explanation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Privileged Users"
          value={data.summary.totalPrivileged}
          subtext="Admin & staff credentials"
          icon={Shield}
          variant="neutral"
        />
        <AdminStatCard
          label="Pending Activations"
          value={data.summary.pendingInvites}
          subtext="Unclaimed staff invites"
          icon={Mail}
          variant={data.summary.pendingInvites > 0 ? "warning" : "neutral"}
        />
        <AdminStatCard
          label="MFA Enrolled"
          value={`${data.summary.mfaEnrolled}/${data.summary.totalPrivileged}`}
          subtext="MFA optional in system config"
          icon={Lock}
          variant={data.summary.mfaEnrolled < data.summary.totalPrivileged ? "warning" : "neutral"}
        />
        <AdminStatCard
          label="Suspended / Locked"
          value={data.summary.suspendedAccounts}
          subtext="Revoked login access"
          icon={UserX}
          variant={data.summary.suspendedAccounts > 0 ? "danger" : "neutral"}
        />
      </div>

      {/* 2. Navigation Tabs & Search Toolbar */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl overflow-x-auto scrollbar-none w-full sm:w-fit">
          <button
            type="button"
            onClick={() => {
              setActiveTab("accounts");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "accounts"
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>Privileged Accounts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                activeTab === "accounts" ? "bg-[#0F172A] text-white" : "bg-white text-[#64748B] border border-[#E2E8F0]"
              }`}
            >
              {data.accounts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("invites");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "invites"
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>Stalled & Pending Invites</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                activeTab === "invites" ? "bg-[#0F172A] text-white" : "bg-white text-[#64748B] border border-[#E2E8F0]"
              }`}
            >
              {data.accounts.filter((a) => a.isPendingActivation).length}
            </span>
          </button>
        </div>

        <AdminTableToolbar
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search account email or ID..."
          filters={
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Filter by role"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin Only</option>
              <option value="STAFF">Staff Only</option>
            </select>
          }
        />
      </div>

      {/* 3. Account Table / Card Container */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filteredAccounts.length === 0 ? (
          <AdminEmptyState
            title="No accounts match filters"
            description="There are currently no privileged accounts matching your selected criteria."
            action={
              (roleFilter !== "ALL" || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("ALL");
                    setSearch("");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop Table (>=768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4 w-[28%]">Account & Role</th>
                    <th className="py-3 px-4 w-[14%]">Status</th>
                    <th className="py-3 px-4 w-[16%]">MFA Posture</th>
                    <th className="py-3 px-4 w-[14%]">Session Version</th>
                    <th className="py-3 px-4 w-[20%]">Activity</th>
                    <th className="py-3 px-4 w-[8%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {paginatedAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Account & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A] truncate">
                          {acc.email || "No Email"}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {acc.role === "ADMIN" ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Staff
                            </span>
                          )}
                          <span className="text-[11px] text-[#94A3B8] font-mono truncate">
                            {acc.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {acc.isPendingActivation ? (
                          <AdminStatusPill label="Pending Invite" variant="warning" />
                        ) : acc.status === "ACTIVE" ? (
                          <AdminStatusPill label="Active" variant="success" />
                        ) : (
                          <AdminStatusPill label="Suspended" variant="danger" />
                        )}
                      </td>

                      {/* MFA Posture */}
                      <td className="py-3.5 px-4">
                        {acc.totpEnabled ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>MFA Enrolled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#64748B] font-medium text-xs">
                            <span>Password only</span>
                          </span>
                        )}
                      </td>

                      {/* Session Version */}
                      <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#334155]">
                        v{acc.sessionVersion}
                      </td>

                      {/* Combined Activity */}
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px] leading-tight">
                        <div>
                          Active <span className="font-semibold text-[#0F172A]">{formatRelativeTime(acc.lastLoginAt)}</span>
                        </div>
                        <div>
                          Created <span className="font-medium text-[#475569]">{formatRelativeTime(acc.createdAt)}</span>
                        </div>
                      </td>

                      {/* Overflow Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <AdminRowActions
                          overflowActions={[
                            {
                              label: "Force Logout All Sessions",
                              isDestructive: true,
                              onClick: () => setTerminatingAccount(acc),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (<768px) */}
            <div className="md:hidden divide-y divide-[#F1F5F9]">
              {paginatedAccounts.map((acc) => (
                <div key={acc.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] truncate">
                        {acc.email || "No Email"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {acc.role === "ADMIN" ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Staff
                          </span>
                        )}
                        <span className="text-[11px] text-[#64748B] font-mono">
                          v{acc.sessionVersion}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {acc.isPendingActivation ? (
                        <AdminStatusPill label="Pending Invite" variant="warning" />
                      ) : acc.status === "ACTIVE" ? (
                        <AdminStatusPill label="Active" variant="success" />
                      ) : (
                        <AdminStatusPill label="Suspended" variant="danger" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span>MFA Posture</span>
                      <span className="font-semibold text-[#0F172A]">
                        {acc.totpEnabled ? "MFA Enrolled" : "Password only"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span>Activity</span>
                      <span>
                        Active {formatRelativeTime(acc.lastLoginAt)} • Created {formatRelativeTime(acc.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTerminatingAccount(acc)}
                    className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Force Logout Active Sessions</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[#F1F5F9]">
              <AdminTablePagination
                page={page}
                pageSize={pageSize}
                totalCount={filteredAccounts.length}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Force Logout Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={!!terminatingAccount}
        onClose={() => setTerminatingAccount(null)}
        onConfirm={handleExecuteForceLogout}
        title="Force Logout Privileged Sessions"
        description="Terminating active sessions immediately invalidates tokens across all logged-in devices and browser tabs. The user will be required to re-authenticate."
        target={terminatingAccount ? `${terminatingAccount.email || terminatingAccount.id} (${terminatingAccount.role})` : undefined}
        confirmLabel="Force Logout"
        isDestructive={true}
        isLoading={isTerminating}
      />
    </div>
  );
}
