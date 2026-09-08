"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, HeartHandshake, Flame, ShieldAlert, Sparkles, Check, X } from "lucide-react";
import Link from "next/link";

interface MythFact {
  id: string;
  topic: string;
  myth: string;
  mythSpeaker: string;
  reality: string;
  realityProof: string;
  stat: string;
  emoji: string;
}

const COMPARISONS: MythFact[] = [
  {
    id: "engineering",
    topic: "The Default Trap",
    myth: "“Just study Computer Science or Engineering first. You can always do what you love later.”",
    mythSpeaker: "Uncle at every family gathering",
    reality: "Cognitive burn-out happens when innate divergent minds are forced into purely algorithmic rote drills.",
    realityProof: "Over 71% of engineering grads never work in technical coding roles. 4 years lost to disengagement.",
    stat: "71% Disengagement",
    emoji: "🛑",
  },
  {
    id: "humanities",
    topic: "The Salary Fallacy",
    myth: "“Design, Psychology, and Humanities have no job security or serious salaries.”",
    mythSpeaker: "WhatsApp family group",
    reality: "AI requires prompt architects, behavioral researchers, and spatial UX directors—drawing heavily on human psychology.",
    realityProof: "Top Spatial UX & Behavioral Tech architects average $140,000+ early in their career.",
    stat: "$140k+ Avg Horizon",
    emoji: "📈",
  },
  {
    id: "pressure",
    topic: "The Marks Dogma",
    myth: "“If you score 95% in Board Exams, you MUST take Science. Commerce is only for average scores.”",
    mythSpeaker: "Outdated School Tradition",
    reality: "Exam memory has almost zero correlation with entrepreneurial or systems-scaling instinct.",
    realityProof: "Top venture capitalists and corporate strategists scored across diverse distributions but possessed high economic curiosity.",
    stat: "93.4% Validity Matrix",
    emoji: "⚡",
  },
];

export default function StudentParentDecoder() {
  const [activeTab, setActiveTab] = useState<string>("engineering");
  const activeData = COMPARISONS.find((c) => c.id === activeTab) || COMPARISONS[0];

  return (
    <section className="pt-4 sm:pt-8 pb-16 sm:pb-24 bg-pop-paper relative overflow-hidden" id="decoder">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Unified Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-pop-violet transition-colors mb-4 sm:mb-5 bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-pop-ink shadow-neo"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black tracking-widest uppercase bg-pop-pink text-white border-2 border-pop-ink px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-neo rotate-[1deg]">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Bridge The Generation Gap</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-pop-ink mt-3 sm:mt-4 tracking-tight">
            PARENT VS. YOU: REALITY DECODER
          </h1>
          <p className="text-slate-700 font-bold text-sm sm:text-lg mt-2 sm:mt-3 max-w-2xl mx-auto px-1 leading-relaxed">
            Replace high-stress dinner table arguments with objective cognitive evidence. See how outdated myths pushed onto students stack up against validated 2026+ psychometric reality.
          </p>

          {/* Interactive Switcher Buttons — Swipeable on Mobile */}
          <div className="mt-6 sm:mt-8 flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar py-1 gap-2 sm:gap-3 justify-start sm:justify-center px-1">
            {COMPARISONS.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setActiveTab(comp.id)}
                className={`shrink-0 text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black border-2 border-pop-ink transition-all ${
                  activeTab === comp.id
                    ? "bg-pop-lime text-pop-ink shadow-neo scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                {comp.emoji} {comp.topic}
              </button>
            ))}
          </div>
        </div>

        {/* Side by Side Contrast Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* Myth Side */}
          <div className="bg-red-50 border-3 sm:border-4 border-pop-ink rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-neo-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-200/50 rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <span className="px-3 py-1 rounded-xl bg-red-500 text-white font-black text-[10px] sm:text-xs uppercase border-2 border-pop-ink shadow-neo flex items-center gap-1">
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  Outdated Advice
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 italic">
                  {activeData.mythSpeaker}
                </span>
              </div>

              <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 sm:mt-3 leading-snug">
                {activeData.myth}
              </p>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Causes 4+ years of career dissatisfaction and misalignment</span>
            </div>
          </div>

          {/* Reality / Science Side */}
          <div className="bg-pop-lime border-3 sm:border-4 border-pop-ink rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-neo-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/40 rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <span className="px-3 py-1 rounded-xl bg-pop-ink text-pop-lime font-black text-[10px] sm:text-xs uppercase border-2 border-pop-ink shadow-neo flex items-center gap-1">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  Validated Reality
                </span>
                <span className="text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white text-pop-ink border border-pop-ink">
                  {activeData.stat}
                </span>
              </div>

              <h4 className="text-lg sm:text-2xl font-black text-pop-ink mt-2 sm:mt-3 leading-snug">
                {activeData.reality}
              </h4>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-2 sm:mt-3 leading-relaxed">
                {activeData.realityProof}
              </p>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-pop-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-black text-pop-ink">
                Based on Big-5 psychometrics
              </span>
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pop-ink text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-neo hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span>Check My Fit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
