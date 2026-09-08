"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Brain, ShieldCheck, HeartHandshake, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-14 sm:py-28 bg-pop-paper relative overflow-hidden border-b-2 border-pop-ink" id="about">
      {/* Background Dot Texture */}
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase bg-pop-lime text-pop-ink border-2 border-pop-ink px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-neo rotate-[-1deg]">
            <Sparkles className="w-4 h-4" />
            <span>Why Pathfinder Exists</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-pop-ink mt-4 tracking-tight leading-tight">
            NOT ANOTHER BORING TEST. <br />
            <span className="text-pop-violet">A REAL CLARITY MACHINE.</span>
          </h2>
          <p className="text-slate-700 font-bold text-sm sm:text-lg mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed px-1">
            Most career tests still ask if you like algebra or want to work in an office. We built Pathfinder because 2026+ careers demand natural instincts, cognitive agility, and real self-awareness.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 mb-12 sm:mb-16">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-4 border-pop-ink shadow-neo-lg hover:shadow-neo-xl transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pop-cyan border-2 border-pop-ink shadow-neo flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6">
                ⚡
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Pillar 01
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-pop-ink mt-1">
                Zero Math, Zero Formulas
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2.5 sm:mt-3 leading-relaxed">
                Forget exam stress. There are no right or wrong answers, no trigonometry questions, and no negative marking. We measure your subconscious problem-solving instincts through intuitive real-world dilemmas.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 pt-4 border-t-2 border-slate-100 flex items-center gap-2 text-xs font-black text-pop-ink">
              <span className="w-2 h-2 rounded-full bg-pop-cyan" />
              <span>100% Intuitive Gameplay</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-4 border-pop-ink shadow-neo-lg hover:shadow-neo-xl transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pop-pink border-2 border-pop-ink shadow-neo flex items-center justify-center text-xl sm:text-2xl text-white mb-5 sm:mb-6">
                🧠
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Pillar 02
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-pop-ink mt-1">
                Validated Psychometrics
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2.5 sm:mt-3 leading-relaxed">
                Calibrated on established Big Five personality dynamics and Holland RIASEC interest matrices. You receive an authentic cognitive archetype and 5-dimensional radar signature—not generic astrology.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 pt-4 border-t-2 border-slate-100 flex items-center gap-2 text-xs font-black text-pop-ink">
              <span className="w-2 h-2 rounded-full bg-pop-pink" />
              <span>Clinical Diagnostic Rigor</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-4 border-pop-ink shadow-neo-lg hover:shadow-neo-xl transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pop-lime border-2 border-pop-ink shadow-neo flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6">
                🛡️
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Pillar 03
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-pop-ink mt-1">
                Zero Coaching Spam
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2.5 sm:mt-3 leading-relaxed">
                We believe career guidance should be protected. We never sell your contact info to aggressive coaching institutes or colleges. Your discovery report is private, transparent, and completely yours.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 pt-4 border-t-2 border-slate-100 flex items-center gap-2 text-xs font-black text-pop-ink">
              <span className="w-2 h-2 rounded-full bg-pop-lime" />
              <span>Strict Student Privacy</span>
            </div>
          </div>
        </div>

        {/* Live Explorer Stats Strip */}
        <div className="bg-pop-ink text-white rounded-2xl sm:rounded-3xl border-4 border-pop-ink p-5 sm:p-8 shadow-neo-xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto text-center lg:text-left">
            <div>
              <div className="text-2xl sm:text-4xl font-black text-pop-lime">48,290+</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider">Students Guided</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-pop-cyan">180+</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider">2026+ Careers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-pop-yellow">0</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider">Formulas Used</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-pop-pink">99.4%</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider">Fit Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Link
              href="/assessment"
              className="w-full sm:w-auto px-5 sm:px-7 py-3.5 rounded-2xl bg-pop-lime text-pop-ink font-black text-xs sm:text-sm hover:bg-[#b8e600] transition-all flex items-center justify-center gap-2 shadow-neo"
            >
              <span>Take Free Discovery Quiz</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
            <Link
              href="/quests"
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl bg-slate-800 text-white font-black text-xs sm:text-sm hover:bg-slate-700 transition-all border border-slate-600 flex items-center justify-center gap-2"
            >
              <span>See The 4 Quests</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
