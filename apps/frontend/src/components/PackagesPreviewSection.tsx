"use client";

import { Check, Star, Sparkles, ArrowRight, ShieldCheck, HelpCircle, FileText, Compass, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function PackagesPreviewSection() {
  const { openAuth } = useAuth();

  const packages = [
    {
      id: "discover",
      name: "Discover",
      subtitle: "Diagnostic Foundation",
      tagline: "Uncover core strengths and natural potential.",
      popular: false,
      includedHeading: "Assessment + Leadership Blueprint",
      features: [
        "Full 4-Module Assessment (Spark, Wiring, Horsepower, Edge)",
        "126 academically validated psychometric & behavioral items",
        "Executive Leadership Blueprint report",
        "Leader's Lens behavioral archetype analysis",
        "Pathway Fit analysis (Venture, Family Business, Corporate, Hybrid)",
        "Gap-to-Ready Meter diagnostics",
      ],
      buttonLabel: "Get Started with Discover",
      buttonVariant: "secondary",
    },
    {
      id: "decode",
      name: "Decode",
      subtitle: "Most Recommended",
      tagline: "Assessment + Expert 1-on-1 Guidance.",
      popular: true,
      includedHeading: "Assessment + Blueprint + 2 Counselling Sessions",
      features: [
        "Everything in the Discover Package",
        "2 one-on-one confidential counselling sessions",
        "In-depth debrief with certified executive career psychologists",
        "Parent-inclusive clarity discussion",
        "Stream & college decision alignment",
        "Identification of blindspots & development frontiers",
      ],
      buttonLabel: "Choose Decode (Recommended)",
      buttonVariant: "primary",
    },
    {
      id: "design",
      name: "Design",
      subtitle: "Full Mentorship Roadmap",
      tagline: "Comprehensive 5-year strategic execution plan.",
      popular: false,
      includedHeading: "Assessment + Blueprint + Counselling + 5-Year Roadmap",
      features: [
        "Everything in the Decode Package",
        "Personalised 5-Year Leadership Roadmap",
        "Year-by-year milestone planning (High school to university)",
        "Curated real-world projects & portfolio building",
        "Executive mentorship & network recommendations",
        "Dedicated follow-up check-ins & progress calibration",
      ],
      buttonLabel: "Enroll in Design",
      buttonVariant: "dark",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-[#E2E8F0] relative overflow-hidden" id="packages">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#E0E7FE] text-[11px] font-black uppercase tracking-wider text-[#4F46E5] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advisory Packages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Clear, transparent packages for <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">every stage of growth.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475569] font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
            Choose the level of depth, expert counselling, and ongoing mentorship that best serves your child&apos;s aspirations.
          </p>
        </div>

        {/* 3 Packages Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => {
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 ${
                  pkg.popular
                    ? "bg-[#0F172A] text-white shadow-2xl border-2 border-indigo-500/40 ring-4 ring-indigo-500/10 lg:-translate-y-2"
                    : "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#CBD5E1]"
                }`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-indigo-400/30">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${pkg.popular ? "text-indigo-300" : "text-[#64748B]"}`}>
                      {pkg.subtitle}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black tracking-tight mb-2">
                    {pkg.name}
                  </h3>

                  <p className={`text-xs sm:text-sm font-medium mb-6 ${pkg.popular ? "text-[#94A3B8]" : "text-[#64748B]"}`}>
                    {pkg.tagline}
                  </p>

                  <div className={`p-4 rounded-xl mb-6 border ${
                    pkg.popular
                      ? "bg-slate-800/80 border-slate-700/80 text-white"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
                  }`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                      pkg.popular ? "text-indigo-300" : "text-[#64748B]"
                    }`}>
                      What&apos;s Included:
                    </span>
                    <span className="text-sm font-extrabold leading-snug block">
                      {pkg.includedHeading}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-2">
                    <span className={`text-[11px] font-black uppercase tracking-wider block ${
                      pkg.popular ? "text-slate-400" : "text-[#64748B]"
                    }`}>
                      Deliverables:
                    </span>
                    {pkg.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          pkg.popular
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className={pkg.popular ? "text-slate-200 font-medium" : "text-[#334155] font-semibold"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-current/10">
                  <button
                    onClick={() => openAuth("signup")}
                    className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-black transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 group ${
                      pkg.popular
                        ? "bg-[#FF6B6B] hover:bg-[#EE5252] text-white hover:shadow-lg hover:shadow-[#FF6B6B]/25 hover:-translate-y-0.5"
                        : pkg.buttonVariant === "dark"
                        ? "bg-[#0F172A] hover:bg-black text-white hover:-translate-y-0.5 shadow-xs"
                        : "bg-white border-2 border-[#0F172A] hover:bg-[#0F172A] hover:text-white text-[#0F172A]"
                    }`}
                  >
                    <span>{pkg.buttonLabel}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =========================================================
            SAMPLE DELIVERABLES (Sample Report & 5-Year Career Map)
        ========================================================= */}
        <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-[#E2E8F0]">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Preview What You&apos;ll Receive
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2 max-w-xl mx-auto leading-relaxed">
              Review real, anonymised executive deliverables to see the psychological depth, rigor, and actionable milestone planning before enrolling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Card 1: Sample Report */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#6366F1]/50 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <div>
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <h4 className="text-lg font-black text-[#0F172A] mb-1">
                  Career Vantage Sample Report
                </h4>
                <div className="text-[11px] font-bold text-[#6366F1] uppercase tracking-wider mb-3">
                  Case Study: Fashion &amp; Corporate Law
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mb-6">
                  Explore a complete diagnostic blueprint evaluating behavioral traits, cognitive horsepower, pathway fit, and gap analysis across executive competency matrices.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <a
                  href="/docs/Career%20Vantage%20Sample%20Report%20-Fashion%20Lawyer.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#0F172A] text-white hover:bg-[#1E293B] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs group"
                >
                  <span>View Sample Report</span>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </a>
              </div>
            </motion.div>

            {/* Card 2: 5-Year Career Map */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#FF6B6B]/50 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <div>
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF2EE] text-[#FF6B6B] flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>

                <h4 className="text-lg font-black text-[#0F172A] mb-1">
                  5-Year Career Map Sample
                </h4>
                <div className="text-[11px] font-bold text-[#FF6B6B] uppercase tracking-wider mb-3">
                  High School Through University Milestones
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mb-6">
                  Inspect a personalised roadmap architecture detailing year-by-year academic targets, skill-building sprints, high-impact extracurriculars, and readiness frontiers.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <a
                  href="/docs/5%20Year%20Career%20Map%20Sample.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#0F172A] text-white hover:bg-[#1E293B] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs group"
                >
                  <span>View 5-Year Career Map</span>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-12 text-center text-xs text-[#64748B] font-semibold flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>All packages include strict parental consent, confidentiality guarantee, and academic validation.</span>
        </div>

      </div>
    </section>
  );
}
