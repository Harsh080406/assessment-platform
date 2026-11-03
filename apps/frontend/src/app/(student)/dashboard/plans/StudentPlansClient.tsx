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
  Users,
  Compass,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  HelpCircle,
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
      feature: "4-Module Evaluation Suite (Spark, Wiring, Horsepower, Edge)",
      discover: "Full Access",
      decode: "Full Access",
      design: "Full Access",
    },
    {
      feature: "24-Page Certified Leadership Blueprint Deliverable",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Leader's Lens Cognitive Archetype Classification",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "Multi-Pathway Fitment (Startup, Family Enterprise, Corporate)",
      discover: true,
      decode: true,
      design: true,
    },
    {
      feature: "1-on-1 Confidential Video Counselling Sessions",
      discover: "None",
      decode: "2 Sessions (60m each)",
      design: "Ongoing Mentorship",
    },
    {
      feature: "Parent-Student Alignment & Debrief Call",
      discover: false,
      decode: true,
      design: true,
    },
    {
      feature: "Stream Selection & Undergraduate Degree Targeting",
      discover: "Report only",
      decode: "Practitioner Debrief",
      design: "Practitioner Debrief",
    },
    {
      feature: "Personalized 5-Year Leadership Milestone Roadmap",
      discover: false,
      decode: false,
      design: true,
    },
    {
      feature: "Real-World Projects & Portfolio Building Recommendations",
      discover: false,
      decode: false,
      design: true,
    },
    {
      feature: "Periodic Trajectory Calibration & Review Check-ins",
      discover: false,
      decode: false,
      design: true,
    },
  ];

  const faqs = [
    {
      q: "Can I take the assessment first and upgrade to Decode or Design later?",
      a: "Yes, absolutely! All registered students have access to the full 4-module evaluation under the Discover tier. You can take your time completing the assessment now, and request the Decode 1-on-1 debrief or Design 5-Year Roadmap whenever your family is ready to review results.",
    },
    {
      q: "Who conducts the 1-on-1 counselling debriefs in Decode?",
      a: "Every session is conducted by certified corporate leadership practitioners (DDI Master Facilitators and EPSHRM alumni from IIM Calcutta). We do not use automated bots or junior telecallers; your debrief is conducted by seasoned talent evaluators who understand real-world enterprise requirements.",
    },
    {
      q: "Are parents welcome to join the counselling session?",
      a: "Yes, strongly recommended. One of the greatest values of Alderwood Vantage is bridging the gap between parental expectations and student aspirations with compassionate, objective psychometric data.",
    },
    {
      q: "What if my school or college has an institutional partnership with Alderwood Vantage?",
      a: "If your institution has sponsored your cohort, your counselling sessions and roadmap access are provisioned automatically through your school's guidance desk. Contact admissions@alderwoodvantage.com or check with your school counsellor with your registered student ID.",
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
    <div className="w-full space-y-8 animate-fade-in pb-16">
      {/* 1. Header */}
      <StudentPageHeader
        title="Assessment & Mentorship Plans"
        description="Explore the three structured developmental tiers: diagnostic evaluations, 1-on-1 senior practitioner debriefs, and your personalized 5-Year Leadership Roadmap."
        backHref="/dashboard"
        backLabel="Dashboard"
        action={{
          label: "View Assessment Modules",
          href: "/dashboard/assessments",
          icon: <Layers className="w-4 h-4" />,
        }}
      />

      {/* 2. Current Student Status Bar */}
      <div className="bg-gradient-to-r from-[#FFF8F6] via-[#FFF2EE] to-white border border-[#FED7CC] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#FED7CC] text-[#FF6B6B] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#0F172A]">
                Welcome, {firstName}!
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Discover Tier Active
              </span>
              {studentGrade && (
                <span className="text-[10px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                  {studentGrade}
                </span>
              )}
            </div>
            <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
              Your student account grants full access to all 4 evaluation modules (Spark, Wiring, Horsepower, Edge) and the synthesized Leadership Blueprint. Explore Decode and Design to add certified 1-on-1 debriefs and your 5-year execution blueprint.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <Link
            href="/dashboard/assessments"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>{hasStartedAssessment ? "Go to Modules" : "Begin Evaluation"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. The Three Packages Grid */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B]">
            Structured Guidance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mt-1">
            Choose Your Level of Guidance
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
              <div className="pt-6 mt-6 border-t border-current/10">
                {pkg.buttonHref ? (
                  <Link
                    href={pkg.buttonHref}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1]"
                  >
                    <span>{pkg.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForInquiry(pkg.name)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      pkg.popular
                        ? "bg-[#FF6B6B] hover:bg-[#EE5252] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-[#0F172A] hover:bg-black text-white hover:-translate-y-0.5"
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

      {/* 4. Sample Deliverables Preview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
            Certified Executive Deliverables
          </span>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Preview Sample Diagnostic Reports &amp; Roadmaps
          </h3>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
            Review actual, anonymized deliverables to see the depth, psychological rigor, and actionable milestone planning before scheduling a debrief.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  24-Page Leadership Blueprint Sample
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-4">
                Full psychological evaluation assessing behavioral traits, cognitive horsepower, pathway fit, and executive competency matrices.
              </p>
            </div>
            <a
              href="/docs/Career%20Vantage%20Sample%20Report%20-Fashion%20Lawyer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#0F172A] hover:text-white transition-all shadow-2xs"
            >
              <span>Inspect Sample Blueprint (PDF)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#4F46E5]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  5-Year Leadership Roadmap Sample
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-4">
                Actionable year-by-year trajectory mapping covering academic choices, certifications, real-world portfolio projects, and internship horizons.
              </p>
            </div>
            <a
              href="/docs/5%20Year%20Career%20Map%20Sample.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#0F172A] hover:text-white transition-all shadow-2xs"
            >
              <span>Inspect Sample 5-Year Roadmap (PDF)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive Feature Comparison Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs overflow-hidden">
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
            Side-by-Side Comparison
          </span>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Package Features &amp; Deliverables
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Understand exactly what is unlocked at each stage of your leadership journey.
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="py-3 px-4 font-bold text-[#0F172A]">Feature / Deliverable</th>
                <th className="py-3 px-4 font-bold text-[#0F172A] text-center w-28">Discover</th>
                <th className="py-3 px-4 font-black text-[#FF6B6B] text-center w-36 bg-[#FFF2EE]">Decode</th>
                <th className="py-3 px-4 font-bold text-[#0F172A] text-center w-32">Design</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#334155]">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-4 text-center">
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
                  <td className="py-3.5 px-4 text-center bg-[#FFF2EE]/40">
                    {typeof row.decode === "boolean" ? (
                      row.decode ? (
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] mx-auto" />
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )
                    ) : (
                      <span className="font-black text-[#FF6B6B]">{row.decode}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
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

      {/* 6. Institutional Cohort & School Partnership Callout */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[#FF6B6B] text-[10px] font-black uppercase tracking-wider border border-slate-700">
            <Users className="w-3 h-3" />
            <span>School &amp; University Partnerships</span>
          </div>
          <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Enrolled Through a Partner Institution?
          </h4>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            If your high school or college administers Alderwood Vantage for your grade cohort, your 1-on-1 debriefs and personalized roadmaps are coordinated directly with your school guidance department.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <a
            href="mailto:admissions@alderwoodvantage.com?subject=Institutional%20Cohort%20Inquiry%20-%20Student%20Portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0F172A] font-bold text-xs hover:bg-gray-100 transition-colors shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>Contact Advisory Desk</span>
          </a>
          <a
            href="tel:+919316819331"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>+91 93168 19331</span>
          </a>
        </div>
      </div>

      {/* 7. Student FAQs */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
            Questions &amp; Clarity
          </span>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[#E2E8F0] rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    activeFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeFaq === index && (
                <div className="p-4 pt-0 text-xs text-[#475569] leading-relaxed border-t border-[#F1F5F9] bg-[#F8FAFC]/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
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
