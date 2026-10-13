"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingQuickAction from "@/components/FloatingQuickAction";
import {
  submitStudentQueryAction,
  submitInstitutionalQueryAction,
  StudentQueryInput,
  InstitutionalQueryInput,
} from "@/app/actions/contact";

export default function ContactPage() {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

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
    } else {
      setErrorMessage(res.error || "Failed to submit query. Please try again.");
    }
  };

  const handleInstitutionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

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
    } else {
      setErrorMessage(res.error || "Failed to submit institutional inquiry. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-black font-sans selection:bg-[#A9B4E8] selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* HERO HEADER */}
        <section className="pt-10 sm:pt-16 pb-8 sm:pb-12 px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.15]">
              WE&apos;RE HERE TO HELP YOU NAVIGATE.
            </h1>

            <p className="text-black font-semibold text-sm sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed px-1">
              Have questions regarding student diagnostics, psychometric scores, or partnering your school or university with our diagnostic engine? Speak directly with our team.
            </p>
          </div>
        </section>

        {/* 2 DIRECT CONTACT CHANNELS */}
        <section className="px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* 1. Phone Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#CBD5E1] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4 border border-[#E0E7FE]">
                  <Phone className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-md">
                  Call Us Directly
                </span>
                <h3 className="text-lg font-black text-black mt-2">Counselor Hotline</h3>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1 leading-relaxed">
                  Direct voice support with our counseling and psychometric specialists.
                </p>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-1.5">
                  <a
                    href="tel:+917570975709"
                    className="text-base sm:text-lg font-black text-[#0F172A] hover:text-[#4F46E5] transition-colors block"
                  >
                    +91 75709 75709
                  </a>
                  <p className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Email Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#CBD5E1] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF0EE] text-[#FF6B6B] flex items-center justify-center mb-4 border border-[#FED7CC]">
                  <Mail className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6B6B] bg-[#FFF0EE] px-2.5 py-0.5 rounded-md">
                  Email Support
                </span>
                <h3 className="text-lg font-black text-black mt-2">Fast Written Response</h3>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1 leading-relaxed">
                  Average response time is under 4 business hours for all inquiries.
                </p>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase">General Inquiries:</span>
                    <a
                      href="mailto:support@alderwoodvantage.com"
                      className="text-xs sm:text-sm font-black text-[#0F172A] hover:text-[#FF6B6B] transition-colors block"
                    >
                      support@alderwoodvantage.com
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase">Institutional Desk:</span>
                    <a
                      href="mailto:partnerships@alderwoodvantage.com"
                      className="text-xs sm:text-sm font-black text-[#0F172A] hover:text-[#FF6B6B] transition-colors block"
                    >
                      partnerships@alderwoodvantage.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE FORM SECTION WITH DUAL TABS */}
        <section className="px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto mb-16 sm:mb-24">
          <div className="bg-white rounded-3xl border border-[#CBD5E1] shadow-sm p-6 sm:p-10 lg:p-12">
            {/* Header & Tab Selector */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1.5">
                Choose the nature of your request to connect with the right department.
              </p>

              {/* Dual Tab Buttons */}
              <div className="mt-6 inline-flex p-1.5 bg-[#F1F3F5] rounded-2xl border border-[#D1D5DB] w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("student");
                    setSubmissionSuccess(null);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeTab === "student"
                      ? "bg-white text-black shadow-xs border border-[#CBD5E1]"
                      : "text-[#64748B] hover:text-black"
                  }`}
                >
                  <User className="w-4 h-4 text-[#FF6B6B]" />
                  <span>Student &amp; Parent Query</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("institutional");
                    setSubmissionSuccess(null);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeTab === "institutional"
                      ? "bg-white text-black shadow-xs border border-[#CBD5E1]"
                      : "text-[#64748B] hover:text-black"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#4F46E5]" />
                  <span>Institutional &amp; School Partnership</span>
                </button>
              </div>
            </div>

            {/* SUCCESS BANNER */}
            {submissionSuccess && (
              <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-emerald-300 text-center mb-8 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-emerald-950">Inquiry Received Successfully!</h3>
                <p className="text-xs sm:text-sm text-emerald-800 font-medium mt-1 max-w-xl mx-auto">
                  {submissionSuccess.message}
                </p>
                <div className="mt-3 inline-block bg-white px-3.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-mono font-bold text-emerald-900">
                  Reference ID: {submissionSuccess.referenceId}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSubmissionSuccess(null)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs sm:text-sm text-red-700 font-semibold mb-6">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: STUDENT & PARENT FORM */}
            {!submissionSuccess && activeTab === "student" && (
              <form onSubmit={handleStudentSubmit} className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Your Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="e.g. ananya@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Grade / Educational Stage
                    </label>
                    <select
                      value={studentForm.stage}
                      onChange={(e) => setStudentForm({ ...studentForm, stage: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="Class 8 - 10 (Stream Selection)">Class 8 - 10 (Stream Selection)</option>
                      <option value="Class 11 & 12 (Degrees)">Class 11 &amp; 12 (Degree &amp; Entrance Prep)</option>
                      <option value="College & Early Graduate">College &amp; Early Graduate</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Independent Career Counselor">Independent Career Counselor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Query Subject
                  </label>
                  <select
                    value={studentForm.subject}
                    onChange={(e) => setStudentForm({ ...studentForm, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="Assessment Report Clarification">Assessment Report Clarification</option>
                    <option value="Psychometric Scores & Archetype Question">Psychometric Scores &amp; Archetype Question</option>
                    <option value="Parent vs Student Decoder Discussion">Parent vs Student Decoder Discussion</option>
                    <option value="Technical or Account Assistance">Technical or Account Assistance</option>
                    <option value="General Guidance Inquiry">General Guidance Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Your Message / Question <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={studentForm.message}
                    onChange={(e) => setStudentForm({ ...studentForm, message: e.target.value })}
                    placeholder="Tell us what you would like to know or how we can assist your career discovery journey..."
                    className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your details are 100% confidential. Zero spam policy.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Sending Query...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span>Send Query</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: INSTITUTIONAL & SCHOOL PARTNERSHIP FORM */}
            {!submissionSuccess && activeTab === "institutional" && (
              <form onSubmit={handleInstitutionalSubmit} className="space-y-5 animate-fade-in">
                <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FE] mb-2 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#3730A3] font-medium leading-relaxed">
                    Alderwood Vantage partners with progressive schools, junior colleges, and universities across India to administer school-wide cognitive calibrations, stream advisory diagnostics, and counselor management dashboards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Institution / School Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionalForm.institutionName}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, institutionName: e.target.value })
                      }
                      placeholder="e.g. Delhi Public School / National Public School"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Institution Type
                    </label>
                    <select
                      value={institutionalForm.institutionType}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, institutionType: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="K-12 Senior Secondary School">K-12 Senior Secondary School (CBSE / ICSE / IB / Cambridge)</option>
                      <option value="Junior College / PU Board">Junior College / Pre-University (PU) College</option>
                      <option value="Degree College / University">Degree College / University Campus</option>
                      <option value="Ed-Tech / Coaching Institution">Ed-Tech / Coaching Academy</option>
                      <option value="State / District Education Authority">State / District Education Authority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Representative Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionalForm.representativeName}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, representativeName: e.target.value })
                      }
                      placeholder="e.g. Dr. Rajesh Verma"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Official Designation <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionalForm.designation}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, designation: e.target.value })
                      }
                      placeholder="e.g. Principal / Head of Career Counseling / Director"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Official Work Email <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={institutionalForm.workEmail}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, workEmail: e.target.value })
                      }
                      placeholder="e.g. principal@dps-school.org"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Official Phone / Mobile <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={institutionalForm.phone}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, phone: e.target.value })
                      }
                      placeholder="e.g. +91 98765 12345"
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Approximate Student Cohort Size
                    </label>
                    <select
                      value={institutionalForm.cohortSize}
                      onChange={(e) =>
                        setInstitutionalForm({ ...institutionalForm, cohortSize: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="Under 250 students">Under 250 students</option>
                      <option value="250 - 750 students">250 - 750 students</option>
                      <option value="750 - 2,000 students">750 - 2,000 students</option>
                      <option value="2,000+ students (Campus / District-wide)">2,000+ students (Campus / District-wide)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Primary Partnership Objective
                    </label>
                    <select
                      value={institutionalForm.partnershipObjective}
                      onChange={(e) =>
                        setInstitutionalForm({
                          ...institutionalForm,
                          partnershipObjective: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="Campus-wide Cognitive Profiling">Campus-wide Cognitive Profiling</option>
                      <option value="Class 10 Stream Selection Calibration">Class 10 Stream Selection Calibration</option>
                      <option value="Class 12 Degree & Entrance Exam Roadmapping">Class 12 Degree &amp; Entrance Exam Roadmapping</option>
                      <option value="Faculty Career Counselor Dashboard Integration">Faculty Career Counselor Dashboard Integration</option>
                      <option value="Custom Psychometric Research Study">Custom Psychometric Research Study</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Institution Context &amp; Preferred Timeline
                  </label>
                  <textarea
                    rows={4}
                    value={institutionalForm.message}
                    onChange={(e) =>
                      setInstitutionalForm({ ...institutionalForm, message: e.target.value })
                    }
                    placeholder="Tell us about your academic calendar, current counseling framework, or any specific requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-[#FBFBF9] text-black text-sm focus:outline-none focus:border-[#0F172A] focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                    <Building2 className="w-4 h-4 text-[#4F46E5]" />
                    <span>Direct priority dispatch to the Institutional Partnerships Director.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F172A] hover:bg-black text-white font-extrabold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span>Submit Institutional Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* QUICK FAQ / IMMEDIATE ASSISTANCE */}
        <section className="py-12 sm:py-16 bg-[#F1F3F5] border-t border-[#D1D5DB] px-3.5 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Frequently Asked Inquiries
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-xs">
                <div className="flex items-center gap-2 font-black text-black text-sm sm:text-base">
                  <HelpCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                  <h4>How long does it take to complete the assessment?</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2 leading-relaxed">
                  The complete 4-module evaluation takes approximately 20 to 25 minutes. It is completely self-paced and can be paused and resumed at any time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-xs">
                <div className="flex items-center gap-2 font-black text-black text-sm sm:text-base">
                  <HelpCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                  <h4>Can schools integrate Alderwood Vantage into their counseling cell?</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2 leading-relaxed">
                  Yes! We provide school principals and counselors with a centralized analytics portal to track student cohorts, stream fitment distributions, and individual diagnostic summaries.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-xs">
                <div className="flex items-center gap-2 font-black text-black text-sm sm:text-base">
                  <HelpCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                  <h4>Is student test data kept private?</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2 leading-relaxed">
                  Strictly yes. We have a zero-spam charter: student scores, contact numbers, and parent details are never shared or sold to commercial tuition or coaching institutions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-xs">
                <div className="flex items-center gap-2 font-black text-black text-sm sm:text-base">
                  <HelpCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                  <h4>Do parents get their own analysis report?</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2 leading-relaxed">
                  Yes, through the Parent vs Student Decoder, parents can review an aligned breakdown of traditional career expectations versus modern high-growth realities.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingQuickAction />
    </div>
  );
}
