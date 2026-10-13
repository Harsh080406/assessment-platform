"use client";

import { AlertTriangle, Clock, ZapOff, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function VantageProblemSection() {
  const problems = [
    {
      num: "01",
      badge: "Peer Pressure & Marks",
      icon: Users,
      iconBg: "bg-[#FFF2EE]",
      iconColor: "text-[#FF6B6B]",
      borderColor: "border-[#FF6B6B]",
      title: "Decisions Driven by Marks",
      statement: "Picking streams based on marks or peer pressure.",
      elaboration:
        "High test scores don't mean you'll love the career. Most students commit to rigorous degrees before discovering what they actually enjoy or excel at.",
    },
    {
      num: "02",
      badge: "Superficial Testing",
      icon: Clock,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#6366F1]",
      borderColor: "border-[#6366F1]",
      title: "10-Minute Quizzes",
      statement: "10-minute quizzes that hand out generic labels.",
      elaboration:
        "Quick online tests spit out shallow multiple-choice answers without measuring real-world problem solving, creative thinking, or natural instincts.",
    },
    {
      num: "03",
      badge: "The Leadership Blindspot",
      icon: ZapOff,
      iconBg: "bg-[#FFF8EE]",
      iconColor: "text-[#F59E0B]",
      borderColor: "border-[#F59E0B]",
      title: "Ignoring Real Leadership",
      statement: "Advice that prepares you for exams, not the real world.",
      elaboration:
        "Modern careers reward initiative, resilience, and decisive judgment—qualities that conventional career tests and school counseling completely ignore.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-[#FBFBF9] relative overflow-hidden" id="the-problem">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Why Traditional Career Advice <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">Fails Ambitious Students.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475569] font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
            The transition from high school to adulthood is too pivotal to base on test scores or generic internet quizzes.
          </p>
        </div>

        {/* 3 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Accent top indicator */}
                <div className={`absolute top-0 left-6 w-12 h-[3px] ${item.borderColor} bg-current rounded-full group-hover:w-20 transition-all duration-300`} />

                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between mb-5 mt-1">
                    <div className={`w-11 h-11 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-mono text-xs font-black text-[#94A3B8]">
                      POINT {item.num}
                    </span>
                  </div>

                  {/* Headline Statement (from PDF) */}
                  <h3 className="text-lg sm:text-xl font-black text-[#0F172A] leading-snug mb-3">
                    {item.statement}
                  </h3>

                  {/* Elaboration */}
                  <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                    {item.elaboration}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                    {item.badge}
                  </span>
                  <span className="text-xs font-bold text-[#FF6B6B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    The Problem
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
