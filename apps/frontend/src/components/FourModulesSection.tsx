"use client";

import { Sparkles, Brain, Cpu, Target, FileText, CheckCircle2, ArrowRight, Gauge, Layers } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import StartAssessmentButton from "./StartAssessmentButton";

export default function FourModulesSection() {
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
      focus: ["Vocational Interests", "Intrinsic Motivators", "Substantive Curiosity"],
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
      focus: ["Big Five Trait Calibrations", "Collaboration Dynamics", "Stress Tolerance"],
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
      focus: ["Analytical Deduction", "Numerical Reasoning", "Spatial & Verbal Precision"],
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
      focus: ["Situational Judgment Scenarios", "Commercial Acumen", "Resilient Execution"],
    },
  ];

  const blueprintOutputs = [
    {
      title: "Leader's Lens",
      summary: "How the student shows up today as a leader and innovator.",
      detail: "Identifies primary behavioral instincts, problem-solving reflexes, and where their natural leadership presence emerges.",
    },
    {
      title: "Pathway Fit",
      summary: "Suitability across Venture / Family Business / Professional / Hybrid.",
      detail: "Quantifies affinity against four major real-world trajectories to provide grounded, bias-free direction.",
    },
    {
      title: "Gap-to-Ready Meter",
      summary: "Where the student stands today against what each pathway demands.",
      detail: "Benchmarks current maturity and highlights clear, actionable skill-building frontiers without ever applying rigid labels.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-[#E2E8F0] relative overflow-hidden" id="modules">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FED7CC] text-[11px] font-black uppercase tracking-wider text-[#FF6B6B] mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>The 4 Modules</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            One assessment. <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">Four lenses on potential.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475569] font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
            Together, the four lenses give a complete picture that no single test can.
          </p>
        </div>

        {/* The 4 Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-20">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-[#FBFBF9] border border-[#CBD5E1] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:bg-white hover:border-[#FF6B6B]/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div>
                  {/* Top Bar with Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${mod.bg} ${mod.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="font-mono text-xs font-black text-[#94A3B8]">
                      MODULE {mod.num}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-1">
                    {mod.name}
                  </h3>
                  <div className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider mb-3">
                    {mod.tagline}
                  </div>
                  <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed mb-6">
                    {mod.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#E2E8F0]">
                    {mod.focus.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs font-semibold text-[#334155]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#64748B]">
                    Calibrated Matrix
                  </span>
                  <span className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#FF6B6B] transition-colors">
                    Lense {mod.num} →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* THE OUTPUT: YOUR LEADERSHIP BLUEPRINT */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-7 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl border border-[#1E293B]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#FF6B6B]/20 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-[#334155]">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#FF6B6B] block mb-1">
                  The Final Deliverable
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  The Output: Your Leadership Blueprint
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-white shrink-0 self-start sm:self-auto">
                <FileText className="w-4 h-4 text-[#FF6B6B]" />
                <span>Jargon-Free Executive Report</span>
              </div>
            </div>

            {/* 3 Blueprint Features from PDF */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-8 sm:pb-10">
              {blueprintOutputs.map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xs">
                  <div className="w-9 h-9 rounded-lg bg-[#FF6B6B] text-white flex items-center justify-center font-black text-sm mb-4">
                    ✓
                  </div>
                  <h4 className="text-lg font-black text-white mb-1.5 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs font-bold text-[#FF6B6B] mb-2 leading-relaxed">
                    {item.summary}
                  </p>
                  <p className="text-xs text-[#94A3B8] font-normal leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Together, the four lenses give a complete picture that no single test can.
              </p>
              <StartAssessmentButton
                label="Launch Assessment Blueprint"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg shrink-0"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
