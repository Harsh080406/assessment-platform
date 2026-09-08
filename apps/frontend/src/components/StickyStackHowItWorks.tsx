"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  ShieldCheck,
  Compass,
} from "lucide-react";
import Link from "next/link";

interface QuestCard {
  id: string;
  stepNum: number;
  questNum: string;
  title: string;
  tagline: string;
  description: string;
  timeTag: string;
  stageTag: string;
  colorBg: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  points: string[];
  hudBadgeTitle: string;
  hudBadgeValue: string;
  hudPreviewText: string;
  ctaText: string;
  ctaLink: string;
}

const QUESTS: QuestCard[] = [
  {
    id: "quest-1",
    stepNum: 1,
    questNum: "QUEST 01",
    title: "Craft Your Genesis Profile",
    tagline: "Pinpoint exactly where you stand right now",
    description:
      "Whether you're picking streams in Class 10, preparing for competitive entrances in Class 12, or feeling misaligned in college, we calibrate everything to your real stage.",
    timeTag: "Takes 60 seconds",
    stageTag: "Class 9 to College",
    colorBg: "bg-white",
    textColor: "text-black",
    badgeBg: "bg-[#A9B4E8]",
    badgeText: "text-black",
    icon: "🧭",
    points: [
      "Select your exact class or semester",
      "No spam, zero unsolicited coaching calls",
      "Tailors dilemmas to your life stage",
    ],
    hudBadgeTitle: "STAGE CALIBRATION",
    hudBadgeValue: "Class 9 • 10 • 11 • 12 • College",
    hudPreviewText: "Zero spam • 100% student private",
    ctaText: "Start Quest 01",
    ctaLink: "/assessment",
  },
  {
    id: "quest-2",
    stepNum: 2,
    questNum: "QUEST 02",
    title: "Battle Dilemmas, Not Math Formulas",
    tagline: "Intuitive scenario-based psychometrics that feel like an RPG",
    description:
      "Forget test anxiety. There are no right or wrong answers, no geometry tricks, and no memorization. You'll tackle real scenarios that reveal how your brain naturally solves problems.",
    timeTag: "Adaptive 20 mins",
    stageTag: "Zero Test Anxiety",
    colorBg: "bg-white",
    textColor: "text-black",
    badgeBg: "bg-[#A9B4E8]",
    badgeText: "text-black",
    icon: "⚡",
    points: [
      "Dynamic adaptive question engine",
      "Measures divergent vs. algorithmic instincts",
      "Zero negative marking or penalty points",
    ],
    hudBadgeTitle: "LIVE SCENARIO ENGINE",
    hudBadgeValue: "Dilemma #04: Server Crash vs. Demo",
    hudPreviewText: "Measures natural cognitive instincts",
    ctaText: "Battle Dilemmas",
    ctaLink: "/assessment",
  },
  {
    id: "quest-3",
    stepNum: 3,
    questNum: "QUEST 03",
    title: "Unlock Your Cognitive Archetype",
    tagline: "More than a boring report card or generic letter grade",
    description:
      "Receive your distinct cognitive profile—like 'The Creative Strategist' or 'The Systems Architect'—with a personalized 5-dimensional radar signature, cognitive traits, and energy zones.",
    timeTag: "Precision Report",
    stageTag: "Psychometric Rigor",
    colorBg: "bg-white",
    textColor: "text-black",
    badgeBg: "bg-[#A9D8C6]",
    badgeText: "text-black",
    icon: "🧠",
    points: [
      "Calibrated on Big Five & RIASEC models",
      "Visual cognitive radar signature",
      "Identifies hidden natural superpowers",
    ],
    hudBadgeTitle: "ARCHETYPE DECODER",
    hudBadgeValue: "The Creative Strategist • 96% Match",
    hudPreviewText: "5-Dimension Cognitive Radar",
    ctaText: "Decode Archetype",
    ctaLink: "/assessment",
  },
  {
    id: "quest-4",
    stepNum: 4,
    questNum: "QUEST 04",
    title: "Launch Your High-Growth Odyssey",
    tagline: "Actionable, modern, future-proof career paths tailored for 2026+",
    description:
      "Get matched to real 2026+ career horizons (from Spatial AI to Behavioral Economics), with real entry salary benchmarks, recommended degree majors, and step-by-step prep roadmaps.",
    timeTag: "Lifelong Roadmap",
    stageTag: "180+ Future Careers",
    colorBg: "bg-white",
    textColor: "text-black",
    badgeBg: "bg-[#A9B4E8]",
    badgeText: "text-black",
    icon: "🚀",
    points: [
      "180+ modern industry roles mapped",
      "College degree & entrance priorities",
      "Actionable reading & project starter pack",
    ],
    hudBadgeTitle: "CAREER HORIZON",
    hudBadgeValue: "Spatial Systems & Modern AI",
    hudPreviewText: "Actionable 4-Year Prep Roadmap",
    ctaText: "Launch Your Odyssey",
    ctaLink: "/careers",
  },
];

