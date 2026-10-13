"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Briefcase,
  Bell,
  User,
  Shield,
  Phone,
  Mail,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  StaffSelfSettingsData,
  updateStaffSelfSettingsAction,
} from "@/app/actions/staff";
import StaffPageHeader from "@/components/staff/StaffPageHeader";

interface StaffSettingsClientProps {
  initialData: StaffSelfSettingsData;
}

const COMMON_SPECIALTIES = [
  "Psychometric Career Counselor",
  "Cognitive Trajectory Analyst",
  "Vocational Psychology Specialist",
  "Higher Secondary Career Strategist",
  "STEM & Tech Career Evaluator",
  "Behavioral & Aptitude Assessor",
];

export default function StaffSettingsClient({ initialData }: StaffSettingsClientProps) {
  const [phone, setPhone] = useState(initialData.phone || "");
  const [specialty, setSpecialty] = useState(initialData.specialty || "");
  const [available, setAvailable] = useState(initialData.available);
  const [emailNotifications, setEmailNotifications] = useState(initialData.emailNotifications);
  const [slaAlerts, setSlaAlerts] = useState(initialData.slaAlerts ?? true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check if any field changed
  const isDirty =
    phone !== (initialData.phone || "") ||
    specialty !== initialData.specialty ||
    available !== initialData.available ||
    emailNotifications !== initialData.emailNotifications ||
    slaAlerts !== (initialData.slaAlerts ?? true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialty.trim()) {
      setFeedback({ type: "error", text: "Specialty focus cannot be empty." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateStaffSelfSettingsAction({
        phone: phone.trim() || null,
        specialty: specialty.trim(),
        available,
        emailNotifications,
        slaAlerts,
      });

      if (res.success) {
        setFeedback({ type: "success", text: "Workstation settings and staff details saved successfully." });
      } else {
        setFeedback({ type: "error", text: res.message || "Failed to update workstation settings." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "An unexpected error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPhone(initialData.phone || "");
    setSpecialty(initialData.specialty || "");
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
    <div className="w-full space-y-5 sm:space-y-6">
      {/* 1. Page Header */}
      <StaffPageHeader
        title="Workstation Settings"
        description="Manage your evaluator staff credentials, queue intake availability, clinical domain specialty, and automated alert preferences."
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
        {/* Card 1: Staff Member Profile & Identity */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-[#F1F5F9] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#4F46E5]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                  Staff Member Details
                </h2>
              </div>
              <p className="text-xs text-[#64748B]">
                Your certified evaluator credentials and communication channels for assessment queue routing.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Certified Evaluator</span>
            </span>
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

          {/* Form Fields: Name, Email, Phone */}
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
                Organization account identity. To modify, contact system admin.
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

            {/* Direct Phone Number (Editable) */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="staff-phone" className="text-xs font-semibold text-[#0F172A] block">
                Direct Contact Phone Number
              </label>
              <div className="relative max-w-md">
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
                Used for high-priority evaluation coordination and security verification.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Assignment Intake Status */}
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
                When unavailable, new student assessments will not be assigned to your workstation.
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

        {/* Card 3: Evaluator Specialty Focus */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Evaluator Specialty Focus
              </h2>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your primary domain of psychometric evaluation and career counseling expertise.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Cognitive Trajectory Analyst"
              className="w-full px-3.5 py-2.5 text-base sm:text-xs font-normal rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
            />

            {/* Selectable Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Select from common specialties:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SPECIALTIES.map((spec) => {
                  const isSelected = specialty === spec;
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-2xs"
                          : "bg-slate-50 text-[#334155] border-[#E2E8F0] hover:bg-slate-100 hover:text-[#0F172A]"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>
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
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || saving}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors disabled:opacity-40 cursor-pointer min-h-[40px]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
