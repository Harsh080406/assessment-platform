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
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-black selection:bg-[#A9B4E8] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full mx-auto px-3.5 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:bg-[#EEF1FB] transition-colors mb-3 bg-white px-3 py-1.5 rounded-xl border border-[#E2E0DB] shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-black" />
            <span className="text-black">Back to Home</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest bg-[#A9B4E8] text-black px-3.5 sm:px-4 py-1 rounded-full shadow-sm inline-block">
                Career Constellation Library
              </span>
              <h1 className="text-2xl sm:text-5xl font-extrabold text-black mt-2 sm:mt-3 tracking-tight font-[family-name:var(--font-dm-sans)]">
                EXPLORE MODERN HORIZONS
              </h1>
              <p className="text-xs sm:text-base font-medium text-[#333333] mt-1.5 sm:mt-2 max-w-2xl leading-relaxed">
                Discover future-proof career disciplines aligned with actual psychometric inclinations rather than outdated corporate stereotypes.
              </p>
            </div>

            <Link
              href="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#A9B4E8] text-black font-extrabold text-xs sm:text-sm shadow-sm hover:bg-[#8E9BDD] self-start md:self-auto transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-black font-extrabold">Match With My Profile</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#E2E0DB] shadow-sm mb-6 sm:mb-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills, or traits..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E2E0DB] outline-none font-bold text-black bg-white focus:ring-1 focus:ring-[#A9B4E8] transition-colors"
            />
          </div>

          {/* Stream Filter Pills */}
          <div className="flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar py-1 gap-1.5 sm:gap-2 w-full md:w-auto">
            {streams.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStream(st)}
                className={`shrink-0 text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                  selectedStream === st
                    ? "bg-[#A9B4E8] text-black border-[#A9B4E8] shadow-sm font-extrabold"
                    : "bg-white text-black border-[#E2E0DB] hover:border-[#A9B4E8]"
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
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#E2E0DB] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5 text-black"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#EEF1FB] text-black border border-[#A9B4E8]/40">
                    {career.stream}
                  </span>
                  <span className="text-xs font-bold text-black bg-[#A9B4E8] px-3 py-1 rounded-full">
                    {career.growth}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-black group-hover:text-[#7C89CC] transition-colors font-[family-name:var(--font-dm-sans)]">
                  {career.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#333333] mt-2 leading-relaxed">
                  {career.description}
                </p>

                {/* Trait Chips */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {career.matchTraits.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold bg-[#EEF1FB] text-black border border-[#A9B4E8]/40 px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="mt-5 pt-4 border-t border-[#E2E0DB] space-y-2 text-xs font-medium">
                  <div className="flex items-start gap-2 text-black">
                    <GraduationCap className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                    <span className="leading-snug text-black font-semibold">{career.degree}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2E0DB]">
                <p className="text-[11px] font-medium text-[#333333] italic mb-3">
                  <span className="font-bold text-black not-italic">First Step:</span>{" "}
                  {career.readinessStep}
                </p>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E0DB]">
                  <span className="text-xs font-bold text-black">
                    Avg: {career.salary}
                  </span>
                  <Link
                    href="/assessment"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-[#A9B4E8] text-black shadow-sm hover:bg-[#8E9BDD] transition-all"
                  >
                    <span className="text-black font-extrabold">Match Trait</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5] text-black" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
