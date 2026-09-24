"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Mail, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { LoginSchema, SignUpSchema } from "@/lib/validations/auth";
import { signUpAction } from "@/app/actions/auth";
import AuthMascot from "@/components/auth/AuthMascot";
import PhoneSignInForm from "@/components/PhoneSignInForm";
import CityscapeLoadingScreen from "@/components/loading/CityscapeLoadingScreen";


export type AuthMode = "login" | "signup" | "forgot_password" | "phone";

interface UnifiedAuthCardProps {
  initialMode?: AuthMode;
  onClose?: () => void;
  callbackUrl?: string;
  isModal?: boolean;
}

export default function UnifiedAuthCard({
  initialMode = "login",
  onClose,
  callbackUrl = "/dashboard",
  isModal = false,
}: UnifiedAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);

  // Shared / Feedback State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Parse NextAuth redirect URL errors (e.g. Google OAuth callbacks)
  // Parse NextAuth redirect URL errors (e.g. Google OAuth callbacks)
  useEffect(() => {
    if (oauthError) {
      if (oauthError === "OAuthSignin" || oauthError === "OAuthCallback") {
        setServerError("Could not complete Google authentication. Please try signing in again.");
      } else if (oauthError === "OAuthCreateAccount") {
        setServerError("Could not create account with Google. Please try another sign-in method.");
      } else if (oauthError === "AccessDenied") {
        setServerError("Access denied. Your account may be inactive, suspended, or an account linking conflict occurred.");
      } else if (oauthError === "Configuration") {
        setServerError("Authentication server configuration error. Please try again shortly.");
      } else {
        setServerError("Authentication failed. Please check your credentials and try again.");
      }
    }
  }, [oauthError]);

  const resetFeedback = () => {
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    if (isAuthenticating || isRedirecting) return;
    resetFeedback();
    setMode(newMode);
  };

  // Helper for signIn with 30s timeout to allow cold DB pooler initialization
  const signInWithTimeout = async (provider: string, options: any, timeoutMs = 30000) => {
    return Promise.race([
      signIn(provider, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AUTH_TIMEOUT")), timeoutMs)
      ),
    ]);
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
    if (isAuthenticating || isRedirecting || isGoogleLoading) return;
    setIsGoogleLoading(true);
    resetFeedback();
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google auth error:", err);
      setServerError("Unable to connect with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating || isRedirecting) return;
    resetFeedback();

    const validation = LoginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });
      return;
    }

    setIsAuthenticating(true);

    try {
      const absoluteCallback =
        typeof window !== "undefined"
          ? `${window.location.origin}${callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`}`
          : callbackUrl;

      const res = await signInWithTimeout(
        "credentials",
        {
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
          redirect: false,
          callbackUrl: absoluteCallback,
        },
        30000
      );

      if (res?.error) {
        setIsAuthenticating(false);
        setIsRedirecting(false);
        const errStr = String(res.error);
        if (errStr.includes("ACCOUNT_LOCKED")) {
          setServerError("Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.");
        } else if (errStr.includes("ACCOUNT_INACTIVE")) {
          setServerError("Your account is inactive. If you received an invitation, please check your email for the activation link.");
        } else if (errStr.includes("SECURITY_BLOCKED_METHOD")) {
          setServerError("This sign-in method is restricted for your account type.");
        } else if (errStr.includes("EMAIL_NOT_VERIFIED")) {
          setServerError("Your email address is not verified yet. Please check your inbox.");
        } else {
          setServerError("Invalid email address or password. Please verify your credentials and try again.");
        }
        return;
      }

      // Successful authentication: confirm session and determine destination by role
      setIsAuthenticating(false);
      setIsRedirecting(true);

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

        if (onClose) onClose();
        window.location.href = targetUrl;
      } catch {
        if (onClose) onClose();
        window.location.href = callbackUrl || "/dashboard";
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      setIsRedirecting(false);
      const errStr = String(err?.message || err || "");
      if (errStr === "AUTH_TIMEOUT") {
        setServerError("Unable to sign in right now. Request timed out. Please try again.");
      } else if (errStr.includes("ACCOUNT_LOCKED")) {
        setServerError("Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.");
      } else if (errStr.includes("ACCOUNT_INACTIVE")) {
        setServerError("Your account is inactive. If you received an invitation, please check your email for the activation link.");
      } else if (errStr.includes("SECURITY_BLOCKED_METHOD")) {
        setServerError("This sign-in method is restricted for your account type.");
      } else if (errStr.includes("EMAIL_NOT_VERIFIED")) {
        setServerError("Your email address is not verified yet. Please check your inbox.");
      } else if (errStr.includes("CredentialsSignin") || errStr.includes("Invalid URL") || errStr.includes("CallbackRouteError")) {
        setServerError("Invalid email address or password. Please verify your credentials and try again.");
      } else {
        setServerError("Unable to sign in right now. Please check your connection and try again.");
      }
    }
  };


  // Sign Up Submit Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    const validation = SignUpSchema.safeParse(signUpData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const formatted: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, msgs]) => {
        if (msgs && msgs.length > 0) formatted[key] = msgs[0];
      });
      setErrors(formatted);
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUpAction(signUpData);
      if (res.success) {
        setSuccessMessage(
          `Account created successfully! We sent a verification link to ${signUpData.email}. Please check your inbox.`
        );
      } else {
        if (res.errors) {
          const formatted: Record<string, string> = {};
          Object.entries(res.errors).forEach(([k, v]) => {
            formatted[k] = v[0];
          });
          setErrors(formatted);
        }
        setServerError(res.message || "Sign up failed. Please try again.");
      }
    } catch {
      setServerError("Network error. Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Submit Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!loginEmail || !loginEmail.includes("@")) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    try {
      const { forgotPasswordAction } = await import("@/app/actions/auth");
      const res = await forgotPasswordAction({ email: loginEmail });
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setServerError(res.message);
      }
    } catch {
      setServerError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <CityscapeLoadingScreen
        message="Authenticating session..."
        submessage="Redirecting to your workspace..."
        fullScreen={true}
      />
    );
  }

  const formBody = (
    <div className="w-full flex flex-col justify-center">
      {/* Header Title & Subtitle */}
      <div className="text-center mb-6 sm:mb-8">

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#191F2D] tracking-tight font-[family-name:var(--font-dm-sans)]">
              {mode === "login"
                ? "Login"
                : mode === "signup"
                ? "Create Account"
                : mode === "phone"
                ? "Phone Login"
                : "Reset Password"}
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-1 font-medium">
              {mode === "login"
                ? "Enter your account details"
                : mode === "signup"
                ? "Start your assessment and career trajectory"
                : mode === "phone"
                ? "Enter your mobile number to get started"
                : "Enter your email to receive recovery instructions"}
            </p>

            {/* Back Button for non-default modes */}
            {mode !== "login" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="mt-2 text-xs font-semibold text-[#FF6B6B] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            )}
          </div>

          {/* Feedback & Error Alerts */}
          {serverError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 1: FORGOT PASSWORD                                                   */}
          {/* ========================================================================= */}
          {mode === "forgot_password" ? (
            successMessage ? (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#191F2D]">Instructions Dispatched</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  If an account is associated with <span className="font-bold text-[#191F2D]">{loginEmail}</span>, you will receive a password reset link shortly.
                </p>
                <div className="p-3 bg-[#FFF8F5] border border-[#F4E3DC] rounded-2xl text-[11px] text-[#718096]">
                  <span className="font-bold text-[#191F2D]">Development Notice:</span> Check your server terminal console for the generated reset URL.
                </div>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-5 h-5 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={isLoading}
                      className={`w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                        errors.email
                          ? "border-red-400 bg-red-50/20"
                          : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 sm:py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )
          ) : mode === "phone" ? (
            /* ======================================================================= */
            /* MODE 2: PHONE OTP LOGIN                                                 */
            /* ======================================================================= */
            <div className="my-2">
              <PhoneSignInForm callbackUrl={callbackUrl} />
            </div>
          ) : mode === "signup" ? (
            /* ======================================================================= */
            /* MODE 3: SIGN UP (CREATE ACCOUNT)                                        */
            /* ======================================================================= */
            successMessage ? (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#191F2D]">Account Created!</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  We have sent a verification link to <span className="font-bold text-[#191F2D]">{signUpData.email}</span>. Please verify your email before logging in.
                </p>
                <div className="p-3 bg-[#FFF8F5] border border-[#F4E3DC] rounded-2xl text-[11px] text-[#718096]">
                  <span className="font-bold text-[#191F2D]">Development Notice:</span> In development mode, check your server console log for the verification URL.
                </div>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  {/* First Name & Last Name Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1">
                        First Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          name="firstName"
                          value={signUpData.firstName}
                          onChange={(e) =>
                            setSignUpData((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                          placeholder="Jane"
                          disabled={isLoading}
                          className={`w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                            errors.firstName
                              ? "border-red-400 bg-red-50/20"
                              : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                          }`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={signUpData.lastName}
                        onChange={(e) =>
                          setSignUpData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        placeholder="Doe"
                        disabled={isLoading}
                        className={`w-full px-3.5 py-2.5 sm:py-3 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                          errors.lastName
                            ? "border-red-400 bg-red-50/20"
                            : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={signUpData.email}
                        onChange={(e) =>
                          setSignUpData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="jane@example.com"
                        disabled={isLoading}
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                          errors.email
                            ? "border-red-400 bg-red-50/20"
                            : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.email}</p>}
                  </div>

                  {/* Password & Confirm Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showSignUpPassword ? "text" : "password"}
                          name="password"
                          value={signUpData.password}
                          onChange={(e) =>
                            setSignUpData((prev) => ({ ...prev, password: e.target.value }))
                          }
                          placeholder="8+ characters"
                          disabled={isLoading}
                          className={`w-full pl-3.5 pr-10 py-2.5 sm:py-3 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                            errors.password
                              ? "border-red-400 bg-red-50/20"
                              : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 text-[#8C95A6] hover:text-[#191F2D] transition-colors p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1">
                        Confirm
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showSignUpConfirm ? "text" : "password"}
                          name="confirmPassword"
                          value={signUpData.confirmPassword}
                          onChange={(e) =>
                            setSignUpData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          placeholder="Repeat password"
                          disabled={isLoading}
                          className={`w-full pl-3.5 pr-10 py-2.5 sm:py-3 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                            errors.confirmPassword
                              ? "border-red-400 bg-red-50/20"
                              : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpConfirm(!showSignUpConfirm)}
                          className="absolute right-3 text-[#8C95A6] hover:text-[#191F2D] transition-colors p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showSignUpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-3 py-3.5 sm:py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-5">
                  <div className="w-full border-t border-[#E2E8F0]" />
                  <span className="bg-white px-4 text-xs font-semibold text-[#8C95A6] uppercase tracking-wider absolute">
                    Or Continue With
                  </span>
                </div>

                {/* Social Buttons */}
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  {/* Google OAuth */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isGoogleLoading}
                    title="Sign up with Google"
                    className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    )}
                  </button>

                  {/* Phone OTP Trigger */}
                  <button
                    type="button"
                    onClick={() => switchMode("phone")}
                    title="Sign up with Phone OTP"
                    className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-white text-[#191F2D] hover:bg-gray-50 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer Switcher */}
                <div className="mt-6 text-center text-xs sm:text-sm font-medium text-[#718096]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-bold text-[#191F2D] hover:text-[#FF6B6B] underline transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )
          ) : (
            /* ======================================================================= */
            /* MODE 4: LOGIN (DEFAULT)                                                 */
            /* ======================================================================= */
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1E2538] mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-5 h-5 text-[#8C95A6] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={isAuthenticating || isRedirecting}
                      className={`w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                        errors.email
                          ? "border-red-400 bg-red-50/20"
                          : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#1E2538]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot_password")}
                      disabled={isAuthenticating || isRedirecting}
                      className="text-xs font-semibold text-[#8C95A6] hover:text-[#FF6B6B] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isAuthenticating || isRedirecting}
                      className={`w-full pl-4 pr-11 py-3 sm:py-3.5 rounded-2xl border bg-white text-sm text-[#1A202C] placeholder:text-[#A0AEC0] outline-none transition-all shadow-sm font-medium ${
                        errors.password
                          ? "border-red-400 bg-red-50/20"
                          : "border-[#F0DCB8] focus:border-[#F4A261] focus:ring-4 focus:ring-[#F4A261]/15"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      disabled={isAuthenticating || isRedirecting}
                      className="absolute right-3.5 text-[#8C95A6] hover:text-[#191F2D] transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">{errors.password}</p>
                  )}
                </div>

                {/* Quick Demo Accounts Fill */}
                <div className="pt-1 pb-1">
                  <div className="text-[11px] font-bold text-[#64748B] mb-1.5 flex items-center justify-between">
                    <span>Quick Fill Demo Credentials:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("admin@aurapath.com");
                        setLoginPassword("Password123!");
                      }}
                      className="px-2 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[11px] transition-all cursor-pointer text-center"
                    >
                      👑 Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("staff@aurapath.com");
                        setLoginPassword("Password123!");
                      }}
                      className="px-2 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition-all cursor-pointer text-center"
                    >
                      🛡️ Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("student@aurapath.com");
                        setLoginPassword("Password123!");
                      }}
                      className="px-2 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[11px] transition-all cursor-pointer text-center"
                    >
                      🎓 Student
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating || isRedirecting}
                  className="w-full mt-2 py-3.5 sm:py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : isRedirecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Redirecting...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-[#E2E8F0]" />
                <span className="bg-white px-4 text-xs font-semibold text-[#8C95A6] uppercase tracking-wider absolute">
                  Or Continue With
                </span>
              </div>

              {/* Social Buttons */}
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleLoading}
                  title="Sign in with Google"
                  className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  )}
                </button>

                {/* Phone OTP Trigger */}
                <button
                  type="button"
                  onClick={() => switchMode("phone")}
                  title="Sign in with Phone OTP"
                  className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-white text-[#191F2D] hover:bg-gray-50 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              {/* Footer Switcher */}
              <div className="mt-8 text-center text-xs sm:text-sm font-medium text-[#718096]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-bold text-[#191F2D] hover:text-[#FF6B6B] underline transition-colors cursor-pointer"
                >
                  Sign Up here
                </button>
              </div>
            </div>
          )}
    </div>
  );

  const cardContent = (
    <div className="relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_80px_rgba(0,0,0,0.18)] border border-[#F5E6E0] overflow-hidden p-5 sm:p-7 md:p-10 text-[#1E2538] font-sans selection:bg-[#FFD4CB]">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 text-[#718096] hover:text-[#1A202C] p-2 rounded-full hover:bg-[#F8FAFC] transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
        {/* Left Column: 50% Equal Proportion Illustration */}
        <div className="hidden md:flex rounded-[24px] sm:rounded-[32px] overflow-hidden relative min-h-[480px] md:min-h-[540px] self-stretch shadow-inner bg-[#FFF5F2]">
          <AuthMascot className="w-full h-full min-h-[480px] md:min-h-[540px]" />
        </div>

        {/* Right Column: 50% Equal Proportion Form */}
        <div className="flex flex-col justify-center px-2 sm:px-4 md:px-6">
          {formBody}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return cardContent;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#FBFBF9] text-[#1E2538] font-sans selection:bg-[#FFD4CB]">
      {cardContent}
    </div>
  );
}


