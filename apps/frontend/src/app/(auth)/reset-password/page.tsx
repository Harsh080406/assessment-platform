"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { resetPasswordAction } from "@/app/actions/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(
    token ? null : "Missing password reset token in the link."
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = ResetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const formatted: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, msgs]) => {
        if (msgs && msgs[0]) formatted[key] = msgs[0];
      });
      setErrors(formatted);
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordAction({ token, password, confirmPassword });
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setServerError(res.message);
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] p-4 text-black font-sans selection:bg-[#A9B4E8]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E0DB] shadow-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <span className="font-[family-name:var(--font-dm-sans)] text-2xl font-black tracking-tight text-black">
              Aura<span className="text-[#7C89CC]">Path</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1.5 font-medium">
            Enter your new secure password below
          </p>
        </div>

        {successMessage ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-black">Password Reset Complete</h3>
            <p className="text-xs text-[#555555] leading-relaxed">{successMessage}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-[#A9B4E8] text-black font-extrabold text-sm hover:bg-[#8E9BDD] transition-all shadow-sm"
            >
              Log In With New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ chars, 1 uppercase, 1 number"
                  disabled={isLoading || !token}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#FAF9F5] text-sm text-black placeholder:text-[#999999] outline-none focus:border-[#A9B4E8] focus:bg-white transition-all ${
                    errors.password ? "border-red-400 bg-red-50/30" : "border-[#E2E0DB]"
                  }`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={isLoading || !token}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#FAF9F5] text-sm text-black placeholder:text-[#999999] outline-none focus:border-[#A9B4E8] focus:bg-white transition-all ${
                    errors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-[#E2E0DB]"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#A9B4E8] text-black font-extrabold text-sm hover:bg-[#8E9BDD] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
