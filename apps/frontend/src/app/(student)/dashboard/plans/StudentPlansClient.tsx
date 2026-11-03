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

  const packages = [
    {
      id: "discover",
      name: "Discover",
      subtitle: "Diagnostic Foundation",
      tagline: "Uncover core strengths, innate cognitive horsepower, and behavioral archetypes.",
      popular: false,
      badge: "Core Evaluation",
      includedHeading: "Assessment + Leadership Blueprint",
      currentTier: true,
      features: [
        "Full 4-Module Assessment (Spark, Wiring, Horsepower, Edge)",
        "126 academically validated psychometric & behavioral questions",
        "Certified 24-page Executive Leadership Blueprint deliverable",
        "Leader's Lens behavioral archetype analysis",
        "Pathway Fit analysis (Startup Founder, Family Business, Corporate Executive, Hybrid)",
        "Gap-to-Ready Competency Radar diagnostics",
      ],
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
      name: "Decode",
      subtitle: "Assessment + 1-on-1 Guidance",
      tagline: "Deep debrief with certified executive leadership psychologists.",
      popular: true,
      badge: "Most Recommended",
      includedHeading: "Assessment + Blueprint + 2 Counselling Debriefs",
      currentTier: false,
      features: [
        "Everything included in the Discover Package",
        "2 confidential 1-on-1 video counselling sessions (60 mins each)",
        "In-depth debrief with certified senior practitioners (DDI Master Facilitators & IIM Calcutta alumni)",
        "Parent-inclusive clarity & alignment discussion",
        "Stream, undergraduate major, and entrance exam priority matrix",
        "Identification of cognitive blindspots and leadership frontiers",
      ],
      buttonLabel: "Inquire About Decode",
      buttonVariant: "primary",
    },
    {
      id: "design",
      name: "Design",
      subtitle: "Comprehensive 5-Year Plan",
      tagline: "Personalized 5-year strategic execution roadmap from school to career.",
      popular: false,
      badge: "Full Mentorship Roadmap",
      includedHeading: "Assessment + Blueprint + Counselling + 5-Year Roadmap",
      currentTier: false,
      features: [
        "Everything included in the Decode Package",
        "Personalized 5-Year Actionable Leadership Roadmap",
        "Year-by-year academic & career milestone planning",
        "Curated real-world projects, portfolio building, and hackathon guidance",
        "Executive mentorship & industry network recommendations",
        "Periodic follow-up check-ins and trajectory calibrations",
      ],
      buttonLabel: "Inquire About Design",
      buttonVariant: "dark",
    },
  ];

  const comparisonRows = [
    {
      feature: "4 Assessment Modules (Spark, Wiring, Horsepower, Edge)",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "24-Page Certified Leadership Blueprint Deliverable",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Cognitive Capability & Behavioral Archetype Breakdown",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "1-on-1 Video Debrief Sessions with Senior Practitioners",
      discover: false,
      decode: "2 Sessions (60m each)",
      design: "2 Sessions (60m each)",
    },
    {
      feature: "Parent-Inclusive Strategic Alignment Debrief",
      discover: false,
      decode: true,
      design: true,
    },
    {
      feature: "Academic Major & College Entrance Strategy Mapping",
      discover: false,
      decode: true,
      design: true,
    },
    {
      feature: "Personalized 5-Year Actionable Career & Leadership Roadmap",
      discover: false,
      decode: false,
      design: true,
    },
    {
      feature: "Annual Milestone Tracking & Portfolio Building Blueprint",
      discover: false,
      decode: false,
      design: true,
    },
    {
      feature: "Follow-up Advisory Check-in Support",
      discover: false,
      decode: "30 Days Email",
      design: "Quarterly Milestones",
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
        title="Choose a Plan Type"
        description="Select the evaluation tier, 1-on-1 leadership debrief, and strategic 5-year career roadmap suited for your trajectory."
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
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B]">
            Mentorship &amp; Roadmaps
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mt-1">
            Choose a Plan Type
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
            From cognitive self-discovery to deep expert counselling and comprehensive multi-year career roadmapping.
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
                    {pkg.badge}
                  </span>
                  {pkg.currentTier && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Current Included
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black tracking-tight mb-1">
                  {pkg.name}
                </h3>
                <p
                  className={`text-xs font-semibold mb-3 ${
                    pkg.popular ? "text-indigo-300" : "text-[#FF6B6B]"
                  }`}
                >
                  {pkg.subtitle}
                </p>

                <p
                  className={`text-xs leading-relaxed mb-6 ${
                    pkg.popular ? "text-[#94A3B8]" : "text-[#64748B]"
                  }`}
                >
                  {pkg.tagline}
                </p>

                {/* Highlight Box */}
                <div
                  className={`p-3.5 rounded-xl mb-6 border text-xs ${
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
                    What&apos;s Included:
                  </span>
                  <span className="font-extrabold leading-snug block">
                    {pkg.includedHeading}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      pkg.popular ? "text-[#94A3B8]" : "text-[#64748B]"
                    }`}
                  >
                    Key Deliverables:
                  </span>
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
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
              </div>

              {/* Action Button */}
              <div className="pt-8">
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
      </div>

      {/* 3. Sample Deliverables Preview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
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
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Included in Discover, Decode &amp; Design
                </span>
                <span className="text-xs text-[#64748B] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>24 Pages</span>
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">
                  Alderwood Leadership Blueprint
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Comprehensive multidimensional psychometric evaluation report detailing cognitive horsepower, behavioral wiring, intrinsic spark, and competitive execution edge.
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
                <span>View Sample Leadership Blueprint (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Card B: 5-Year Career Roadmap */}
          <div className="border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#CBD5E1] transition-all bg-[#FAFAFA]/50 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  Exclusive to Design Package
                </span>
                <span className="text-xs text-[#64748B] font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>5-Year Horizon</span>
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">
                  5-Year Actionable Milestone Roadmap
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Annualized execution roadmap mapping semester goals, high-impact internships, college admissions target bands, and executive mentorship interventions.
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
                <span>View Sample 5-Year Roadmap (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Detailed Comparison Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
              Deep Dive
            </span>
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Package Comparison Matrix
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Compare features across diagnostic, guidance, and strategic roadmapping tiers.
            </p>
          </div>
          <div className="sm:hidden self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-[#64748B] border border-slate-200">
            <span>← Scroll to compare tiers →</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="min-w-[580px] w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider font-bold text-[#64748B]">
                <th className="py-3 px-4 w-[42%] min-w-[210px] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                  Capability / Deliverable
                </th>
                <th className="py-3 px-3 text-center min-w-[105px]">
                  Discover
                </th>
                <th className="py-3 px-3 text-center bg-indigo-50/60 rounded-t-lg text-indigo-900 min-w-[130px] font-bold">
                  Decode
                </th>
                <th className="py-3 px-3 text-center min-w-[130px] font-bold">
                  Design
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]/80 transition-colors group">
                  <td className="py-3.5 px-4 font-medium text-[#1E293B] sticky left-0 bg-white group-hover:bg-[#F8FAFC] transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {typeof row.discover === "boolean" ? (
                      row.discover ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-semibold text-[#0F172A]">{row.discover}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center bg-indigo-50/30 font-semibold text-indigo-950">
                    {typeof row.decode === "boolean" ? (
                      row.decode ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-semibold text-indigo-950">{row.decode}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {typeof row.design === "boolean" ? (
                      row.design ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-semibold text-[#0F172A]">{row.design}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Interactive Inquiry / Upgrade Modal */}
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
                    <span>Mentorship Upgrade Request</span>
                  </div>
                  <h4 className="text-xl font-bold text-[#0F172A] tracking-tight">
                    Inquire About {selectedPlanForInquiry}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Request counselling availability, package pricing, or institutional sponsorship for your evaluation dossier.
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
