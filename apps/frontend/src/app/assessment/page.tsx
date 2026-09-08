"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Compass,
  Download,
  RotateCcw,
  Check,
  Flame,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AssessmentQuestion {
  id: number;
  section: string;
  question: string;
  context: string;
  choices: {
    key: string;
    emoji: string;
    text: string;
    detail: string;
    archetypeScore: {
      creative: number;
      systems: number;
      empathy: number;
      venture: number;
    };
  }[];
}

const FULL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    section: "Cognitive Problem Solving",
    question: "When presented with an open-ended project challenge, what is your immediate default impulse?",
    context: "There are no wrong answers; choose how your brain naturally behaves.",
    choices: [
      {
        key: "A",
        emoji: "🎨",
        text: "Sketch multiple wild lateral concepts before filtering",
        detail: "You brainstorm freely without self-censoring, discovering unexpected connections.",
        archetypeScore: { creative: 35, systems: 10, empathy: 15, venture: 20 },
      },
      {
        key: "B",
        emoji: "🔬",
        text: "Deconstruct the problem into technical constraints and rules",
        detail: "You look for the underlying data structures, variables, and logical mechanics.",
        archetypeScore: { creative: 10, systems: 35, empathy: 10, venture: 15 },
      },
      {
        key: "C",
        emoji: "🤝",
        text: "Talk to people affected to understand their real emotional pain",
        detail: "You prioritize authentic human context and how individuals experience friction.",
        archetypeScore: { creative: 15, systems: 10, empathy: 35, venture: 10 },
      },
      {
        key: "D",
        emoji: "⚡",
        text: "Calculate commercial scale and design an execution roadmap",
        detail: "You immediately think about resource allocation, timelines, and market adoption.",
        archetypeScore: { creative: 15, systems: 20, empathy: 10, venture: 35 },
      },
    ],
  },
  {
    id: 2,
    section: "Work Energy Zones",
    question: "Which environment allows you to reach an effortless state of flow?",
    context: "Think about times you completely lost track of time.",
    choices: [
      {
        key: "A",
        emoji: "💻",
        text: "Deep solo problem-solving with code, math models, or complex data",
        detail: "Uninterrupted focus dissecting hard puzzles until the solution snaps into place.",
        archetypeScore: { creative: 15, systems: 35, empathy: 5, venture: 15 },
      },
      {
        key: "B",
        emoji: "✨",
        text: "Visualizing, prototyping, or designing interactive media and art",
        detail: "Crafting aesthetics, sensory flow, and memorable visual storytelling.",
        archetypeScore: { creative: 35, systems: 15, empathy: 15, venture: 10 },
      },
      {
        key: "C",
        emoji: "🧠",
        text: "Coaching a teammate or mediating a group through an obstacle",
        detail: "Observing group dynamics, helping peers grow, and fostering psychological safety.",
        archetypeScore: { creative: 10, systems: 10, empathy: 35, venture: 15 },
      },
      {
        key: "D",
        emoji: "🚀",
        text: "Pitching an ambitious initiative, negotiating, or rallying a launch",
        detail: "High-momentum environments where rallying people and driving traction matters.",
        archetypeScore: { creative: 20, systems: 15, empathy: 15, venture: 35 },
      },
    ],
  },
  {
    id: 3,
    section: "Instinctual Curiosity",
    question: "If you had 3 hours free in a world-class digital library, what shelf pulls you first?",
    context: "Follow your involuntary curiosity rather than what looks good on a resume.",
    choices: [
      {
        key: "A",
        emoji: "🔭",
        text: "Quantum algorithms, autonomous robotics, and cryptography",
        detail: "Rigorous empirical discovery and mathematical architecture.",
        archetypeScore: { creative: 15, systems: 35, empathy: 5, venture: 15 },
      },
      {
        key: "B",
        emoji: "🎬",
        text: "Spatial architecture, cinema direction, and interactive design",
        detail: "Visual composition, spatial psychology, and human-crafted experiences.",
        archetypeScore: { creative: 35, systems: 15, empathy: 15, venture: 10 },
      },
      {
        key: "C",
        emoji: "🧬",
        text: "Cognitive psychology, neuroscience, and cultural behavior",
        detail: "The mechanics of human mind, societal culture, and emotional well-being.",
        archetypeScore: { creative: 15, systems: 15, empathy: 35, venture: 10 },
      },
      {
        key: "D",
        emoji: "📈",
        text: "Venture transformations, geopolitics, and iconic market builders",
        detail: "How visionary leaders changed entire industries and scaled global networks.",
        archetypeScore: { creative: 15, systems: 20, empathy: 10, venture: 35 },
      },
    ],
  },
  {
    id: 4,
    section: "Handling Friction & Ambiguity",
    question: "When a major plan fails at the 11th hour, what is your natural reaction?",
    context: "Pressure strips away pretense and reveals your real archetype.",
    choices: [
      {
        key: "A",
        emoji: "🧭",
        text: "I step up to steer the group, clarify roles, and restore energy",
        detail: "Instinctive ownership, maintaining morale, and focusing on next steps.",
        archetypeScore: { creative: 10, systems: 20, empathy: 20, venture: 35 },
      },
      {
        key: "B",
        emoji: "🔍",
        text: "I diagnose the root logical breakdown and rewrite the framework",
        detail: "Systematic fault-isolation, debugging assumptions, and fixing the pipeline.",
        archetypeScore: { creative: 10, systems: 35, empathy: 10, venture: 15 },
      },
      {
        key: "C",
        emoji: "💡",
        text: "I invent an entirely lateral alternative nobody has noticed yet",
        detail: "Reframing constraints into an unorthodox competitive advantage.",
        archetypeScore: { creative: 35, systems: 15, empathy: 10, venture: 20 },
      },
      {
        key: "D",
        emoji: "❤️",
        text: "I listen to team frustrations and negotiate an aligned compromise",
        detail: "De-escalating friction, protecting morale, and reuniting the team.",
        archetypeScore: { creative: 10, systems: 10, empathy: 35, venture: 15 },
      },
    ],
  },
  {
    id: 5,
    section: "Ultimate Life Impact",
    question: "20 years from now, what achievement would bring you the deepest internal pride?",
    context: "Your internal north star.",
    choices: [
      {
        key: "A",
        emoji: "🛠️",
        text: "I engineered fundamental breakthroughs that advanced human technology",
        detail: "Tangible architectural marvels and technological milestones.",
        archetypeScore: { creative: 20, systems: 35, empathy: 10, venture: 20 },
      },
      {
        key: "B",
        emoji: "🌟",
        text: "I created iconic artistic works, memorable products, or cultural shifts",
        detail: "Original expression that moved millions of people.",
        archetypeScore: { creative: 35, systems: 15, empathy: 15, venture: 15 },
      },
      {
        key: "C",
        emoji: "🩺",
        text: "I directly alleviated suffering, healed people, or lifted communities",
        detail: "Compassionate interpersonal impact and systemic human welfare.",
        archetypeScore: { creative: 10, systems: 10, empathy: 35, venture: 15 },
      },
      {
        key: "D",
        emoji: "⚡",
        text: "I built high-growth enterprises that created immense opportunity and value",
        detail: "Venture scale, economic independence, and empowering thousands.",
        archetypeScore: { creative: 15, systems: 20, empathy: 15, venture: 35 },
      },
    ],
  },
];

