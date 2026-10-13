"use client";

import { ArrowRight, Sparkles, UserPlus, PhoneCall, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ClosingCtaSection() {
  const { openAuth } = useAuth();

  return (
    <section className="py-16 sm:py-24 bg-[#0F172A] relative overflow-hidden text-white" id="cta">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-radial from-[#FF6B6B]/25 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-radial from-[#6366F1]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-wider text-[#FF6B6B] mb-5 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B6B]" />
          <span>Find your vantage</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-4">
          Give your child a clearer view <br className="hidden sm:inline" />
          <span className="text-[#FF6B6B]">of their future.</span>
        </h2>

        <p className="text-sm sm:text-lg text-[#CBD5E1] font-semibold max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Raising leaders, not just employees. Take the comprehensive, academically validated four-module assessment today and receive your personalized Leadership Blueprint.
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-8">
          <button
            onClick={() => openAuth("signup")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-[54px] sm:h-[60px] px-8 sm:px-10 text-sm sm:text-base font-black bg-[#FF6B6B] hover:bg-[#F95858] text-white rounded-xl sm:rounded-2xl shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>Begin Assessment Today</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-[54px] sm:h-[60px] px-7 sm:px-8 text-sm sm:text-base font-black bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl sm:rounded-2xl transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Speak with an Advisor</span>
          </Link>
        </div>

        {/* Credibility reassurance badge strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#94A3B8] font-bold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Parental Consent Required
          </span>
          <span className="text-[#334155] hidden sm:inline">•</span>
          <span>DDI Master Facilitator Verified</span>
          <span className="text-[#334155] hidden sm:inline">•</span>
          <span>100% Confidential Data</span>
        </div>

      </div>
    </section>
  );
}
