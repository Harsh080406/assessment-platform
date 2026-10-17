"use client";

import Link from "next/link";
import {
  ArrowRight,
  Eye,
  CheckCircle2,
  Users,
  Lock,
  Heart,
  Scale,
  TrendingUp,
  Award,
  BookOpen,
  Quote,
  Compass,
  FileText,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutClient() {
  // Credibility Strip Items (from original Hero 3 cards)
  const credibilityItems = [
    {
      title: "Leadership practitioners",
      description:
        "Decades inside leading global enterprises assessing and shaping leadership talent.",
      icon: Users,
    },
    {
      title: "Academically validated",
      description:
        "Evaluation matrices reviewed and endorsed by distinguished PhD academicians.",
      icon: BookOpen,
    },
    {
      title: "Early clarity engine",
      description:
        "Equipping students and families with actionable direction years before high-stakes decisions.",
      icon: Award,
    },
  ];

  // Our Distinct Approach (original 4 points)
  const approachPoints = [
    {
      number: "01",
      title: "Rigorous",
      description:
        "Assessment framework reviewed and validated by renowned academicians.",
    },
    {
      number: "02",
      title: "Leadership-led",
      description:
        "Built by professionals experienced in leadership assessment and development.",
    },
    {
      number: "03",
      title: "Personal",
      description:
        "Every report is explained in conversation, never just emailed.",
    },
    {
      number: "04",
      title: "Honest",
      description:
        "We show potential and gaps with equal clarity.",
    },
  ];

  // Mission Points (original 3 points)
  const missionPoints = [
    "To replace guesswork with rigorous, evidence-based insight",
    "To help students become future-ready for any path: entrepreneur, family business leader or professional",
    "To make serious, credible guidance accessible to schools, institutions and families",
  ];

  // How We Work (synthesized strictly from existing platform facts)
  const steps = [
    {
      step: "01",
      title: "Take the assessment",
      description:
        "Students complete four core modules: Spark, Wiring, Horsepower, and Edge in an engaging online format.",
      icon: FileText,
    },
    {
      step: "02",
      title: "Receive the Leadership Blueprint",
      description:
        "A multi-dimensional profile mapping behavioral traits, cognitive strengths, and leadership inclinations.",
      icon: Compass,
    },
    {
      step: "03",
      title: "One-on-one session with parents",
      description:
        "Talk through the report in a dedicated debrief with parents included to turn insights into actionable plans.",
      icon: MessageSquare,
    },
  ];

  // Core Values (original 5 values with muted category labels above title)
  const values = [
    {
      badge: "Foundation",
      name: "Integrity",
      description:
        "Unwavering commitment to academic standards and ethical guidance.",
      icon: Award,
    },
    {
      badge: "Focus",
      name: "Student-first",
      description:
        "Every metric and conversation exists solely to serve the young learner's growth.",
      icon: Heart,
    },
    {
      badge: "Method",
      name: "Evidence over opinion",
      description:
        "Rooted in psychometric validation rather than arbitrary speculation.",
      icon: Scale,
    },
    {
      badge: "Trust",
      name: "Confidentiality",
      description:
        "Zero third-party monetization or data sharing. Complete family privacy.",
      icon: Lock,
    },
    {
      badge: "Trajectory",
      name: "Growth mindset",
      description:
        "Highlighting evolving potential and dynamic trajectories, never permanent limits.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#0F172A] font-[family-name:var(--font-inter)] selection:bg-[#FED7CC] selection:text-[#0F172A]">
      <Navbar />

      <main className="flex-1 pb-16 md:pb-0">
        {/* =========================================================
            1. HERO SECTION
        ========================================================= */}
        <section
          aria-labelledby="hero-heading"
          className="bg-[#FAFAF9] pt-12 sm:pt-16 pb-16 sm:pb-24 border-b border-[#E7E5E4]"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Header Block */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-[720px] mx-auto mb-12 sm:mb-16"
            >
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0F172A] tracking-[-0.01em] leading-[1.12]"
              >
                Who we are
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-[#475569] font-normal leading-relaxed max-w-[640px] mx-auto">
                We are leadership practitioners, academicians, and developmental strategists dedicated to replacing guesswork with serious, evidence-based insight for young minds.
              </p>
            </motion.div>

            {/* Credibility Strip */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-xs divide-y md:divide-y-0 md:divide-x divide-[#E7E5E4] grid grid-cols-1 md:grid-cols-3">
              {credibilityItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 flex items-start gap-4 transition-colors hover:bg-[#FAFAF9]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center shrink-0 text-[#FF6B6B]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#0F172A] tracking-[-0.01em]">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm text-[#64748B] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            2. OUR STORY
        ========================================================= */}
        <section
          aria-labelledby="story-heading"
          className="bg-white py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="our-story"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Story narrative */}
              <div className="lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                  Background and genesis
                </span>
                <h2
                  id="story-heading"
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-2 mb-6"
                >
                  Our story
                </h2>

                <div className="space-y-4 text-base sm:text-lg text-[#334155] leading-relaxed max-w-[65ch]">
                  <p>
                    We have spent our careers inside leading organisations, hiring, assessing and developing leaders. Again and again we saw the same thing: potential is often visible early, but rarely nurtured with intent.
                  </p>
                  <p>
                    Bright young people drifted into choices by default, while others with real leadership and entrepreneurial promise were never shown what they could become.
                  </p>
                  <p>
                    Alderwood Vantage was founded to change that, by giving students and families a clear, evidence-based view of potential, years before the stakes get high.
                  </p>
                </div>
              </div>

              {/* Right Column: Designed Pull-Quote Card (No photo) */}
              <div className="lg:col-span-5">
                <div className="relative bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] p-7 sm:p-9 shadow-xs overflow-hidden">
                  <Quote
                    className="w-16 h-16 text-[#FF6B6B]/15 absolute -top-2 -right-2 rotate-12 pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#FF6B6B] mb-5">
                    <Quote className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <blockquote className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-[-0.01em] leading-snug">
                    “Potential is often visible early, but rarely nurtured with intent.”
                  </blockquote>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                    The founding insight behind Alderwood Vantage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. OUR DISTINCT APPROACH
        ========================================================= */}
        <section
          aria-labelledby="approach-heading"
          className="bg-[#FAFAF9] py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="distinct-approach"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Standard Header Pattern */}
            <div className="text-center max-w-[560px] mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                Methodology
              </span>
              <h2
                id="approach-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-2 mb-3"
              >
                Our distinct approach
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                How we translate rigorous assessment into practical, lifelong student growth.
              </p>
            </div>

            {/* 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {approachPoints.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E7E5E4] p-7 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <span className="block text-sm font-bold text-[#FF6B6B] tracking-wider mb-3">
                      {item.number}
                    </span>
                    <h3 className="text-xl font-bold text-[#0F172A] tracking-[-0.01em] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. OUR PURPOSE
        ========================================================= */}
        <section
          aria-labelledby="purpose-heading"
          className="bg-white py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="our-purpose"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Standard Header Pattern */}
            <div className="text-center max-w-[560px] mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                Orientation and north star
              </span>
              <h2
                id="purpose-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-2 mb-3"
              >
                Our purpose
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Empowering every young learner to discover their trajectory and prepare purposefully.
              </p>
            </div>

            {/* Two Equal-Height Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Vision Card */}
              <div className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] p-7 sm:p-9 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E5E4] flex items-center justify-center text-[#FF6B6B] mb-5">
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                    Vision
                  </span>
                  <h3 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] tracking-[-0.01em] leading-snug mt-3 mb-4">
                    To be a partner in discovering and developing young leaders and innovators across the world.
                  </h3>
                  <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                    Guiding students toward self-awareness, character, and enduring confidence.
                  </p>
                </div>
              </div>

              {/* Mission Card */}
              <div className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] p-7 sm:p-9 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E5E4] flex items-center justify-center text-[#FF6B6B] mb-5">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                    Mission
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-[-0.01em] mt-3 mb-5">
                    Our commitments to schools and families
                  </h3>
                  <ul className="space-y-4">
                    {missionPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2
                          className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="text-sm sm:text-base text-[#334155] font-medium leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. HOW WE WORK (Built strictly from existing facts)
        ========================================================= */}
        <section
          aria-labelledby="how-it-works-heading"
          className="bg-[#FAFAF9] py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="how-we-work"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Standard Header Pattern */}
            <div className="text-center max-w-[560px] mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                Assessment journey
              </span>
              <h2
                id="how-it-works-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-2 mb-3"
              >
                How we work
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                A simple, three-step pathway designed for clarity, depth, and developmental action.
              </p>
            </div>

            {/* 3-Step Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {steps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E7E5E4] p-7 sm:p-8 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#FF6B6B]">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-bold tracking-widest text-[#64748B] uppercase">
                          Step {item.step}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#0F172A] tracking-[-0.01em] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#475569] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            6. CORE VALUES
        ========================================================= */}
        <section
          aria-labelledby="values-heading"
          className="bg-white py-16 sm:py-24 border-b border-[#E7E5E4]"
          id="core-values"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            {/* Standard Header Pattern */}
            <div className="text-center max-w-[560px] mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6B6B]">
                Ethical pillars
              </span>
              <h2
                id="values-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em] mt-2 mb-3"
              >
                Core values
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                The five foundational principles governing our assessments, data governance, and guidance conversations.
              </p>
            </div>

            {/* 5 Values Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {values.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] p-6 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E5E4] flex items-center justify-center text-[#FF6B6B] mb-4">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                        {val.badge}
                      </span>
                      <h3 className="text-lg font-bold text-[#0F172A] tracking-[-0.01em] mb-2">
                        {val.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            7. PRIVACY AND TRUST BAND
        ========================================================= */}
        <section
          aria-labelledby="trust-heading"
          className="bg-[#0F172A] text-white py-16 sm:py-20"
          id="privacy"
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-[720px] mx-auto">
              {/* Trust Icon */}
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FF6B6B] mx-auto mb-6">
                <Lock className="w-6 h-6" aria-hidden="true" />
              </div>

              <h2
                id="trust-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-[-0.01em]"
              >
                Privacy and trust guaranteed
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed max-w-[620px] mx-auto">
                Student data is collected only with parental consent, kept confidential, and never shared without permission.
              </p>

              {/* 3 Explicit Promises */}
              <div className="mt-8 mb-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] shrink-0" aria-hidden="true" />
                  <span>Parental consent required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] shrink-0" aria-hidden="true" />
                  <span>Strictly confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] shrink-0" aria-hidden="true" />
                  <span>Never shared without permission</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white text-sm sm:text-base font-bold shadow-xs hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
                >
                  <span>Explore packages</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#privacy"
                  className="text-sm font-semibold text-slate-300 hover:text-white underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm py-2 px-3"
                >
                  Privacy and parental consent
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          9. MOBILE STICKY BOTTOM BAR (Mobile only, md:hidden)
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
