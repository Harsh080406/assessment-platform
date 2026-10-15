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
  requestStudentPasswordResetOtpAction,
  verifyStudentPasswordResetOtpAction,
  resetStudentPasswordWithOtpAction,
} from "@/app/actions/security";

interface SecurityClientProps {
  initialData: {
    email?: string | null;
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

  // Password flow mode: "idle" | "direct" | "forgot_otp" | "forgot_new_pass"
  const [passwordMode, setPasswordMode] = useState<
    "idle" | "direct" | "forgot_otp" | "forgot_new_pass"
  >("idle");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
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

  const handleCancelPassword = () => {
    setPasswordMode("idle");
    setPasswordFeedback(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpCode("");
  };

  // Direct password change with current password
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
        setPasswordMode("idle");
        setData((prev) => ({
          ...prev,
          hasPassword: true,
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

  // Step 1 of Forgot Password: Dispatch OTP to registered email
  const handleInitiateForgotPassword = async () => {
    setPasswordFeedback(null);
    setPasswordLoading(true);
    try {
      const res = await requestStudentPasswordResetOtpAction();
      if (res.success) {
        setMaskedEmail(res.data?.maskedEmail || data.email || "your registered email");
        setPasswordMode("forgot_otp");
        setPasswordFeedback({ type: "success", text: res.message });
      } else {
        setPasswordFeedback({ type: "error", text: res.message });
      }
    } catch {
      setPasswordFeedback({
        type: "error",
        text: "Failed to dispatch verification code. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Step 2 of Forgot Password: User submits OTP for verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setPasswordFeedback({
        type: "error",
        text: "Please enter the 6-digit verification code.",
      });
      return;
    }

    setPasswordLoading(true);
    setPasswordFeedback(null);
    try {
      const res = await verifyStudentPasswordResetOtpAction(otpCode.trim());
      if (res.success) {
        setPasswordMode("forgot_new_pass");
        setPasswordFeedback({
          type: "success",
          text: "Verification code confirmed! Now enter your new password below.",
        });
      } else {
        setPasswordFeedback({ type: "error", text: res.message });
      }
    } catch {
      setPasswordFeedback({
        type: "error",
        text: "Verification failed. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Step 3 of Forgot Password: User enters new password and saves to database
  const handleSavePasswordWithOtp = async (e: React.FormEvent) => {
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
      const res = await resetStudentPasswordWithOtpAction(otpCode.trim(), newPassword);
      if (res.success) {
        setPasswordFeedback({ type: "success", text: res.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpCode("");
        setPasswordMode("idle");
        setData((prev) => ({
          ...prev,
          hasPassword: true,
          sessionVersion: prev.sessionVersion + 1,
        }));
      } else {
        setPasswordFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setPasswordFeedback({
        type: "error",
        text: err.message || "Failed to update password in database.",
      });
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
      {/* 1. Change / Reset Password Section */}
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

        {/* View 1: Initial Idle State */}
        {passwordMode === "idle" && (
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-[#475569]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">
                  {data.hasPassword ? "Account password" : "No password set"}
                </div>
                <div className="text-xs text-[#64748B]">
                  {data.hasPassword ? "••••••••••••" : "Add a password for email & password login"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPasswordMode("direct");
                setPasswordFeedback(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto min-h-[40px]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{data.hasPassword ? "Reset password" : "Set password"}</span>
            </button>
          </div>
        )}

        {/* View 2: Direct Password Update (Current + New + Confirm) */}
        {passwordMode === "direct" && (
          <form
            onSubmit={handlePasswordChange}
            className="space-y-4 max-w-md animate-in fade-in-0 duration-150"
          >
            {data.hasPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0F172A] block">
                    Current password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleInitiateForgotPassword}
                    disabled={passwordLoading}
                    className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>
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

            <div className="flex items-center gap-2.5 pt-1">
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

              <button
                type="button"
                onClick={handleCancelPassword}
                disabled={passwordLoading}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* View 3: Enter Email OTP Code (When Forgot Password was clicked) */}
        {passwordMode === "forgot_otp" && (
          <form
            onSubmit={handleVerifyOtp}
            className="space-y-4 max-w-md animate-in fade-in-0 duration-150"
          >
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                <Mail className="w-4 h-4 text-[#4F46E5]" />
                <span>Verification Code Sent</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-[#0F172A]">{maskedEmail}</span>. Enter the code
                below to continue.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A] block">
                6-Digit Verification Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 bg-white text-lg tracking-widest font-mono text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px] text-center"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={passwordLoading || otpCode.length !== 6}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50 transition-colors inline-flex items-center gap-2 min-h-[44px]"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleInitiateForgotPassword}
                disabled={passwordLoading}
                className="px-3.5 py-2.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
              >
                Resend Code
              </button>

              <button
                type="button"
                onClick={handleCancelPassword}
                disabled={passwordLoading}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* View 4: Correct OTP Verified -> Enter New Password & Confirm Password */}
        {passwordMode === "forgot_new_pass" && (
          <form
            onSubmit={handleSavePasswordWithOtp}
            className="space-y-4 max-w-md animate-in fade-in-0 duration-150"
          >
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Code Verified</span>
              </div>
              <p>Please enter your new password below to update your account in the database.</p>
            </div>

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
                autoFocus
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

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-semibold shadow-2xs cursor-pointer disabled:opacity-50 transition-colors inline-flex items-center gap-2 min-h-[44px]"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving new password...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelPassword}
                disabled={passwordLoading}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
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
