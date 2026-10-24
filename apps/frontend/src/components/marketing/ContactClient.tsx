"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ArrowDown,
  Building2,
  User,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  MessageSquare,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  submitStudentQueryAction,
  submitInstitutionalQueryAction,
  StudentQueryInput,
  InstitutionalQueryInput,
} from "@/app/actions/contact";

export default function ContactClient() {
  const [activeTab, setActiveTab] = useState<"student" | "institutional">("student");

  // Student Form State
  const [studentForm, setStudentForm] = useState<StudentQueryInput>({
    name: "",
    email: "",
    phone: "",
    stage: "Class 11 & 12 (Degrees)",
    subject: "Assessment Report Clarification",
    message: "",
  });

  // Institutional Form State
  const [institutionalForm, setInstitutionalForm] = useState<InstitutionalQueryInput>({
    institutionName: "",
    representativeName: "",
    designation: "",
    workEmail: "",
    phone: "",
    institutionType: "K-12 Senior Secondary School",
    cohortSize: "250 - 750 students",
    partnershipObjective: "Campus-wide Cognitive Profiling",
    message: "",
  });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);

  // Field Touched / Validation States
  const [studentTouched, setStudentTouched] = useState<Record<string, boolean>>({});
  const [institutionalTouched, setInstitutionalTouched] = useState<Record<string, boolean>>({});

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form & Mobile Bar Visibility
  const formRef = useRef<HTMLDivElement>(null);
  const studentFirstInputRef = useRef<HTMLInputElement>(null);
  const institutionalFirstInputRef = useRef<HTMLInputElement>(null);
  const [isFormInView, setIsFormInView] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Copy to clipboard handler
  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Scroll to form handler
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Track if form is in viewport and track focus on inputs for mobile bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      observer.disconnect();
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Switch tabs and maintain smooth focus
  const handleTabSwitch = (tab: "student" | "institutional") => {
    setActiveTab(tab);
    setSubmissionSuccess(null);
    setErrorMessage(null);
    setTimeout(() => {
      if (tab === "student") {
        studentFirstInputRef.current?.focus();
      } else {
        institutionalFirstInputRef.current?.focus();
      }
    }, 50);
  };

  // Inline validation checks
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const studentErrors = {
    name: !studentForm.name.trim() ? "Please enter your name" : null,
    email: !studentForm.email.trim()
      ? "Please enter your email address"
      : !emailRegex.test(studentForm.email)
      ? "Please enter a valid email address"
      : null,
    message: !studentForm.message.trim() ? "Please enter your message or question" : null,
  };

  const institutionalErrors = {
    institutionName: !institutionalForm.institutionName.trim()
      ? "Please enter your institution or school name"
      : null,
    representativeName: !institutionalForm.representativeName.trim()
      ? "Please enter the representative's name"
      : null,
    designation: !institutionalForm.designation.trim()
      ? "Please enter your official designation"
      : null,
    workEmail: !institutionalForm.workEmail.trim()
      ? "Please enter your official work email"
      : !emailRegex.test(institutionalForm.workEmail)
      ? "Please enter a valid official work email"
      : null,
    phone: !institutionalForm.phone.trim() ? "Please enter an official contact number" : null,
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Touch all required fields
    setStudentTouched({ name: true, email: true, message: true });

    if (studentErrors.name || studentErrors.email || studentErrors.message) {
      setErrorMessage("Please complete all required fields highlighted in red below.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitStudentQueryAction(studentForm);
      setIsSubmitting(false);

      if (res.success && res.referenceId && res.message) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          message: res.message,
        });
        setStudentForm({
          name: "",
          email: "",
          phone: "",
          stage: "Class 11 & 12 (Degrees)",
          subject: "Assessment Report Clarification",
          message: "",
        });
        setStudentTouched({});
      } else {
        setErrorMessage(res.error || "Failed to submit query. Please try again.");
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage("Network error occurred. Please check your connection and try again.");
    }
  };

  const handleInstitutionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Touch all required fields
    setInstitutionalTouched({
      institutionName: true,
      representativeName: true,
      designation: true,
      workEmail: true,
      phone: true,
    });

    if (
      institutionalErrors.institutionName ||
      institutionalErrors.representativeName ||
      institutionalErrors.designation ||
      institutionalErrors.workEmail ||
      institutionalErrors.phone
    ) {
      setErrorMessage("Please complete all required fields highlighted in red below.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitInstitutionalQueryAction(institutionalForm);
      setIsSubmitting(false);

      if (res.success && res.referenceId && res.message) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          message: res.message,
        });
        setInstitutionalForm({
          institutionName: "",
          representativeName: "",
          designation: "",
          workEmail: "",
          phone: "",
          institutionType: "K-12 Senior Secondary School",
          cohortSize: "250 - 750 students",
          partnershipObjective: "Campus-wide Cognitive Profiling",
          message: "",
        });
        setInstitutionalTouched({});
      } else {
        setErrorMessage(res.error || "Failed to submit institutional inquiry. Please try again.");
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage("Network error occurred. Please check your connection and try again.");
    }
  };

  // FAQ Items
  const faqItems = [
    {
      q: "How long does it take to complete the assessment?",
      a: "The complete four-module evaluation takes approximately 20 to 25 minutes. It is self-paced and can be paused and resumed at any time from your dashboard.",
    },
    {
      q: "Can schools integrate Alderwood Vantage into their counselling cell?",
      a: "Yes. We provide school principals and counsellors with a centralized analytics portal to track student cohorts, stream fitment distributions, and individual diagnostic summaries.",
    },
    {
      q: "Is student test data kept private?",
      a: "Strictly yes. We maintain a zero-spam policy: student scores, contact numbers, and parent details are never shared or sold to commercial tuition or coaching institutions.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#0F172A] font-sans selection:bg-[#FED7CC] selection:text-[#0F172A]">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================
            1. HERO SECTION
            - 56px desktop / 36px mobile H1 in Sentence Case
            - Warm, calm, direct editorial copy with zero jargon
            - Subtext 17-20px, anchor link to FAQ
        ========================================================= */}
        <section className="pt-14 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 max-w-[1120px] mx-auto text-center">
          <div className="max-w-[720px] mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0F172A] tracking-[-0.01em] leading-[1.12]">
              We&apos;re here to help.
            </h1>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-[19px] text-[#475569] font-normal leading-relaxed max-w-[620px] mx-auto">
              Questions about the assessment, your child&apos;s report, or bringing Alderwood Vantage to your school? Talk to our team.
            </p>

            <div className="mt-4">
              <a
                href="#faq"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm py-1"
              >
                <span>Prefer to read first? See our frequently asked questions</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. MAIN SECTION: TWO-COLUMN LAYOUT
            - Container: 1120px, 24px padding (16px mobile)
            - Left Column: "Talk to us" direct channels card (sticky)
            - Right Column: Form card with dual toggle & validation
        ========================================================= */}
        <section className="px-4 sm:px-6 max-w-[1120px] mx-auto pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ─────────────────────────────────────────────────────────
                LEFT COLUMN: TALK TO US STACK (Sticky on desktop)
            ───────────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
                
                {/* Header */}
                <div className="pb-6 border-b border-[#E2E8F0]">
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#FF6B6B]">
                    Direct channels
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-[-0.01em] mt-1">
                    Talk to us
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                    Direct voice and written support from our advisory team.
                  </p>
                </div>

                {/* Contact Rows */}
                <div className="divide-y divide-[#E2E8F0]">
                  
                  {/* Row 1: Phone */}
                  <div className="py-5 first:pt-5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                          Counsellor helpline
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href="tel:+919316819331"
                            className="text-base sm:text-lg font-bold text-[#0F172A] hover:text-[#FF6B6B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                          >
                            +91 93168 19331
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopy("+91 93168 19331", "phone")}
                            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F5F4] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1 text-xs"
                            title="Copy phone number"
                            aria-label="Copy phone number"
                          >
                            {copiedKey === "phone" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] font-semibold text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-[#64748B] font-medium mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                          <span>Mon – Sat, 9:00 AM – 7:00 PM IST</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div className="py-5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3.5">
                        {/* General Inquiries */}
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                            General enquiries
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a
                              href="mailto:support@alderwoodvantage.com"
                              className="text-sm sm:text-base font-bold text-[#0F172A] hover:text-[#FF6B6B] transition-colors break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                            >
                              support@alderwoodvantage.com
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy("support@alderwoodvantage.com", "support-email")}
                              className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F5F4] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1 text-xs shrink-0"
                              title="Copy email"
                              aria-label="Copy support email"
                            >
                              {copiedKey === "support-email" ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[11px] font-semibold text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Institutional Desk */}
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                            Institutional desk
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a
                              href="mailto:partnerships@alderwoodvantage.com"
                              className="text-sm sm:text-base font-bold text-[#0F172A] hover:text-[#FF6B6B] transition-colors break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                            >
                              partnerships@alderwoodvantage.com
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy("partnerships@alderwoodvantage.com", "partnerships-email")}
                              className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F5F4] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1 text-xs shrink-0"
                              title="Copy email"
                              aria-label="Copy partnerships email"
                            >
                              {copiedKey === "partnerships-email" ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[11px] font-semibold text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Response Time */}
                  <div className="py-5 last:pb-0">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                          Response commitment
                        </span>
                        <p className="text-sm font-semibold text-[#0F172A] mt-0.5 leading-relaxed">
                          Average response time is under 4 business hours for all enquiries.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct Help Notice */}
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 text-xs text-[#64748B] leading-relaxed">
                <span className="font-bold text-[#0F172A]">Parent or educator? </span>
                Our counsellors are available to answer queries regarding assessment results, dimensional scores, and institutional pilots directly over phone or email.
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────
                RIGHT COLUMN: MESSAGE FORM CARD
            ───────────────────────────────────────────────────────── */}
            <div ref={formRef} id="contact-form" className="lg:col-span-7 scroll-mt-28">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 lg:p-9 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
                
                {/* Form Header */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-[-0.01em]">
                    Send us a message
                  </h2>
                  <p className="text-sm text-[#475569] mt-1.5 leading-relaxed">
                    Choose who you are and we will route it to the right person.
                  </p>
                </div>

                {/* Segmented Toggle Control (Accessible Radio Group / Tablist) */}
                <div
                  role="tablist"
                  aria-label="Enquiry category"
                  className="grid grid-cols-2 p-1.5 bg-[#F1F5F9] rounded-full border border-[#E2E8F0] mt-6 mb-8"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-student"
                    aria-selected={activeTab === "student"}
                    aria-controls="panel-student"
                    onClick={() => handleTabSwitch("student")}
                    className={`h-11 px-3 sm:px-5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === "student"
                        ? "bg-white text-[#0F172A] shadow-xs border border-[#CBD5E1]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    }`}
                  >
                    <User className={`w-4 h-4 shrink-0 ${activeTab === "student" ? "text-[#FF6B6B]" : "text-[#64748B]"}`} />
                    <span className="truncate">Student &amp; parent</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-institutional"
                    aria-selected={activeTab === "institutional"}
                    aria-controls="panel-institutional"
                    onClick={() => handleTabSwitch("institutional")}
                    className={`h-11 px-3 sm:px-5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === "institutional"
                        ? "bg-white text-[#0F172A] shadow-xs border border-[#CBD5E1]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    }`}
                  >
                    <Building2 className={`w-4 h-4 shrink-0 ${activeTab === "institutional" ? "text-[#FF6B6B]" : "text-[#64748B]"}`} />
                    <span className="truncate">Institutional &amp; school</span>
                  </button>
                </div>

                {/* SUCCESS PANEL */}
                {submissionSuccess && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-6 sm:p-8 rounded-xl bg-[#ECFDF5] border border-emerald-300 text-center animate-fade-in"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3.5 border border-emerald-200">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-emerald-950">
                      Thank you — we&apos;ve received your message
                    </h3>
                    
                    <p className="text-sm text-emerald-900 font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
                      {submissionSuccess.message}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-emerald-300 text-xs font-mono font-bold text-emerald-950">
                      <span>Reference ID:</span>
                      <span className="text-[#0F172A]">{submissionSuccess.referenceId}</span>
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => setSubmissionSuccess(null)}
                        className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                )}

                {/* ERROR SUMMARY BANNER */}
                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800 font-medium mb-6 animate-fade-in"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-900">Please review your submission</p>
                      <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────
                    FORM 1: STUDENT & PARENT ENQUIRY
                ───────────────────────────────────────────────────── */}
                {!submissionSuccess && activeTab === "student" && (
                  <form
                    id="panel-student"
                    role="tabpanel"
                    aria-labelledby="tab-student"
                    onSubmit={handleStudentSubmit}
                    className="space-y-5 animate-fade-in"
                    noValidate
                  >
                    {/* Name */}
                    <div>
                      <label htmlFor="student-name" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                        Your name <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <input
                        ref={studentFirstInputRef}
                        id="student-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        onBlur={() => setStudentTouched({ ...studentTouched, name: true })}
                        placeholder="e.g. Ananya Sharma"
                        aria-invalid={studentTouched.name && !!studentErrors.name}
                        aria-describedby={studentTouched.name && studentErrors.name ? "student-name-error" : undefined}
                        className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                          studentTouched.name && studentErrors.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                        }`}
                      />
                      {studentTouched.name && studentErrors.name && (
                        <p id="student-name-error" className="text-xs text-red-600 font-medium mt-1">
                          {studentErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="student-email" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                        Email address <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <input
                        id="student-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        onBlur={() => setStudentTouched({ ...studentTouched, email: true })}
                        placeholder="e.g. ananya@example.com"
                        aria-invalid={studentTouched.email && !!studentErrors.email}
                        aria-describedby={studentTouched.email && studentErrors.email ? "student-email-error" : undefined}
                        className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                          studentTouched.email && studentErrors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                        }`}
                      />
                      {studentTouched.email && studentErrors.email && (
                        <p id="student-email-error" className="text-xs text-red-600 font-medium mt-1">
                          {studentErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone (optional) & Educational Stage in 2 Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label htmlFor="student-phone" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                          Phone number <span className="text-xs font-normal text-[#64748B]">(optional)</span>
                        </label>
                        <input
                          id="student-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors"
                        />
                      </div>

                      {/* Educational Stage */}
                      <div>
                        <label htmlFor="student-stage" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                          Grade / educational stage
                        </label>
                        <div className="relative">
                          <select
                            id="student-stage"
                            name="stage"
                            value={studentForm.stage}
                            onChange={(e) => setStudentForm({ ...studentForm, stage: e.target.value })}
                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors cursor-pointer appearance-none truncate"
                          >
                            <option value="Class 8 - 10 (Stream Selection)">Class 8 – 10 (Stream Selection)</option>
                            <option value="Class 11 & 12 (Degrees)">Class 11 &amp; 12 (Degree &amp; Entrance Prep)</option>
                            <option value="College & Early Graduate">College &amp; Early Graduate</option>
                            <option value="Parent / Guardian">Parent / Guardian</option>
                            <option value="Independent Career Counselor">Independent Career Counsellor</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="student-subject" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                        Query subject
                      </label>
                      <div className="relative">
                        <select
                          id="student-subject"
                          name="subject"
                          value={studentForm.subject}
                          onChange={(e) => setStudentForm({ ...studentForm, subject: e.target.value })}
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors cursor-pointer appearance-none truncate"
                        >
                          <option value="Assessment Report Clarification">Assessment Report Clarification</option>
                          <option value="Psychometric Scores & Archetype Question">Psychometric Scores &amp; Archetype Question</option>
                          <option value="Technical or Account Assistance">Technical or Account Assistance</option>
                          <option value="General Guidance Inquiry">General Guidance Enquiry</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="student-message" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                        Your message or question <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <textarea
                        id="student-message"
                        name="message"
                        required
                        rows={6}
                        value={studentForm.message}
                        onChange={(e) => setStudentForm({ ...studentForm, message: e.target.value })}
                        onBlur={() => setStudentTouched({ ...studentTouched, message: true })}
                        placeholder="Tell us what you would like to know or how we can assist your child's discovery journey..."
                        aria-invalid={studentTouched.message && !!studentErrors.message}
                        aria-describedby={studentTouched.message && studentErrors.message ? "student-message-error" : undefined}
                        className={`w-full p-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 resize-none ${
                          studentTouched.message && studentErrors.message
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                        }`}
                      />
                      {studentTouched.message && studentErrors.message && (
                        <p id="student-message-error" className="text-xs text-red-600 font-medium mt-1">
                          {studentErrors.message}
                        </p>
                      )}
                    </div>

                    {/* Privacy Reassurance directly above Submit */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                        <Lock className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>
                          Your details are kept confidential. We never share them.{" "}
                          <Link href="/privacy" className="text-[#0F172A] font-semibold underline hover:text-[#FF6B6B] transition-colors">
                            Privacy &amp; parental consent
                          </Link>
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] active:bg-[#E05353] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Sending message...</span>
                          </>
                        ) : (
                          <>
                            <span>Send message</span>
                            <Send className="w-4 h-4 text-white" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ─────────────────────────────────────────────────────
                    FORM 2: INSTITUTIONAL & SCHOOL PARTNERSHIP
                ───────────────────────────────────────────────────── */}
                {!submissionSuccess && activeTab === "institutional" && (
                  <form
                    id="panel-institutional"
                    role="tabpanel"
                    aria-labelledby="tab-institutional"
                    onSubmit={handleInstitutionalSubmit}
                    className="space-y-6 animate-fade-in"
                    noValidate
                  >
                    {/* Introductory Context Strip */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-[#0F172A] shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                        Alderwood Vantage partners with schools and junior colleges across India to administer cohort-wide cognitive calibrations, stream advisory diagnostics, and counsellor management dashboards.
                      </p>
                    </div>

                    {/* Sub-section 1: Your institution */}
                    <div className="space-y-4 pt-2">
                      <div className="pb-2 border-b border-[#E2E8F0]">
                        <h3 className="text-base font-bold text-[#0F172A]">
                          1. Your institution
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Institution Name */}
                        <div>
                          <label htmlFor="inst-name" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Institution / school name <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <input
                            ref={institutionalFirstInputRef}
                            id="inst-name"
                            name="institutionName"
                            type="text"
                            required
                            autoComplete="organization"
                            value={institutionalForm.institutionName}
                            onChange={(e) =>
                              setInstitutionalForm({ ...institutionalForm, institutionName: e.target.value })
                            }
                            onBlur={() => setInstitutionalTouched({ ...institutionalTouched, institutionName: true })}
                            placeholder="e.g. National Public School"
                            aria-invalid={institutionalTouched.institutionName && !!institutionalErrors.institutionName}
                            aria-describedby={institutionalTouched.institutionName && institutionalErrors.institutionName ? "inst-name-error" : undefined}
                            className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                              institutionalTouched.institutionName && institutionalErrors.institutionName
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                            }`}
                          />
                          {institutionalTouched.institutionName && institutionalErrors.institutionName && (
                            <p id="inst-name-error" className="text-xs text-red-600 font-medium mt-1">
                              {institutionalErrors.institutionName}
                            </p>
                          )}
                        </div>

                        {/* Institution Type */}
                        <div>
                          <label htmlFor="inst-type" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Institution type
                          </label>
                          <div className="relative">
                            <select
                              id="inst-type"
                              name="institutionType"
                              value={institutionalForm.institutionType}
                              onChange={(e) =>
                                setInstitutionalForm({ ...institutionalForm, institutionType: e.target.value })
                              }
                              className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors cursor-pointer appearance-none truncate"
                            >
                              <option value="K-12 Senior Secondary School">K-12 Senior Secondary School (CBSE / ICSE / IB / Cambridge)</option>
                              <option value="Junior College / PU Board">Junior College / Pre-University (PU) College</option>
                              <option value="Degree College / University">Degree College / University Campus</option>
                              <option value="Ed-Tech / Coaching Institution">Ed-Tech / Coaching Academy</option>
                              <option value="State / District Education Authority">State / District Education Authority</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-section 2: Your details */}
                    <div className="space-y-4 pt-2">
                      <div className="pb-2 border-b border-[#E2E8F0]">
                        <h3 className="text-base font-bold text-[#0F172A]">
                          2. Your details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Representative Name */}
                        <div>
                          <label htmlFor="inst-rep-name" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Representative name <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <input
                            id="inst-rep-name"
                            name="representativeName"
                            type="text"
                            required
                            autoComplete="name"
                            value={institutionalForm.representativeName}
                            onChange={(e) =>
                              setInstitutionalForm({ ...institutionalForm, representativeName: e.target.value })
                            }
                            onBlur={() => setInstitutionalTouched({ ...institutionalTouched, representativeName: true })}
                            placeholder="e.g. Dr. Rajesh Verma"
                            aria-invalid={institutionalTouched.representativeName && !!institutionalErrors.representativeName}
                            aria-describedby={institutionalTouched.representativeName && institutionalErrors.representativeName ? "inst-rep-name-error" : undefined}
                            className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                              institutionalTouched.representativeName && institutionalErrors.representativeName
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                            }`}
                          />
                          {institutionalTouched.representativeName && institutionalErrors.representativeName && (
                            <p id="inst-rep-name-error" className="text-xs text-red-600 font-medium mt-1">
                              {institutionalErrors.representativeName}
                            </p>
                          )}
                        </div>

                        {/* Designation */}
                        <div>
                          <label htmlFor="inst-designation" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Official designation <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <input
                            id="inst-designation"
                            name="designation"
                            type="text"
                            required
                            value={institutionalForm.designation}
                            onChange={(e) =>
                              setInstitutionalForm({ ...institutionalForm, designation: e.target.value })
                            }
                            onBlur={() => setInstitutionalTouched({ ...institutionalTouched, designation: true })}
                            placeholder="e.g. Principal / Head of Career Guidance"
                            aria-invalid={institutionalTouched.designation && !!institutionalErrors.designation}
                            aria-describedby={institutionalTouched.designation && institutionalErrors.designation ? "inst-designation-error" : undefined}
                            className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                              institutionalTouched.designation && institutionalErrors.designation
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                            }`}
                          />
                          {institutionalTouched.designation && institutionalErrors.designation && (
                            <p id="inst-designation-error" className="text-xs text-red-600 font-medium mt-1">
                              {institutionalErrors.designation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Official Work Email */}
                        <div>
                          <label htmlFor="inst-email" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Official work email <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <input
                            id="inst-email"
                            name="workEmail"
                            type="email"
                            required
                            autoComplete="email"
                            inputMode="email"
                            value={institutionalForm.workEmail}
                            onChange={(e) =>
                              setInstitutionalForm({ ...institutionalForm, workEmail: e.target.value })
                            }
                            onBlur={() => setInstitutionalTouched({ ...institutionalTouched, workEmail: true })}
                            placeholder="e.g. principal@institution.edu.in"
                            aria-invalid={institutionalTouched.workEmail && !!institutionalErrors.workEmail}
                            aria-describedby={institutionalTouched.workEmail && institutionalErrors.workEmail ? "inst-email-error" : undefined}
                            className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                              institutionalTouched.workEmail && institutionalErrors.workEmail
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                            }`}
                          />
                          {institutionalTouched.workEmail && institutionalErrors.workEmail && (
                            <p id="inst-email-error" className="text-xs text-red-600 font-medium mt-1">
                              {institutionalErrors.workEmail}
                            </p>
                          )}
                        </div>

                        {/* Official Phone */}
                        <div>
                          <label htmlFor="inst-phone" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Official phone / mobile <span className="text-[#FF6B6B]" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <input
                            id="inst-phone"
                            name="phone"
                            type="tel"
                            required
                            autoComplete="tel"
                            inputMode="tel"
                            value={institutionalForm.phone}
                            onChange={(e) =>
                              setInstitutionalForm({ ...institutionalForm, phone: e.target.value })
                            }
                            onBlur={() => setInstitutionalTouched({ ...institutionalTouched, phone: true })}
                            placeholder="e.g. +91 98765 12345"
                            aria-invalid={institutionalTouched.phone && !!institutionalErrors.phone}
                            aria-describedby={institutionalTouched.phone && institutionalErrors.phone ? "inst-phone-error" : undefined}
                            className={`w-full h-12 px-4 rounded-xl border bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 ${
                              institutionalTouched.phone && institutionalErrors.phone
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#CBD5E1] focus:border-[#FF6B6B]"
                            }`}
                          />
                          {institutionalTouched.phone && institutionalErrors.phone && (
                            <p id="inst-phone-error" className="text-xs text-red-600 font-medium mt-1">
                              {institutionalErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sub-section 3: Your requirements */}
                    <div className="space-y-4 pt-2">
                      <div className="pb-2 border-b border-[#E2E8F0]">
                        <h3 className="text-base font-bold text-[#0F172A]">
                          3. Your requirements
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Cohort Size */}
                        <div>
                          <label htmlFor="inst-cohort" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Approximate student cohort size
                          </label>
                          <div className="relative">
                            <select
                              id="inst-cohort"
                              name="cohortSize"
                              value={institutionalForm.cohortSize}
                              onChange={(e) =>
                                setInstitutionalForm({ ...institutionalForm, cohortSize: e.target.value })
                              }
                              className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors cursor-pointer appearance-none truncate"
                            >
                              <option value="Under 250 students">Under 250 students</option>
                              <option value="250 - 750 students">250 - 750 students</option>
                              <option value="750 - 2,000 students">750 - 2,000 students</option>
                              <option value="2,000+ students (Campus / District-wide)">2,000+ students (Campus / District-wide)</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Primary Objective */}
                        <div>
                          <label htmlFor="inst-objective" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                            Primary partnership objective
                          </label>
                          <div className="relative">
                            <select
                              id="inst-objective"
                              name="partnershipObjective"
                              value={institutionalForm.partnershipObjective}
                              onChange={(e) =>
                                setInstitutionalForm({
                                  ...institutionalForm,
                                  partnershipObjective: e.target.value,
                                })
                              }
                              className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors cursor-pointer appearance-none truncate"
                            >
                              <option value="Campus-wide Cognitive Profiling">Campus-wide Cognitive Profiling</option>
                              <option value="Class 10 Stream Selection Calibration">Class 10 Stream Selection Calibration</option>
                              <option value="Class 12 Degree & Entrance Exam Roadmapping">Class 12 Degree &amp; Entrance Exam Roadmapping</option>
                              <option value="Faculty Career Counselor Dashboard Integration">Faculty Career Counsellor Dashboard Integration</option>
                              <option value="Custom Psychometric Research Study">Custom Psychometric Research Study</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Context & Timeline */}
                      <div>
                        <label htmlFor="inst-message" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                          Institution context &amp; preferred timeline
                        </label>
                        <textarea
                          id="inst-message"
                          name="message"
                          rows={4}
                          value={institutionalForm.message}
                          onChange={(e) =>
                            setInstitutionalForm({ ...institutionalForm, message: e.target.value })
                          }
                          placeholder="Tell us about your academic calendar, current counselling framework, or specific requirements..."
                          className="w-full p-4 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Dispatch Note and Submit Button */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>Direct priority dispatch to the Institutional Partnerships Director.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] active:bg-[#E05353] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Sending request...</span>
                          </>
                        ) : (
                          <>
                            <span>Send request</span>
                            <Send className="w-4 h-4 text-white" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            3. FREQUENTLY ASKED QUESTIONS (ACCORDION)
            - Single centered column, max-w-[800px]
            - First item open by default
            - Clean 56px touch target rows, accessible aria-expanded
            - Smooth height transitions, no exclamation marks
        ========================================================= */}
        <section id="faq" className="py-16 sm:py-24 border-t border-[#E2E8F0] px-4 sm:px-6">
          <div className="max-w-[800px] mx-auto">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#FF6B6B]">
                Common queries
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-1.5">
                Frequently asked questions
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-lg mx-auto">
                Everything you need to know about reaching us, student data privacy, and the assessment process.
              </p>
            </div>

            {/* Accordion Stack */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] overflow-hidden shadow-xs">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="transition-colors">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full min-h-[56px] py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FAFAF9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#0F172A] pr-2">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#64748B] shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#FF6B6B]" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                      className={`px-5 sm:px-6 pb-5 pt-1 text-sm text-[#475569] leading-relaxed ${
                        isOpen ? "block animate-fade-in" : "hidden"
                      }`}
                    >
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          5. MOBILE STICKY BOTTOM ACTION BAR (Viewport < 768px only)
          - Hidden when the message form is in view or when keyboard is open
          - Call directly or quick-scroll to message form
      ========================================================= */}
      {!isFormInView && !isKeyboardOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5 max-w-md mx-auto">
            <a
              href="tel:+919316819331"
              className="flex-1 h-11 px-4 rounded-xl border border-[#CBD5E1] text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 active:bg-[#F5F5F4] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Call advisory</span>
            </a>

            <button
              type="button"
              onClick={scrollToForm}
              className="flex-1 h-11 px-4 rounded-xl bg-[#FF6B6B] active:bg-[#F95858] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>Send message</span>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
