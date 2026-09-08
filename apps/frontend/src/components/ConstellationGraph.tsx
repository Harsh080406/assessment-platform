"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  X,
  Activity,
  Award,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface ConstellationNode {
  id: string;
  name: string;
  cluster: "tech" | "creative" | "bio" | "venture" | "policy";
  clusterLabel: string;
  emoji: string;
  category: string;
  badgeBg: string;
  badgeText: string;
  haloColor: string;
  glowColor: string;
  x: number; // svg coordinate (0 to 1000)
  y: number; // svg coordinate (0 to 500)
  leftPct: string;
  topPct: string;
  salaryBand: string;
  demandGrowth: string;
  matchScore: number;
  tagline: string;
  coreSuperpower: string;
  roles: { title: string; salary: string }[];
  skills: string[];
}

const NODES: ConstellationNode[] = [
  {
    id: "ai-systems",
    name: "AI & NEURAL SYSTEMS",
    cluster: "tech",
    clusterLabel: "Tech & Quantum",
    emoji: "🤖",
    category: "Algorithmic Cognition",
    badgeBg: "bg-pop-cyan",
    badgeText: "text-pop-ink",
    haloColor: "rgba(0, 240, 255, 0.4)",
    glowColor: "#00F0FF",
    x: 500,
    y: 70,
    leftPct: "50%",
    topPct: "14%",
    salaryBand: "₹24 - 48 LPA",
    demandGrowth: "+54% 2026+",
    matchScore: 98,
    tagline: "Architecting machine reasoning, agentic models, and autonomic cognitive pipelines.",
    coreSuperpower: "Abstract pattern synthesis & algorithmic logic",
    roles: [
      { title: "Autonomous Agent Architect", salary: "₹34 LPA" },
      { title: "Spatial AI Engineer", salary: "₹28 LPA" },
      { title: "Robotics Motion Lead", salary: "₹26 LPA" },
    ],
    skills: ["PyTorch", "System Architecture", "Graph Theory", "Linear Algebra"],
  },
  {
    id: "venture-scale",
    name: "VENTURE & QUANT SCALE",
    cluster: "venture",
    clusterLabel: "Venture & Policy",
    emoji: "⚡",
    category: "Market Momentum",
    badgeBg: "bg-pop-orange",
    badgeText: "text-white",
    haloColor: "rgba(255, 102, 0, 0.4)",
    glowColor: "#FF6600",
    x: 770,
    y: 125,
    leftPct: "77%",
    topPct: "25%",
    salaryBand: "₹22 - 45 LPA",
    demandGrowth: "+38% 2026+",
    matchScore: 94,
    tagline: "Building enterprise momentum, capital modeling, and exponential growth engines.",
    coreSuperpower: "Strategic risk calibration & systemic momentum",
    roles: [
      { title: "FinTech Protocol Lead", salary: "₹36 LPA" },
      { title: "Venture Product Lead", salary: "₹30 LPA" },
      { title: "Quantitative Strategist", salary: "₹42 LPA" },
    ],
    skills: ["Macro Modeling", "Game Theory", "Capital Allocation", "Product Strategy"],
  },
  {
    id: "law-ethics",
    name: "LAW & GLOBAL ETHICS",
    cluster: "policy",
    clusterLabel: "Venture & Policy",
    emoji: "⚖️",
    category: "Rhetoric & Governance",
    badgeBg: "bg-pop-violet",
    badgeText: "text-white",
    haloColor: "rgba(121, 40, 202, 0.4)",
    glowColor: "#7928CA",
    x: 880,
    y: 250,
    leftPct: "88%",
    topPct: "50%",
    salaryBand: "₹18 - 36 LPA",
    demandGrowth: "+46% 2026+",
    matchScore: 91,
    tagline: "Dispute synthesis, autonomous agent governance, and frontier policy.",
    coreSuperpower: "Dialectical argumentation & institutional design",
    roles: [
      { title: "Frontier AI Policy Lead", salary: "₹32 LPA" },
      { title: "Cross-Border IP Strategist", salary: "₹26 LPA" },
      { title: "Systems Arbiter", salary: "₹28 LPA" },
    ],
    skills: ["Jurisprudence", "Diplomacy", "Ethical Frameworks", "Policy Drafting"],
  },
  {
    id: "quantum-science",
    name: "QUANTUM & PURE SCIENCE",
    cluster: "tech",
    clusterLabel: "Tech & Quantum",
    emoji: "🔭",
    category: "First-Principles Inquiry",
    badgeBg: "bg-emerald-400",
    badgeText: "text-pop-ink",
    haloColor: "rgba(52, 211, 153, 0.4)",
    glowColor: "#10B981",
    x: 770,
    y: 375,
    leftPct: "77%",
    topPct: "75%",
    salaryBand: "₹20 - 40 LPA",
    demandGrowth: "+32% 2026+",
    matchScore: 93,
    tagline: "First-principles modeling, universe mechanics, and radical laboratory experimentation.",
    coreSuperpower: "Empirical rigor & deep mathematical curiosity",
    roles: [
      { title: "Quantum Info Scientist", salary: "₹35 LPA" },
      { title: "Astrophysics Modeler", salary: "₹27 LPA" },
      { title: "Clean Fusion Modeler", salary: "₹30 LPA" },
    ],
    skills: ["Quantum Mechanics", "Numerical Simulation", "Statistical Physics", "Calculus"],
  },
  {
    id: "behavior-mind",
    name: "BEHAVIOR & COGNITION",
    cluster: "creative",
    clusterLabel: "Creative & 3D",
    emoji: "🧠",
    category: "Cognitive Mechanics",
    badgeBg: "bg-purple-300",
    badgeText: "text-pop-ink",
    haloColor: "rgba(216, 180, 254, 0.4)",
    glowColor: "#C084FC",
    x: 500,
    y: 430,
    leftPct: "50%",
    topPct: "86%",
    salaryBand: "₹16 - 32 LPA",
    demandGrowth: "+41% 2026+",
    matchScore: 96,
    tagline: "Decoding subconscious decision heuristics, motivation psychology, and user empathy.",
    coreSuperpower: "Deep interpersonal decoding & motivational intuition",
    roles: [
      { title: "Behavioral Economics Lead", salary: "₹26 LPA" },
      { title: "Cognitive Neuro-Coach", salary: "₹22 LPA" },
      { title: "Principal User Researcher", salary: "₹28 LPA" },
    ],
    skills: ["Psychometrics", "Heuristic Design", "Experimental Psychology", "Empathy Interviewing"],
  },
  {
    id: "transmedia-narrative",
    name: "TRANSMEDIA & CULTURE",
    cluster: "creative",
    clusterLabel: "Creative & 3D",
    emoji: "🎬",
    category: "Cultural Resonators",
    badgeBg: "bg-pop-yellow",
    badgeText: "text-pop-ink",
    haloColor: "rgba(255, 222, 89, 0.4)",
    glowColor: "#FFDE59",
    x: 230,
    y: 375,
    leftPct: "23%",
    topPct: "75%",
    salaryBand: "₹15 - 30 LPA",
    demandGrowth: "+35% 2026+",
    matchScore: 92,
    tagline: "Orchestrating cultural movements, world-building, and multi-format viral storytelling.",
    coreSuperpower: "Evocative empathy & narrative universe design",
    roles: [
      { title: "World Narrative Director", salary: "₹26 LPA" },
      { title: "Immersive Doc Producer", salary: "₹24 LPA" },
      { title: "Cultural Brand Lead", salary: "₹22 LPA" },
    ],
    skills: ["Story Crafting", "Transmedia Production", "Cultural Semiotics", "Creative Direction"],
  },
  {
    id: "bio-longevity",
    name: "BIO & NEURO MEDICINE",
    cluster: "bio",
    clusterLabel: "Bio & Health",
    emoji: "🧬",
    category: "Human Optimization",
    badgeBg: "bg-pop-lime",
    badgeText: "text-pop-ink",
    haloColor: "rgba(204, 255, 0, 0.4)",
    glowColor: "#CCFF00",
    x: 120,
    y: 250,
    leftPct: "12%",
    topPct: "50%",
    salaryBand: "₹22 - 44 LPA",
    demandGrowth: "+49% 2026+",
    matchScore: 95,
    tagline: "Cellular reprogramming, neural interfaces, and algorithmic medicine.",
    coreSuperpower: "Systemic bio-intuition & precision diagnosis",
    roles: [
      { title: "Neural Interface Researcher", salary: "₹34 LPA" },
      { title: "Genomic Bioinformatician", salary: "₹28 LPA" },
      { title: "Robotic Surgical Lead", salary: "₹38 LPA" },
    ],
    skills: ["Molecular Biology", "Bioinformatics", "Neurophysiology", "Biochemistry"],
  },
  {
    id: "spatial-ux",
    name: "SPATIAL & 3D WORLDS",
    cluster: "creative",
    clusterLabel: "Creative & 3D",
    emoji: "🎨",
    category: "Spatial Perception",
    badgeBg: "bg-pop-pink",
    badgeText: "text-white",
    haloColor: "rgba(255, 46, 147, 0.4)",
    glowColor: "#FF2E93",
    x: 230,
    y: 125,
    leftPct: "23%",
    topPct: "25%",
    salaryBand: "₹20 - 38 LPA",
    demandGrowth: "+52% 2026+",
    matchScore: 97,
    tagline: "Pioneering holographic ergonomics, tactile visual systems, and mixed reality.",
    coreSuperpower: "Spatial imagination & multisensory aesthetic harmony",
    roles: [
      { title: "Spatial Reality Director", salary: "₹32 LPA" },
      { title: "XR Interaction Architect", salary: "₹26 LPA" },
      { title: "Holographic UI Engineer", salary: "₹29 LPA" },
    ],
    skills: ["Spatial Audio", "Shader Math", "3D Ergonomics", "Unreal Engine 5"],
  },
];

