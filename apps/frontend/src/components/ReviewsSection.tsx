"use client";

import { Star, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewsSection() {
  const reviews = [
    {
      name: "Priya Sharma",
      role: "Parent of Grade 11 Student",
      location: "New Delhi",
      avatarBg: "bg-[#FFF2EE] text-[#FF6B6B]",
      initials: "PS",
      rating: 5,
      tag: "Career Clarity",
      headline: "“Eliminated the guesswork and gave us peace of mind.”",
      quote:
        "Like most parents, we were anxious about whether our daughter should pursue medicine or commerce. Alderwood Vantage didn’t just spit out a generic score—it mapped her analytical stamina, creative problem-solving, and natural inclinations with remarkable precision. The report sparked our first productive, calm family conversation about college.",
      outcome: "Discovered Bio-Informatics & Health Data Science Fit",
    },
    {
      name: "Kabir Sengupta",
      role: "First-Year University Student",
      location: "Bengaluru",
      avatarBg: "bg-[#EEF2FF] text-[#4F46E5]",
      initials: "KS",
      rating: 5,
      tag: "Self-Discovery",
      headline: "“Showed me how I actually think under real pressure.”",
      quote:
        "Standard school exams only test how much you can memorize. The Alderwood Vantage assessment presented real scenarios that tested how I prioritize decisions and handle ambiguity. The 5-Year Leadership Blueprint gave me concrete confidence to choose my dual degree without second-guessing.",
      outcome: "Validated Economics & Computational Strategy Path",
    },
    {
      name: "Vikramaditya Singhal",
      role: "Enterprise Owner & Father of 18-Year-Old",
      location: "Ahmedabad",
      avatarBg: "bg-[#FFF8EE] text-[#D97706]",
      initials: "VS",
      rating: 5,
      tag: "Generational Leadership",
      headline: "“Nuanced, academically rigorous, and surprisingly honest.”",
      quote:
        "I wanted an objective perspective on whether my son had the commercial temperament for enterprise leadership or if he'd thrive better pioneering his own tech venture. The depth of psychometric rigor here blew away any 15-minute quiz we've seen. It is a genuine, actionable roadmap.",
      outcome: "Structured 5-Year Entrepreneurial & Enterprise Track",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FBFBF9] relative overflow-hidden" id="reviews">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-tight"
          >
            Trusted by Families. <br className="hidden sm:inline" />
            <span className="text-[#FF6B6B]">Proven for Next-Generation Leaders.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-xs sm:text-sm text-[#475569] font-medium mt-3 max-w-2xl mx-auto leading-relaxed"
          >
            See how parents and students used the Alderwood Vantage Psychometric Assessment to eliminate career anxiety, uncover hidden strengths, and gain clear direction.
          </motion.p>
        </div>

        {/* 3 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#FF6B6B]/60 transition-all duration-200 group relative"
            >
              {/* Top Row: Stars + Tag */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                    {rev.tag}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-sm sm:text-[15px] font-bold text-[#0F172A] leading-snug mb-3">
                  {rev.headline}
                </h3>

                {/* Review Body */}
                <p className="text-xs sm:text-[13px] text-[#475569] font-medium leading-relaxed mb-5">
                  {rev.quote}
                </p>
              </div>

              {/* Bottom: Outcome Tag & Reviewer Identity */}
              <div className="pt-4 border-t border-[#F1F5F9] space-y-3.5">
                {/* Result Highlight */}
                <div className="flex items-start gap-1.5 bg-[#FAFBFD] border border-[#E2E8F0] rounded-lg p-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] font-semibold text-[#334155] leading-tight">
                    <span className="text-[#64748B] font-bold">Outcome: </span>
                    {rev.outcome}
                  </div>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full ${rev.avatarBg} font-black text-xs flex items-center justify-center shrink-0 shadow-2xs border border-black/5`}
                  >
                    {rev.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                        {rev.name}
                      </h4>
                      <span title="Verified Assessment" className="inline-flex">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B6B] shrink-0" />
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium truncate">
                      {rev.role} • {rev.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>



      </div>
    </section>
  );
}
