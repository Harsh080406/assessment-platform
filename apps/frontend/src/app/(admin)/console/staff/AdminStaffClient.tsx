"use client";

import { useState, useTransition } from "react";
import {
  UserPlus,
  Briefcase,
  Copy,
  Check,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserRoleAction, inviteStaffOrAdminAction } from "@/app/actions/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusPill, { AdminTag } from "@/components/admin/AdminStatusPill";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";

interface StaffItem {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  specialty: string | null;
  activeReviewsCount: number;
  publishedCount: number;
  createdAt: string;
  available?: boolean;
}

interface AdminStaffClientProps {
  initialStaff: StaffItem[];
}

export default function AdminStaffClient({ initialStaff }: AdminStaffClientProps) {
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.STAFF);
  const [createdActivationUrl, setCreatedActivationUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Role Confirmation Dialog State
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    staff: StaffItem;
    newRole: UserRole;
  } | null>(null);

  const handleRoleChangeSelect = (staff: StaffItem, newRole: UserRole) => {
    if (staff.role === newRole) return;
    setPendingRoleChange({ staff, newRole });
  };

  const handleConfirmRoleChange = () => {
    if (!pendingRoleChange) return;
    const { staff, newRole } = pendingRoleChange;

    setMessage(null);
    startTransition(async () => {
      const res = await updateUserRoleAction(staff.id, newRole);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, role: newRole } : s))
        );
        setMessage({ text: res.message, type: "success" });
        setPendingRoleChange(null);
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
      const res = await inviteStaffOrAdminAction({
        email: inviteEmail,
        role: inviteRole,
      });

      if (res.success && res.data) {
        setCreatedActivationUrl(res.data.activationUrl);
        setMessage({ text: res.message, type: "success" });

        // Optimistically add inactive staff item
        setStaffList((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            role: inviteRole,
            status: UserStatus.INACTIVE,
            specialty: inviteRole === UserRole.STAFF ? "General Evaluator" : "System Administrator",
            activeReviewsCount: 0,
            publishedCount: 0,
            createdAt: new Date().toISOString(),
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

  return (
    <div className="space-y-6">
      {/* 1. Page Header with "Invite staff / admin" as Primary Button */}
      <AdminPageHeader
        title="Staff & Workload"
        description="Monitor staff evaluator open assignments, review capacity, published report volume, and manage internal roles."
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
            <span>Invite staff / admin</span>
          </button>
        }
      />

      {/* 2. Toast Feedback */}
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

      {/* 3. Generated Activation Link Callout */}
      {createdActivationUrl && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[#0F172A] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Signed Account Activation Link</span>
            </div>
            <button
              type="button"
              onClick={copyActivationLink}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
          <p className="text-xs text-[#475569]">
            Share this activation link with the invitee to establish credentials:
          </p>
          <div className="p-2.5 bg-white rounded-lg border border-indigo-200 text-xs font-mono break-all text-[#0F172A] select-all">
            {createdActivationUrl}
          </div>
        </div>
      )}

      {/* 4. Staff Card Grid (3-up laptop, 1-up mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((staff) => {
          const initials = staff.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ST";

          return (
            <div
              key={staff.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 flex flex-col justify-between space-y-4"
            >
              {/* Card Header: Avatar + Identity + Status Tags */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#0F172A] truncate">
                        {staff.name}
                      </h3>
                      <p className="text-xs text-[#64748B] font-mono truncate">
                        {staff.email || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {staff.role === UserRole.ADMIN ? (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Staff
                      </span>
                    )}

                    {staff.status === UserStatus.INACTIVE ? (
                      <AdminStatusPill label="Pending Invite" variant="warning" />
                    ) : staff.available === false ? (
                      <AdminStatusPill label="Paused" variant="neutral" />
                    ) : (
                      <AdminStatusPill label="Available" variant="success" />
                    )}
                  </div>
                </div>

                {/* Specialty (single line) */}
                <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  <span className="text-[#334155] font-medium truncate">
                    {staff.specialty || "Psychometric Evaluator"}
                  </span>
                </div>

                {/* Two Neutral Workload Counters */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-lg font-bold text-[#0F172A] tabular-nums">
                      {staff.activeReviewsCount}
                    </div>
                    <div className="text-[11px] font-medium text-[#64748B] uppercase">
                      Open Reviews
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-lg font-bold text-[#0F172A] tabular-nums">
                      {staff.publishedCount}
                    </div>
                    <div className="text-[11px] font-medium text-[#64748B] uppercase">
                      Published Reports
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Select */}
              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#64748B]">Assign Role:</span>
                <select
                  value={staff.role}
                  onChange={(e) => handleRoleChangeSelect(staff, e.target.value as UserRole)}
                  disabled={isPending}
                  className="py-1 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={UserRole.STAFF}>STAFF</option>
                  <option value={UserRole.ADMIN}>ADMIN</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision Staff Modal */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">
                Invite Staff / Admin Member
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

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Invitee Email Address
                </label>
                <input
                  type="email"
                  placeholder="staff@alderwoodvantage.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Assigned Clearance Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={UserRole.STAFF}>STAFF (Clinical Evaluator)</option>
                  <option value={UserRole.ADMIN}>ADMIN (System Administrator)</option>
                </select>
              </div>

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
                  {isPending ? "Generating..." : "Generate Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={!!pendingRoleChange}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={handleConfirmRoleChange}
        title="Change Staff Member Role"
        description={`Are you sure you want to change this member's clearance role to ${pendingRoleChange?.newRole}? This modifies administrative permissions and dashboard access immediately.`}
        target={pendingRoleChange ? `${pendingRoleChange.staff.name} (${pendingRoleChange.staff.email})` : undefined}
        confirmLabel="Confirm Role Change"
        isDestructive={false}
        isLoading={isPending}
      />
    </div>
  );
}
