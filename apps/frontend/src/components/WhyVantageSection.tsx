"use client";

import { Layers, GraduationCap, Briefcase, Compass, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function WhyVantageSection() {
  const pillars = [
    {
      num: "01",
      title: "Depth, not a quick quiz.",
      subtitle: "A complete assessment across 4 dimensions.",
      description:
        "We evaluate your spark, personality, aptitude, and problem-solving through 4 calibrated modules—never rushed shortcuts.",
      icon: Layers,
      color: "text-[#FF6B6B]",
      bg: "bg-[#FFF2EE]",
      badge: "4 Core Lenses",
    },
    {
      num: "02",
      title: "Academically validated.",
      subtitle: "Developed with PhD academicians.",
      description:
        "Built on verified behavioral psychology and cognitive science, giving you clear, reliable, and trustworthy insights.",
      icon: GraduationCap,
      color: "text-[#0284C7]",
      bg: "bg-[#F0F9FF]",
      badge: "Scientific Rigor",
    },
    {
      num: "03",
      title: "Leadership-led.",
      subtitle: "Designed by top corporate & HR leaders.",
      description:
        "Crafted by executive mentors who know firsthand what top employers, modern founders, and venture leaders actually look for.",
      icon: Briefcase,
      color: "text-[#6366F1]",
      bg: "bg-[#EEF2FF]",
      badge: "Executive Insight",
    },
    {
      num: "04",
      title: "Beyond \"what to study.\"",
      subtitle: "A practical 5-year roadmap.",
      description:
        "We don't just name a degree. You get an actionable multi-year roadmap with skill milestones, projects, and mentorship.",
      icon: Compass,
      color: "text-[#10B981]",
      bg: "bg-[#ECFDF5]",
      badge: "5-Year Trajectory",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-[#E2E8F0] relative overflow-hidden" id="why-vantage">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
              Raising leaders, <br className="hidden sm:inline" />
              <span className="text-[#FF6B6B]">not just employees.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#475569] font-semibold mt-3 leading-relaxed">
              Designed from the boardroom down and validated by academic research to provide serious, credible clarity.
            </p>
          </div>

          <Link
            href="/packages"
            className="self-start lg:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs sm:text-sm font-extrabold shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Explore Packages</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-[#FBFBF9] border border-[#CBD5E1] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:bg-white hover:border-[#FF6B6B]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  {/* Top Bar with Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="font-mono text-xs font-black text-[#94A3B8]">
                      {item.num}
                    </span>
                  </div>

                  {/* Title & Subtitle from PDF */}
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block mb-1">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-black text-[#0F172A] tracking-tight leading-snug mb-1.5">
                    {item.title}
                  </h3>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#FF6B6B] leading-snug mb-3">
                    {item.subtitle}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Validated Standard</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
