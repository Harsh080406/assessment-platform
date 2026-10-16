"use client";

import { useState, useTransition } from "react";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  Copy,
  Check,
  MapPin,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import {
  updateUserStatusAction,
  resetUserAccessAction,
  inviteUserAction,
  updateUserLocationAction,
} from "@/app/actions/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
  location: string | null;
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

  // Invite User Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.STUDENT);
  const [createdActivationUrl, setCreatedActivationUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Location Modal State
  const [editingLocationUser, setEditingLocationUser] = useState<UserItem | null>(null);
  const [newLocationValue, setNewLocationValue] = useState("");

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
      (u.school && u.school.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q));

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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setCreatedActivationUrl(null);

    startTransition(async () => {
      const res = await inviteUserAction({
        email: inviteEmail,
        role: inviteRole,
      });

      if (res.success && res.data) {
        setCreatedActivationUrl(res.data.activationUrl);
        setMessage({ text: res.message, type: "success" });

        // Optimistically add invited user to candidate list
        setUsers((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            phone: null,
            role: inviteRole,
            status: UserStatus.INACTIVE,
            school: null,
            grade: null,
            location: null,
            createdAt: new Date().toISOString(),
            lastLoginAt: null,
            attemptsCount: 0,
          },
          ...prev,
        ]);
        setInviteEmail("");
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  const copyActivationLink = () => {
    if (createdActivationUrl) {
      navigator.clipboard.writeText(createdActivationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
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
    <div className="space-y-6">
      {/* 1. Page Header with Invite User Primary Button */}
      <AdminPageHeader
        title="User Governance"
        description="Manage candidate accounts, role assignments, security statuses, and access credentials."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
        action={
          <button
            type="button"
            onClick={() => {
              setShowInviteModal(true);
              setCreatedActivationUrl(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite User</span>
          </button>
        }
      />

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
                    <th className="py-3 px-4 w-[26%]">User Account</th>
                    <th className="py-3 px-4 w-[12%]">Role</th>
                    <th className="py-3 px-4 w-[18%]">School & Grade</th>
                    <th className="py-3 px-4 w-[18%]">Location</th>
                    <th className="py-3 px-4 w-[10%]">Status</th>
                    <th className="py-3 px-4 w-[8%]">Attempts</th>
                    <th className="py-3 px-4 w-[8%] text-right">Actions</th>
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

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          {u.location ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#0F172A] truncate">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate font-medium" title={u.location}>
                                {u.location}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#94A3B8] italic text-[11px]">Not provided</span>
                          )}
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
                                label: "Edit Location",
                                onClick: () => {
                                  setEditingLocationUser(u);
                                  setNewLocationValue(u.location || "");
                                },
                              },
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
                      <span>Location</span>
                      <span className="font-medium text-[#0F172A] flex items-center gap-1">
                        {u.location ? (
                          <>
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{u.location}</span>
                          </>
                        ) : (
                          <span className="text-[#94A3B8] italic">—</span>
                        )}
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

      {/* Invite User Modal */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">
                Invite User to Platform
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdActivationUrl ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Congratulatory Invitation Email Sent!</p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      An activation email has been dispatched with instructions for the user to submit their profile details and create their password. You may also provide the link directly below:
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0F172A] block">
                    Activation Link (Valid for 48 Hours)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdActivationUrl}
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono text-[#0F172A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyActivationLink}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] shrink-0 transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setCreatedActivationUrl(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Invitee Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Assigned Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={UserRole.STUDENT}>STUDENT (Candidate Assessment)</option>
                    <option value={UserRole.STAFF}>STAFF (Evaluator / Reviewer)</option>
                    <option value={UserRole.ADMIN}>ADMIN (System Administrator)</option>
                  </select>
                </div>

                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Upon dispatching, a congratulatory invitation email will be delivered to this address instructing the user to proceed to the secure activation link, enter their personal details (name, date of birth, address, phone), and create their password.
                </p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !inviteEmail.trim()}
                    className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    {isPending ? "Sending Invitation..." : "Send Invitation & Email"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit User Location Modal */}
      {editingLocationUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E2E8F0] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Edit User Location</h3>
                  <p className="text-[11px] text-[#64748B]">
                    {editingLocationUser.name} ({editingLocationUser.email || "No email"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLocationUser(null)}
                className="p-1 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await updateUserLocationAction(
                    editingLocationUser.id,
                    newLocationValue
                  );
                  if (res.success) {
                    setUsers((prev) =>
                      prev.map((usr) =>
                        usr.id === editingLocationUser.id
                          ? { ...usr, location: newLocationValue.trim() || null }
                          : usr
                      )
                    );
                    setMessage({ text: res.message, type: "success" });
                    setEditingLocationUser(null);
                  } else {
                    setMessage({ text: res.message, type: "error" });
                  }
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Full Address, City or Country
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={newLocationValue}
                    onChange={(e) => setNewLocationValue(e.target.value)}
                    placeholder="e.g. New Delhi, India or London, UK"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">
                  This location is used for regional demographics, timezones, and assessment routing.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setEditingLocationUser(null)}
                  className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
