"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Award, Flame } from "lucide-react";

interface Archetype {
  id: string;
  number: string;
  name: string;
  emoji: string;
  matchScore: string;
  badgeShape: string;
  tagline: string;
  polygonPoints: string;
  cardColor: string;
  accentColor: string;
  metrics: {
    label: string;
    value: number;
    barColor: string;
  }[];
  horizons: {
    title: string;
    badgeBg: string;
    badgeText: string;
  }[];
}

const ARCHETYPES: Record<string, Archetype> = {
  creative: {
    id: "creative",
    number: "#04",
    name: "THE CREATIVE STRATEGIST",
    emoji: "🎨",
    matchScore: "98% Fit",
    badgeShape: "Divergent Polymath",
    tagline: "High divergent ideation + systems execution discipline.",
    polygonPoints: "80,24 135,60 115,125 40,118 28,60",
    cardColor: "bg-white",
    accentColor: "text-pop-violet",
    metrics: [
      { label: "Creative Thinking", value: 95, barColor: "bg-pop-pink" },
      { label: "Complex Problem Solving", value: 88, barColor: "bg-pop-cyan" },
      { label: "Interpersonal Resonance", value: 91, barColor: "bg-pop-lime" },
      { label: "Systems Architecture", value: 84, barColor: "bg-pop-orange" },
    ],
    horizons: [
      { title: "Spatial Experience Designer", badgeBg: "bg-pop-pink", badgeText: "text-white" },
      { title: "Creative Technologist", badgeBg: "bg-pop-cyan", badgeText: "text-pop-ink" },
      { title: "Venture Brand Director", badgeBg: "bg-pop-lime", badgeText: "text-pop-ink" },
      { title: "Behavioral Product Architect", badgeBg: "bg-pop-yellow", badgeText: "text-pop-ink" },
    ],
  },
  systems: {
    id: "systems",
    number: "#07",
    name: "THE SYSTEMS ARCHITECT",
    emoji: "⚡",
    matchScore: "96% Fit",
    badgeShape: "Algorithmic Precision Matrix",
    tagline: "Deep structural deduction + first-principles scaling logic.",
    polygonPoints: "80,18 138,50 100,128 30,110 24,52",
    cardColor: "bg-white",
    accentColor: "text-pop-cyan",
    metrics: [
      { label: "Creative Thinking", value: 76, barColor: "bg-pop-pink" },
      { label: "Complex Problem Solving", value: 98, barColor: "bg-pop-cyan" },
      { label: "Interpersonal Resonance", value: 74, barColor: "bg-pop-lime" },
      { label: "Systems Architecture", value: 99, barColor: "bg-pop-orange" },
    ],
    horizons: [
      { title: "Distributed Systems Architect", badgeBg: "bg-pop-cyan", badgeText: "text-pop-ink" },
      { title: "Autonomous Robotics Lead", badgeBg: "bg-pop-lime", badgeText: "text-pop-ink" },
      { title: "Quantitative Risk Modeler", badgeBg: "bg-pop-yellow", badgeText: "text-pop-ink" },
      { title: "Applied AI Researcher", badgeBg: "bg-pop-pink", badgeText: "text-white" },
    ],
  },
};

