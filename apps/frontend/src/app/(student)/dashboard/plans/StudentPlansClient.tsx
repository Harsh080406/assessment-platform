"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Star,
  ArrowRight,
  FileText,
  ExternalLink,
  ShieldCheck,
  Compass,
  Calendar,
  Clock,
  Layers,
  X,
  Send,
  HelpCircle,
  PlusCircle,
  Info,
} from "lucide-react";
import StudentPageHeader from "@/components/student/StudentPageHeader";

interface StudentPlansClientProps {
  firstName: string;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  studentSchool?: string | null;
  hasStartedAssessment: boolean;
  hasCompletedAssessment: boolean;
}

export default function StudentPlansClient({
  firstName,
  studentName,
  studentEmail,
  studentGrade,
  studentSchool,
  hasStartedAssessment,
  hasCompletedAssessment,
}: StudentPlansClientProps) {
  const [selectedPlanForInquiry, setSelectedPlanForInquiry] = useState<string | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [mobileTableView, setMobileTableView] = useState<"all" | "discover" | "decode" | "design">("all");

  const packages = [
    {
      id: "discover",
      packageNumber: "PACKAGE 1",
      name: "Discover",
      subtitle: "Know yourself",
      badge: "Insight Report",
      price: "₹6,000",
      priceLabel: "Report only",
      popular: false,
      currentTier: true,
      tagline:
        "Students and families who want a clear scientific evidence-based written picture and will discuss it at home or with the school.",
      includedHeading: "Assessment + Personalised Report (15–17 pages)",
      features: [
        "Online assessment covering personality, interests, work values, 16 skills and reasoning",
        "Personalised Career Vantage Report (about 15–17 pages) with charts and plain-language explanations",
        "Page 3 \"Suitable for\" summary: academic and career direction",
        "Top three career directions with match strength, routes, and ways to try them",
        "Development plan with measurable next steps",
        "Delivered as a PDF within 7–10 working days of the assessment",
      ],
      bestFor: "Students who just want to understand themselves better and explore natural strengths.",
      buttonLabel: hasCompletedAssessment
        ? "View Your Blueprint Report"
        : hasStartedAssessment
        ? "Continue Assessment Modules"
        : "Start Assessment Modules",
      buttonHref: hasCompletedAssessment ? "/dashboard/results" : "/dashboard/assessments",
      buttonVariant: "outline",
    },
    {
      id: "decode",
      packageNumber: "PACKAGE 2",
      name: "Decode",
      subtitle: "Understand it, then plan",
      badge: "Insight + Guidance",
      price: "₹10,500",
      priceLabel: "Report + 2 counselling sessions",
      popular: true,
      currentTier: false,
      tagline:
        "Students choosing subjects or streams, or families who want a counsellor to explain and guide.",
      includedHeading: "Everything in Package 1 + 2 Counselling Sessions",
      features: [
        "Everything included in Package 1 (Discover)",
        "Session 1: Walkthrough with the student (parent or guardian welcome), 45–60 minutes",
        "Session 2: Result walkthrough with student career and subject exploration, shortlist, and a 90-day action plan, 45–60 minutes",
        "One-page written action plan after Session 2",
        "Sessions online or in person; use within 90 days",
      ],
      bestFor: "Subject or stream choices coming up, or families wanting help talking through results.",
      buttonLabel: "Inquire About Decode",
      buttonVariant: "primary",
    },
    {
      id: "design",
      packageNumber: "PACKAGE 3",
      name: "Design",
      subtitle: "A five-year plan to follow",
      badge: "Premier Pathway",
      price: "₹19,500",
      priceLabel: "Report + 5-Year Plan + 3 counselling sessions",
      popular: false,
      currentTier: false,
      tagline:
        "Families planning ahead, or students weighing family business, study abroad, or a niche career.",
      includedHeading: "Everything in Package 2 + 5-Year Plan + 3 Sessions",
      features: [
        "Everything included in Package 2 (Decode)",
        "5-Year Career & Education Map (about 10 pages)",
        "Pathway fit: employment, family business, new venture, or a hybrid",
        "Year-by-year roadmap with a capstone project and milestone for each year",
        "Skills roadmap, mentor map, and four decision gates",
        "Session 3: Map walkthrough and first-year milestones, 45–60 minutes (can be used as a 3-month check-in)",
        "Short extra questionnaire on family situation and preferences; sessions valid for 6 months",
      ],
      bestFor: "Longer-term plan, family business succession, new venture, or an unusual career.",
      buttonLabel: "Inquire About Design",
      buttonVariant: "dark",
    },
  ];

  const comparisonRows = [
    {
      feature: "Online assessment (personality, interests, work values, 16 skills, reasoning)",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Personalised Career Vantage Report with charts (about 15–17 pages)",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "“Suitable for” summary: academic and career direction",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Top three career directions with routes and ways to try them",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Development plan with measurable steps",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Counselling sessions (45–60 minutes each)",
      discover: false,
      decode: "2 Sessions",
      design: "3 Sessions",
    },
    {
      feature: "Parent or guardian welcome in Session 1",
      discover: false,
      decode: true,
      design: true,
    },
    {
      feature: "Written action plan after the sessions",
      discover: false,
      decode: "Yes (1-Page)",
      design: "Yes (1-Page)",
    },
    {
      feature: "5-Year Career & Education Map",
      discover: false,
      decode: false,
      design: "Yes (~10 pages)",
    },
    {
      feature: "Pathway fit: employment, family business, venture, hybrid",
      discover: false,
      decode: false,
      design: true,
    },
    {
      feature: "Skills roadmap, mentor map, yearly milestones and projects",
      discover: false,
      decode: false,
      design: true,
    },
    {
      feature: "Sessions valid for",
      discover: false,
      decode: "90 days",
      design: "6 months",
    },
    {
      feature: "Price [Exclusive of GST]",
      discover: "₹6,000",
      decode: "₹10,500",
      design: "₹19,500",
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setSelectedPlanForInquiry(null);
      setInquirySubmitted(false);
      setInquiryNotes("");
    }, 2800);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in pb-24 sm:pb-16">
      {/* 1. Header */}
      <StudentPageHeader
        title="Career Vantage Packages"
        description="Personalised career and education guidance for students, built on a scientific-style assessment and a detailed written report. Every package starts with the same online assessment and personalised report."
        backHref="/dashboard"
        backLabel="Dashboard"
        action={{
          label: "View Assessment Modules",
          href: "/dashboard/assessments",
          icon: <Layers className="w-4 h-4" />,
        }}
      />

      {/* 2. The Three Packages Grid */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B]">
            Transparent Pricing in INR [Excl. GST]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mt-1">
            Choose a Plan Type
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
            The difference is how much support you get to turn the report into decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                pkg.popular
                  ? "bg-[#0F172A] text-white shadow-xl border-2 border-indigo-500/40 ring-4 ring-indigo-500/10 lg:-translate-y-1.5"
                  : "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#CBD5E1]"
              }`}
            >
              {/* Popular / Recommended Pill */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF6B6B] text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-white/20">
                  <Star className="w-3 h-3 fill-white" />
                  <span>Most Recommended</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      pkg.popular
                        ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800"
                        : "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                    }`}
                  >
                    {pkg.packageNumber} • {pkg.badge}
                  </span>
                  {pkg.currentTier && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Current Included
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black tracking-tight mb-0.5">
                  {pkg.name}
                </h3>
                <p
                  className={`text-xs font-semibold mb-3 ${
                    pkg.popular ? "text-indigo-300" : "text-[#FF6B6B]"
                  }`}
                >
                  {pkg.subtitle}
                </p>

                {/* Price Tag */}
                <div className="my-3 pb-3 border-b border-current/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight">
                      {pkg.price}
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        pkg.popular ? "text-slate-400" : "text-[#64748B]"
                      }`}
                    >
                      [Excl. GST]
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold block mt-0.5 ${
                      pkg.popular ? "text-indigo-200" : "text-[#0F172A]"
                    }`}
                  >
                    {pkg.priceLabel}
                  </span>
                </div>

                {/* Highlight Box */}
                <div
                  className={`p-3.5 rounded-xl mb-4 border text-xs ${
                    pkg.popular
                      ? "bg-slate-800/80 border-slate-700 text-white"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                      pkg.popular ? "text-indigo-300" : "text-[#64748B]"
                    }`}
                  >
                    What you get:
                  </span>
                  <span className="font-extrabold leading-snug block">
                    {pkg.includedHeading}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-5">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          pkg.popular ? "text-[#FF6B6B]" : "text-emerald-600"
                        }`}
                      />
                      <span
                        className={`leading-relaxed ${
                          pkg.popular ? "text-[#CBD5E1]" : "text-[#334155]"
                        }`}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Best For Box */}
                <div
                  className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    pkg.popular
                      ? "bg-slate-900/60 border-slate-700 text-slate-300"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
                  }`}
                >
                  <span
                    className={`font-bold block mb-0.5 ${
                      pkg.popular ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    Best for:
                  </span>
                  {pkg.tagline}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {pkg.buttonHref ? (
                  <Link
                    href={pkg.buttonHref}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                      pkg.popular
                        ? "bg-[#FF6B6B] hover:bg-[#F95858] text-white"
                        : "bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span>{pkg.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForInquiry(pkg.name)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                      pkg.popular
                        ? "bg-[#FF6B6B] hover:bg-[#F95858] text-white shadow-md"
                        : "bg-[#0F172A] hover:bg-black text-white"
                    }`}
                  >
                    <span>{pkg.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Not Sure Which Package Callout + Junior Edition Note */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F0] border border-[#FED7CC] flex items-start gap-3 text-xs text-[#0F172A]">
            <HelpCircle className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#0F172A] block text-sm">
                Not sure which package?
              </span>
              <p className="text-[#475569] leading-relaxed">
                <strong className="text-[#0F172A]">Package 1</strong> suits a student who just wants to understand themselves better. Choose <strong className="text-[#0F172A]">Package 2</strong> if subject or stream choices are coming up, or you would like help talking it through. Choose <strong className="text-[#0F172A]">Package 3</strong> if you want a longer-term plan, or are weighing family business, a new venture, or an unusual career.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 flex items-start gap-3 text-xs text-[#0F172A]">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#0F172A] block text-sm">
                Class 8–9 Students (Junior Edition)
              </span>
              <p className="text-[#475569] leading-relaxed">
                Class 8–9 students receive the <strong className="text-[#0F172A]">Junior Edition</strong> of the report, written in age-appropriate language with a parents&apos; guide. For this age group, the 5-Year Map in Package 3 covers Classes 9 to 12 and subject choices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Optional Add-ons */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF2EE] text-[#FF6B6B] flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] bg-[#FFF2EE] px-2 py-0.5 rounded">
                Optional Add-on
              </span>
            </div>
            <h4 className="text-base font-bold text-[#0F172A] mt-1">
              Additional Counselling Session
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              A further 45–60 minute session with certified practitioners, online or in person.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
          <div className="text-right">
            <div className="text-xl font-black text-[#0F172A]">₹2,500</div>
            <div className="text-[10px] text-[#64748B]">per session [Excl. GST]</div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPlanForInquiry("Additional Counselling Session Add-on")}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Inquire Add-on
          </button>
        </div>
      </div>

      {/* 4. How It Works (4 Steps) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
            Simple 4-Step Process
          </span>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            How It Works
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            From initial registration to report delivery and practitioner walkthroughs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h5 className="text-sm font-bold text-[#0F172A]">Register</h5>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Choose a package. For students under 18, a parent or guardian gives consent.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h5 className="text-sm font-bold text-[#0F172A]">Take the Assessment</h5>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Online, 60–90 minutes, at home or at a scheduled convenient time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h5 className="text-sm font-bold text-[#0F172A]">Receive Your Report</h5>
            <p className="text-xs text-[#64748B] leading-relaxed">
              A personalised PDF delivered within 7–10 working days of assessment completion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
              4
            </div>
            <h5 className="text-sm font-bold text-[#0F172A]">Talk It Through</h5>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your sessions (Packages 2 and 3) and, in Package 3, your 5-year career &amp; education map.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Sample Deliverables Preview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
              Tangible Outcomes
            </span>
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Sample Deliverables Preview
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Download certified redacted samples to review the depth, rigor, and visual elegance of your final deliverables.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[#475569] text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Certified Alderwood Standard</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card A: Leadership Blueprint */}
          <div className="border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#CBD5E1] transition-all bg-[#FAFAFA]/50 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Discover • Decode • Design
                </span>
                <span className="inline-flex text-xs text-[#64748B] font-semibold items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>About 15–17 Pages</span>
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">
                  Career Vantage Report
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Comprehensive multidimensional report (about 15–17 pages) with charts and plain-language explanations covering personality, interests, work values, 16 skills, and reasoning. Includes page 3 &quot;Suitable for&quot; summary and top 3 career directions.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <a
                href="/docs/Career%20Vantage%20Sample%20Report%20-Fashion%20Lawyer.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#FF6B6B]" />
                <span>View Sample Career Vantage Report (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Card B: 5-Year Career Map */}
          <div className="border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#CBD5E1] transition-all bg-[#FAFAFA]/50 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                  Design Tier Exclusive
                </span>
                <span className="inline-flex text-xs text-[#64748B] font-semibold items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>About 10 Pages</span>
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">
                  5-Year Career &amp; Education Map
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Annualized execution roadmap (about 10 pages) with pathway fit (employment, family business, venture, hybrid), year-by-year capstone project and milestones, skills roadmap, mentor map, and four decision gates.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <a
                href="/docs/5%20Year%20Career%20Map%20Sample.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>View Sample 5-Year Career Map (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Side-by-Side Detailed Comparison Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
              Compare the Packages
            </span>
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Package Comparison Matrix
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              A quick view of what is in each package. Prices in INR [Exclusive of GST].
            </p>
          </div>

          {/* Desktop Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[#475569]">
            <span>3 Tiers Side-by-Side</span>
          </div>
        </div>

        {/* Mobile Segmented Tab Filter */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] px-0.5">
            <span className="font-semibold">Select tier view:</span>
            <span className="text-[10px] text-slate-400">Tap to filter or compare</span>
          </div>
          <div className="grid grid-cols-4 p-1 bg-[#F1F5F9] rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMobileTableView("all")}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                mobileTableView === "all"
                  ? "bg-white text-[#0F172A] shadow-xs font-black"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              All Tiers
            </button>
            <button
              type="button"
              onClick={() => setMobileTableView("discover")}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                mobileTableView === "discover"
                  ? "bg-white text-emerald-700 shadow-xs font-black"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Discover
            </button>
            <button
              type="button"
              onClick={() => setMobileTableView("decode")}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                mobileTableView === "decode"
                  ? "bg-white text-indigo-700 shadow-xs font-black"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Decode
            </button>
            <button
              type="button"
              onClick={() => setMobileTableView("design")}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                mobileTableView === "design"
                  ? "bg-white text-[#FF6B6B] shadow-xs font-black"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Design
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#64748B]">
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 w-[38%] min-w-[125px] sm:min-w-[210px] sticky left-0 bg-white z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  Feature / Deliverable
                </th>
                <th
                  className={`py-2.5 sm:py-3 px-1.5 sm:px-3 text-center min-w-[68px] sm:min-w-[105px] text-[10px] sm:text-[11px] font-bold text-[#0F172A] ${
                    mobileTableView === "all" || mobileTableView === "discover"
                      ? "table-cell"
                      : "hidden sm:table-cell"
                  }`}
                >
                  <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase">Pkg 1</span>
                  <span className="block text-xs sm:text-sm font-black text-[#0F172A]">Discover</span>
                  <span className="block text-[10px] sm:text-xs font-bold text-emerald-700 mt-0.5">₹6,000</span>
                </th>
                <th
                  className={`py-2.5 sm:py-3 px-1.5 sm:px-3 text-center bg-indigo-50/70 rounded-t-lg text-indigo-950 min-w-[74px] sm:min-w-[130px] font-bold text-[10px] sm:text-[11px] ${
                    mobileTableView === "all" || mobileTableView === "decode"
                      ? "table-cell"
                      : "hidden sm:table-cell"
                  }`}
                >
                  <span className="block text-[9px] sm:text-[10px] font-semibold text-indigo-600 uppercase">Pkg 2</span>
                  <span className="block text-xs sm:text-sm font-black text-indigo-950">Decode</span>
                  <span className="block text-[10px] sm:text-xs font-bold text-indigo-700 mt-0.5">₹10,500</span>
                </th>
                <th
                  className={`py-2.5 sm:py-3 px-1.5 sm:px-3 text-center min-w-[74px] sm:min-w-[130px] font-bold text-[#0F172A] text-[10px] sm:text-[11px] ${
                    mobileTableView === "all" || mobileTableView === "design"
                      ? "table-cell"
                      : "hidden sm:table-cell"
                  }`}
                >
                  <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase">Pkg 3</span>
                  <span className="block text-xs sm:text-sm font-black text-[#0F172A]">Design</span>
                  <span className="block text-[10px] sm:text-xs font-bold text-[#FF6B6B] mt-0.5">₹19,500</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]/80 transition-colors group">
                  <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 font-medium text-[#1E293B] text-[11px] sm:text-xs leading-snug sticky left-0 bg-white group-hover:bg-[#F8FAFC] transition-colors z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                    {row.feature}
                  </td>
                  <td
                    className={`py-2.5 sm:py-3.5 px-1 sm:px-3 text-center text-[11px] sm:text-xs ${
                      mobileTableView === "all" || mobileTableView === "discover"
                        ? "table-cell"
                        : "hidden sm:table-cell"
                    }`}
                  >
                    {typeof row.discover === "boolean" ? (
                      row.discover ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-bold text-[#0F172A]">{row.discover}</span>
                    )}
                  </td>
                  <td
                    className={`py-2.5 sm:py-3.5 px-1 sm:px-3 text-center bg-indigo-50/30 font-semibold text-indigo-950 text-[11px] sm:text-xs ${
                      mobileTableView === "all" || mobileTableView === "decode"
                        ? "table-cell"
                        : "hidden sm:table-cell"
                    }`}
                  >
                    {typeof row.decode === "boolean" ? (
                      row.decode ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-bold text-indigo-950">{row.decode}</span>
                    )}
                  </td>
                  <td
                    className={`py-2.5 sm:py-3.5 px-1 sm:px-3 text-center text-[11px] sm:text-xs ${
                      mobileTableView === "all" || mobileTableView === "design"
                        ? "table-cell"
                        : "hidden sm:table-cell"
                    }`}
                  >
                    {typeof row.design === "boolean" ? (
                      row.design ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-bold text-[#0F172A]">{row.design}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Good to Know Notice */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 sm:p-7 text-xs text-[#475569] space-y-3">
        <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#FF6B6B]" />
          <span>Good to know</span>
        </h4>
        <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[#475569]">
          <li>Prices are in Indian rupees [Exclusive of GST].</li>
          <li>Reports are delivered within 7–10 working days of the completed assessment. Sessions are booked at times that suit the family and are valid for the period shown above (90 days for Decode, 6 months for Design).</li>
          <li>Please give 24 hours&apos; notice to reschedule a session.</li>
          <li>Information about students is kept strictly confidential and used only for career guidance. For students under 18, a parent or guardian&apos;s consent is required.</li>
          <li>The assessment and report describe interests, skills and preferences at one point in time. They are a guide for exploring careers, not a diagnosis, an intelligence test, or a guarantee of any outcome, and are best read with school records and real-world experience.</li>
        </ul>
      </div>

      {/* 8. Interactive Inquiry / Upgrade Modal */}
      {selectedPlanForInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden p-6 sm:p-7 text-[#0F172A]">
            <button
              onClick={() => setSelectedPlanForInquiry(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySubmitted ? (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[#0F172A]">
                  Inquiry Received!
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Thank you, <span className="font-bold text-[#0F172A]">{firstName}</span>. Our senior admissions &amp; counselling coordinator will review your profile and connect via email within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6B6B] text-[10px] font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Career Vantage Inquiry</span>
                  </div>
                  <h4 className="text-xl font-bold text-[#0F172A] tracking-tight">
                    Inquire About {selectedPlanForInquiry}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Request scheduling availability, package details, or institutional coordination.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#1E2538] mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={studentName}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-gray-50 text-[#0F172A] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E2538] mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={studentEmail}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-gray-50 text-[#0F172A] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E2538] mb-1">
                      Preferred Timing / Specific Questions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      placeholder="e.g. Interested in Class 11 stream selection debrief on weekends..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/15 transition-all text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
