"use client";

import { useState } from "react";
import {
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  Globe,
  Loader2,
} from "lucide-react";
import {
  changeStudentPasswordAction,
  revokeAllSessionsAction,
} from "@/app/actions/security";

interface SecurityClientProps {
  initialData: {
    hasPassword: boolean;
    linkedMethods: Array<{
      type: string;
      label: string;
      isActive: boolean;
      identifier?: string | null;
    }>;
    sessionVersion: number;
  };
}

export default function SecurityClient({ initialData }: SecurityClientProps) {
  const [data, setData] = useState(initialData);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Revoke session state
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeFeedback, setRevokeFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changeStudentPasswordAction(currentPassword, newPassword);
      if (res.success) {
        setPasswordFeedback({ type: "success", text: res.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setData((prev) => ({
          ...prev,
          hasPassword: true,
          sessionVersion: prev.sessionVersion + 1,
        }));
      } else {
        setPasswordFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setPasswordFeedback({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (
      !window.confirm(
        "Are you sure you want to sign out of all other devices? Other active sessions will terminate immediately."
      )
    ) {
      return;
    }

    setRevokeLoading(true);
    setRevokeFeedback(null);
    try {
      const res = await revokeAllSessionsAction();
      if (res.success) {
        setRevokeFeedback({ type: "success", text: res.message });
        setData((prev) => ({ ...prev, sessionVersion: prev.sessionVersion + 1 }));
      } else {
        setRevokeFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setRevokeFeedback({ type: "error", text: err.message || "Failed to revoke sessions." });
    } finally {
      setRevokeLoading(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "GOOGLE":
        return <Globe className="w-4 h-4 text-blue-600" />;
      case "EMAIL_OTP":
        return <Mail className="w-4 h-4 text-emerald-600" />;
      case "PHONE_OTP":
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case "PASSWORD":
      default:
        return <KeyRound className="w-4 h-4 text-[#475569]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Change Password Section */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            {data.hasPassword ? "Change password" : "Set account password"}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
            {data.hasPassword
              ? "Choose a strong password to protect your assessment records."
              : "Set a password to enable direct email & password authentication."}
          </p>
        </div>

        {passwordFeedback && (
          <div
            role="status"
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in-0 duration-150 ${
              passwordFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                : "bg-red-50 text-red-950 border-red-200"
            }`}
          >
            {passwordFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{passwordFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {data.hasPassword && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A] block">
                Current password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white text-base sm:text-sm font-normal text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A] block">
              New password (min 8 characters) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white text-base sm:text-sm font-normal text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0F172A] block">
              Confirm new password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white text-base sm:text-sm font-normal text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50 transition-colors inline-flex items-center gap-2 min-h-[44px]"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>{data.hasPassword ? "Update password" : "Set password"}</span>
            )}
          </button>
        </form>
      </section>

      {/* 2. Linked Sign-in Methods Section */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Linked sign-in methods
          </h2>
          <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
            Authentication providers currently authorized to access your student account.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {data.linkedMethods.map((method) => (
            <div
              key={method.type}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                method.isActive
                  ? "bg-[#F8FAFC] border-[#E2E8F0]"
                  : "bg-slate-50/50 border-dashed border-[#E2E8F0] opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                  {getMethodIcon(method.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F172A] truncate">
                    {method.label}
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate">
                    {method.identifier}
                  </div>
                </div>
              </div>

              {method.isActive ? (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  Inactive
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Global Device Revocation Section */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Device sessions
          </h2>
          <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5 leading-relaxed">
            Signed in on a shared device? Terminate all active sessions across other browsers immediately.
          </p>
          <div className="text-[11px] text-[#94A3B8] font-mono mt-1">
            Session version: v{data.sessionVersion}
          </div>
        </div>

        {revokeFeedback && (
          <div
            role="status"
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in-0 duration-150 ${
              revokeFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                : "bg-red-50 text-red-950 border-red-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{revokeFeedback.text}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleRevokeSessions}
          disabled={revokeLoading}
          className="px-4 py-2.5 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50 transition-colors inline-flex items-center gap-2 min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>{revokeLoading ? "Invalidating sessions..." : "Sign out of all other devices"}</span>
        </button>
      </section>
    </div>
  );
}