const INTER_CONNECTIONS = [
  { fromIndex: 0, toIndex: 7, color: "#00F0FF" },
  { fromIndex: 0, toIndex: 1, color: "#FF6600" },
  { fromIndex: 1, toIndex: 2, color: "#7928CA" },
  { fromIndex: 2, toIndex: 3, color: "#10B981" },
  { fromIndex: 3, toIndex: 4, color: "#C084FC" },
  { fromIndex: 4, toIndex: 5, color: "#FFDE59" },
  { fromIndex: 5, toIndex: 6, color: "#CCFF00" },
  { fromIndex: 6, toIndex: 7, color: "#FF2E93" },
];

const CLUSTER_FILTERS = [
  { id: "all", label: "All Hubs" },
  { id: "tech", label: "Tech & AI" },
  { id: "creative", label: "Creative & 3D" },
  { id: "venture", label: "Venture & Scale" },
  { id: "bio", label: "Bio & Health" },
];

export default function ConstellationGraph() {
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const isNodeVisible = (node: ConstellationNode) => {
    if (selectedCluster === "all") return true;
    if (selectedCluster === "venture") return node.cluster === "venture" || node.cluster === "policy";
    return node.cluster === selectedCluster;
  };

  return (
    <div className="relative w-full rounded-3xl sm:rounded-[2.5rem] bg-[#0A0E1A] border-4 border-pop-ink shadow-neo-xl overflow-hidden flex flex-col select-none max-h-[78vh]">
      {/* 1. Sleek Compact Telemetry & Controls Bar */}
      <div className="bg-[#0F1424] border-b-2 border-slate-800/80 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 z-30 shrink-0">
        {/* Left Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pop-lime opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pop-lime" />
          </span>
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-300 uppercase">
            Aura Constellation Map <span className="text-pop-cyan">v3.8</span>
          </span>
        </div>

        {/* Center / Right Filter Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
          {CLUSTER_FILTERS.map((filter) => {
            const isActive = selectedCluster === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setSelectedCluster(filter.id);
                  if (activeNode && filter.id !== "all" && activeNode.cluster !== filter.id) {
                    setActiveNode(null);
                  }
                }}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? "bg-pop-lime text-pop-ink border-pop-lime shadow-[0_0_10px_rgba(204,255,0,0.5)] scale-105"
                    : "bg-slate-900/90 text-slate-400 border-slate-700/60 hover:text-white hover:border-slate-500"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Constellation Canvas Area (Compact Aspect Ratio Fitted for One Window View) */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10] min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] max-h-[62vh] flex items-center justify-center overflow-hidden">
        {/* Subtle Cyber Blueprint Background Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15) 0%, transparent 70%),
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 36px 36px, 36px 36px",
          }}
        />

        {/* Ambient Gradient Glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-pop-cyan/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-pop-pink/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pop-lime/10 blur-3xl pointer-events-none" />

        {/* SVG Dynamic Beams, Orbital Circles, and Traveling Photons */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="radarBeam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7928CA" stopOpacity="0" />
            </linearGradient>

            <radialGradient id="radarCone" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 240, 255, 0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background Concentric Orbital Rings */}
          <circle
            cx="500"
            cy="250"
            r="100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle
            cx="500"
            cy="250"
            r="190"
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <circle
            cx="500"
            cy="250"
            r="310"
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
          />

          {/* Continuous Rotating Radar Sweep Beam */}
          <g className="origin-center animate-[spin_18s_linear_infinite]" style={{ transformOrigin: "500px 250px" }}>
            <line
              x1="500"
              y1="250"
              x2="500"
              y2="40"
              stroke="url(#radarBeam)"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <path
              d="M500,250 L500,40 A210,210 0 0,1 650,100 Z"
              fill="url(#radarCone)"
              opacity="0.25"
            />
          </g>

          {/* Inter-Constellation Perimeter Synergy Lines */}
          {INTER_CONNECTIONS.map((conn, idx) => {
            const nodeA = NODES[conn.fromIndex];
            const nodeB = NODES[conn.toIndex];
            const isHighlighted =
              hoveredNodeId === nodeA.id ||
              hoveredNodeId === nodeB.id ||
              activeNode?.id === nodeA.id ||
              activeNode?.id === nodeB.id;

            return (
              <line
                key={`inter-${idx}`}
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke={conn.color}
                strokeWidth={isHighlighted ? "2.5" : "1.2"}
                strokeOpacity={isHighlighted ? 0.9 : 0.22}
                strokeDasharray="4 4"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Primary Spoke Beams from Center (500, 250) to Each Hub */}
          {NODES.map((node) => {
            const visible = isNodeVisible(node);
            const isHovered = hoveredNodeId === node.id || activeNode?.id === node.id;

            return (
              <g key={`beam-${node.id}`} opacity={visible ? 1 : 0.15} className="transition-opacity duration-300">
                <line
                  x1="500"
                  y1="250"
                  x2={node.x}
                  y2={node.y}
                  stroke={node.glowColor}
                  strokeWidth={isHovered ? "3" : "1.8"}
                  strokeOpacity={isHovered ? 1 : 0.45}
                  filter={isHovered ? "url(#neonGlow)" : undefined}
                  className="transition-all duration-300"
                />

                {/* Flowing Light Photon Particles */}
                {visible && (
                  <circle r={isHovered ? "4" : "3"} fill={node.glowColor} filter="url(#neonGlow)">
                    <animateMotion
                      dur={`${2.2 + (node.x % 5) * 0.3}s`}
                      repeatCount="indefinite"
                      path={`M500,250 L${node.x},${node.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* 3. Central Core Element ("AURA CORE / YOU") */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-pop-lime/30 border-dashed animate-spin"
              style={{ animationDuration: "25s" }}
            />
            <div
              className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-pop-cyan/25 animate-spin"
              style={{ animationDuration: "40s", animationDirection: "reverse" }}
            />

            {/* Glowing Core Box */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-pop-lime border-3 sm:border-4 border-pop-ink shadow-[0_0_24px_rgba(204,255,0,0.5),5px_5px_0px_#0B0F19] p-1.5 flex items-center justify-center cursor-pointer rotate-[-2deg]"
              onClick={() => setActiveNode(null)}
            >
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-pop-ink flex flex-col items-center justify-center text-white border border-white/20 p-1">
                <span className="text-[8px] sm:text-[9px] font-black text-pop-lime tracking-widest uppercase flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2" />
                  CORE
                </span>
                <span className="text-base sm:text-2xl font-black tracking-tight text-pop-yellow leading-tight">
                  YOU
                </span>
                <span className="text-[7px] sm:text-[8px] font-bold text-pop-cyan tracking-wider uppercase">
                  Apex Hub
                </span>
              </div>
            </motion.div>
          </div>

          <span className="mt-2 px-2.5 py-0.5 rounded-full bg-pop-pink text-white text-[9px] sm:text-[10px] font-black tracking-wide border border-pop-ink shadow-neo rotate-[1deg]">
            180+ Horizons
          </span>
        </div>

        {/* 4. The 8 Constellation Hub Nodes */}
        {NODES.map((node) => {
          const visible = isNodeVisible(node);
          const isSelected = activeNode?.id === node.id;
          const isHovered = hoveredNodeId === node.id;

          return (
            <div
              key={node.id}
              className="absolute z-25 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{
                left: node.leftPct,
                top: node.topPct,
                opacity: visible ? 1 : 0.2,
                pointerEvents: visible ? "auto" : "none",
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => setActiveNode(isSelected ? null : node)}
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className={`relative px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl ${node.badgeBg} ${node.badgeText} border-2 sm:border-3 border-pop-ink font-black cursor-pointer select-none transition-shadow ${
                  isSelected || isHovered
                    ? "shadow-[0_0_20px_rgba(255,255,255,0.6),5px_5px_0px_#0B0F19] ring-2 ring-white"
                    : "shadow-[3px_3px_0px_#0B0F19]"
                } flex items-center gap-1.5 sm:gap-2`}
              >
                <span className="text-sm sm:text-base shrink-0">{node.emoji}</span>

                <div className="flex flex-col text-left">
                  <div className="text-[10px] sm:text-xs font-black tracking-tight leading-none whitespace-nowrap">
                    {node.name}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-[9px] opacity-90 font-bold">
                    <span className="px-1 py-0.2 rounded bg-pop-ink text-white font-black">
                      {node.matchScore}%
                    </span>
                    <span className="hidden md:inline-block font-semibold">
                      {node.clusterLabel}
                    </span>
                  </div>
                </div>

                <span className="relative flex h-1.5 w-1.5 ml-0.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: node.glowColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: node.glowColor }}
                  />
                </span>
              </motion.div>
            </div>
          );
        })}

        {/* 5. Floating Stickers */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pop-yellow text-pop-ink border-2 border-pop-ink shadow-neo absolute top-4 left-4 rotate-[-3deg]">
          <Activity className="w-3 h-3 text-pop-ink" />
          <span className="text-[10px] font-black uppercase">Adaptive Matrix</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pop-pink text-white border-2 border-pop-ink shadow-neo absolute bottom-4 left-4 rotate-[2deg]">
          <Award className="w-3 h-3 text-white" />
          <span className="text-[10px] font-black uppercase">Zero Anxiety</span>
        </div>

        {/* 6. High-Tech Node Inspector Modal Drawer (Fitted inside canvas without scrolling) */}
        <AnimatePresence>
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] sm:w-[85%] max-w-lg bg-[#0F1424] text-white rounded-2xl p-4 border-2 sm:border-3 border-pop-lime shadow-[0_16px_36px_rgba(0,0,0,0.85),6px_6px_0px_#0B0F19]"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-lg">
                    {activeNode.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-pop-lime">
                        {activeNode.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-pop-cyan text-pop-ink">
                        {activeNode.demandGrowth}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {activeNode.category} • Match: <span className="text-pop-yellow">{activeNode.matchScore}%</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveNode(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  aria-label="Close Inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Roles Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 my-2">
                {activeNode.roles.map((role) => (
                  <div
                    key={role.title}
                    className="bg-slate-800/90 p-1.5 rounded-lg border border-slate-700/80 flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-black text-white truncate">
                      {role.title}
                    </span>
                    <span className="text-[9px] font-bold text-pop-cyan mt-0.5">
                      Future Horizon
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Row */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-300 truncate hidden sm:inline-block">
                  ⚡ Superpower: <span className="text-pop-yellow">{activeNode.coreSuperpower}</span>
                </span>
                <Link
                  href="/assessment"
                  className="ml-auto px-3 py-1.5 rounded-lg bg-pop-lime text-pop-ink font-black text-[11px] hover:bg-[#b8e600] transition-all flex items-center gap-1 shadow-neo cursor-pointer shrink-0"
                >
                  <span>Explore Cluster</span>
                  <ArrowRight className="w-3 h-3 stroke-[3]" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 7. Bottom Metric Bar */}
      <div className="bg-[#0B0F19] border-t-2 border-slate-800/80 px-4 py-2 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-slate-400 shrink-0">
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-pop-cyan" />
            8 Clusters
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-pop-pink" />
            180+ Horizons
          </span>
          <span className="hidden sm:flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-pop-yellow" />
            98% Fit Rating
          </span>
        </div>
        <span className="text-slate-500 font-semibold text-[10px] hidden md:inline-block">
          Tap any cluster to inspect horizon metrics
        </span>
      </div>
    </div>
  );
}
