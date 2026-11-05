"use client";

import { Check, Star, Sparkles, ArrowRight, ShieldCheck, FileText, Compass, ExternalLink, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function PackagesPreviewSection() {
  const { openAuth } = useAuth();

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
      tagline:
        "Students and Families who want a clear scientific evidence based written picture and will discuss it at home or with the school.",
      includedHeading: "Assessment + Personalised Report (15–17 pages)",
      features: [
        "Online assessment covering personality, interests, work values, 16 skills and reasoning",
        "Personalised Career Vantage Report (about 15–17 pages) with charts & plain-language explanations",
        "Page 3 \"Suitable for\" summary: academic and career direction",
        "Top three career directions with match strength, routes, and ways to try them",
        "Development plan with measurable next steps",
        "Delivered as a PDF within 7–10 working days of the assessment",
      ],
      buttonLabel: "Get Started with Discover",
      buttonVariant: "secondary",
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
      buttonLabel: "Choose Decode (Recommended)",
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
            <span>Career Vantage Packages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Clear, transparent packages for <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">every stage of growth.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475569] font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
            Personalised career and education guidance for students, built on a scientific-style assessment and a detailed written report. Prices in INR [Exclusive of GST].
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
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF6B6B] text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Most Recommended</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${pkg.popular ? "text-indigo-300" : "text-[#64748B]"}`}>
                      {pkg.packageNumber} • {pkg.badge}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black tracking-tight mb-1">
                    {pkg.name}
                  </h3>

                  <p className={`text-xs sm:text-sm font-semibold mb-3 ${pkg.popular ? "text-indigo-300" : "text-[#FF6B6B]"}`}>
                    {pkg.subtitle}
                  </p>

                  {/* Price Tag */}
                  <div className="my-4 pb-4 border-b border-current/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight">
                        {pkg.price}
                      </span>
                      <span className={`text-xs font-semibold ${pkg.popular ? "text-slate-400" : "text-[#64748B]"}`}>
                        [Excl. GST]
                      </span>
                    </div>
                    <span className={`text-xs font-bold block mt-1 ${pkg.popular ? "text-indigo-200" : "text-[#0F172A]"}`}>
                      {pkg.priceLabel}
                    </span>
                  </div>

                  <div className={`p-4 rounded-xl mb-5 border ${
                    pkg.popular
                      ? "bg-slate-800/80 border-slate-700/80 text-white"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
                  }`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                      pkg.popular ? "text-indigo-300" : "text-[#64748B]"
                    }`}>
                      What you get:
                    </span>
                    <span className="text-sm font-extrabold leading-snug block">
                      {pkg.includedHeading}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-1 mb-5">
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

                  {/* Best For Box */}
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    pkg.popular
                      ? "bg-slate-900/60 border-slate-700 text-slate-300"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
                  }`}>
                    <span className={`font-bold block mb-0.5 ${pkg.popular ? "text-white" : "text-[#0F172A]"}`}>
                      Best for:
                    </span>
                    {pkg.tagline}
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

        {/* View Full Comparison Link */}
        <div className="mt-10 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm font-bold text-[#0F172A] hover:bg-white hover:border-[#0F172A] transition-all shadow-2xs"
          >
            <span>Compare all features &amp; optional add-ons on the Packages page</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B6B]" />
          </Link>
        </div>

        {/* =========================================================
            SAMPLE DELIVERABLES (Sample Report & 5-Year Career Map)
        ========================================================= */}
        <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-[#E2E8F0]">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B] block mb-1">
              Deliverable Samples
            </span>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>About 15–17 Pages</span>
                  </span>
                </div>

                <h4 className="text-lg font-black text-[#0F172A] mb-1">
                  Career Vantage Sample Report
                </h4>
                <div className="text-[11px] font-bold text-[#6366F1] uppercase tracking-wider mb-3">
                  Case Study: Fashion &amp; Corporate Law
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mb-6">
                  Explore a complete diagnostic report with charts and plain-language explanations covering personality, interests, work values, 16 skills, and reasoning. Includes page 3 &quot;Suitable for&quot; summary and top 3 career directions.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <a
                  href="/docs/Career%20Vantage%20Sample%20Report%20-Fashion%20Lawyer.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#0F172A] text-white hover:bg-[#1E293B] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs group"
                >
                  <span>View Sample Report (PDF)</span>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF2EE] text-[#FF6B6B] flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>About 10 Pages</span>
                  </span>
                </div>

                <h4 className="text-lg font-black text-[#0F172A] mb-1">
                  5-Year Career &amp; Education Map
                </h4>
                <div className="text-[11px] font-bold text-[#FF6B6B] uppercase tracking-wider mb-3">
                  High School Through University Milestones
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mb-6">
                  Inspect a personalised roadmap architecture detailing pathway fit (employment, family business, venture, hybrid), year-by-year capstone project and milestones, skills roadmap, mentor map, and four decision gates.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <a
                  href="/docs/5%20Year%20Career%20Map%20Sample.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#0F172A] text-white hover:bg-[#1E293B] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs group"
                >
                  <span>View 5-Year Career Map (PDF)</span>
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
