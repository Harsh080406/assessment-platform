"use client";

import { useState } from "react";
import {
  Timer,
  Sliders,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import {
  AdminSettingsData,
  updateSystemSettingsAction,
} from "@/app/actions/settings";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";

interface AdminSettingsClientProps {
  initialData: AdminSettingsData;
}

export default function AdminSettingsClient({ initialData }: AdminSettingsClientProps) {
  const [slaDays, setSlaDays] = useState(initialData.slaDays);
  const [featureFlags, setFeatureFlags] = useState(initialData.featureFlags);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // High-Impact Toggle Confirmation Modal State
  const [pendingFlagToggle, setPendingFlagToggle] = useState<{
    key: "studentSignup" | "requireMfaForStaff" | "maintenanceNotice";
    title: string;
    description: string;
    targetState: boolean;
  } | null>(null);

  // Compute change count
  const changedItems: string[] = [];
  if (slaDays !== initialData.slaDays) {
    changedItems.push("SLA Turnaround Window");
  }
  if (featureFlags.studentSignup !== initialData.featureFlags.studentSignup) {
    changedItems.push("Public Student Registration");
  }
  if (featureFlags.autoAssignment !== initialData.featureFlags.autoAssignment) {
    changedItems.push("Automated Evaluator Round-Robin");
  }
  if (featureFlags.requireMfaForStaff !== initialData.featureFlags.requireMfaForStaff) {
    changedItems.push("Privileged MFA Enforcement Policy");
  }
  if (featureFlags.maintenanceNotice !== initialData.featureFlags.maintenanceNotice) {
    changedItems.push("Site Maintenance Notice Banner");
  }

  const isDirty = changedItems.length > 0;

  const handleRequestFlagToggle = (key: keyof typeof featureFlags) => {
    const currentState = featureFlags[key];
    const targetState = !currentState;

    if (key === "studentSignup") {
      setPendingFlagToggle({
        key: "studentSignup",
        title: targetState ? "Enable Public Student Registration" : "Disable Public Student Registration",
        description: targetState
          ? "Enabling this allows any prospective student to create an account and initiate assessments."
          : "Disabling this blocks new student account registrations. Existing enrolled accounts will remain active.",
        targetState,
      });
      return;
    }

    if (key === "requireMfaForStaff") {
      setPendingFlagToggle({
        key: "requireMfaForStaff",
        title: targetState ? "Enforce Privileged MFA Policy" : "Relax Privileged MFA Policy",
        description: targetState
          ? "Enforcing MFA will mandate that staff evaluators and administrators configure two-factor authentication before accessing workspaces."
          : "Relaxing this policy permits staff evaluators to sign in using standard credentials without mandatory two-factor prompts.",
        targetState,
      });
      return;
    }

    if (key === "maintenanceNotice") {
      setPendingFlagToggle({
        key: "maintenanceNotice",
        title: targetState ? "Display Site Maintenance Banner" : "Remove Site Maintenance Banner",
        description: targetState
          ? "This will display an informational banner across public and student portals informing users of scheduled platform maintenance."
          : "This will dismiss the global maintenance notice banner for all visitors.",
        targetState,
      });
      return;
    }

    // Low-impact toggles (e.g. autoAssignment)
    setFeatureFlags((prev) => ({ ...prev, [key]: targetState }));
  };

  const handleConfirmFlagToggle = () => {
    if (!pendingFlagToggle) return;
    setFeatureFlags((prev) => ({
      ...prev,
      [pendingFlagToggle.key]: pendingFlagToggle.targetState,
    }));
    setPendingFlagToggle(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateSystemSettingsAction({
        slaDays,
        featureFlags,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        // Update baseline initial data
        initialData.slaDays = slaDays;
        initialData.featureFlags = { ...featureFlags };
      } else {
        setFeedback({ type: "error", text: res.message || "Failed to save configuration." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "An unexpected error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Global SLA Turnaround Duration */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Global SLA Turnaround Window
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
                The certified evaluation turnaround guarantee promised to candidates. Controls overdue breach status across evaluator queues and administrative SLA monitoring.
              </p>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold tabular-nums shrink-0">
              {slaDays} Days ({slaDays * 24}h)
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={slaDays}
                  onChange={(e) => setSlaDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-1.5 text-xs font-bold text-[#0F172A] border border-[#E2E8F0] rounded-lg bg-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                />
                <span className="text-xs font-medium text-[#64748B]">days from candidate submission</span>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <span className="text-[11px] font-semibold text-[#94A3B8] mr-1">
                  Presets:
                </span>
                {[2, 3, 4, 5, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSlaDays(days)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      slaDays === days
                        ? "bg-[#0F172A] text-white"
                        : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Computation formula: <code className="font-mono text-[#0F172A] bg-[#F8FAFC] px-1 py-0.5 rounded border border-[#E2E8F0]">dueDate = submittedAt + {slaDays} days</code>. Overdue state flags automatically when remaining time breaches zero.
            </p>
          </div>
        </div>

        {/* Section 2: Platform Operational Feature Flags */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#0F172A]">
              Operational Feature Flags
            </h2>
            <p className="text-xs text-[#64748B]">
              Runtime operational controls. Changes take effect on the next incoming request without code redeployment.
            </p>
          </div>

          <div className="divide-y divide-[#F1F5F9] border-t border-[#F1F5F9]">
            {/* Flag 1: Public Registration (High-Impact) */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Public Student Registration
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    High Impact
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Permit prospective students to self-register via Google OAuth or OTP. Disabling limits platform access to existing accounts only.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRequestFlagToggle("studentSignup")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  featureFlags.studentSignup ? "bg-[#0F172A]" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={featureFlags.studentSignup}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    featureFlags.studentSignup ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Flag 2: Auto Assignment (Standard) */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0 pr-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  Automated Evaluator Round-Robin
                </span>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Automatically assign incoming candidate submissions to active clinical staff with the lowest current workload upon intake.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRequestFlagToggle("autoAssignment")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  featureFlags.autoAssignment ? "bg-[#0F172A]" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={featureFlags.autoAssignment}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    featureFlags.autoAssignment ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Flag 3: Staff MFA Requirement (High-Impact) */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Privileged MFA Enforcement Policy
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    High Impact
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Mandate that staff evaluators and system administrators configure two-factor TOTP authentication before accessing operational consoles.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRequestFlagToggle("requireMfaForStaff")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  featureFlags.requireMfaForStaff ? "bg-[#0F172A]" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={featureFlags.requireMfaForStaff}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    featureFlags.requireMfaForStaff ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Flag 4: Maintenance Notice (High-Impact) */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Site Maintenance Notice Banner
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    High Impact
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Display an informational notice banner across platform surfaces warning visitors of scheduled maintenance windows.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRequestFlagToggle("maintenanceNotice")}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  featureFlags.maintenanceNotice ? "bg-[#0F172A]" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={featureFlags.maintenanceNotice}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    featureFlags.maintenanceNotice ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-between gap-3 sticky bottom-4 z-20 shadow-md">
          <div className="text-xs text-[#64748B]">
            {isDirty ? (
              <span className="font-semibold text-[#0F172A]">
                {changedItems.length} unsaved setting {changedItems.length === 1 ? "change" : "changes"}
              </span>
            ) : (
              <span>System configuration is up to date</span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save system configuration"}</span>
          </button>
        </div>
      </form>

      {/* High-Impact Feature Flag Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={!!pendingFlagToggle}
        onClose={() => setPendingFlagToggle(null)}
        onConfirm={handleConfirmFlagToggle}
        title={pendingFlagToggle?.title || "Confirm Setting Change"}
        description={pendingFlagToggle?.description || ""}
        confirmLabel={pendingFlagToggle?.targetState ? "Enable Flag" : "Disable Flag"}
        isDestructive={pendingFlagToggle?.key === "studentSignup" && !pendingFlagToggle?.targetState}
      />
    </div>
  );
}
