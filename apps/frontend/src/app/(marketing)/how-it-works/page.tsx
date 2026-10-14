"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Laptop,
  Cpu,
  FileCheck,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function HowItWorksPage() {
  const { openAuth } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // The 5 Steps from Section 2 of Alderwood Vantage Content
  const steps = [
    {
      id: "step-1",
      num: "01",
      tag: "Step 01 - Setup",
      title: "Register and profile setup",
      subtitle: "Parental consent up front, sensitive data handled with care.",
      icon: UserCheck,
      description:
        "Create the student's profile. Parental consent is taken up front, because we handle sensitive information with care.",
      highlights: [
        "Create student profile with academic grade (Class 8–12 and early undergrad)",
        "Upfront parental consent ensuring full transparency and ethical oversight",
        "Strict student privacy charter: zero data sharing with coaching institutes or advertisers",
        "Quick 2-minute onboarding with no prerequisite tests or preparation needed",
      ],
      quote:
        "We treat your child's data with utmost respect and institutional security.",
      action: {
        label: "Begin registration",
        type: "auth",
      },
    },
    {
      id: "step-2",
      num: "02",
      tag: "Step 02 - Assessment",
      title: "Take the assessment",
      subtitle: "Four-module online assessment completed at the student's own pace.",
      icon: Laptop,
      description:
        "The student completes the four-module assessment online, at their own pace.",
      highlights: [
        "Four comprehensive lenses: Spark, Wiring, Horsepower, and Edge",
        "100% self-paced with seamless auto-save across mobile, tablet, and desktop",
        "Engaging situational scenarios and behavioral dilemmas, not stressful exams",
        "Zero trick formulas, negative marking, or memorization requirements",
      ],
      quote:
        "Students can pause anytime and return whenever they are refreshed.",
      action: {
        label: "Start the assessment",
        type: "auth",
      },
    },
    {
      id: "step-3",
      num: "03",
      tag: "Step 03 - Analysis",
      title: "Expert analysis",
      subtitle: "Validated framework scoring reviewed by renowned academicians.",
      icon: Cpu,
      description:
        "Responses are scored using our validated framework and reviewed by renowned academicians.",
      highlights: [
        "Scoring model calibrated across several areas against corporate leadership benchmarks",
        "Co-developed and academically validated alongside PhD-qualified academicians",
        "Designed by HR veterans with credentials from DDI and IIM Calcutta",
        "Controls for social desirability and response bias for true authentic insights",
      ],
      quote:
        "Rigorous corporate and academic science replaces superficial 10-minute quizzes.",
      action: null, // Step 3 has no direct user action button
    },
    {
      id: "step-4",
      num: "04",
      tag: "Step 04 - The report",
      title: "Receive your Leadership Blueprint",
      subtitle: "Clear, jargon-free report covering interests, personality, aptitude, and leadership.",
      icon: FileCheck,
      description:
        "A clear, jargon-free report covering interests, personality, aptitude and leadership competencies, with pathway recommendations.",
      highlights: [
        "Leader's Lens: How the student shows up today as a leader and innovator",
        "Pathway Fit: Empirical suitability across Venture, Family Business, Corporate, or Hybrid",
        "Gap-to-Ready Meter: Where the student stands today against what each pathway demands",
        "Actionable, parent-friendly recommendations without confusing academic jargon",
      ],
      quote:
        "Provides a common language that helps families talk constructively.",
      action: {
        label: "See what is in the Blueprint",
        type: "link",
        href: "/packages",
      },
    },
    {
      id: "step-5",
      num: "05",
      tag: "Step 05 - Guidance",
      title: "Get guided and 5-year roadmap",
      subtitle: "Meet a trained counsellor and receive a personalised 5-year Leadership Roadmap.",
      icon: Compass,
      description:
        "Depending on your package, meet a trained counsellor and receive a personalised 5-year Leadership Roadmap.",
      highlights: [
        "One-on-one sessions with trained corporate leadership counsellors",
        "Personalised 5-Year Leadership Roadmap: skills to build, real-world projects & mentorship",
        "Year-by-year milestones balancing academic goals with enterprise exposure",
        "Long-term clarity that prepares the student for leadership, not just a job",
      ],
      quote:
        "Connects assessment findings directly to actionable steps for the next 5 years.",
      action: {
        label: "Explore packages",
        type: "link",
        href: "/packages",
      },
    },
  ];

  // URL Hash Synchronisation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const foundIndex = steps.findIndex(
          (s) => s.id === hash || s.id === `step-${hash}`
        );
        if (foundIndex !== -1) {
          setActiveStepIndex(foundIndex);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [steps]);

  const selectStep = useCallback(
    (index: number) => {
      setActiveStepIndex(index);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${steps[index].id}`);
      }
    },
    [steps]
  );

  // Keyboard navigation for tablist
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % steps.length;
      selectStep(nextIndex);
      document.getElementById(`step-tab-${nextIndex}`)?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + steps.length) % steps.length;
      selectStep(prevIndex);
      document.getElementById(`step-tab-${prevIndex}`)?.focus();
    }
  };

  const currentStep = steps[activeStepIndex];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#0F172A] font-[family-name:var(--font-inter)] selection:bg-[#FED7CC] selection:text-[#0F172A]">
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        {/* =========================================================
            1. HERO SECTION
        ========================================================= */}
        <section
          aria-labelledby="hero-heading"
          className="pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 border-b border-[#E7E5E4]"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Headline and CTAs */}
            <div className="text-center max-w-[720px] mx-auto">
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0F172A] tracking-[-0.01em] leading-[1.12]"
              >
                From uncertainty to a{" "}
                <span className="text-[#FF6B6B]">clear vantage in five steps.</span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-[#475569] font-normal leading-relaxed max-w-[640px] mx-auto">
                From self-discovery to leadership: a validated assessment, expert counselling, mentorship and a 5-year pathway that helps every student become the leader, innovator and builder they can be.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => openAuth("signup")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white text-sm sm:text-base font-bold transition-all shadow-xs hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] focus-visible:ring-offset-2"
                >
                  <span>Give your child a clearer future</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <Link
                  href="/packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] text-[#0F172A] text-sm sm:text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]"
                >
                  Explore packages
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. THE 5-STEP JOURNEY (Core of the page)
        ========================================================= */}
        <section
          aria-labelledby="journey-heading"
          className="py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="journey"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Standard Section Header */}
            <div className="text-center max-w-[560px] mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#FF6B6B]">
                Step-by-step process
              </span>
              <h2
                id="journey-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-2 mb-3"
              >
                How the journey unfolds
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                A clear, progressive pathway from initial setup to lifelong developmental momentum.
              </p>
            </div>

            {/* Mobile Horizontal Stepper (Scrollable, visible on small screens) */}
            <div className="lg:hidden mb-8">
              <div
                role="tablist"
                aria-label="Steps"
                className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar"
              >
                {steps.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  return (
                    <button
                      key={step.id}
                      role="tab"
                      id={`step-tab-mobile-${idx}`}
                      aria-selected={isActive}
                      aria-controls={`step-panel-${idx}`}
                      onClick={() => selectStep(idx)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] ${
                        isActive
                          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                          : "bg-white text-[#475569] border-[#E7E5E4] hover:bg-[#F5F5F4]"
                      }`}
                    >
                      <span
                        className={
                          isActive ? "text-[#FF6B6B]" : "text-[#94A3B8]"
                        }
                      >
                        {step.num}
                      </span>
                      <span>{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Two-Column Layout (Desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Sticky Stepper (~35% width) */}
              <div className="hidden lg:block lg:col-span-4 sticky top-28">
                <div
                  role="tablist"
                  aria-label="Assessment journey steps"
                  aria-orientation="vertical"
                  className="space-y-2 relative"
                >
                  {steps.map((step, idx) => {
                    const isActive = activeStepIndex === idx;
                    const isLast = idx === steps.length - 1;

                    return (
                      <div key={step.id} className="relative">
                        {/* Connecting Line between steps */}
                        {!isLast && (
                          <div
                            aria-hidden="true"
                            className="absolute left-[22px] top-[46px] w-0.5 h-[calc(100%-24px)] bg-[#E7E5E4]"
                          />
                        )}

                        <button
                          role="tab"
                          id={`step-tab-${idx}`}
                          aria-selected={isActive}
                          aria-controls={`step-panel-${idx}`}
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => selectStep(idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-4 cursor-pointer relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] ${
                            isActive
                              ? "bg-white border border-[#E7E5E4] shadow-xs"
                              : "hover:bg-white/60 border border-transparent"
                          }`}
                        >
                          {/* Number Badge */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isActive
                                ? "bg-[#0F172A] text-white"
                                : "bg-white border border-[#E7E5E4] text-[#64748B]"
                            }`}
                          >
                            {step.num}
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <span
                              className={`block text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
                                isActive ? "text-[#FF6B6B]" : "text-[#94A3B8]"
                              }`}
                            >
                              Step {step.num}
                            </span>
                            <span
                              className={`block text-sm font-bold truncate ${
                                isActive ? "text-[#0F172A]" : "text-[#64748B]"
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Step Content Panel (~65% width) */}
              <div className="lg:col-span-8">
                <div
                  role="tabpanel"
                  id={`step-panel-${activeStepIndex}`}
                  aria-labelledby={`step-tab-${activeStepIndex}`}
                  className="bg-white rounded-xl border border-[#E7E5E4] p-7 sm:p-10 min-h-[460px] flex flex-col justify-between"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Step Header */}
                      <div>
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#FF6B6B]">
                          {currentStep.tag}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-[-0.01em] mt-1.5 mb-3">
                          {currentStep.title}
                        </h3>
                        <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
                          {currentStep.description}
                        </p>
                      </div>

                      {/* 4 Check Highlights */}
                      <div className="space-y-3 pt-2">
                        {currentStep.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2
                              className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span className="text-sm sm:text-base text-[#334155] font-medium leading-relaxed">
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Editorial Italic Pull-Line (Core Principle) */}
                      <div className="border-t border-[#E7E5E4] pt-5">
                        <blockquote className="text-base sm:text-lg text-[#334155] italic leading-relaxed">
                          &ldquo;{currentStep.quote}&rdquo;
                        </blockquote>
                      </div>

                      {/* Meaningful Contextual Action Button (Only where appropriate) */}
                      {currentStep.action && (
                        <div className="pt-2">
                          {currentStep.action.type === "auth" ? (
                            <button
                              onClick={() => openAuth("signup")}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-black text-white text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]"
                            >
                              <span>{currentStep.action.label}</span>
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                          ) : (
                            <Link
                              href={currentStep.action.href || "/packages"}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-black text-white text-sm font-bold transition-all shadow-xs hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]"
                            >
                              <span>{currentStep.action.label}</span>
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. PHILOSOPHY SECTION ("A note on how we see students")
        ========================================================= */}
        <section
          aria-labelledby="philosophy-heading"
          className="bg-white py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="philosophy"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Top Row: Editorial Quote & Plain Side Note */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#FF6B6B]">
                  A note on how we see students
                </span>
                <blockquote
                  id="philosophy-heading"
                  className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0F172A] tracking-[-0.01em] leading-snug mt-3"
                >
                  &ldquo;Teenagers are still growing. Our results highlight{" "}
                  <span className="text-[#FF6B6B]">emerging strengths</span> and development areas, never fixed labels.&rdquo;
                </blockquote>
              </div>

              <div className="lg:col-span-5">
                <div className="border-l-2 border-[#E7E5E4] pl-6 text-base sm:text-[17px] text-[#334155] leading-relaxed">
                  <p>
                    We deliberately reject assessments that trap young minds into rigid categories. Alderwood Vantage measures potential and capabilities that can be nurtured with intent over the critical next five years.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: 3 Columns (Separated by thin dividers, NOT cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E7E5E4] pt-12 mt-12 border-t border-[#E7E5E4]">
              {/* Column 1 */}
              <div className="py-6 md:py-0 md:pr-8 first:pt-0">
                <h3 className="text-lg font-bold text-[#0F172A] tracking-[-0.01em] mb-2">
                  Strengths keep developing
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Strengths evolve rapidly throughout high school and university. Our assessment maps emerging potential rather than permanent limitations.
                </p>
              </div>

              {/* Column 2 */}
              <div className="py-6 md:py-0 md:px-8">
                <h3 className="text-lg font-bold text-[#0F172A] tracking-[-0.01em] mb-2">
                  Skills can be built
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Leadership competencies—initiative, resilience, decision reflexes, and commercial thinking—can be systematically developed with the right 5-year roadmap.
                </p>
              </div>

              {/* Column 3 */}
              <div className="py-6 md:py-0 md:pl-8 last:pb-0">
                <h3 className="text-lg font-bold text-[#0F172A] tracking-[-0.01em] mb-2">
                  No fixed labels
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  No rigid career boxes or pigeonholes. Students and parents gain a shared language to explore who they can become, not just which exam stream to follow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          5. MOBILE STICKY BOTTOM BAR (Mobile only, md:hidden)
      ========================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] p-3 md:hidden shadow-lg">
        <Link
          href="/packages"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white text-sm font-bold shadow-xs active:scale-[0.99] transition-all"
        >
          <span>Explore packages</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
