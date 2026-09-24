"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, ArrowRight, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { EmailRequestOtpSchema, EmailVerifyOtpSchema } from "@/lib/validations/auth";
import { requestEmailOtpAction } from "@/app/actions/auth";

interface EmailOtpSignInFormProps {
  callbackUrl?: string;
}

export default function EmailOtpSignInForm({ callbackUrl = "/dashboard" }: EmailOtpSignInFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = EmailRequestOtpSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.flatten().fieldErrors.email?.[0] || "Invalid email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestEmailOtpAction({ email });
      if (!res.success) {
        setError(res.message);
        setIsLoading(false);
        return;
      }

      setStep("otp");
      setCountdown(60);
      setIsLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = EmailVerifyOtpSchema.safeParse({ email, code });
    if (!validation.success) {
      setError(validation.error.flatten().fieldErrors.code?.[0] || "Code must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        type: "email_otp",
        email,
        code,
        redirect: false,
      });

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

      if (callbackUrl && !callbackUrl.startsWith("/login")) {
        router.push(callbackUrl);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
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

      {step === "email" ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border border-[#CBD5E1] bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15 transition-all shadow-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-[#718096] mt-1 font-medium">
              We will send a 6-digit login code to your email inbox.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send Email Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
          <div className="p-3.5 bg-[#FFF0EB] rounded-2xl border border-[#FFD4C8] flex items-center justify-between text-xs text-[#1E2538]">
            <div>
              <span className="text-[#718096] block text-[11px]">Code sent to:</span>
              <span className="font-extrabold">{email}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("email");
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
              Enter 6-Digit Email Code
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
              <span className="font-bold text-[#1E2538]">Dev Notice:</span> Check your terminal console for the stub email OTP.
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
                Resend Email Code
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
