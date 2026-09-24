"use client";

import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Cpu, BrainCircuit } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="pt-12 sm:pt-20 pb-4 sm:pb-6 bg-[#FBFBF9] relative overflow-hidden" id="about">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FE] px-4 py-1.5 rounded-full mb-3 shadow-xs">
            <span>Why AuraPath</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight leading-tight">
            NOT ANOTHER TEST. <br />
            <span className="underline decoration-[#FF6B6B] underline-offset-8">A CLARITY ENGINE.</span>
          </h2>
          <p className="text-black font-bold text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed px-1">
            Legacy tests ask if you like math or office desks. AuraPath calibrates your natural problem-solving instinct against 2026+ career frontiers.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-14">
          {/* Pillar 1 */}
          <div className="group relative bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-2xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
            {/* Small length accent border */}
            <div className="absolute top-0 left-7 w-12 h-[3px] bg-[#FF6B6B] rounded-full group-hover:w-16 transition-all duration-300" />

            <div>
              <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-black flex items-center justify-center mb-5 mt-1 shadow-xs">
                <BrainCircuit className="w-5 h-5 stroke-[2.2] text-black" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-black">
                Pillar 01
              </span>
              <h3 className="text-lg sm:text-xl font-black text-black mt-1">
                Zero Math, Zero Rote
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-black mt-2.5 leading-relaxed">
                No geometry formulas, no negative marking. We measure your real-world problem-solving reflexes through scenario-based dilemmas.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-black">Instinctive Dilemmas</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="group relative bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-2xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
            {/* Small length accent border */}
            <div className="absolute top-0 left-7 w-12 h-[3px] bg-[#FF6B6B] rounded-full group-hover:w-16 transition-all duration-300" />

            <div>
              <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-black flex items-center justify-center mb-5 mt-1 shadow-xs">
                <Cpu className="w-5 h-5 stroke-[2.2] text-black" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-black">
                Pillar 02
              </span>
              <h3 className="text-lg sm:text-xl font-black text-black mt-1">
                Validated Psychometrics
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-black mt-2.5 leading-relaxed">
                Built on Big Five and Holland RIASEC matrices to deliver an authentic cognitive archetype and 5-dimensional radar signature.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-black">Diagnostic Rigor</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="group relative bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-2xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
            {/* Small length accent border */}
            <div className="absolute top-0 left-7 w-12 h-[3px] bg-[#FF6B6B] rounded-full group-hover:w-16 transition-all duration-300" />

            <div>
              <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-black flex items-center justify-center mb-5 mt-1 shadow-xs">
                <ShieldCheck className="w-5 h-5 stroke-[2.2] text-black" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-black">
                Pillar 03
              </span>
              <h3 className="text-lg sm:text-xl font-black text-black mt-1">
                Zero Coaching Spam
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-black mt-2.5 leading-relaxed">
                We never sell your contact info to aggressive coaching centers. Your diagnostic report is private, transparent, and yours.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-bold text-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-black">100% Student Privacy</span>
            </div>
          </div>
        </div>

        {/* Live Explorer Stats Strip */}
        <div className="bg-[#1A1A1D] text-white rounded-2xl shadow-lg p-5 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto text-center lg:text-left">
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">48,290+</div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#A9B4E8] mt-0.5 uppercase tracking-wider">Students Guided</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">180+</div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#A9B4E8] mt-0.5 uppercase tracking-wider">2026+ Careers</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">0</div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#A9B4E8] mt-0.5 uppercase tracking-wider">Formulas Used</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">99.4%</div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#A9B4E8] mt-0.5 uppercase tracking-wider">Diagnostic Fit</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            <Link
              href="/quests"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-black hover:bg-[#EEF1FB] font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Explore The 4 Modules</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
