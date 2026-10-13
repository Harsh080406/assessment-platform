"use client";

import { Shield, Sparkles, CheckCircle2, Lock, Heart, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OurStorySection() {
  const approaches = [
    {
      title: "Rigorous",
      desc: "Assessment framework reviewed and validated by renowned academicians.",
    },
    {
      title: "Leadership-led",
      desc: "Built by professionals experienced in leadership assessment and development.",
    },
    {
      title: "Personal",
      desc: "Every report is explained in conversation, never just emailed.",
    },
    {
      title: "Honest",
      desc: "We show potential and gaps with equal clarity.",
    },
  ];

  const values = [
    "Integrity",
    "Student-first",
    "Evidence over opinion",
    "Confidentiality",
    "Growth mindset",
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FBFBF9] relative overflow-hidden" id="about-us">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        
        {/* Story Banner Grid */}
        <div className="bg-white border border-[#CBD5E1] rounded-3xl p-7 sm:p-10 lg:p-14 shadow-sm mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FED7CC] text-[11px] font-black uppercase tracking-wider text-[#FF6B6B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About Alderwood Vantage</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
                Our Story: Why We Founded <br />
                <span className="text-[#FF6B6B]">Alderwood Vantage.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#334155] font-semibold leading-relaxed">
                We have spent our careers inside leading organisations, hiring, assessing and developing leaders. Again and again we saw the same thing: potential is often visible early, but rarely nurtured with intent.
              </p>

              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                Bright young people drifted into choices by default, while others with real leadership and entrepreneurial promise were never shown what they could become. Alderwood Vantage was founded to change that, by giving students and families a clear, evidence-based view of potential, years before the stakes get high.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#FF6B6B] hover:text-[#EE5252] hover:underline"
                >
                  <span>Read our complete founding background</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Vision & Mission Card on Right */}
            <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md border border-[#1E293B]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B6B] block mb-1">
                  Our Vision
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-snug">
                  To be a partner in discovering and developing young leaders and innovators across the world.
                </p>
              </div>

              <div className="pt-4 border-t border-[#334155] space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] block">
                  Our Mission
                </span>
                <div className="space-y-2.5 text-xs text-[#CBD5E1] font-medium">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
                    <span>To replace guesswork with rigorous, evidence-based insight.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
                    <span>To help students become future-ready for any path: entrepreneur, family business leader or professional.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
                    <span>To make serious, credible guidance accessible to schools, institutions and families.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Our Approach (4 Points) & Values & Privacy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Our Approach (4 Points) */}
          <div className="lg:col-span-8 bg-white border border-[#CBD5E1] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#4F46E5] block mb-1">
                Methodology
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                Our Approach
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {approaches.map((app) => (
                <div key={app.title} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                    <h4 className="text-sm font-black text-[#0F172A]">
                      {app.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">
                    {app.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Our Values Bar */}
            <div className="pt-4 border-t border-[#F1F5F9]">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B] block mb-2.5">
                Our Values
              </span>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => (
                  <span
                    key={val}
                    className="px-3 py-1 rounded-lg bg-[#FFF2EE] text-[#0F172A] border border-[#FED7CC] text-xs font-bold"
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Privacy & Trust Callout */}
          <div className="lg:col-span-4 bg-[#ECFDF5] border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-2xs">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
                Trust &amp; Governance
              </span>
              <h3 className="text-xl font-black text-emerald-950 tracking-tight mb-2">
                Privacy and Trust
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900 font-semibold leading-relaxed">
                &ldquo;Student data is collected only with parental consent, kept confidential, and never shared without permission.&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Zero-Spam Parental Promise</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