export default function AssessmentPage() {
  const [stage, setStage] = useState<string>("11-12");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const question = FULL_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / FULL_QUESTIONS.length) * 100);

  const handleSelectChoice = (choiceKey: string) => {
    setSelectedChoices((prev) => ({ ...prev, [currentStep]: choiceKey }));
  };

  const handleNext = () => {
    if (selectedChoices[currentStep] === undefined) {
      alert("Please choose the scenario option that fits you best!");
      return;
    }

    if (currentStep < FULL_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedChoices({});
    setIsCompleted(false);
  };

  // Compute Scores
  let totals = { creative: 42, systems: 40, empathy: 38, venture: 36 };
  Object.entries(selectedChoices).forEach(([stepIdx, choiceKey]) => {
    const q = FULL_QUESTIONS[Number(stepIdx)];
    const chosen = q?.choices.find((c) => c.key === choiceKey);
    if (chosen) {
      totals.creative += chosen.archetypeScore.creative;
      totals.systems += chosen.archetypeScore.systems;
      totals.empathy += chosen.archetypeScore.empathy;
      totals.venture += chosen.archetypeScore.venture;
    }
  });

  // Dominant Archetype
  let topArchetype = "The Creative Strategist";
  let archetypeTag = "#04";
  let archetypeEmoji = "🎨";
  let archetypeDesc =
    "You thrive at the intersection where divergent aesthetic intuition meets systems execution. You see lateral connections between disparate fields that pure specialists miss.";
  let recommendedRoles = [
    { title: "Spatial UX & Product Designer", match: "98%", salary: "$120k - $185k", stream: "Design & Tech" },
    { title: "Creative Technologist / AI Prototyper", match: "95%", salary: "$130k - $195k", stream: "Emerging Tech" },
    { title: "Behavioral Product Architect", match: "92%", salary: "$115k - $175k", stream: "Cognitive Tech" },
  ];

  if (totals.systems >= totals.creative && totals.systems >= totals.venture) {
    topArchetype = "The Systems Architect";
    archetypeTag = "#07";
    archetypeEmoji = "⚡";
    archetypeDesc =
      "Your core power lies in first-principles deduction, abstract logic, and building bulletproof scalable architectures that withstand stress.";
    recommendedRoles = [
      { title: "Distributed Systems Engineer", match: "98%", salary: "$140k - $210k", stream: "Core Computing" },
      { title: "Autonomous Robotics & AI Lead", match: "94%", salary: "$145k - $220k", stream: "Robotics" },
      { title: "Quantitative Risk Modeler", match: "91%", salary: "$130k - $195k", stream: "Quant / FinTech" },
    ];
  } else if (totals.venture >= totals.creative && totals.venture >= totals.systems) {
    topArchetype = "The Venture Catalyst";
    archetypeTag = "#02";
    archetypeEmoji = "🚀";
    archetypeDesc =
      "You are driven by opportunity recognition, market momentum, and assembling diverse talents to scale ambitious ideas into commercial reality.";
    recommendedRoles = [
      { title: "FinTech Product Growth Lead", match: "97%", salary: "$135k - $195k", stream: "Venture Tech" },
      { title: "Venture Capital Tech Analyst", match: "94%", salary: "$125k - $185k", stream: "Investment" },
      { title: "Enterprise Scaling Strategist", match: "90%", salary: "$120k - $175k", stream: "Strategy" },
    ];
  } else if (totals.empathy >= totals.creative) {
    topArchetype = "The Bio-Social Visionary";
    archetypeTag = "#09";
    archetypeEmoji = "🧬";
    archetypeDesc =
      "You combine deep interpersonal resonance with scientific curiosity, finding your greatest purpose in elevating human wellness and societal health.";
    recommendedRoles = [
      { title: "Cognitive Neuro-Psychologist", match: "97%", salary: "$110k - $165k", stream: "Neuroscience" },
      { title: "Bio-medical Interface Specialist", match: "93%", salary: "$120k - $175k", stream: "Bio-Tech" },
      { title: "Organizational Culture Architect", match: "89%", salary: "$105k - $160k", stream: "People Ops" },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-student-grid text-pop-ink selection:bg-pop-lime selection:text-pop-ink">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10">
        {/* Breadcrumb & Stage Selection */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-pop-ink hover:text-pop-violet transition-colors bg-white px-3 py-1.5 rounded-xl border-2 border-pop-ink shadow-neo self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border-2 border-pop-ink px-3.5 sm:px-4 py-1.5 rounded-2xl shadow-neo text-xs font-black">
            <span>Calibrated for:</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="bg-pop-lime text-pop-ink font-black px-2 py-0.5 rounded-lg border border-pop-ink outline-none cursor-pointer"
            >
              <option value="8-10">Class 8 – 10 (Foundation)</option>
              <option value="11-12">Class 11 – 12 (Crossroad)</option>
              <option value="college">College &amp; Graduate (Launchpad)</option>
            </select>
          </div>
        </div>

        {!isCompleted ? (
          /* Question Card */
          <div className="bg-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-pop-ink shadow-neo-xl overflow-hidden">
            {/* Top Bar */}
            <div className="bg-pop-ink text-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b-3 sm:border-b-4 border-pop-ink">
              <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
                <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-pop-lime text-pop-ink font-black text-[11px] sm:text-xs uppercase">
                  {question.section}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-pop-yellow flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pop-yellow" />
                  Quest {currentStep + 1} of {FULL_QUESTIONS.length}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
                <div className="w-28 sm:w-36 h-2.5 sm:h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-pop-lime via-pop-cyan to-pop-pink transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-black text-pop-lime">{progressPercent}%</span>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-4 sm:p-10">
              <h2 className="text-xl sm:text-3xl font-black text-pop-ink leading-snug">
                {question.question}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1.5 sm:mt-2">
                {question.context}
              </p>

              {/* Choice Cards */}
              <div className="mt-5 sm:mt-8 space-y-3 sm:space-y-4">
                {question.choices.map((choice) => {
                  const isSelected = selectedChoices[currentStep] === choice.key;
                  return (
                    <button
                      key={choice.key}
                      onClick={() => handleSelectChoice(choice.key)}
                      type="button"
                      className={`w-full text-left p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-pop-ink transition-all flex items-start justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-pop-lime/25 shadow-neo translate-x-0.5 -translate-y-0.5"
                          : "bg-white hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-4">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pop-ink text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {choice.key}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-lg sm:text-xl">{choice.emoji}</span>
                            <h4 className="font-black text-sm sm:text-base text-pop-ink">{choice.text}</h4>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 leading-relaxed">
                            {choice.detail}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border-2 border-pop-ink flex items-center justify-center shrink-0 ml-2 transition-all ${
                          isSelected ? "bg-pop-ink text-white" : "bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t-2 border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`text-xs font-black px-3.5 sm:px-4 py-2 rounded-xl transition-colors ${
                    currentStep === 0
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:text-pop-ink border-2 border-transparent hover:border-pop-ink"
                  }`}
                >
                  ← Back
                </button>

                <button
                  onClick={handleNext}
                  className="px-5 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-pop-lime text-pop-ink font-black text-xs sm:text-sm border-2 border-pop-ink shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <span>
                    {currentStep === FULL_QUESTIONS.length - 1
                      ? "⚡ Unlock Report"
                      : "Continue"}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Completion State: Archetype Result Card */
          <div className="bg-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-pop-ink p-5 sm:p-12 shadow-neo-xl animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-pop-lime text-pop-ink font-black text-[10px] sm:text-xs uppercase mb-3 sm:mb-4 border-2 border-pop-ink shadow-neo">
                <Sparkles className="w-3.5 h-3.5" />
                Assessment Complete • Stage: Class {stage}
              </span>
              <h2 className="text-2xl sm:text-5xl font-black text-pop-ink tracking-tight">
                Your Primary Student Archetype
              </h2>
              <div className="text-xl sm:text-3xl font-black text-pop-violet mt-2 flex flex-wrap items-center justify-center gap-2">
                <span>{archetypeEmoji}</span>
                <span>{topArchetype}</span>
                <span className="text-slate-400 font-bold">{archetypeTag}</span>
              </div>
              <p className="text-xs sm:text-base font-bold text-slate-700 max-w-xl mx-auto mt-2 sm:mt-3 leading-relaxed">
                {archetypeDesc}
              </p>
            </div>

            {/* Cognitive Trait Bars & Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 my-6 sm:my-8 p-4 sm:p-8 bg-pop-paper rounded-2xl sm:rounded-3xl border-3 border-pop-ink shadow-neo">
              <div className="space-y-3.5 sm:space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Cognitive Dimensional Fit
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-800 mb-1">
                    <span>Creative &amp; Divergent Thinking</span>
                    <span>{totals.creative}%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full border-2 border-pop-ink overflow-hidden p-0.5">
                    <div
                      className="h-full bg-pop-pink rounded-full"
                      style={{ width: `${Math.min(totals.creative, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-800 mb-1">
                    <span>Systems &amp; Algorithmic Logic</span>
                    <span>{totals.systems}%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full border-2 border-pop-ink overflow-hidden p-0.5">
                    <div
                      className="h-full bg-pop-cyan rounded-full"
                      style={{ width: `${Math.min(totals.systems, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-800 mb-1">
                    <span>Interpersonal Resonance</span>
                    <span>{totals.empathy}%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full border-2 border-pop-ink overflow-hidden p-0.5">
                    <div
                      className="h-full bg-pop-lime rounded-full"
                      style={{ width: `${Math.min(totals.empathy, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-800 mb-1">
                    <span>Venture &amp; Commercial Instinct</span>
                    <span>{totals.venture}%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full border-2 border-pop-ink overflow-hidden p-0.5">
                    <div
                      className="h-full bg-pop-orange rounded-full"
                      style={{ width: `${Math.min(totals.venture, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Radar visualization */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-pop-ink flex flex-col items-center justify-center text-center shadow-sm">
                <svg className="w-32 h-32 sm:w-40 sm:h-40" viewBox="0 0 160 160">
                  <polygon
                    fill="none"
                    points="80,15 140,55 125,130 35,130 20,55"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  <polygon
                    fill="rgba(204, 255, 0, 0.4)"
                    points="80,24 135,60 115,125 40,118 28,60"
                    stroke="#0B0F19"
                    strokeWidth="3"
                  />
                  <circle cx="80" cy="24" fill="#FF2E93" r="4" stroke="#0B0F19" strokeWidth="1.5" />
                  <circle cx="135" cy="60" fill="#00F0FF" r="4" stroke="#0B0F19" strokeWidth="1.5" />
                  <circle cx="115" cy="125" fill="#CCFF00" r="4" stroke="#0B0F19" strokeWidth="1.5" />
                  <circle cx="40" cy="118" fill="#FF6600" r="4" stroke="#0B0F19" strokeWidth="1.5" />
                  <circle cx="28" cy="60" fill="#7928CA" r="4" stroke="#0B0F19" strokeWidth="1.5" />
                </svg>
                <span className="text-xs font-black text-pop-ink mt-2">
                  Multi-Factor Polymath Signature
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Calibrated to your exact milestone
                </span>
              </div>
            </div>

            {/* Top Careers */}
            <div className="mt-6 sm:mt-8">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">
                Highest Affinity Modern Career Horizons
              </h4>

              <div className="space-y-3 sm:space-y-3.5">
                {recommendedRoles.map((role) => (
                  <div
                    key={role.title}
                    className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-pop-ink bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-neo hover:translate-x-0.5 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-md bg-pop-paper border border-pop-ink">
                          {role.stream}
                        </span>
                        <h5 className="font-black text-slate-900 text-sm sm:text-base">{role.title}</h5>
                      </div>
                      <span className="text-xs font-bold text-slate-500 mt-1 block">
                        💰 Typical entry horizon: {role.salary}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="px-3 py-1 rounded-full bg-pop-lime text-pop-ink text-xs font-black border border-pop-ink shadow-sm">
                        {role.match} Match
                      </span>
                      <Link
                        href="/careers"
                        className="text-xs font-black text-pop-violet hover:underline flex items-center gap-1"
                      >
                        Explore Roadmap →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <button
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 text-xs font-black text-pop-ink px-5 py-3 rounded-2xl border-2 border-pop-ink hover:bg-slate-100 shadow-neo transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={() => alert("Downloading your official 24-page psychometric report (PDF)...")}
                className="px-6 sm:px-8 py-3.5 rounded-2xl bg-pop-lime text-pop-ink font-black text-xs sm:text-sm border-2 border-pop-ink shadow-neo-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Diagnostic PDF</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
