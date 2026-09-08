"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Flame } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-14 sm:py-20 bg-pop-paper relative">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Main CTA Card with Electric Violet -> Vivid Indigo Gradient */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#7928CA] via-[#6366F1] to-[#4F46E5] border-4 border-pop-ink p-5 sm:p-14 lg:p-16 text-center text-white shadow-neo-xl overflow-hidden">
          {/* Subtle light dot overlay for tactile paper texture */}
          <div className="absolute inset-0 bg-dot-pattern-light opacity-20 pointer-events-none" />

          {/* Ambient colorful neon glows */}
          <div className="absolute -top-16 -left-16 w-60 h-60 bg-pop-pink/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-pop-cyan/35 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Sticker 1 - Top Right */}
          <div className="hidden sm:inline-flex absolute top-6 right-8 rotate-6 items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pop-pink text-white font-black text-xs border-2 border-pop-ink shadow-neo pointer-events-none">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>48,000+ Students Joined</span>
          </div>

          {/* Floating Sticker 2 - Bottom Left */}
          <div className="hidden sm:inline-flex absolute bottom-6 left-8 -rotate-6 items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pop-yellow text-pop-ink font-black text-xs border-2 border-pop-ink shadow-neo pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 fill-pop-ink" />
            <span>94% Clarity Score</span>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pop-yellow text-pop-ink text-[10px] sm:text-sm font-black uppercase tracking-wider mb-5 sm:mb-6 border-2 border-pop-ink shadow-neo rotate-[-1deg]">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pop-ink text-pop-ink" />
              <span>Your Real Superpowers Await</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-sm">
              STOP GUESSING. <br />
              <span className="bg-pop-lime text-pop-ink px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl inline-block mt-2 sm:mt-3 border-2 sm:border-3 border-pop-ink shadow-neo rotate-[1deg] text-base xs:text-lg sm:text-3xl md:text-4xl lg:text-5xl">
                START BUILDING YOUR FUTURE.
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-indigo-100 font-bold max-w-xl mx-auto leading-relaxed px-1">
              Join thousands of students who eliminated career anxiety and discovered what they're truly built for in under 20 minutes.
            </p>

            {/* Primary Action Button */}
            <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-4 sm:gap-5 w-full max-w-sm sm:max-w-none mx-auto">
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4.5 rounded-2xl bg-pop-lime hover:bg-[#bcf200] text-pop-ink font-black text-base sm:text-lg border-3 border-pop-ink shadow-neo-lg hover:shadow-neo hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2.5 sm:gap-3"
              >
                <span>Take The Assessment Now</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </Link>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-black">
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center gap-1 shadow-sm">
                  ⚡ 20 Min Quick Discovery
                </span>
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center gap-1 shadow-sm">
                  🎯 100% Tailored Insights
                </span>
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center gap-1 shadow-sm">
                  🔒 Free • Zero Spam
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
