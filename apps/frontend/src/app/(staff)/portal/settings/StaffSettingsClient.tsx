"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Bell,
  User,
  Shield,
  Phone,
  Mail,
  Camera,
  Upload,
  Trash2,
  MapPin,
  Building2,
  Globe,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import {
  StaffSelfSettingsData,
  updateStaffSelfSettingsAction,
  uploadStaffSelfAvatarAction,
} from "@/app/actions/staff";
import StaffPageHeader from "@/components/staff/StaffPageHeader";

interface StaffSettingsClientProps {
  initialData: StaffSelfSettingsData;
}

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

export default function StaffSettingsClient({ initialData }: StaffSettingsClientProps) {
  // Form State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl || null);
  const [phone, setPhone] = useState(initialData.phone || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [available, setAvailable] = useState(initialData.available);
  const [emailNotifications, setEmailNotifications] = useState(initialData.emailNotifications);
  const [slaAlerts, setSlaAlerts] = useState(initialData.slaAlerts ?? true);

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if any field changed
  const isDirty =
    avatarUrl !== (initialData.avatarUrl || null) ||
    phone !== (initialData.phone || "") ||
    address !== (initialData.address || "") ||
    available !== initialData.available ||
    emailNotifications !== initialData.emailNotifications ||
    slaAlerts !== (initialData.slaAlerts ?? true);

  // Evaluator Initials Fallback
  const initials =
    initialData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "EV";

  // Upload Photo Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Photo file size must be under 5MB." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingPhoto(true);
    setFeedback(null);

    try {
      const res = await uploadStaffSelfAvatarAction(formData);
      if (res.success && res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
        setFeedback({
          type: "success",
          text: "Profile photo uploaded and updated successfully.",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to upload profile photo.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "An unexpected error occurred while uploading.",
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateStaffSelfSettingsAction({
        phone: phone.trim() || null,
        address: address.trim() || null,
        avatarUrl: avatarUrl || null,
        available,
        emailNotifications,
        slaAlerts,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text: "Workstation settings and evaluator profile saved successfully.",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to update workstation settings.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAvatarUrl(initialData.avatarUrl || null);
    setPhone(initialData.phone || "");
    setAddress(initialData.address || "");
    setAvailable(initialData.available);
    setEmailNotifications(initialData.emailNotifications);
    setSlaAlerts(initialData.slaAlerts ?? true);
    setFeedback(null);
  };

  const formattedJoinDate = initialData.memberSince
    ? new Date(initialData.memberSince).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Verified";

  return (
    <div className="w-full space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Page Header */}
      <StaffPageHeader
        title="Evaluator Workstation Settings"
        description="Manage your evaluator profile photo, physical address, queue intake availability, and alert dispatch preferences."
        backHref="/portal"
        backLabel="Back to Live Queue"
      />

      {/* Feedback Toast Notification */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in-0 duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-semibold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
        {/* Card 1: Evaluator Profile Photo & Credentials */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#4F46E5]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                  Evaluator Profile & Identity
                </h2>
              </div>
              <p className="text-xs text-[#64748B]">
                Your photo appears on certified candidate assessment reviews, executive feedback notes, and staff directories.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>{initialData.specialty || "Certified Evaluator"}</span>
              </span>
            </div>
          </div>

          {/* Profile Photo Uploader & Avatar Preview */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar Preview */}
              <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-black">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={initialData.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{initials}</span>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Photo Actions */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Profile Photo</h3>
                  <p className="text-xs text-[#64748B]">
                    Upload a high-resolution professional portrait. Supports JPG, PNG, or WebP under 5MB.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{isUploadingPhoto ? "Uploading..." : "Upload New Photo"}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Faculty Portrait Presets */}
            <div className="border-t border-[#E2E8F0] pt-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#4F46E5]" />
                <span>Or select a verified faculty portrait preset:</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_STAFF_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      title={preset.label}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/30 scale-105"
                          : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        sizes="44px"
                        className="object-cover"
                        unoptimized
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#4F46E5]/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Credential Overview Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                Evaluator ID
              </span>
              <span className="font-mono font-bold text-[#0F172A] text-xs">
                EVL-{initialData.staffId.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                Access Role
              </span>
              <span className="font-bold text-[#0F172A] text-xs">
                {initialData.role} Queue Clearance
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                Account Status
              </span>
              <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {initialData.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] block">
                Member Since
              </span>
              <span className="font-bold text-[#0F172A] text-xs">
                {formattedJoinDate}
              </span>
            </div>
          </div>

          {/* Fixed Identity Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Display Name */}
            <div className="space-y-1">
              <label htmlFor="staff-name" className="text-xs font-semibold text-[#0F172A] block">
                Evaluator Display Name
              </label>
              <input
                id="staff-name"
                type="text"
                readOnly
                disabled
                value={initialData.name}
                className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] cursor-not-allowed min-h-[44px]"
              />
              <span className="text-[11px] text-[#94A3B8] block">
                Official institutional name. To amend, contact system administration.
              </span>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="staff-email" className="text-xs font-semibold text-[#0F172A] block">
                  Registered Staff Email
                </label>
                <span className="text-[10px] font-semibold text-emerald-700">Verified</span>
              </div>
              <div className="relative">
                <input
                  id="staff-email"
                  type="email"
                  readOnly
                  disabled
                  value={initialData.email || ""}
                  className="w-full px-3.5 py-2.5 pl-9 text-base sm:text-xs rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] cursor-not-allowed min-h-[44px]"
                />
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[11px] text-[#94A3B8] block">
                Primary channel for assignment notifications and authentication.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Contact Phone & Full Address */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="space-y-1 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="text-base font-bold text-[#0F172A]">
                Contact & Full Address
              </h2>
            </div>
            <p className="text-xs text-[#64748B]">
              Your contact phone number and full residential/office address for official evaluator records, compliance, and postal correspondence.
            </p>
          </div>

          <div className="space-y-4">
            {/* Direct Phone Number */}
            <div className="space-y-1 max-w-md">
              <label htmlFor="staff-phone" className="text-xs font-semibold text-[#0F172A] block">
                Direct Contact Phone Number
              </label>
              <div className="relative">
                <input
                  id="staff-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 pl-9 text-base sm:text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                />
                <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[11px] text-[#64748B] block">
                Used for time-critical escalation and urgent evaluation coordination.
              </span>
            </div>

            {/* Full Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="staff-address" className="text-xs font-semibold text-[#0F172A] block">
                  Full Residential / Office Address
                </label>
                <span className="text-[11px] text-[#64748B]">
                  Official evaluator records
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="staff-address"
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No., Street Name, Area/Locality, City, State/Province, PIN/Postal Code, Country"
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] leading-relaxed resize-y"
                />
              </div>
              <span className="text-[11px] text-[#64748B] block">
                Please include complete door/flat details, street, city, state, and postal code.
              </span>
            </div>

            {/* Address Live Preview Card (if entered) */}
            {address.trim() && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold text-slate-800 block">Formatted Mailing Preview:</span>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                    {initialData.name}
                    {"\n"}
                    {address.trim()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Assignment Intake Status */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4F46E5]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Assignment Intake Status
                </h2>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                When unavailable, incoming student assessments will not be assigned to your workstation queue.
              </p>
            </div>

            {/* Accessible Toggle */}
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              role="switch"
              aria-checked={available}
              aria-label="Toggle intake availability"
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 ${
                available ? "bg-[#4F46E5]" : "bg-slate-300"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  available ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div>
            {available ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Active — Ready to receive assessment assignments</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Unavailable — Workstation intake paused</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Queue Alerts & Notifications */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Queue Alerts & Notifications
              </h2>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              In-portal alerts are always active in your workstation header. Configure external notifications below.
            </p>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {/* Toggle 1: Assignment Dispatch */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 max-w-md">
                <span className="text-xs font-semibold text-[#0F172A] block">
                  Email Dispatch on New Assignments
                </span>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Receive an immediate email notification whenever a student assessment is assigned to your queue.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                role="switch"
                aria-checked={emailNotifications}
                aria-label="Toggle assignment email notifications"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 ${
                  emailNotifications ? "bg-[#4F46E5]" : "bg-slate-300"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    emailNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: SLA 48h Threshold Alerts */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 max-w-md">
                <span className="text-xs font-semibold text-[#0F172A] block">
                  Urgent 48-Hour SLA Threshold Alerts
                </span>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Receive priority alerts when an active submission approaches the turnaround SLA deadline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSlaAlerts(!slaAlerts)}
                role="switch"
                aria-checked={slaAlerts}
                aria-label="Toggle SLA turnaround alerts"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 ${
                  slaAlerts ? "bg-[#4F46E5]" : "bg-slate-300"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    slaAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || saving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors disabled:opacity-40 cursor-pointer min-h-[40px]"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Workstation Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
