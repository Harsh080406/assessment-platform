"use client";

import { useState, useTransition } from "react";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserStatusAction, resetUserAccessAction } from "@/app/actions/admin";
import AdminStatusPill, { AdminTag } from "@/components/admin/AdminStatusPill";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";
import {
  AdminTableToolbar,
  AdminTablePagination,
  AdminRowActions,
  AdminEmptyState,
  pluralize,
  formatFallback,
  type ActiveFilter,
} from "@/components/admin/AdminDataTable";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    user: UserItem | null;
    actionType: "disable" | "enable" | "reset";
  }>({
    isOpen: false,
    user: null,
    actionType: "disable",
  });

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

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Active filter chips
  const activeFilters: ActiveFilter[] = [];
  if (roleFilter !== "ALL") {
    activeFilters.push({
      key: "role",
      label: "Role",
      valueLabel: roleFilter,
    });
  }
  if (statusFilter !== "ALL") {
    activeFilters.push({
      key: "status",
      label: "Status",
      valueLabel: statusFilter === UserStatus.ACTIVE ? "Active" : "Disabled",
    });
  }

  const handleExecuteStatusToggle = (user: UserItem) => {
    const nextStatus = user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    setMessage(null);

    startTransition(async () => {
      const res = await updateUserStatusAction(user.id, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        setMessage({ text: res.message, type: "success" });
        setConfirmDialog({ isOpen: false, user: null, actionType: "disable" });
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  const handleExecuteResetAccess = (user: UserItem) => {
    setMessage(null);
    startTransition(async () => {
      const res = await resetUserAccessAction(user.id);
      if (res.success) {
        setMessage({ text: res.message, type: "success" });
        setConfirmDialog({ isOpen: false, user: null, actionType: "reset" });
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  const renderRoleTag = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Admin
          </span>
        );
      case UserRole.STAFF:
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Staff
          </span>
        );
      default:
        return <AdminTag>Student</AdminTag>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {message && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
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
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar: Search & Compact Dropdowns */}
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        searchPlaceholder="Search candidate by name, email, school..."
        filters={
          <>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Filter by role"
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.STUDENT}>Students</option>
              <option value={UserRole.STAFF}>Staff Evaluators</option>
              <option value={UserRole.ADMIN}>Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.SUSPENDED}>Disabled</option>
            </select>
          </>
        }
        activeFilters={activeFilters}
        onRemoveFilter={(key) => {
          if (key === "role") setRoleFilter("ALL");
          if (key === "status") setStatusFilter("ALL");
          setPage(1);
        }}
        onClearAllFilters={() => {
          setRoleFilter("ALL");
          setStatusFilter("ALL");
          setSearchQuery("");
          setPage(1);
        }}
      />

      {/* Users Table / Mobile Cards */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filteredUsers.length === 0 ? (
          <AdminEmptyState
            title="No candidate accounts match criteria"
            description="There are currently no registered users matching your search parameters."
            action={
              (roleFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                    setSearchQuery("");
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
                    <th className="py-3 px-4 w-[30%]">User Account</th>
                    <th className="py-3 px-4 w-[14%]">Role</th>
                    <th className="py-3 px-4 w-[24%]">School & Grade</th>
                    <th className="py-3 px-4 w-[12%]">Status</th>
                    <th className="py-3 px-4 w-[10%]">Attempts</th>
                    <th className="py-3 px-4 w-[10%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {paginatedUsers.map((u) => {
                    const initials = u.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "US";

                    return (
                      <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                        {/* Account */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#0F172A] truncate">
                                {u.name}
                              </div>
                              <div className="text-[11px] text-[#64748B] font-mono truncate">
                                {u.email || u.phone || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">{renderRoleTag(u.role)}</td>

                        {/* School & Grade (muted dash fallback) */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#0F172A] truncate">
                            {formatFallback(u.school)}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate">
                            {formatFallback(u.grade)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {u.status === UserStatus.ACTIVE ? (
                            <AdminStatusPill label="Active" variant="success" />
                          ) : (
                            <AdminStatusPill label="Disabled" variant="danger" />
                          )}
                        </td>

                        {/* Attempts */}
                        <td className="py-3.5 px-4 tabular-nums font-semibold text-[#0F172A]">
                          {pluralize(u.attemptsCount, "attempt", "attempts")}
                        </td>

                        {/* Overflow Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <AdminRowActions
                            primaryAction={
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    user: u,
                                    actionType: "reset",
                                  })
                                }
                                className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
                                title="Reset access / Send password reset"
                                aria-label="Reset password"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            }
                            overflowActions={[
                              {
                                label:
                                  u.status === UserStatus.ACTIVE
                                    ? "Disable Account"
                                    : "Re-Enable Account",
                                isDestructive: u.status === UserStatus.ACTIVE,
                                onClick: () =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    user: u,
                                    actionType:
                                      u.status === UserStatus.ACTIVE ? "disable" : "enable",
                                  }),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (<768px) */}
            <div className="md:hidden divide-y divide-[#F1F5F9]">
              {paginatedUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-[#64748B] font-mono truncate">
                        {u.email || u.phone || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {renderRoleTag(u.role)}
                      {u.status === UserStatus.ACTIVE ? (
                        <AdminStatusPill label="Active" variant="success" />
                      ) : (
                        <AdminStatusPill label="Disabled" variant="danger" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span>School & Grade</span>
                      <span className="font-medium text-[#0F172A]">
                        {formatFallback(u.school)} • {formatFallback(u.grade)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span>Attempts</span>
                      <span className="font-bold text-[#0F172A]">
                        {pluralize(u.attemptsCount, "attempt", "attempts")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          user: u,
                          actionType: "reset",
                        })
                      }
                      className="flex-1 py-2 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reset Access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          user: u,
                          actionType: u.status === UserStatus.ACTIVE ? "disable" : "enable",
                        })
                      }
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                        u.status === UserStatus.ACTIVE
                          ? "border border-red-200 text-red-600 hover:bg-red-50"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {u.status === UserStatus.ACTIVE ? "Disable" : "Re-Enable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-[#F1F5F9]">
              <AdminTablePagination
                page={page}
                pageSize={pageSize}
                totalCount={filteredUsers.length}
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

      {/* Destructive & High-Impact Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, user: null, actionType: "disable" })}
        onConfirm={() => {
          if (!confirmDialog.user) return;
          if (confirmDialog.actionType === "reset") {
            handleExecuteResetAccess(confirmDialog.user);
          } else {
            handleExecuteStatusToggle(confirmDialog.user);
          }
        }}
        title={
          confirmDialog.actionType === "disable"
            ? "Disable User Account"
            : confirmDialog.actionType === "enable"
            ? "Re-Enable User Account"
            : "Reset User Password Access"
        }
        description={
          confirmDialog.actionType === "disable"
            ? "Disabling this account immediately revokes access to tests and results. The user will not be able to log in until reactivated."
            : confirmDialog.actionType === "enable"
            ? "This will restore active login access to the user's dashboard and assessments."
            : "This will invalidate active credentials and initiate an administrative password reset routine for this user."
        }
        target={confirmDialog.user ? `${confirmDialog.user.name} (${confirmDialog.user.email || confirmDialog.user.phone || confirmDialog.user.id})` : undefined}
        confirmLabel={
          confirmDialog.actionType === "disable"
            ? "Disable Account"
            : confirmDialog.actionType === "enable"
            ? "Re-Enable Account"
            : "Confirm Reset"
        }
        isDestructive={confirmDialog.actionType === "disable"}
        isLoading={isPending}
      />
    </div>
  );
}
