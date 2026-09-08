"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

interface CareerCluster {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  growthTag: string;
  skills: string[];
  salaryRange: string;
  sampleRoles: string[];
}

const CLUSTERS: CareerCluster[] = [
  {
    id: "tech",
    category: "tech",
    icon: "💻",
    title: "AI & Modern Computing",
    description:
      "Machine learning engineering, autonomous systems, cybersecurity architecture, and human-AI interface engineering.",
    growthTag: "+34% High Growth",
    skills: ["Algorithms", "Python", "Neural Nets", "Systems Logic"],
    salaryRange: "$120k - $210k",
    sampleRoles: ["ML Ops Engineer", "AI Safety Auditor", "Autonomous Systems Lead"],
  },
  {
    id: "design",
    category: "design",
    icon: "🎨",
    title: "Spatial & Interaction Design",
    description:
      "UI/UX product direction, spatial 3D computing, motion storytelling, brand identity, and hardware interaction ergonomics.",
    growthTag: "Creative Tech +28%",
    skills: ["Spatial UX", "Figma", "Visual Logic", "Interaction Physics"],
    salaryRange: "$110k - $180k",
    sampleRoles: ["Spatial Interface Designer", "Lead Brand Director", "Design Systems Architect"],
  },
  {
    id: "health",
    category: "health",
    icon: "🧬",
    title: "Bioscience & Cognitive Care",
    description:
      "Genomics, cognitive psychology, neuroscience research, robotic surgical interfaces, and mental wellness systems.",
    growthTag: "Societal Impact",
    skills: ["Genomics", "Neuroscience", "Empathetic Diagnosis", "Bio-Data"],
    salaryRange: "$105k - $175k",
    sampleRoles: ["Neuro-psychologist", "Bio-informatician", "Robotic Tech Specialist"],
  },
  {
    id: "business",
    category: "business",
    icon: "⚡",
    title: "Venture & Market Strategy",
    description:
      "Venture capital analysts, fintech product managers, commercial strategy leads, and entrepreneurial company builders.",
    growthTag: "Commercial Scale",
    skills: ["Economics", "Scale Mechanics", "Leadership", "FinTech"],
    salaryRange: "$125k - $195k",
    sampleRoles: ["FinTech PM", "Venture Partner", "Corporate Scaling Lead"],
  },
  {
    id: "law",
    category: "law",
    icon: "⚖️",
    title: "Tech Ethics & Global Policy",
    description:
      "Technology law, constitutional advocacy, international relations, sustainability treaties, and corporate arbitration.",
    growthTag: "Global Governance",
    skills: ["Rhetoric", "Contracts", "AI Privacy Policy", "Mediation"],
    salaryRange: "$130k - $215k",
    sampleRoles: ["AI Privacy Counsel", "Policy Negotiator", "Arbitration Director"],
  },
  {
    id: "sustainability",
    category: "sustainability",
    icon: "🌱",
    title: "CleanTech & Energy Grids",
    description:
      "Renewable storage networks, carbon credit engineering, circular supply chain innovation, and climate data modeling.",
    growthTag: "Planetary Future",
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
    <section className="py-20 sm:py-28 bg-[#DDD0C8] relative overflow-hidden border-b border-[#323232]/15" id="career-paths">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs font-bold tracking-widest uppercase bg-[#323232] text-[#DDD0C8] px-4 py-1.5 rounded-full inline-block mb-3">
            Career Constellations
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#323232] mt-2 tracking-tight">
            BEYOND A SINGLE TITLE
          </h2>
          <p className="text-[#525252] font-medium text-base sm:text-lg mt-3">
            Modern careers are fluid, multi-disciplinary, and high-impact. Pick a domain to explore mapped roadmaps.
          </p>

          {/* Interactive Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {[
              { id: "all", label: "All Domains" },
              { id: "tech", label: "Tech & AI" },
              { id: "design", label: "Spatial Design" },
              { id: "health", label: "Bioscience" },
              { id: "business", label: "Venture Strategy" },
              { id: "law", label: "Policy & Ethics" },
              { id: "sustainability", label: "CleanTech" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#323232] text-[#DDD0C8] border-[#323232] shadow-solid-sm"
                    : "bg-[#E8DFD8] text-[#525252] border-[#323232]/20 hover:text-[#323232]"
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
              className="bg-[#FFFFFF] rounded-2xl p-7 border border-[#323232]/20 shadow-solid-sm hover:shadow-solid hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-[#E8DFD8] border border-[#323232]/15 flex items-center justify-center text-2xl shadow-solid-sm">
                    {cluster.icon}
                  </span>
                  <span className="text-xs font-bold bg-[#E8DFD8] text-[#323232] px-3 py-1 rounded-lg border border-[#323232]/15">
                    {cluster.growthTag}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#323232] mt-2">
                  {cluster.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#525252] mt-2 leading-relaxed">
                  {cluster.description}
                </p>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cluster.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-semibold bg-[#E8DFD8]/60 text-[#323232] border border-[#323232]/15 px-2.5 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#323232]/10 flex items-center justify-between">
                <span className="text-xs font-bold text-[#737373]">
                  {cluster.salaryRange}
                </span>
                <Link
                  href="/careers"
                  className="text-xs font-bold text-[#323232] hover:text-[#1F1F1F] flex items-center gap-1 group"
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
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#323232] text-[#DDD0C8] font-bold text-sm sm:text-base border border-[#323232] shadow-solid hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Compass className="w-5 h-5 stroke-[2.2]" />
            <span>Open Complete Career Galaxy (180+ Horizons)</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
