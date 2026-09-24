"use client";

import { useState, useTransition } from "react";
import {
  UserCog,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Briefcase,
  UserPlus,
  Copy,
  Check,
  Mail,
  ArrowRight,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserRoleAction, inviteStaffOrAdminAction } from "@/app/actions/admin";

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

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, role: newRole } : s))
        );
        setMessage({ text: res.message, type: "success" });
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

        // Optimistically add inactive staff item to list if STAFF
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
            Staff & Administrator Management
          </h2>
          <p className="text-xs text-[#64748B]">
            Provision staff/admin accounts via secure invite links. Self-registration for administrative roles is restricted.
          </p>
        </div>

        <button
          onClick={() => {
            setShowInviteModal(true);
            setCreatedActivationUrl(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <UserPlus className="w-4 h-4 text-indigo-400" />
          <span>Invite Staff / Admin</span>
        </button>
      </div>

      {/* Global Alert */}
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

      {/* Generated Activation Link Banner (If active) */}
      {createdActivationUrl && (
        <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-900">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Signed Activation Link Created (Fix #1)</span>
            </div>
            <button
              onClick={copyActivationLink}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
          <p className="text-xs font-medium text-indigo-800">
            Share this link with the invitee to let them activate their account with a Password or Google OAuth:
          </p>
          <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs font-mono break-all text-indigo-950 font-bold select-all">
            {createdActivationUrl}
          </div>
        </div>
      )}

      {/* Invite Modal / Card Drawer */}
      {showInviteModal && (
        <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-[#0F172A]">Provision New Staff or Admin</h3>
            </div>
            <button
              onClick={() => setShowInviteModal(false)}
              className="text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-[#334155]">Invitee Email Address</label>
              <input
                type="email"
                placeholder="staff@aurapath.org"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-[#334155]">Assigned Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value={UserRole.STAFF}>STAFF (Evaluator)</option>
                <option value={UserRole.ADMIN}>ADMIN (System Administrator)</option>
              </select>
            </div>

            <div className="sm:col-span-1 flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {isPending ? "Generating..." : "Generate Invite"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#0F172A]">{staff.name}</h3>
                      <p className="text-xs text-[#64748B]">{staff.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                        staff.role === UserRole.ADMIN
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {staff.role}
                    </span>
                    {staff.status === UserStatus.INACTIVE && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Invite
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                    Certified Specialty
                  </span>
                  <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#4F46E5]" />
                    {staff.specialty}
                  </span>
                </div>

                {/* Workload Indicators */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
                    <div className="text-xl font-black text-amber-900">{staff.activeReviewsCount}</div>
                    <div className="text-[10px] font-bold text-amber-700 uppercase mt-0.5">
                      Open Reviews
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                    <div className="text-xl font-black text-emerald-900">{staff.publishedCount}</div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">
                      Published Reports
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Assignment Selector */}
              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#64748B]">Assign Role:</span>
                <select
                  value={staff.role}
                  onChange={(e) => handleRoleChange(staff.id, e.target.value as UserRole)}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value={UserRole.STAFF}>STAFF</option>
                  <option value={UserRole.ADMIN}>ADMIN</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
