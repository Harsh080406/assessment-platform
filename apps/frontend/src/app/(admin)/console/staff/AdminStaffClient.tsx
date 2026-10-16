"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  UserPlus,
  Briefcase,
  Copy,
  Check,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  Ban,
  Camera,
  Upload,
  UserCheck,
  Settings,
  LayoutGrid,
  List,
  ChevronDown,
  Clock,
  Sparkles,
  Award,
  Users,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import {
  updateStaffMemberAction,
  uploadStaffAvatarAction,
  inviteStaffOrAdminAction,
  StaffAuthorityStatus,
} from "@/app/actions/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusPill from "@/components/admin/AdminStatusPill";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";

export interface StaffItem {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  specialty: string | null;
  activeReviewsCount: number;
  publishedCount: number;
  createdAt: string;
  active: boolean;
  available: boolean;
  avatarUrl: string | null;
}

interface AdminStaffClientProps {
  initialStaff: StaffItem[];
}

export const SPECIFIC_STAFF_ROLES = [
  "Lead Psychometric Evaluator",
  "Senior Cognitive Assessor",
  "SJT & Dilemma Specialist",
  "Competency & Values Analyst",
  "Career Trajectory Mentor",
  "Integrity & Proctoring Officer",
  "Admissions Reviewer",
  "Associate Evaluator",
  "System Administrator",
] as const;

export const PRESET_STAFF_AVATARS = [
  {
    id: "evaluator-1",
    label: "Dr. Evelyn Reed",
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "evaluator-2",
    label: "Prof. Michael Vance",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "evaluator-3",
    label: "Dr. Alistair Chen",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "evaluator-4",
    label: "Elena Rostova",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "evaluator-5",
    label: "Marcus Sterling",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "evaluator-6",
    label: "Nadia Solis",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  },
];

