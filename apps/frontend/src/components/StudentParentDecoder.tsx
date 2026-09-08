"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Compass, ShieldAlert, Check, X } from "lucide-react";
import Link from "next/link";

interface MythFact {
  id: string;
  topic: string;
  myth: string;
  mythSpeaker: string;
  reality: string;
  realityProof: string;
  stat: string;
  icon: string;
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
    icon: "🛑",
  },
  {
    id: "humanities",
    topic: "The Salary Fallacy",
    myth: "“Design, Psychology, and Humanities have no job security or serious salaries.”",
    mythSpeaker: "WhatsApp family group",
    reality: "AI requires prompt architects, behavioral researchers, and spatial UX directors—drawing heavily on human psychology.",
    realityProof: "Top Spatial UX & Behavioral Tech architects average $140,000+ early in their career.",
    stat: "$140k+ Avg Horizon",
    icon: "📈",
  },
  {
    id: "pressure",
    topic: "The Marks Dogma",
    myth: "“If you score 95% in Board Exams, you MUST take Science. Commerce is only for average scores.”",
    mythSpeaker: "Outdated School Tradition",
    reality: "Exam memory has almost zero correlation with entrepreneurial or systems-scaling instinct.",
    realityProof: "Top venture capitalists and corporate strategists scored across diverse distributions but possessed high economic curiosity.",
    stat: "93.4% Validity Matrix",
    icon: "⚡",
  },
];

export default function StudentParentDecoder() {
  const [activeTab, setActiveTab] = useState<string>("engineering");
  const activeData = COMPARISONS.find((c) => c.id === activeTab) || COMPARISONS[0];

  return (
    <section className="pt-6 sm:pt-10 pb-16 sm:pb-24 bg-[#FBFBF9] relative overflow-hidden" id="decoder">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Unified Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-black transition-colors mb-5 bg-white px-4 py-2 rounded-xl border border-[#E2E0DB] shadow-sm hover:bg-[#EEF1FB]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-black" />
            <span className="text-black">Back to Home</span>
          </Link>

          <div>
            <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase bg-[#A9B4E8] text-black px-4 py-1.5 rounded-full mb-3 shadow-sm">
              <Compass className="w-4 h-4 stroke-[2.2] text-black" />
              <span className="text-black">Bridge The Generation Gap</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold text-black mt-2 tracking-tight font-[family-name:var(--font-dm-sans)]">
            PARENT VS. YOU: REALITY DECODER
          </h1>
          <p className="text-black font-semibold text-sm sm:text-lg mt-3 max-w-2xl mx-auto px-1 leading-relaxed">
            Replace high-stress dinner table arguments with objective cognitive evidence. See how outdated myths pushed onto students stack up against validated 2026+ psychometric reality.
          </p>

          {/* Interactive Switcher Buttons */}
          <div className="mt-8 flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar py-1 gap-2.5 justify-start sm:justify-center px-1">
            {COMPARISONS.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setActiveTab(comp.id)}
                className={`shrink-0 text-xs sm:text-sm px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === comp.id
                    ? "bg-[#A9B4E8] text-black border border-[#A9B4E8] shadow-sm font-extrabold"
                    : "bg-white text-black border border-[#E2E0DB] hover:bg-[#EEF1FB]"
                }`}
              >
                {comp.icon} <span className="text-black">{comp.topic}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Side by Side Contrast Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* Traditional Myth Side */}
          <div className="bg-white border border-[#E2E0DB] shadow-sm rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden text-black">
            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#E3A0A0]/20 text-[#B03A3A] font-black text-xs uppercase flex items-center gap-1.5 border border-[#E3A0A0]/40">
                  <X className="w-3.5 h-3.5 stroke-[2.5] text-[#B03A3A]" />
                  Legacy Advice
                </span>
                <span className="text-xs font-bold text-black italic">
                  {activeData.mythSpeaker}
                </span>
              </div>

              <p className="text-lg sm:text-2xl font-bold text-black mt-3 leading-snug">
                {activeData.myth}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E2E0DB] text-xs font-semibold text-black flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#B03A3A]" />
              <span>Often leads to 4+ years of cognitive misalignment & disengagement</span>
            </div>
          </div>

          {/* Validated Reality Side */}
          <div className="bg-[#1A1A1D] text-white border border-[#2E2E32] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#A9D8C6] text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-black" />
                  2026+ Validated Reality
                </span>
                <span className="text-xs font-black px-3 py-1 rounded-lg bg-[#141416] text-white border border-[#2E2E32]">
                  {activeData.stat}
                </span>
              </div>

              <h4 className="text-lg sm:text-2xl font-black text-white mt-3 leading-snug">
                {activeData.reality}
              </h4>
              <p className="text-xs sm:text-sm font-medium text-[#A9B4E8] mt-3 leading-relaxed">
                {activeData.realityProof}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-[#2E2E32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white">
                Calibrated against 180+ modern disciplines
              </span>
              <Link
                href="/assessment"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black hover:bg-[#EEF1FB] font-black text-xs flex items-center justify-center gap-1.5 border border-[#E2E0DB] shadow-sm transition-all"
              >
                <span>Discover Your Edge</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] text-black" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
