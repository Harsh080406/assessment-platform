"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { activateAccountAction } from "@/app/actions/auth";

interface ActivateAccountClientProps {
  token: string;
  email: string | null;
  role: string | null;
}

export default function ActivateAccountClient({
  token,
  email,
  role,
}: ActivateAccountClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    !email ? "Invalid or expired activation link." : null
  );
  const [success, setSuccess] = useState<string | null>(null);

  const targetDashboard =
    role === "ADMIN" ? "/console" : role === "STAFF" ? "/portal" : "/dashboard";

  const handlePasswordActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await activateAccountAction({ token, password });
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          router.push(`/login?callbackUrl=${encodeURIComponent(targetDashboard)}`);
        }, 1500);
      } else {
        setError(res.message);
      }
    });
  };

  const handleGoogleActivation = () => {
    signIn("google", { callbackUrl: targetDashboard });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
          Activate Your Account
        </h1>
        <p className="text-xs text-[#64748B] font-medium">
          You have been invited to join the AuraPath platform.
        </p>
      </div>

      {/* Account Details Banner */}
      {email && role && (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#94A3B8]">
              Invited Email
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              {role}
            </span>
          </div>
          <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {email}
          </div>
        </div>
      )}

      {/* Error / Success Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success} Redirecting...</span>
        </div>
      )}

      {email && !success && (
        <div className="space-y-5">
          {/* Activation Form */}
          <form onSubmit={handlePasswordActivation} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Set Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? (
                "Activating Account..."
              ) : (
                <>
                  <span>Activate with Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-3 text-[10px] font-extrabold uppercase text-[#94A3B8] absolute">
              Or
            </span>
          </div>

          {/* Google OAuth Activation Option */}
          <button
            onClick={handleGoogleActivation}
            disabled={isPending}
            className="w-full py-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold transition flex items-center justify-center gap-3 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Activate with Google</span>
          </button>
        </div>
      )}
    </div>
  );
}
