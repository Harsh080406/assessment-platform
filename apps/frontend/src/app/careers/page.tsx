"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Sparkles,
  Compass,
  ArrowLeft,
  GraduationCap,
  Flame,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CareerItem {
  id: string;
  title: string;
  stream: string;
  growth: string;
  salary: string;
  degree: string;
  matchTraits: string[];
  description: string;
  readinessStep: string;
}

const CAREER_DATABASE: CareerItem[] = [
  {
    id: "ai-engineer",
    title: "Machine Learning & AI Architect",
    stream: "Technology",
    growth: "🔥 +38% High Growth",
    salary: "$130,000 - $210,000",
    degree: "B.Tech Computer Science / Mathematics & Computing",
    matchTraits: ["Systems Logic", "Python", "Neural Networks"],
    description: "Designs, trains, and deploys deep foundation neural models and autonomous agent workflows.",
    readinessStep: "Master linear algebra, PyTorch, and distributed training systems.",
  },
  {
    id: "spatial-designer",
    title: "Spatial Computing & Vision UX Designer",
    stream: "Design",
    growth: "✨ +29% Creative Tech",
    salary: "$115,000 - $175,000",
    degree: "B.Des Interaction Design / Human-Computer Interaction",
    matchTraits: ["Spatial Form", "Emotional Resonance", "3D Ergonomics"],
    description: "Crafts intuitive next-generation spatial gestures, augmented reality overlays, and hardware interaction paradigms.",
    readinessStep: "Build 3D interactive prototypes in Unity/Spline and master spatial layout guidelines.",
  },
  {
    id: "neuro-psych",
    title: "Cognitive Neuroscience & Behavioral Analyst",
    stream: "Healthcare",
    growth: "🧬 Societal Impact",
    salary: "$105,000 - $160,000",
    degree: "B.Sc Psychology / Cognitive Science / Pre-Med",
    matchTraits: ["Interpersonal Resonance", "Empirical Method", "Active Listening"],
    description: "Investigates brain plasticity, neural pathways of learning, and designs targeted therapies.",
    readinessStep: "Engage in computational psychology lab research and clinical shadowing.",
  },
  {
    id: "fintech-lead",
    title: "FinTech Product Strategist & Venture Lead",
    stream: "Venture",
    growth: "⚡ +32% Commercial Scale",
    salary: "$125,000 - $190,000",
    degree: "B.Com / B.B.A / Economics & Data Analytics",
    matchTraits: ["Venture Scalability", "Risk Modeling", "Negotiation"],
    description: "Architects algorithmic credit models, decentralized protocols, and digital payment infrastructure.",
    readinessStep: "Analyze financial statements and build consumer banking micro-experiments.",
  },
  {
    id: "clean-energy",
    title: "Smart Grid & Renewable Storage Engineer",
    stream: "CleanTech",
    growth: "🌱 +35% Planetary",
    salary: "$110,000 - $170,000",
    degree: "B.Tech Electrical / Energy Systems Engineering",
    matchTraits: ["Planetary Impact", "Thermodynamics", "Sensor Networks"],
    description: "Develops decentralized solar/wind microgrid storage and carbon offset verification algorithms.",
    readinessStep: "Study battery chemistry kinetics and power distribution modeling software.",
  },
  {
    id: "tech-law",
    title: "Artificial Intelligence & Privacy Policy Counsel",
    stream: "Law",
    growth: "⚖️ +27% Global Policy",
    salary: "$140,000 - $220,000",
    degree: "B.A. LL.B (Hons) / Master of Public Policy",
    matchTraits: ["Rhetoric & Ethics", "Statutory Synthesis", "International Treaties"],
    description: "Shapes international AI copyright laws, data sovereignty governance, and cross-border tech ethics.",
    readinessStep: "Participate in national parliamentary debates and international moot courts.",
  },
];

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");

  const streams = ["All", "Technology", "Design", "Healthcare", "Venture", "CleanTech", "Law"];

  const filtered = CAREER_DATABASE.filter((item) => {
    const matchesStream = selectedStream === "All" || item.stream === selectedStream;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matchTraits.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStream && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-student-grid text-pop-ink selection:bg-pop-lime selection:text-pop-ink">
      <Navbar />

      <main className="flex-1 w-full mx-auto px-3.5 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-pop-ink hover:text-pop-violet transition-colors mb-3 bg-white px-3 py-1.5 rounded-xl border-2 border-pop-ink shadow-neo"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-pop-cyan text-pop-ink border-2 border-pop-ink px-3.5 sm:px-4 py-1 rounded-full shadow-neo inline-block rotate-[-1deg]">
                Career Constellation Library
              </span>
              <h1 className="text-2xl sm:text-5xl font-black text-pop-ink mt-2 sm:mt-3 tracking-tight">
                EXPLORE MODERN HORIZONS
              </h1>
              <p className="text-xs sm:text-base font-bold text-slate-600 mt-1.5 sm:mt-2 max-w-2xl leading-relaxed">
                Discover future-proof career disciplines aligned with actual psychometric inclinations rather than outdated corporate stereotypes.
              </p>
            </div>

            <Link
              href="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-pop-lime text-pop-ink border-2 border-pop-ink font-black text-xs sm:text-sm shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Match With My Profile</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-3 border-pop-ink shadow-neo-lg mb-6 sm:mb-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills, or traits..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-pop-ink outline-none font-bold"
            />
          </div>

          {/* Stream Filter Pills — Horizontal swipeable on touch */}
          <div className="flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar py-1 gap-1.5 sm:gap-2 w-full md:w-auto">
            {streams.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStream(st)}
                className={`shrink-0 text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-xl font-black border-2 border-pop-ink transition-all ${
                  selectedStream === st
                    ? "bg-pop-lime text-pop-ink shadow-neo"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((career) => (
            <div
              key={career.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-3 sm:border-4 border-pop-ink shadow-neo-lg hover:shadow-neo-xl transition-all flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-pop-paper text-pop-ink border border-pop-ink">
                    {career.stream}
                  </span>
                  <span className="text-xs font-black text-pop-ink bg-pop-lime px-3 py-1 rounded-full border border-pop-ink">
                    {career.growth}
                  </span>
                </div>

                <h3 className="text-xl font-black text-pop-ink group-hover:text-pop-violet transition-colors">
                  {career.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
                  {career.description}
                </p>

                {/* Trait Chips */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {career.matchTraits.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-black bg-pop-paper text-pop-ink border border-pop-ink px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="mt-5 pt-4 border-t-2 border-slate-100 space-y-2 text-xs font-bold">
                  <div className="flex items-start gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-pop-ink shrink-0 mt-0.5" />
                    <span className="leading-snug">{career.degree}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 italic mb-3">
                  <span className="font-black text-pop-ink not-italic">First Step:</span>{" "}
                  {career.readinessStep}
                </p>
                <Link
                  href="/assessment"
                  className="w-full py-3 rounded-2xl bg-pop-ink text-white hover:bg-slate-800 font-black text-xs flex items-center justify-center gap-2 transition-all border-2 border-pop-ink shadow-neo"
                >
                  <span>Test Compatibility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
