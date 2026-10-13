"use client";

import { Rocket, Landmark, Briefcase, Network, ArrowRight, ShieldCheck, Compass } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForEveryPathSection() {
  const paths = [
    {
      title: "Build Your Own Venture",
      role: "The Founder & Innovator Track",
      description:
        "Calibrate risk tolerance, creative agility, initiative, and commercial instincts needed to take ideas from zero to scale.",
      icon: Rocket,
      badge: "Entrepreneurial",
      badgeColor: "bg-[#FFF2EE] text-[#FF6B6B] border-[#FED7CC]",
      highlights: ["Initiative & Autonomy", "Resilience Under Ambiguity", "Creative Problem Solving"],
    },
    {
      title: "Lead the Family Business",
      role: "The Generational Steward Track",
      description:
        "Evaluate strategic decision-making, stakeholder influence, operational stewardship, and enterprise modernization capability.",
      icon: Landmark,
      badge: "Enterprise",
      badgeColor: "bg-[#FFF8EE] text-[#F59E0B] border-[#FDE68A]",
      highlights: ["Generational Stewardship", "Commercial Acumen", "Ethical Influence"],
    },
    {
      title: "Grow a Professional Career",
      role: "The Executive & Specialist Track",
      description:
        "Map deep domain aptitude, analytical horsepower, collaborative execution, and upward mobility in global enterprises.",
      icon: Briefcase,
      badge: "Corporate Leadership",
      badgeColor: "bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FE]",
      highlights: ["Analytical Horsepower", "Executive Presence", "Strategic Execution"],
    },
    {
      title: "Hybrid & Multipotentialite",
      role: "The Adaptive Leader Track",
      description:
        "Unpack multifaceted talents combining technical precision, creative strategy, and cross-functional leadership agility.",
      icon: Network,
      badge: "Interdisciplinary",
      badgeColor: "bg-[#F0FDF4] text-emerald-700 border-emerald-200",
      highlights: ["Learning Agility", "Cross-Domain Synergy", "Adaptive Instincts"],
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FBFBF9] relative overflow-hidden" id="pathways">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
            See Where They Stand. <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">And Where They Can Go.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-medium mt-2.5 max-w-2xl mx-auto leading-relaxed">
            &ldquo;Whether your child will build a venture, lead the family business, or grow a professional career, Alderwood Vantage helps them see where they stand and where they can go.&rdquo;
          </p>
        </div>

        {/* 4 Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {paths.map((path, idx) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#FF6B6B]/60 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-4 h-4 text-[#FF6B6B]" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${path.badgeColor}`}>
                      {path.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight mb-0.5">
                    {path.title}
                  </h3>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2.5">
                    {path.role}
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#475569] font-medium leading-relaxed mb-4">
                    {path.description}
                  </p>

                  {/* Highlights Pill List */}
                  <div className="space-y-1.5 pt-2.5 border-t border-[#F1F5F9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Core Dimension Focus:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-[11px] font-medium bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    Calibrated in Leadership Blueprint
                  </span>
                  <Link
                    href="/packages"
                    className="text-xs font-extrabold text-[#FF6B6B] hover:text-[#EE5252] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Pathway Fit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
