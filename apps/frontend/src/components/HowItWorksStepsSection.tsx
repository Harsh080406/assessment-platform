"use client";

import { UserCheck, Laptop, Cpu, FileCheck, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorksStepsSection() {
  const steps = [
    {
      num: "01",
      title: "Register",
      description: "Create the student's profile. Parental consent is taken up front, because we handle sensitive information with care.",
      icon: UserCheck,
      badge: "Parental Consent",
    },
    {
      num: "02",
      title: "Take the assessment",
      description: "The student completes the four-module assessment online, at their own pace.",
      icon: Laptop,
      badge: "Self-Paced Online",
    },
    {
      num: "03",
      title: "Expert analysis",
      description: "Responses are scored using our validated framework and reviewed by renowned academicians.",
      icon: Cpu,
      badge: "Academic Review",
    },
    {
      num: "04",
      title: "Receive your Leadership Blueprint",
      description: "A clear, jargon-free report covering interests, personality, aptitude and leadership competencies, with pathway recommendations.",
      icon: FileCheck,
      badge: "Jargon-Free Report",
    },
    {
      num: "05",
      title: "Get guided",
      description: "Depending on your package, meet a trained counsellor and receive a personalised 5-year Leadership Roadmap.",
      icon: Compass,
      badge: "Personalised Roadmap",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FBFBF9] relative overflow-hidden" id="how-it-works">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#E0E7FE] text-[11px] font-black uppercase tracking-wider text-[#4F46E5] mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>The 5-Step Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            From uncertainty to a <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">clear vantage in five steps.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475569] font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
            A structured, respectful process built around student growth, academic validation, and parental involvement.
          </p>
        </div>

        {/* 5-Step Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5 mb-12 sm:mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#FF6B6B]/60 transition-all duration-200 group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-black text-[#FF6B6B] bg-[#FFF2EE] px-2.5 py-1 rounded-md border border-[#FED7CC]">
                      STEP {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#0F172A] leading-snug mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#475569] font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F1F5F9]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    {step.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Philosophy Callout: A note on how we see students */}
        <div className="relative rounded-3xl bg-white border border-[#CBD5E1] p-6 sm:p-9 lg:p-10 shadow-sm overflow-hidden w-full">
          {/* Top Bar: Eyebrow Badge & Academic Charter Tag */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F1F5F9]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FED7CC] text-xs font-bold text-[#E05353] shadow-2xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#FF6B6B] shrink-0" />
              <span className="uppercase tracking-wider font-extrabold text-[11px]">
                Our Founding Perspective
              </span>
              <span className="text-[#FED7CC]">•</span>
              <span className="text-[#475569] font-bold text-[11px]">
                The Vantage Growth Charter
              </span>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Academically Validated • Zero Fixed Labels</span>
            </div>
          </div>

          {/* Core Manifesto: Wide Editorial Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center py-5 sm:py-6 border-b border-[#F1F5F9]">
            <div className="lg:col-span-8 space-y-2">
              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FF6B6B]">
                A Note On How We See Students
              </div>
              <blockquote className="text-lg sm:text-2xl lg:text-3xl font-black text-[#0F172A] tracking-[-0.02em] leading-snug">
                &ldquo;Teenagers are still growing. Our results highlight{" "}
                <span className="text-[#FF6B6B]">emerging strengths</span> and development areas,{" "}
                <span className="underline decoration-[#FF6B6B]/60 decoration-wavy underline-offset-6">
                  never fixed labels
                </span>
                .&rdquo;
              </blockquote>
            </div>

            <div className="lg:col-span-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 sm:p-5">
              <p className="text-xs sm:text-[13px] text-[#334155] font-medium leading-relaxed">
                We reject tests that box students into rigid categories. We map trajectory, potential, and capabilities that can be nurtured with intent over the next five years.
              </p>
            </div>
          </div>

          {/* 3 Pillars Grid: Full Width */}
          <div className="relative z-10 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-[#FAFAF9] hover:bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 sm:p-5 transition-all shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Dynamic Trajectory
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-[#475569] font-medium leading-relaxed">
                Strengths evolve over time; we measure growth potential, not limits.
              </p>
            </div>

            <div className="bg-[#FAFAF9] hover:bg-white border border-[#E2E8F0] hover:border-[#FED7CC] rounded-2xl p-4 sm:p-5 transition-all shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shrink-0" />
                <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Nurtured With Intent
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-[#475569] font-medium leading-relaxed">
                Leadership competencies are built systematically through practice.
              </p>
            </div>

            <div className="bg-[#FAFAF9] hover:bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 sm:p-5 transition-all shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shrink-0" />
                <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Zero Pigeonholing
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-[#475569] font-medium leading-relaxed">
                Empowering students to discover who they can become.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