export default function ArchetypeSpotlight() {
  const [activeTab, setActiveTab] = useState<"creative" | "systems">("creative");
  const data = ARCHETYPES[activeTab];

  return (
    <section className="py-24 bg-pop-paper border-y-2 border-pop-ink" id="archetype-spotlight">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-black uppercase tracking-widest bg-pop-yellow text-pop-ink border-2 border-pop-ink px-4 py-1.5 rounded-full shadow-neo rotate-[-1deg] inline-block">
              In-Depth Persona Breakdown
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-pop-ink mt-4 tracking-tight leading-tight">
              YOU ARE MORE THAN A TEST SCORE.
            </h2>
            <p className="text-slate-600 font-bold mt-4 text-base sm:text-lg leading-relaxed">
              School exams measure memorization speed. Pathfinder measures your{" "}
              <span className="text-pop-ink underline decoration-pop-pink decoration-3">
                divergent cognition, crisis instincts, social resonance, and real work temperament
              </span>
              .
            </p>

            {/* Value Checkpoints */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border-2 border-pop-ink shadow-neo">
                <div className="w-8 h-8 rounded-xl bg-pop-lime text-pop-ink flex items-center justify-center shrink-0 font-black text-sm border-2 border-pop-ink">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-black text-pop-ink">Zero Career Dogma</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Discovers hybrid emerging careers that high schools haven't even heard of yet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border-2 border-pop-ink shadow-neo">
                <div className="w-8 h-8 rounded-xl bg-pop-pink text-white flex items-center justify-center shrink-0 font-black text-sm border-2 border-pop-ink">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-black text-pop-ink">Psychometric Rigor</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Calibrated on certified Big Five and Holland RIASEC personality models.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border-2 border-pop-ink shadow-neo">
                <div className="w-8 h-8 rounded-xl bg-pop-cyan text-pop-ink flex items-center justify-center shrink-0 font-black text-sm border-2 border-pop-ink">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-black text-pop-ink">Real College Majors</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Direct degree majors, entrance exams, and high-impact side project starter packs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Archetype Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-9 border-4 border-pop-ink shadow-neo-xl relative">
              {/* Profile Switcher Pills */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-black text-slate-500 uppercase">Demo Profile:</span>
                <button
                  onClick={() => setActiveTab("creative")}
                  className={`text-xs px-4 py-1.5 rounded-xl font-black border-2 border-pop-ink transition-all ${
                    activeTab === "creative"
                      ? "bg-pop-lime text-pop-ink shadow-neo"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🎨 Creative Strategist
                </button>
                <button
                  onClick={() => setActiveTab("systems")}
                  className={`text-xs px-4 py-1.5 rounded-xl font-black border-2 border-pop-ink transition-all ${
                    activeTab === "systems"
                      ? "bg-pop-cyan text-pop-ink shadow-neo"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ⚡ Systems Architect
                </button>
              </div>

              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
                <div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Identified Student Archetype
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-pop-ink flex items-center gap-2 mt-0.5">
                    <span>{data.emoji}</span>
                    <span>{data.name}</span>
                    <span className="text-base font-black text-slate-400">{data.number}</span>
                  </h3>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-pop-lime text-pop-ink font-black text-xs border-2 border-pop-ink shadow-neo">
                  {data.matchScore}
                </div>
              </div>

              {/* Metrics & Radar Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 items-center">
                {/* Metric Bars */}
                <div className="space-y-4">
                  {data.metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs font-black text-slate-800 mb-1">
                        <span>{metric.label}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full border-2 border-pop-ink overflow-hidden p-0.5">
                        <div
                          className={`h-full ${metric.barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* SVG Radar Polygon */}
                <div className="bg-pop-paper rounded-2xl p-5 border-2 border-pop-ink flex flex-col items-center justify-center text-center shadow-neo">
                  <svg className="w-36 h-36 sm:w-40 sm:h-40" viewBox="0 0 160 160">
                    <polygon
                      fill="none"
                      points="80,15 140,55 125,130 35,130 20,55"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                    />
                    <polygon
                      fill="none"
                      points="80,45 115,70 105,110 55,110 45,70"
                      stroke="#94A3B8"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <polygon
                      fill="rgba(204, 255, 0, 0.4)"
                      points={data.polygonPoints}
                      stroke="#0B0F19"
                      strokeWidth="3"
                    />
                    <circle cx="80" cy="24" fill="#FF2E93" r="4.5" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="135" cy="60" fill="#00F0FF" r="4.5" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="115" cy="125" fill="#CCFF00" r="4.5" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="40" cy="118" fill="#FF6600" r="4.5" stroke="#0B0F19" strokeWidth="1.5" />
                    <circle cx="28" cy="60" fill="#7928CA" r="4.5" stroke="#0B0F19" strokeWidth="1.5" />
                  </svg>
                  <span className="text-xs font-black text-pop-ink mt-2">
                    {data.badgeShape}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                    {data.tagline}
                  </span>
                </div>
              </div>

              {/* Recommended Career Horizons */}
              <div className="mt-7 pt-6 border-t-2 border-slate-100">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-3">
                  Top Recommended Modern Horizons
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.horizons.map((hz) => (
                    <span
                      key={hz.title}
                      className={`px-3.5 py-1.5 rounded-xl ${hz.badgeBg} ${hz.badgeText} text-xs font-black border-2 border-pop-ink shadow-neo`}
                    >
                      {hz.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
