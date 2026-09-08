"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="pt-4 sm:pt-6 pb-12 sm:pb-16 bg-[#FBFBF9] relative">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#1A1A1D] text-white p-8 sm:p-16 text-center shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A9B4E8] text-black text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
              <Compass className="w-3.5 h-3.5 stroke-[2.2] text-black" />
              <span className="text-black">Calibrate Your Blueprint</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white font-[family-name:var(--font-dm-sans)]">
              STOP GUESSING. <br />
              <span className="text-white underline decoration-[#A9B4E8] underline-offset-8">
                ARCHITECT YOUR TRAJECTORY.
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[#A9B4E8] font-medium max-w-lg mx-auto leading-relaxed px-1">
              Join 48,000+ students who eliminated career paralysis and discovered their authentic strengths in 20 minutes.
            </p>

            {/* Primary Action Button */}
            <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto">
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-7 sm:px-10 py-3.5 rounded-xl bg-white text-black hover:bg-[#EEF1FB] font-extrabold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
              >
                <span className="text-black font-extrabold">Begin Assessment</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-black" />
              </Link>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-[#141416] text-[#A9B4E8] border border-[#2E2E32]">
                  20 Min Adaptive
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#141416] text-[#A9B4E8] border border-[#2E2E32]">
                  180+ Horizons
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#141416] text-[#A9B4E8] border border-[#2E2E32]">
                  100% Private
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
