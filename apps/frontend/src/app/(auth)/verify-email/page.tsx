"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { verifyEmailAction } from "@/app/actions/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error"
  );
  const [message, setMessage] = useState<string>(
    token ? "Verifying your email address..." : "No verification token provided in the link."
  );

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function verify() {
      try {
        const res = await verifyEmailAction({ token: token! });
        if (!isMounted) return;

        if (res.success) {
          setStatus("success");
          setMessage(res.message);
        } else {
          setStatus("error");
          setMessage(res.message);
        }
      } catch {
        if (!isMounted) return;
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] p-4 text-black font-sans selection:bg-[#A9B4E8]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E0DB] shadow-md text-center">
        <Link href="/" className="inline-block mb-6">
          <span className="font-[family-name:var(--font-dm-sans)] text-2xl font-black tracking-tight text-black">
            Aura<span className="text-[#7C89CC]">Path</span>
          </span>
        </Link>

        {status === "verifying" && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-12 h-12 text-[#7C89CC] animate-spin mx-auto" />
            <h2 className="text-xl font-extrabold text-black">Verifying Account</h2>
            <p className="text-xs text-[#666666]">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-black">Email Verified!</h2>
            <p className="text-xs text-[#555555] leading-relaxed">{message}</p>

            <Link
              href="/login?verified=true"
              className="mt-6 inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-[#A9B4E8] text-black font-extrabold text-sm hover:bg-[#8E9BDD] transition-all shadow-sm gap-2"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-black">Verification Failed</h2>
            <p className="text-xs text-red-600 leading-relaxed font-medium">{message}</p>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-[#A9B4E8] text-black font-extrabold text-sm hover:bg-[#8E9BDD] transition-all shadow-sm"
              >
                Back to Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold text-[#666666] hover:text-black py-2 transition-colors"
              >
                Create a New Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
