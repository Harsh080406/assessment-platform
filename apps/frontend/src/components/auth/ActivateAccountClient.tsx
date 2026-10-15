"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  User,
  Calendar,
  MapPin,
  Phone,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
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

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    !email ? "Invalid or expired activation link. Please request a new invitation." : null
  );
  const [isActivated, setIsActivated] = useState(false);
  const [activatedDetails, setActivatedDetails] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const targetDashboard =
    role === "ADMIN" ? "/console" : role === "STAFF" ? "/portal" : "/dashboard";

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError("Please provide your first name.");
      return;
    }

    if (!lastName.trim()) {
      setError("Please provide your last name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both entries.");
      return;
    }

    startTransition(async () => {
      const res = await activateAccountAction({
        token,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || undefined,
        country: country.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (res.success) {
        setActivatedDetails({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        setIsActivated(true);
      } else {
        setError(res.message);
      }
    });
  };

  const handleGoogleActivation = () => {
    signIn("google", { callbackUrl: targetDashboard });
  };

  // SUCCESS WINDOW
  if (isActivated) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-8 sm:p-10 space-y-7 animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Activated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Welcome to Alderwood Vantage!
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed max-w-md mx-auto">
            Your profile details and password have been configured successfully. Your account is now active and ready to use.
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
            <span className="text-xs font-semibold text-[#64748B]">Name</span>
            <span className="text-xs font-bold text-[#0F172A]">
              {activatedDetails?.firstName} {activatedDetails?.lastName}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
            <span className="text-xs font-semibold text-[#64748B]">Account Email</span>
            <span className="text-xs font-bold text-[#0F172A]">{email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
            <span className="text-xs font-semibold text-[#64748B]">Role / Access</span>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              {role || "STUDENT"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Status</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active & Verified
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(targetDashboard)}`}
            className="w-full py-4 rounded-xl bg-[#0F172A] hover:bg-black text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <span>Sign In to Access Your Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="w-full py-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155] text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>Go to Main Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-center text-[11px] text-[#94A3B8]">
          Alderwood Vantage • Raising leaders, not just employees.
        </p>
      </div>
    );
  }

  // ACTIVATION FORM
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-8 sm:p-9 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
          Activate Your Account
        </h1>
        <p className="text-xs text-[#64748B] font-medium max-w-sm mx-auto">
          Please complete your profile details and set a secure password to finalize your account activation.
        </p>
      </div>

      {/* Account Details Banner */}
      {email && (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#94A3B8]">
              Invited Email
            </span>
            {role && (
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                {role}
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {email && (
        <form onSubmit={handleActivation} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Jenkins"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Date of Birth & Country/Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Calendar className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Country / Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. United Kingdom"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={isPending}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#334155] block">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+44 20 7946 0912"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Create Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-3 text-[#94A3B8] hover:text-[#475569]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#334155] block">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#94A3B8]">
            Must contain at least 8 characters. You will use this password to sign in.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Activating Your Account...</span>
              </span>
            ) : (
              <>
                <span>Complete Activation & Create Password</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-3 text-[10px] font-extrabold uppercase text-[#94A3B8] absolute">
              Or
            </span>
          </div>

          {/* Google OAuth Activation Option */}
          <button
            type="button"
            onClick={handleGoogleActivation}
            disabled={isPending}
            className="w-full py-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold transition flex items-center justify-center gap-3 shadow-xs"
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
        </form>
      )}
    </div>
  );
}
