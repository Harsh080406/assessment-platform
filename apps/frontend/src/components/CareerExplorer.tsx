"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Compass, Sparkles } from "lucide-react";

interface CareerCluster {
  id: string;
  category: string;
  emoji: string;
  title: string;
  description: string;
  growthTag: string;
  growthBg: string;
  growthText: string;
  cardBg: string;
  hoverRotate: string;
  skills: string[];
  salaryRange: string;
  sampleRoles: string[];
}

const CLUSTERS: CareerCluster[] = [
  {
    id: "tech",
    category: "tech",
    emoji: "💻",
    title: "AI & Modern Computing",
    description:
      "Machine learning engineering, autonomous systems, cybersecurity architecture, and human-AI interface engineering.",
    growthTag: "🔥 +34% High Growth",
    growthBg: "bg-pop-cyan",
    growthText: "text-pop-ink",
    cardBg: "bg-white",
    hoverRotate: "hover:rotate-[-1deg]",
    skills: ["Algorithms", "Python", "Neural Nets", "Systems Logic"],
    salaryRange: "$120k - $210k",
    sampleRoles: ["ML Ops Engineer", "AI Safety Auditor", "Autonomous Systems Lead"],
  },
  {
    id: "design",
    category: "design",
    emoji: "🎨",
    title: "Spatial & Interaction Design",
    description:
      "UI/UX product direction, spatial 3D computing, motion storytelling, brand identity, and hardware interaction ergonomics.",
    growthTag: "✨ Creative Tech +28%",
    growthBg: "bg-pop-pink",
    growthText: "text-white",
    cardBg: "bg-white",
    hoverRotate: "hover:rotate-[1deg]",
    skills: ["Spatial UX", "Figma", "Visual Logic", "Interaction Physics"],
    salaryRange: "$110k - $180k",
    sampleRoles: ["Spatial Interface Designer", "Lead Brand Director", "Design Systems Architect"],
  },
  {
    id: "health",
    category: "health",
    emoji: "🧬",
    title: "Bioscience & Cognitive Care",
    description:
      "Genomics, cognitive psychology, neuroscience research, robotic surgical interfaces, and mental wellness systems.",
    growthTag: "🩺 Societal Impact",
    growthBg: "bg-pop-lime",
    growthText: "text-pop-ink",
    cardBg: "bg-white",
    hoverRotate: "hover:rotate-[-1deg]",
    skills: ["Genomics", "Neuroscience", "Empathetic Diagnosis", "Bio-Data"],
    salaryRange: "$105k - $175k",
    sampleRoles: ["Neuro-psychologist", "Bio-informatician", "Robotic Tech Specialist"],
  },
  {
    id: "business",
    category: "business",
    emoji: "⚡",
    title: "Venture & Market Strategy",
    description:
      "Venture capital analysts, fintech product managers, commercial strategy leads, and entrepreneurial company builders.",
    growthTag: "🚀 Commercial Scale",
    growthBg: "bg-pop-orange",
    growthText: "text-white",
    cardBg: "bg-white",
    hoverRotate: "hover:rotate-[1deg]",
    skills: ["Economics", "Scale Mechanics", "Leadership", "FinTech"],
    salaryRange: "$125k - $195k",
    sampleRoles: ["FinTech PM", "Venture Partner", "Corporate Scaling Lead"],
  },
  {
    id: "law",
    category: "law",
    emoji: "⚖️",
    title: "Tech Ethics & Global Policy",
    description:
      "Technology law, constitutional advocacy, international relations, sustainability treaties, and corporate arbitration.",
    growthTag: "🌐 Global Governance",
    growthBg: "bg-pop-violet",
    growthText: "text-white",
    cardBg: "bg-white",
    hoverRotate: "hover:rotate-[-1deg]",
    skills: ["Rhetoric", "Contracts", "AI Privacy Policy", "Mediation"],
    salaryRange: "$130k - $215k",
    sampleRoles: ["AI Privacy Counsel", "Policy Negotiator", "Arbitration Director"],
  },
  {
    id: "sustainability",
    category: "sustainability",
    emoji: "🌱",
    title: "CleanTech & Energy Grids",
    description:
      "Renewable storage networks, carbon credit engineering, circular supply chain innovation, and climate data modeling.",
    growthTag: "🌍 Planetary Future",
    growthBg: "bg-pop-lime",
    growthText: "text-pop-ink",
    cardBg: "bg-white",
    hoverRotate: "hover:rotate-[1deg]",
    skills: ["Renewable Tech", "Geo-Data", "Circular Systems", "Life-Cycle"],
    salaryRange: "$110k - $170k",
    sampleRoles: ["Carbon Systems Auditor", "Smart Grid Lead", "ESG Architect"],
  },
];

export default function CareerExplorer() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredClusters =
    activeFilter === "all"
      ? CLUSTERS
      : CLUSTERS.filter((c) => c.category === activeFilter);

  return (
    <section className="py-24 bg-pop-paper relative overflow-hidden" id="career-paths">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black tracking-widest uppercase bg-pop-cyan text-pop-ink border-2 border-pop-ink px-4 py-1.5 rounded-full shadow-neo rotate-[-1deg] inline-block">
            Career Constellations
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-pop-ink mt-3 tracking-tight">
            BIGGER THAN ONE TITLE
          </h2>
          <p className="text-slate-600 font-bold text-base sm:text-lg mt-2">
            Modern careers are fluid, multi-disciplinary, and high-impact. Pick a stream to explore.
          </p>

          {/* Interactive Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { id: "all", label: "🌟 All Streams" },
              { id: "tech", label: "💻 Tech & AI" },
              { id: "design", label: "🎨 Spatial Design" },
              { id: "health", label: "🧬 Bioscience" },
              { id: "business", label: "⚡ Venture" },
              { id: "law", label: "⚖️ Policy" },
              { id: "sustainability", label: "🌱 CleanTech" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-2xl font-black border-2 border-pop-ink transition-all ${
                  activeFilter === tab.id
                    ? "bg-pop-ink text-white shadow-neo scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClusters.map((cluster) => (
            <div
              key={cluster.id}
              className={`bg-white rounded-3xl p-7 border-4 border-pop-ink shadow-neo-lg hover:shadow-neo-xl transition-all duration-200 flex flex-col justify-between ${cluster.hoverRotate}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-14 h-14 rounded-2xl bg-pop-paper border-2 border-pop-ink shadow-neo flex items-center justify-center text-2xl">
                    {cluster.emoji}
                  </span>
                  <span
                    className={`text-xs font-black ${cluster.growthBg} ${cluster.growthText} px-3 py-1 rounded-xl border-2 border-pop-ink shadow-neo`}
                  >
                    {cluster.growthTag}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-pop-ink mt-2">
                  {cluster.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
                  {cluster.description}
                </p>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cluster.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-bold bg-pop-paper text-pop-ink border border-pop-ink px-2.5 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {cluster.sampleRoles.length} highlighted roles
                </span>
                <Link
                  href={`/careers?cluster=${cluster.id}`}
                  className="text-xs font-black text-pop-ink hover:text-pop-violet flex items-center gap-1 group"
                >
                  <span>Explore Roadmaps</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to Full Directory */}
        <div className="mt-14 text-center">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-pop-lime text-pop-ink font-black text-sm sm:text-base border-3 border-pop-ink shadow-neo-lg hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo transition-all"
          >
            <Compass className="w-5 h-5 stroke-[2.5]" />
            <span>Open Complete Career Galaxy Library (180+ Modern Roles)</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
