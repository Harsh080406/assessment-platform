"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Cpu,
  Target,
  FileText,
  Star,
  Check,
  ShieldCheck,
  Compass,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  Info,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingQuickAction from "@/components/FloatingQuickAction";
import { useAuth } from "@/context/AuthContext";

export default function PackagesClient() {
  const { openAuth } = useAuth();

  // Point 3: The 4 Modules
  const modules = [
    {
      num: "01",
      name: "Spark",
      tagline: "What Energises You",
      description:
        "Identifies the subjects, activities and fields that genuinely excite the student, so choices come from real interest and not from trends or pressure.",
      icon: Sparkles,
      color: "text-[#FF6B6B]",
      bg: "bg-[#FFF2EE]",
      border: "border-[#FED7CC]",
    },
    {
      num: "02",
      name: "Wiring",
      tagline: "How You Naturally Operate",
      description:
        "Explores personality, temperament and working style: how the student thinks, reacts, decides and relates to others, and which environments bring out their best.",
      icon: Brain,
      color: "text-[#6366F1]",
      bg: "bg-[#EEF2FF]",
      border: "border-[#E0E7FE]",
    },
    {
      num: "03",
      name: "Horsepower",
      tagline: "What You're Naturally Good At",
      description:
        "Measures cognitive aptitude across reasoning, numerical, verbal and spatial abilities, showing natural strengths and learning potential.",
      icon: Cpu,
      color: "text-[#0284C7]",
      bg: "bg-[#F0F9FF]",
      border: "border-[#BAE6FD]",
    },
    {
      num: "04",
      name: "Edge",
      tagline: "What You Can Build On",
      description:
        "Looks at the leadership and entrepreneurial competencies that set people apart: initiative, decision-making, influence, resilience, creativity, commercial thinking and learning agility.",
      icon: Target,
      color: "text-[#F59E0B]",
      bg: "bg-[#FFF8EE]",
      border: "border-[#FDE68A]",
    },
  ];

  // Point 3: The Output - Your Leadership Blueprint
  const blueprintOutputs = [
    {
      title: "Leader's Lens",
      description: "How the student shows up today as a leader and innovator.",
    },
    {
      title: "Pathway Fit",
      description:
        "Suitability across Build your own venture / Lead the family business / Professional career / Hybrid.",
    },
    {
      title: "Gap-to-Ready Meter",
      description:
        "Where the student stands today against what each pathway demands.",
    },
  ];

  // Point 3A: Packages
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
        "Personalised Career Vantage Report (about 15–17 pages) with charts and plain-language explanations",
        "Page 3 \"Suitable for\" summary: academic and career direction",
        "Top three career directions with match strength, routes, and ways to try them",
        "Development plan with measurable next steps",
        "Delivered as a PDF within 7–10 working days of the assessment",
      ],
      bestFor: "A student who just wants to understand themselves better.",
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
      bestFor: "Subject or stream choices coming up, or families wanting counselling support.",
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
      bestFor: "Longer-term plan, family business, new venture, or an unusual career.",
      buttonLabel: "Enroll in Design",
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#0F172A] font-[family-name:var(--font-inter)] selection:bg-[#FED7CC] selection:text-[#0F172A]">
      {/* 1. Header Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* =========================================================
             BREADCRUMB & INTRO HEADER
         ========================================================= */}
        <section className="pt-10 sm:pt-16 pb-6 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-[-0.03em] leading-[1.15]">
              One assessment. <br className="hidden sm:inline" />
              <span className="text-[#FF6B6B]">Four lenses on potential.</span>
            </h1>

            <p className="text-[#475569] font-medium text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Together, the four lenses give a complete picture that no single test can.
            </p>
          </div>
        </section>

        {/* =========================================================
            POINT 3: THE 4 MODULES (Spark, Wiring, Horsepower, Edge)
        ========================================================= */}
        <section className="py-8 sm:py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#FF6B6B]/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group shadow-sm"
                >
                  <div>
                    {/* Top Bar with Number & Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-xl ${mod.bg} ${mod.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="font-mono text-xs font-black text-[#94A3B8]">
                        MODULE {mod.num}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-1">
                      {mod.name}
                    </h2>
                    <div className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider mb-3">
                      ({mod.tagline})
                    </div>
                    <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* =========================================================
              THE OUTPUT: YOUR LEADERSHIP BLUEPRINT
          ========================================================= */}
          <div className="bg-[#0F172A] text-white rounded-3xl p-7 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl border border-[#1E293B]">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#FF6B6B]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-black tracking-widest uppercase text-[#FF6B6B] block mb-2">
                The Tangible Output
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-white">
                Personalised Career Vantage Report
              </h3>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed mb-10">
                A detailed, plain-language written report (about 15–17 pages) with charts, benchmarks, and actionable directions delivered within 7–10 working days of assessment completion.
              </p>

              {/* 3 Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800">
                {blueprintOutputs.map((out) => (
                  <div key={out.title} className="space-y-1.5">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                      {out.title}
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {out.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom Clarification */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
                  Scientific &amp; Actionable
                </span>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Every package starts with the same assessment and report. The difference is how much support you get to turn the report into decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            POINT 3A: PACKAGES (Discover, Decode, Design)
        ========================================================= */}
        <section className="py-16 sm:py-24 bg-white border-t border-[#E2E8F0] relative overflow-hidden" id="packages">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
            {/* Section Top Header */}
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B] block mb-2">
                Career Vantage Packages
              </span>
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
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${
                            pkg.popular ? "text-indigo-300" : "text-[#64748B]"
                          }`}
                        >
                          {pkg.packageNumber} • {pkg.badge}
                        </span>
                      </div>

                      <h3 className="text-3xl font-black tracking-tight mb-1">
                        {pkg.name}
                      </h3>

                      <p
                        className={`text-xs sm:text-sm font-semibold mb-4 ${
                          pkg.popular ? "text-indigo-300" : "text-[#FF6B6B]"
                        }`}
                      >
                        {pkg.subtitle}
                      </p>

                      {/* Price Display */}
                      <div className="my-4 pb-4 border-b border-current/10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-black tracking-tight">
                            {pkg.price}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              pkg.popular ? "text-slate-400" : "text-[#64748B]"
                            }`}
                          >
                            [Excl. GST]
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold block mt-1 ${
                            pkg.popular ? "text-indigo-200" : "text-[#0F172A]"
                          }`}
                        >
                          {pkg.priceLabel}
                        </span>
                      </div>

                      <div
                        className={`p-4 rounded-xl mb-6 border ${
                          pkg.popular
                            ? "bg-slate-800/80 border-slate-700/80 text-white"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                            pkg.popular ? "text-indigo-300" : "text-[#64748B]"
                          }`}
                        >
                          What you get:
                        </span>
                        <span className="text-sm font-extrabold leading-snug block">
                          {pkg.includedHeading}
                        </span>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 pt-1 mb-6">
                        {pkg.features.map((feat) => (
                          <div
                            key={feat}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed"
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                pkg.popular
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span
                              className={
                                pkg.popular
                                  ? "text-slate-200 font-medium"
                                  : "text-[#334155] font-semibold"
                              }
                            >
                              {feat}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Best For Box */}
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
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

            {/* Selection Guidance & Junior Edition Note */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#FED7CC] flex items-start gap-3.5 text-xs text-[#0F172A]">
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

              <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 flex items-start gap-3.5 text-xs text-[#0F172A]">
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

            {/* Optional Add-on */}
            <div className="mt-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2EE] text-[#FF6B6B] flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] bg-[#FFF2EE] px-2 py-0.5 rounded">
                    Optional Add-on
                  </span>
                  <h4 className="text-base font-bold text-[#0F172A] mt-1">
                    Additional Counselling Session
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    A further 45–60 minute session, online or in person.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                <div className="text-right">
                  <div className="text-xl font-black text-[#0F172A]">₹2,500</div>
                  <div className="text-[10px] text-[#64748B]">per session [Excl. GST]</div>
                </div>
                <button
                  onClick={() => openAuth("signup")}
                  className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Book Add-on
                </button>
              </div>
            </div>

            {/* =========================================================
                HOW IT WORKS (4 STEPS)
            ========================================================= */}
            <div className="mt-16 pt-12 sm:pt-16 border-t border-[#E2E8F0]">
              <div className="max-w-3xl mx-auto text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B] block mb-1">
                  How It Works
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  From Registration to Career Execution
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2 max-w-xl mx-auto leading-relaxed">
                  Four simple steps from taking the assessment at home to discussing your trajectory with expert counsellors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-sm font-black">
                    1
                  </div>
                  <h5 className="text-base font-bold text-[#0F172A]">Register</h5>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Choose a package. For students under 18, a parent or guardian gives consent.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-sm font-black">
                    2
                  </div>
                  <h5 className="text-base font-bold text-[#0F172A]">Take the Assessment</h5>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Online, 60–90 minutes, at home or at a scheduled time.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-sm font-black">
                    3
                  </div>
                  <h5 className="text-base font-bold text-[#0F172A]">Receive Your Report</h5>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    A personalised PDF delivered within 7–10 working days of assessment completion.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-sm font-black">
                    4
                  </div>
                  <h5 className="text-base font-bold text-[#0F172A]">Talk It Through</h5>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Your sessions (Packages 2 and 3) and, in Package 3, your 5-year career &amp; education map.
                  </p>
                </div>
              </div>
            </div>

            {/* =========================================================
                COMPARE THE PACKAGES TABLE
            ========================================================= */}
            <div className="mt-16 pt-12 sm:pt-16 border-t border-[#E2E8F0]">
              <div className="max-w-3xl mx-auto text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B] block mb-1">
                  Compare the packages
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  A Quick View of What Is in Each
                </h3>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="min-w-[580px] w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider font-bold text-[#64748B]">
                        <th className="py-3 px-4 w-[42%] min-w-[210px] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                          Feature / Deliverable
                        </th>
                        <th className="py-3 px-3 text-center min-w-[105px]">
                          Package 1<br /><span className="text-[10px] font-medium text-slate-500">Insight Report</span>
                        </th>
                        <th className="py-3 px-3 text-center bg-indigo-50/60 rounded-t-lg text-indigo-900 min-w-[130px] font-bold">
                          Package 2<br /><span className="text-[10px] font-medium text-indigo-700">Insight + Guidance</span>
                        </th>
                        <th className="py-3 px-3 text-center min-w-[130px] font-bold">
                          Package 3<br /><span className="text-[10px] font-medium text-slate-500">Premier Pathway</span>
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
                              <span className="font-bold text-[#0F172A]">{row.discover}</span>
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
                              <span className="font-bold text-indigo-950">{row.decode}</span>
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
                              <span className="font-bold text-[#0F172A]">{row.design}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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

            {/* =========================================================
                GOOD TO KNOW ADVISORY SECTION
            ========================================================= */}
            <div className="mt-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 sm:p-9 text-xs text-[#475569] space-y-4 max-w-5xl mx-auto">
              <h4 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Good to know</span>
              </h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-[#475569]">
                <li><strong className="text-[#0F172A]">Prices:</strong> In Indian rupees [Exclusive of GST].</li>
                <li><strong className="text-[#0F172A]">Turnaround &amp; Validity:</strong> Reports are delivered within 7–10 working days of the completed assessment. Sessions are booked at times that suit the family and are valid for the period shown above (90 days for Package 2, 6 months for Package 3).</li>
                <li><strong className="text-[#0F172A]">Rescheduling:</strong> Please give 24 hours&apos; notice to reschedule a session.</li>
                <li><strong className="text-[#0F172A]">Student Confidentiality:</strong> Information about students is kept strictly confidential and used only for career guidance. For students under 18, a parent or guardian&apos;s consent is required.</li>
                <li><strong className="text-[#0F172A]">Assessment Scope:</strong> The assessment and report describe interests, skills and preferences at one point in time. They are a guide for exploring careers, not a diagnosis, an intelligence test, or a guarantee of any outcome, and are best read with school records and real-world experience.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Quick Action */}
      <FloatingQuickAction />
    </div>
  );
}