export default function AdminStaffClient({ initialStaff }: AdminStaffClientProps) {
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "GRANTED" | "STOPPED" | "REVOKED" | "ADMINS">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.STAFF);
  const [inviteSpecificRole, setInviteSpecificRole] = useState<string>(SPECIFIC_STAFF_ROLES[0]);
  const [customInviteRole, setCustomInviteRole] = useState("");
  const [createdActivationUrl, setCreatedActivationUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit / Manage Staff Modal State
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSpecificRole, setEditSpecificRole] = useState<string>("");
  const [customSpecificRole, setCustomSpecificRole] = useState("");
  const [editSystemRole, setEditSystemRole] = useState<UserRole>(UserRole.STAFF);
  const [editAuthority, setEditAuthority] = useState<StaffAuthorityStatus>("GRANTED");
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Dialog State for Stop / Revoke actions
  const [confirmDialog, setConfirmDialog] = useState<{
    staff: StaffItem;
    action: "GRANT" | "STOP" | "REVOKE";
  } | null>(null);

  // Helper to resolve authority status of a staff member
  const getStaffAuthority = (staff: StaffItem): StaffAuthorityStatus => {
    if (staff.status === UserStatus.SUSPENDED) return "REVOKED";
    if (staff.status === UserStatus.INACTIVE || staff.active === false) return "STOPPED";
    return "GRANTED";
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((staff) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      staff.name.toLowerCase().includes(q) ||
      (staff.email && staff.email.toLowerCase().includes(q)) ||
      (staff.specialty && staff.specialty.toLowerCase().includes(q));

    const authority = getStaffAuthority(staff);
    let matchesStatus = true;
    if (filterStatus === "GRANTED") matchesStatus = authority === "GRANTED";
    if (filterStatus === "STOPPED") matchesStatus = authority === "STOPPED";
    if (filterStatus === "REVOKED") matchesStatus = authority === "REVOKED";
    if (filterStatus === "ADMINS") matchesStatus = staff.role === UserRole.ADMIN;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalStaffCount = staffList.length;
  const grantedCount = staffList.filter((s) => getStaffAuthority(s) === "GRANTED").length;
  const stoppedCount = staffList.filter((s) => getStaffAuthority(s) === "STOPPED").length;
  const revokedCount = staffList.filter((s) => getStaffAuthority(s) === "REVOKED").length;
  const totalOpenReviews = staffList.reduce((acc, s) => acc + s.activeReviewsCount, 0);

  // Open Edit Modal
  const handleOpenEdit = (staff: StaffItem) => {
    setEditingStaff(staff);
    setEditName(staff.name);
    const existingSpecialty = staff.specialty || SPECIFIC_STAFF_ROLES[0];
    const isStandard = SPECIFIC_STAFF_ROLES.includes(existingSpecialty as any);
    if (isStandard) {
      setEditSpecificRole(existingSpecialty);
      setCustomSpecificRole("");
    } else {
      setEditSpecificRole("CUSTOM");
      setCustomSpecificRole(existingSpecialty);
    }
    setEditSystemRole(staff.role);
    setEditAuthority(getStaffAuthority(staff));
    setEditAvailable(staff.available ?? true);
    setEditAvatarUrl(staff.avatarUrl || null);
  };

  // Submit Edit Modal Changes
  const handleSaveStaffChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const resolvedSpecificRole =
      editSpecificRole === "CUSTOM"
        ? customSpecificRole.trim() || "Certified Psychometric Evaluator"
        : editSpecificRole;

    setMessage(null);
    startTransition(async () => {
      const res = await updateStaffMemberAction({
        userId: editingStaff.id,
        name: editName,
        specificRole: resolvedSpecificRole,
        systemRole: editSystemRole,
        authorityStatus: editAuthority,
        available: editAvailable,
        avatarUrl: editAvatarUrl,
      });

      if (res.success && res.data) {
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id
              ? {
                  ...s,
                  name: editName,
                  role: editSystemRole,
                  status:
                    editAuthority === "GRANTED"
                      ? UserStatus.ACTIVE
                      : editAuthority === "STOPPED"
                      ? UserStatus.INACTIVE
                      : UserStatus.SUSPENDED,
                  specialty: resolvedSpecificRole,
                  active: editAuthority === "GRANTED",
                  available: editAuthority === "GRANTED" ? editAvailable : false,
                  avatarUrl: editAvatarUrl,
                }
              : s
          )
        );
        setMessage({ text: res.message, type: "success" });
        setEditingStaff(null);
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  // Fast Authority Toggle from Card or Table
  const executeQuickAuthorityChange = (staff: StaffItem, newAuthority: StaffAuthorityStatus) => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateStaffMemberAction({
        userId: staff.id,
        authorityStatus: newAuthority,
      });

      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === staff.id
              ? {
                  ...s,
                  status:
                    newAuthority === "GRANTED"
                      ? UserStatus.ACTIVE
                      : newAuthority === "STOPPED"
                      ? UserStatus.INACTIVE
                      : UserStatus.SUSPENDED,
                  active: newAuthority === "GRANTED",
                  available: newAuthority === "GRANTED" ? s.available : false,
                }
              : s
          )
        );
        setMessage({ text: res.message, type: "success" });
        setConfirmDialog(null);
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  // Handle Photo File Upload
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStaff) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "Profile picture must be under 5MB.", type: "error" });
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadStaffAvatarAction(editingStaff.id, formData);
    setIsUploadingPhoto(false);

    if (res.success && res.data?.avatarUrl) {
      setEditAvatarUrl(res.data.avatarUrl);
      setStaffList((prev) =>
        prev.map((s) => (s.id === editingStaff.id ? { ...s, avatarUrl: res.data!.avatarUrl } : s))
      );
      setMessage({ text: "Staff profile photo uploaded successfully.", type: "success" });
    } else {
      setMessage({ text: res.message || "Failed to upload photo.", type: "error" });
    }
  };

  // Send Invitation Action
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setCreatedActivationUrl(null);

    const resolvedSpecific =
      inviteSpecificRole === "CUSTOM"
        ? customInviteRole.trim() || "Certified Psychometric Evaluator"
        : inviteSpecificRole;

    startTransition(async () => {
      const res = await inviteStaffOrAdminAction({
        email: inviteEmail,
        role: inviteRole,
        specificRole: resolvedSpecific,
      });

      if (res.success && res.data) {
        setCreatedActivationUrl(res.data.activationUrl);
        setMessage({ text: res.message, type: "success" });

        // Add to list optimistically
        setStaffList((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            role: inviteRole,
            status: UserStatus.INACTIVE,
            specialty: resolvedSpecific,
            activeReviewsCount: 0,
            publishedCount: 0,
            createdAt: new Date().toISOString(),
            active: true,
            available: true,
            avatarUrl: null,
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
      {/* 1. Header with "Invite Evaluator / Staff" Action */}
      <AdminPageHeader
        title="Staff & Workload Governance"
        description="Assign specific clinical designations, grant or revoke evaluation permissions, manage profile photos, and monitor live assessment queues."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
        action={
          <button
            type="button"
            onClick={() => {
              setShowInviteModal(true);
              setCreatedActivationUrl(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#FF6B6B]" />
            <span>Invite Staff Member</span>
          </button>
        }
      />

      {/* 2. Toast Feedback Alert */}
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
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Activation Link Quick-Share Banner */}
      {createdActivationUrl && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[#0F172A] space-y-2.5 animate-in fade-in-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Signed Account Activation Link (48 Hours Valid)</span>
            </div>
            <button
              type="button"
              onClick={copyActivationLink}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
          <p className="text-xs text-[#475569]">
            Share this secure link with the staff member so they can set their password and profile details:
          </p>
          <div className="p-2.5 bg-white rounded-lg border border-indigo-200 text-xs font-mono break-all text-[#0F172A] select-all">
            {createdActivationUrl}
          </div>
        </div>
      )}

      {/* 4. Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div className="text-2xl font-black text-[#0F172A] tabular-nums">{totalStaffCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Faculty evaluators</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Authority Granted</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">{grantedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Active & grading</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Authority Stopped</span>
            <PauseCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">{stoppedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">On leave / paused</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Authority Revoked</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">{revokedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Access suspended</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Queue Reviews</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A] tabular-nums">{totalOpenReviews}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Assigned in queue</p>
        </div>
      </div>

      {/* 5. Filter Toolbar & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by evaluator name, email, designation..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center & Right: Filter Pills + Grid/Table View Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-white text-[#0F172A] shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              All ({staffList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("GRANTED")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "GRANTED"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Granted</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("STOPPED")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "STOPPED"
                  ? "bg-white text-amber-800 shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Stopped</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("REVOKED")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "REVOKED"
                  ? "bg-white text-rose-800 shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Revoked</span>
            </button>
          </div>

          {/* Grid / Table View Switcher */}
          <div className="flex items-center gap-1 border border-[#E2E8F0] p-1 rounded-xl bg-white">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#0F172A] text-white"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
              title="Card Grid View"
              aria-label="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#0F172A] text-white"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
              title="Table Directory View"
              aria-label="Table Directory View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Main Staff Content (Cards or Directory Table) */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-[#94A3B8] mx-auto stroke-1" />
          <h3 className="text-sm font-bold text-[#0F172A]">No staff members match this criteria</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Try adjusting your search keywords or filter pills, or invite a new evaluator to the platform.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const authority = getStaffAuthority(staff);
            const initials =
              staff.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "EV";

            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Avatar, Name, Email, Role Badges */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar with Status Dot */}
                      <div className="relative w-12 h-12 rounded-2xl bg-[#0F172A] text-white font-black text-sm flex items-center justify-center shrink-0 border border-[#E2E8F0] overflow-hidden">
                        {staff.avatarUrl ? (
                          <Image
                            src={staff.avatarUrl}
                            alt={staff.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{initials}</span>
                        )}

                        {/* Status Ring Indicator */}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                            authority === "GRANTED"
                              ? "bg-emerald-500"
                              : authority === "STOPPED"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          title={`Authority: ${authority}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-sm text-[#0F172A] truncate">
                            {staff.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#64748B] font-mono truncate">
                          {staff.email || "No email"}
                        </p>
                      </div>
                    </div>

                    {/* System Role Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        staff.role === UserRole.ADMIN
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {staff.role}
                    </span>
                  </div>

                  {/* Specific Role / Designation Pill */}
                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-xs font-semibold text-[#0F172A] truncate">
                      {staff.specialty || "Certified Psychometric Evaluator"}
                    </span>
                  </div>

                  {/* Authority Status Indicator Bar */}
                  <div className="flex items-center justify-between text-xs py-1 px-1">
                    <span className="text-[#64748B] font-medium">Evaluation Authority:</span>
                    {authority === "GRANTED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Granted</span>
                      </span>
                    ) : authority === "STOPPED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <PauseCircle className="w-3 h-3 text-amber-600" />
                        <span>Stopped (Paused)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Ban className="w-3 h-3 text-rose-600" />
                        <span>Revoked</span>
                      </span>
                    )}
                  </div>

                  {/* Workload Metric Counters */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-lg font-black text-[#0F172A] tabular-nums">
                        {staff.activeReviewsCount}
                      </div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Open Reviews
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-lg font-black text-[#0F172A] tabular-nums">
                        {staff.publishedCount}
                      </div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Published Reports
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quick Actions + Edit Modal Trigger */}
                <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  {/* Quick Authority Action Dropdown / Button */}
                  <div className="flex items-center gap-1">
                    {authority === "GRANTED" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            staff,
                            action: "STOP",
                          })
                        }
                        className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Temporarily pause evaluator permissions"
                      >
                        <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Stop</span>
                      </button>
                    ) : authority === "STOPPED" ? (
                      <button
                        type="button"
                        onClick={() => executeQuickAuthorityChange(staff, "GRANTED")}
                        className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Restore evaluator permissions"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Grant</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => executeQuickAuthorityChange(staff, "GRANTED")}
                        className="px-2.5 py-1 rounded-lg border border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Re-authorize evaluator account"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Re-grant</span>
                      </button>
                    )}

                    {authority !== "REVOKED" && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            staff,
                            action: "REVOKE",
                          })
                        }
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Revoke access completely"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Primary Manage & Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(staff)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE DIRECTORY VIEW */
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Evaluator</th>
                  <th className="py-3 px-4">Specific Role</th>
                  <th className="py-3 px-4">Authority Status</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Workload Volume</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredStaff.map((staff) => {
                  const authority = getStaffAuthority(staff);
                  const initials =
                    staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "EV";

                  return (
                    <tr key={staff.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                      {/* Column 1: Evaluator with Photo Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl bg-[#0F172A] text-white font-black text-xs flex items-center justify-center shrink-0 border border-[#E2E8F0] overflow-hidden">
                            {staff.avatarUrl ? (
                              <Image
                                src={staff.avatarUrl}
                                alt={staff.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#0F172A] block truncate">
                              {staff.name}
                            </span>
                            <span className="text-[11px] text-[#64748B] font-mono block truncate">
                              {staff.email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Specific Role */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-semibold text-[#0F172A] inline-block max-w-[200px] truncate">
                          {staff.specialty || "Certified Psychometric Evaluator"}
                        </span>
                      </td>

                      {/* Column 3: Authority Status */}
                      <td className="py-3 px-4">
                        {authority === "GRANTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Granted</span>
                          </span>
                        ) : authority === "STOPPED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <PauseCircle className="w-3 h-3 text-amber-600" />
                            <span>Stopped</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>Revoked</span>
                          </span>
                        )}
                      </td>

                      {/* Column 4: System Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            staff.role === UserRole.ADMIN
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {staff.role}
                        </span>
                      </td>

                      {/* Column 5: Workload */}
                      <td className="py-3 px-4 tabular-nums">
                        <span className="font-bold text-[#0F172A]">{staff.activeReviewsCount}</span>
                        <span className="text-[#64748B] text-[11px]"> active / </span>
                        <span className="font-semibold text-[#0F172A]">{staff.publishedCount}</span>
                        <span className="text-[#64748B] text-[11px]"> published</span>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {authority === "GRANTED" ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDialog({ staff, action: "STOP" })}
                              className="px-2 py-1 rounded-md text-amber-700 hover:bg-amber-50 text-[11px] font-bold cursor-pointer"
                            >
                              Stop
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => executeQuickAuthorityChange(staff, "GRANTED")}
                              className="px-2 py-1 rounded-md text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold cursor-pointer"
                            >
                              Grant
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(staff)}
                            className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] font-semibold text-[#0F172A] cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Comprehensive Staff Management Modal (Dialog) */}
      {editingStaff && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl w-full max-w-xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0F172A] text-white">
                  <Settings className="w-4 h-4 text-[#FF6B6B]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    Manage Evaluator Profile & Permissions
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Configure specific clinical role, authority status, and profile photo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-slate-200/50"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffChanges} className="p-6 space-y-6">
              {/* SECTION A: PROFILE PHOTO & AVATAR PICKER */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                  Staff Profile Picture
                </label>

                <div className="flex items-center gap-4">
                  {/* Current Avatar Large Preview */}
                  <div className="relative w-20 h-20 rounded-2xl bg-[#0F172A] text-white font-black text-xl flex items-center justify-center shrink-0 border-2 border-[#CBD5E1] overflow-hidden shadow-xs">
                    {editAvatarUrl ? (
                      <Image
                        src={editAvatarUrl}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>
                        {editName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "EV"}
                      </span>
                    )}

                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Custom Photo</span>
                      </button>

                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl(null)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Upload a high-res portrait (JPG, PNG, WebP up to 5MB) or select a preset below.
                    </p>
                  </div>
                </div>

                {/* Preset Avatars Row */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#64748B] block mb-2">
                    Or select from curated faculty portraits:
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_STAFF_AVATARS.map((preset) => {
                      const isSelected = editAvatarUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setEditAvatarUrl(preset.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 ring-2 ring-indigo-500/20 scale-105"
                              : "border-[#E2E8F0] hover:border-slate-400"
                          }`}
                          title={preset.label}
                        >
                          <Image
                            src={preset.url}
                            alt={preset.label}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION B: FULL NAME & SPECIFIC ROLE ASSIGNMENT */}
              <div className="space-y-4 pt-2 border-t border-[#F1F5F9]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Evaluator Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block">
                      Evaluator Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      placeholder="e.g. Dr. Arthur Vance"
                      className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* System Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block">
                      Platform System Role
                    </label>
                    <select
                      value={editSystemRole}
                      onChange={(e) => setEditSystemRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                      <option value={UserRole.STAFF}>STAFF (Evaluator Access)</option>
                      <option value={UserRole.ADMIN}>ADMIN (Full Console Access)</option>
                    </select>
                  </div>
                </div>

                {/* Specific Role Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] block">
                    Specific Clinical Role & Designation
                  </label>
                  <select
                    value={editSpecificRole}
                    onChange={(e) => setEditSpecificRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    {SPECIFIC_STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Custom Designation...</option>
                  </select>

                  {editSpecificRole === "CUSTOM" && (
                    <input
                      type="text"
                      value={customSpecificRole}
                      onChange={(e) => setCustomSpecificRole(e.target.value)}
                      placeholder="Enter custom clinical designation (e.g. Behavioral Scientist)"
                      className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-indigo-50/20 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mt-2"
                      required
                    />
                  )}
                </div>
              </div>

              {/* SECTION C: AUTHORITY & PERMISSION CONTROLS (STOP / GRANT / REVOKE) */}
              <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
                <div>
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                    Evaluation Authority & Permissions
                  </label>
                  <p className="text-[11px] text-[#64748B]">
                    Control whether this staff member is currently authorized to evaluate candidates or paused.
                  </p>
                </div>

                {/* 3 Large Segmented Cards: Grant, Stop, Revoke */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Card 1: Grant */}
                  <button
                    type="button"
                    onClick={() => setEditAuthority("GRANTED")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      editAuthority === "GRANTED"
                        ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                        : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          editAuthority === "GRANTED" ? "text-emerald-700" : "text-slate-400"
                        }`}
                      />
                      {editAuthority === "GRANTED" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <div className="font-black text-xs text-[#0F172A]">Grant Authority</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5 leading-snug">
                      Operational & active to grade
                    </div>
                  </button>

                  {/* Card 2: Stop */}
                  <button
                    type="button"
                    onClick={() => setEditAuthority("STOPPED")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      editAuthority === "STOPPED"
                        ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20"
                        : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <PauseCircle
                        className={`w-4 h-4 ${
                          editAuthority === "STOPPED" ? "text-amber-700" : "text-slate-400"
                        }`}
                      />
                      {editAuthority === "STOPPED" && (
                        <span className="w-2 h-2 rounded-full bg-amber-600" />
                      )}
                    </div>
                    <div className="font-black text-xs text-[#0F172A]">Stop Authority</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5 leading-snug">
                      Paused for leave / freeze
                    </div>
                  </button>

                  {/* Card 3: Revoke */}
                  <button
                    type="button"
                    onClick={() => setEditAuthority("REVOKED")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      editAuthority === "REVOKED"
                        ? "border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20"
                        : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Ban
                        className={`w-4 h-4 ${
                          editAuthority === "REVOKED" ? "text-rose-700" : "text-slate-400"
                        }`}
                      />
                      {editAuthority === "REVOKED" && (
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                      )}
                    </div>
                    <div className="font-black text-xs text-[#0F172A]">Revoke Access</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5 leading-snug">
                      Completely terminate
                    </div>
                  </button>
                </div>

                {/* Granular Auto-Assignment Toggle */}
                {editAuthority === "GRANTED" && (
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">
                        Automated Workload Routing
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Allow incoming assessment attempts to be automatically routed to this evaluator
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editAvailable}
                        onChange={(e) => setEditAvailable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isPending ? "Saving..." : "Save Staff Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Invite Staff Member Modal Dialog */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#0F172A] text-white">
                  <UserPlus className="w-4 h-4 text-[#FF6B6B]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Invite Evaluator / Staff</h3>
                  <p className="text-[11px] text-[#64748B]">
                    Send signed activation token & establish clinical role
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1.5"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A]">Staff Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="evaluator@alderwoodvantage.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* System Role Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A]">System Authorization Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value={UserRole.STAFF}>STAFF (Evaluation Portal Access)</option>
                  <option value={UserRole.ADMIN}>ADMIN (Full Console Governance)</option>
                </select>
              </div>

              {/* Specific Designation Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A]">Specific Evaluator Designation</label>
                <select
                  value={inviteSpecificRole}
                  onChange={(e) => setInviteSpecificRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  {SPECIFIC_STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Designation...</option>
                </select>

                {inviteSpecificRole === "CUSTOM" && (
                  <input
                    type="text"
                    value={customInviteRole}
                    onChange={(e) => setCustomInviteRole(e.target.value)}
                    placeholder="Enter custom clinical designation"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-indigo-50/20 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mt-2"
                    required
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isPending ? "Sending Invite..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Stop / Revoke Authority Confirmation Dialog */}
      {confirmDialog && (
        <AdminConfirmationDialog
          isOpen={true}
          title={
            confirmDialog.action === "STOP"
              ? "Stop Evaluation Authority?"
              : "Revoke Staff Access Completely?"
          }
          description={
            confirmDialog.action === "STOP"
              ? `Temporarily stop evaluation permissions for "${confirmDialog.staff.name}". They will not be able to claim queue items or publish reports until granted again.`
              : `Revoke all platform access for "${confirmDialog.staff.name}". Their account will be suspended and all review permissions terminated.`
          }
          confirmLabel={confirmDialog.action === "STOP" ? "Stop Authority" : "Revoke Access"}
          isDestructive={true}
          isLoading={isPending}
          onConfirm={() =>
            executeQuickAuthorityChange(
              confirmDialog.staff,
              confirmDialog.action === "STOP" ? "STOPPED" : "REVOKED"
            )
          }
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
