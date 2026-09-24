"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Phone, KeyRound, ArrowRight, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { PhoneRequestOtpSchema, PhoneVerifyOtpSchema } from "@/lib/validations/auth";
import { requestPhoneOtpAction } from "@/app/actions/auth";

interface PhoneSignInFormProps {
  callbackUrl?: string;
  onSuccess?: () => void;
}

export default function PhoneSignInForm({ callbackUrl = "/dashboard" }: PhoneSignInFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Request Phone OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = PhoneRequestOtpSchema.safeParse({ phone });
    if (!validation.success) {
      setError(validation.error.flatten().fieldErrors.phone?.[0] || "Invalid phone number");
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestPhoneOtpAction({ phone });
      if (!res.success) {
        setError(res.message);
        setIsLoading(false);
        return;
      }

      setStep("otp");
      setCountdown(60); // 60s cooldown for resend
      setIsLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Helper for signIn with timeout (30s)
  const signInWithTimeout = async (provider: string, options: any, timeoutMs = 30000) => {
    return Promise.race([
      signIn(provider, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AUTH_TIMEOUT")), timeoutMs)
      ),
    ]);
  };

  // Step 2: Verify Phone OTP & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    const validation = PhoneVerifyOtpSchema.safeParse({ phone, code });
    if (!validation.success) {
      setError(validation.error.flatten().fieldErrors.code?.[0] || "Code must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signInWithTimeout(
        "credentials",
        {
          type: "phone_otp",
          phone,
          code,
          redirect: false,
        },
        30000
      );

      if (res?.error) {
        if (res.error.includes("OTP_NOT_FOUND")) {
          setError("No active code found. Please request a new security code.");
        } else if (res.error.includes("OTP_EXPIRED")) {
          setError("Security code has expired (10 min limit). Please request a new one.");
        } else if (res.error.includes("OTP_MAX_ATTEMPTS")) {
          setError("Maximum verification attempts exceeded. This code has been invalidated for security.");
        } else if (res.error.includes("OTP_INCORRECT")) {
          const parts = res.error.split(":");
          const remaining = parts[1] || "";
          setError(`Incorrect security code.${remaining ? ` ${remaining} attempt(s) remaining.` : ""}`);
        } else if (res.error.includes("ACCOUNT_INACTIVE")) {
          setError("Account is inactive or suspended. Please contact support.");
        } else {
          setError("Verification failed. Please check the code and try again.");
        }
        setIsLoading(false);
        return;
      }

      // Confirmed auth -> determine destination by role
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;

        let targetUrl = "/dashboard";
        if (callbackUrl && callbackUrl !== "/dashboard" && !callbackUrl.startsWith("/login")) {
          targetUrl = callbackUrl;
        } else if (role === "STAFF") {
          targetUrl = "/portal";
        } else if (role === "ADMIN") {
          targetUrl = "/console";
        } else {
          targetUrl = "/dashboard";
        }

        window.location.href = targetUrl;
      } catch {
        window.location.href = callbackUrl || "/dashboard";
      }
    } catch (err: any) {
      if (err?.message === "AUTH_TIMEOUT") {
        setError("Unable to verify code right now. Request timed out. Please try again.");
      } else {
        setError("Connection error. Please check your network and try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === "phone" ? (
        /* Phone Number Entry */
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1.5">
              Mobile Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-5 h-5 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199 or +91 9876543210"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border border-[#CBD5E1] bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15 transition-all shadow-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-[#718096] mt-1 font-medium">
              Include country code (e.g. +1, +91, +44).
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phone}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send 6-Digit Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* OTP Code Verification */
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
          <div className="p-3.5 bg-[#FFF0EB] rounded-2xl border border-[#FFD4C8] flex items-center justify-between text-xs text-[#1E2538]">
            <div>
              <span className="text-[#718096] block text-[11px]">Code sent to:</span>
              <span className="font-extrabold">{phone}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="text-[#FF6B6B] font-extrabold hover:underline text-[11px] cursor-pointer"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1.5">
              Enter 6-Digit Security Code
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-5 h-5 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                disabled={isLoading}
                autoFocus
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border border-[#CBD5E1] bg-white text-center tracking-[0.35em] text-lg font-black text-[#1E2538] placeholder:text-[#CBD5E1] placeholder:tracking-normal outline-none focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15 transition-all shadow-sm font-mono"
              />
            </div>
            <div className="p-2.5 bg-[#FFF8F5] border border-[#F4E3DC] rounded-xl text-[11px] text-[#718096] mt-2">
              <span className="font-bold text-[#1E2538]">Dev Notice:</span> Check your terminal console for the stub SMS code.
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend button */}
          <div className="text-center pt-2">
            {countdown > 0 ? (
              <span className="text-[11px] text-[#718096] font-medium">
                Resend code in <span className="font-bold text-[#1E2538]">{countdown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B] hover:underline cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resend Security Code
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