interface QuestCardItemProps {
  quest: QuestCard;
  index: number;
  total: number;
  scrollProgress: number;
  isDesktop: boolean;
}

function QuestCardItem({ quest, index, total, scrollProgress, isDesktop }: QuestCardItemProps) {
  const isLast = index === total - 1;

  const start = index * 0.25 + 0.12;
  const end = start + 0.12;

  let scale = 1;

  if (isDesktop && !isLast) {
    if (scrollProgress >= end) {
      scale = 0.96;
    } else if (scrollProgress > start) {
      const factor = (scrollProgress - start) / (end - start);
      scale = 1 - factor * 0.04;
    }
  }

  return (
    <div
      id={quest.id}
      className={`scroll-mt-20 lg:scroll-mt-28 w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-10 flex flex-col justify-between overflow-hidden border border-[#E2E0DB] text-black ${
        isDesktop
          ? "sticky top-20 lg:top-24 h-[460px]"
          : "relative h-auto mb-6 sm:mb-8"
      } ${quest.colorBg}`}
      style={{
        zIndex: isDesktop ? (index + 1) * 10 : 1,
        marginBottom: isDesktop ? (isLast ? "0" : "2.5rem") : undefined,
        transformOrigin: "top center",
        transform: isDesktop ? `scale(${scale})` : "none",
        opacity: 1,
        transition: isDesktop ? "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        boxShadow: isDesktop
          ? index > 0
            ? "0 -8px 24px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.08)"
            : "0 4px 16px -4px rgba(0,0,0,0.08)"
          : "0 4px 16px -4px rgba(0,0,0,0.08)",
      }}
    >
      {/* 1. Card Top Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E2E0DB] pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quest Number Badge */}
          <span
            className={`px-3 py-1 sm:py-1.5 rounded-lg font-black text-xs sm:text-sm uppercase border border-[#E2E0DB] ${quest.badgeBg} ${quest.badgeText}`}
          >
            {quest.questNum}
          </span>
          {/* Stage Tag */}
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E2E0DB] bg-[#EEF1FB] text-black">
            <Target className="w-3.5 h-3.5 text-black" />
            {quest.stageTag}
          </span>
          {/* Time Tag */}
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#E2E0DB] bg-[#EEF1FB] text-black">
            <Clock className="w-3.5 h-3.5 text-black" />
            {quest.timeTag}
          </span>
        </div>

        {/* Step Indicator & Segmented Progress Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E0DB] bg-[#EEF1FB] text-black">
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
            {quest.stepNum}/4
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 sm:h-2.5 w-2 sm:w-3.5 rounded-sm transition-colors ${
                  step <= quest.stepNum
                    ? "bg-[#A9B4E8]"
                    : "bg-[#E2E0DB]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center my-auto py-3 sm:py-6">
        {/* Left Column: Headlines, Description, Feature Badges */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-black font-[family-name:var(--font-dm-sans)]"
            style={{ color: "#000000" }}
          >
            {quest.title}
          </h3>
          <p
            className="text-sm sm:text-base lg:text-lg font-bold mt-1.5 sm:mt-2 text-black"
            style={{ color: "#000000" }}
          >
            {quest.tagline}
          </p>
          <p
            className="mt-2.5 sm:mt-4 text-xs sm:text-sm lg:text-base font-semibold leading-relaxed max-w-2xl text-black"
            style={{ color: "#000000" }}
          >
            {quest.description}
          </p>

          {/* Bullet Points */}
          <div className="mt-3.5 sm:mt-5 flex flex-wrap gap-2">
            {quest.points.map((pt) => (
              <span
                key={pt}
                className="text-[11px] sm:text-xs lg:text-sm font-bold px-3 py-1 sm:py-1.5 rounded-lg border border-[#E2E0DB] bg-[#EEF1FB] text-black inline-flex items-center gap-1.5"
                style={{ color: "#000000" }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black bg-[#A9D8C6] text-black"
                  style={{ color: "#000000" }}
                >
                  ✓
                </span>
                <span className="text-black" style={{ color: "#000000" }}>{pt}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Preview HUD Card */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-stretch justify-center">
          <div
            className="rounded-2xl border border-[#E2E0DB] p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col gap-3 sm:gap-4 mt-2 lg:mt-0 bg-[#EEF1FB]/60 text-black"
          >
            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 border border-[#E2E0DB] bg-white text-black"
              >
                {quest.icon}
              </div>
              <div className="text-right">
                <div
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black"
                >
                  {quest.hudBadgeTitle}
                </div>
                <div
                  className="text-xs sm:text-sm font-extrabold truncate max-w-[200px] sm:max-w-none text-black"
                >
                  {quest.hudBadgeValue}
                </div>
              </div>
            </div>

            <div
              className="text-[11px] sm:text-xs font-bold p-2.5 rounded-lg border border-[#E2E0DB] flex items-center gap-1.5 bg-white text-black"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-black" />
              <span className="truncate text-black">{quest.hudPreviewText}</span>
            </div>

            <Link
              href={quest.ctaLink}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#A9B4E8] shadow-sm transition-all active:scale-[0.98] bg-[#A9B4E8] text-black hover:bg-[#8E9BDD]"
            >
              <span className="text-black">{quest.ctaText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-black" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Card Bottom Bar */}
      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-[#E2E0DB] text-[10px] sm:text-xs font-bold mt-2 text-black">
        <span className="text-black font-bold">
          AuraPath Adaptive Engine v2.6
        </span>
        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-bold text-black">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-black" />
          <span>Diagnostic Pipeline Verified</span>
        </span>
      </div>
    </div>
  );
}

export default function StickyStackHowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

  const activeCardIndex =
    scrollProgress < 0.25
      ? 0
      : scrollProgress < 0.50
      ? 1
      : scrollProgress < 0.75
      ? 2
      : 3;

  return (
    <section className="pt-6 sm:pt-10 pb-6 sm:pb-10 bg-[#FBFBF9] relative overflow-hidden" id="how-it-works">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
        {/* Unified Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:bg-[#EEF1FB] transition-colors mb-5 bg-white px-4 py-2 rounded-xl border border-[#E2E0DB] shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-black" />
            <span className="text-black">Back to Home</span>
          </Link>

          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-[#A9B4E8] text-black px-4 py-1.5 rounded-full mb-3 shadow-sm font-extrabold">
              <Compass className="w-4 h-4 stroke-[2.2] text-black" />
              <span className="text-black">The Complete Roadmap</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold text-black mt-2 tracking-tight font-[family-name:var(--font-dm-sans)]">
            THE 4 QUESTS TO CLARITY
          </h1>
          <p className="text-black font-semibold text-sm sm:text-lg mt-3 max-w-2xl mx-auto px-1 leading-relaxed">
            Each quest builds directly on your natural problem-solving instincts. Tap any quest or scroll through to uncover your future step-by-step.
          </p>

          {/* Mini Step Indicator Badges */}
          <div className="mt-8 flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar py-1 gap-2.5 justify-start sm:justify-center px-1">
            {QUESTS.map((q, i) => (
              <a
                key={q.id}
                href={`#${q.id}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 border ${
                  activeCardIndex === i
                    ? "bg-[#A9B4E8] text-black border-[#A9B4E8] shadow-sm"
                    : "bg-white text-black border-[#E2E0DB] hover:bg-[#EEF1FB]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#A9B4E8]" />
                <span className="text-black">{q.questNum}: {q.title.split(" ")[q.title.split(" ").length - 1]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Cards Deck */}
        <div ref={containerRef} className={`relative ${isDesktop ? "pb-8 lg:pb-12" : "pb-4"}`}>
          {QUESTS.map((quest, index) => (
            <QuestCardItem
              key={quest.id}
              quest={quest}
              index={index}
              total={QUESTS.length}
              scrollProgress={scrollProgress}
              isDesktop={isDesktop}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
