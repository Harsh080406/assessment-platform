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
      "Whether you're picking streams in Class 10, dreading entrance exams in Class 12, or feeling stuck in a college degree, we calibrate everything to your real stage.",
    timeTag: "Takes 60 seconds",
    stageTag: "Class 9 to College",
    colorBg: "bg-pop-lime",
    textColor: "text-pop-ink",
    badgeBg: "bg-pop-ink",
    badgeText: "text-pop-lime",
    icon: "🎒",
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
    tagline: "Intuitive scenario-based psychometrics that feel like a game",
    description:
      "Forget test anxiety. There are no right or wrong answers, no geometry tricks, and no memorization. You'll tackle real scenarios that reveal how your brain naturally solves problems.",
    timeTag: "Adaptive 20 mins",
    stageTag: "Zero Test Anxiety",
    colorBg: "bg-pop-cyan",
    textColor: "text-pop-ink",
    badgeBg: "bg-pop-ink",
    badgeText: "text-pop-cyan",
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
    title: "Unlock Your Student Archetype",
    tagline: "More than a boring report card or generic letter grade",
    description:
      "Receive your distinct cognitive profile—like 'The Creative Strategist' or 'The Systems Architect'—with a personalized 5-dimensional radar signature, cognitive traits, and energy zones.",
    timeTag: "Instant Holographic Report",
    stageTag: "Psychometric Calibrated",
    colorBg: "bg-pop-pink",
    textColor: "text-white",
    badgeBg: "bg-pop-yellow",
    badgeText: "text-pop-ink",
    icon: "🔮",
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
    colorBg: "bg-pop-orange",
    textColor: "text-white",
    badgeBg: "bg-pop-ink",
    badgeText: "text-white",
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
    ctaLink: "/assessment",
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

  // Staggered scroll thresholds for each card on desktop
  const start = index * 0.25 + 0.12;
  const end = start + 0.12;

  let scale = 1;
  let opacity = 1;

  if (isDesktop && !isLast) {
    if (scrollProgress >= end) {
      scale = 0.96;
      opacity = 0.88;
    } else if (scrollProgress > start) {
      const factor = (scrollProgress - start) / (end - start);
      scale = 1 - factor * 0.04; // 1.0 -> 0.96
      opacity = 1 - factor * 0.12; // 1.0 -> 0.88
    }
  }

  return (
    <div
      id={quest.id}
      className={`scroll-mt-20 lg:scroll-mt-28 w-full rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border-3 sm:border-4 border-pop-ink p-4 sm:p-7 lg:p-10 flex flex-col justify-between overflow-hidden ${
        isDesktop
          ? "sticky top-20 lg:top-24 h-[460px]"
          : "relative h-auto mb-6 sm:mb-8"
      } ${quest.colorBg}`}
      style={{
        zIndex: isDesktop ? (index + 1) * 10 : 1,
        marginBottom: isDesktop ? (isLast ? "0" : "2.5rem") : undefined,
        transformOrigin: "top center",
        transform: isDesktop ? `scale(${scale})` : "none",
        opacity: isDesktop ? opacity : 1,
        transition: isDesktop ? "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out" : "none",
        boxShadow: isDesktop
          ? index > 0
            ? "0 -16px 36px rgba(0, 0, 0, 0.22), 8px 8px 0px #0B0F19, 0 20px 40px -15px rgba(0,0,0,0.35)"
            : "8px 8px 0px #0B0F19, 0 20px 40px -15px rgba(0,0,0,0.35)"
          : "4px 4px 0px #0B0F19, 0 10px 25px -5px rgba(0,0,0,0.2)",
      }}
    >
      {/* 1. Card Top Bar */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-pop-ink/20 pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quest Number Badge */}
          <span
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase border-2 border-pop-ink shadow-neo ${quest.badgeBg} ${quest.badgeText}`}
          >
            {quest.questNum}
          </span>
          {/* Stage Tag */}
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl bg-white text-pop-ink border-2 border-pop-ink shadow-neo">
            <Target className="w-3.5 h-3.5" />
            {quest.stageTag}
          </span>
          {/* Time Tag */}
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white text-pop-ink border-2 border-pop-ink shadow-neo">
            <Clock className="w-3.5 h-3.5" />
            {quest.timeTag}
          </span>
        </div>

        {/* Step Indicator & Segmented Progress Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white text-pop-ink px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border-2 border-pop-ink shadow-neo">
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">
            {quest.stepNum}/4
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 sm:h-2.5 w-2 sm:w-3.5 rounded-sm border border-pop-ink transition-colors ${
                  step <= quest.stepNum ? "bg-pop-ink" : "bg-slate-200"
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
            className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight ${quest.textColor}`}
          >
            {quest.title}
          </h3>
          <p
            className={`text-sm sm:text-base lg:text-lg font-bold mt-1.5 sm:mt-2 opacity-90 ${quest.textColor}`}
          >
            {quest.tagline}
          </p>
          <p
            className={`mt-2.5 sm:mt-4 text-xs sm:text-sm lg:text-base font-semibold leading-relaxed max-w-2xl ${quest.textColor} opacity-95`}
          >
            {quest.description}
          </p>

          {/* Bullet Points */}
          <div className="mt-3.5 sm:mt-5 flex flex-wrap gap-2">
            {quest.points.map((pt) => (
              <span
                key={pt}
                className="text-[11px] sm:text-xs lg:text-sm font-black bg-white text-pop-ink px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border-2 border-pop-ink shadow-neo inline-flex items-center gap-1.5"
              >
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-pop-lime border border-pop-ink flex items-center justify-center text-[9px] sm:text-[10px] font-black text-pop-ink">
                  ✓
                </span>
                {pt}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Preview HUD Card */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-stretch justify-center">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 sm:border-3 border-pop-ink p-3.5 sm:p-5 lg:p-6 shadow-neo sm:shadow-neo-lg flex flex-col gap-2.5 sm:gap-3.5 mt-2 lg:mt-0">
            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-pop-paper border-2 border-pop-ink flex items-center justify-center text-xl sm:text-2xl shadow-neo shrink-0">
                {quest.icon}
              </div>
              <div className="text-right">
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {quest.hudBadgeTitle}
                </div>
                <div className="text-xs sm:text-sm font-black text-pop-ink truncate max-w-[200px] sm:max-w-none">
                  {quest.hudBadgeValue}
                </div>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs font-bold text-slate-700 bg-pop-paper p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-pop-ink/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pop-pink shrink-0" />
              <span className="truncate">{quest.hudPreviewText}</span>
            </div>

            <Link
              href={quest.ctaLink}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-pop-ink text-white font-black text-xs sm:text-sm hover:bg-slate-800 transition-all border-2 border-white flex items-center justify-center gap-2 shadow-neo group cursor-pointer active:scale-98"
            >
              <span>{quest.ctaText}</span>
              <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Card Bottom Bar */}
      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t-2 border-pop-ink/20 text-[10px] sm:text-xs font-black mt-2">
        <span className={`opacity-85 ${quest.textColor}`}>
          AuraPath Adaptive Engine v2.4
        </span>
        <span className={`inline-flex items-center gap-1 sm:gap-1.5 opacity-90 ${quest.textColor}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Pipeline</span>
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
    <section className="pt-4 sm:pt-8 pb-16 sm:pb-28 bg-pop-paper relative overflow-hidden" id="how-it-works">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
        {/* Unified Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-pop-violet transition-colors mb-4 sm:mb-5 bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-pop-ink shadow-neo"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black tracking-widest uppercase bg-pop-yellow text-pop-ink border-2 border-pop-ink px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-neo rotate-[-1deg]">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>The Complete Roadmap</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-pop-ink mt-3 sm:mt-4 tracking-tight">
            THE 4 QUESTS TO CLARITY
          </h1>
          <p className="text-slate-700 font-bold text-sm sm:text-lg mt-2 sm:mt-3 max-w-2xl mx-auto px-1 leading-relaxed">
            Each quest builds directly on your natural problem-solving instincts. Tap any quest or scroll through to uncover your future step-by-step.
          </p>

          {/* Mini Step Indicator Badges — Horizontal scrollable on touch, clickable to jump */}
          <div className="mt-6 sm:mt-8 flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar py-1 gap-2 sm:gap-3 justify-start sm:justify-center px-1">
            {QUESTS.map((q, i) => (
              <a
                key={q.id}
                href={`#${q.id}`}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black border-2 border-pop-ink transition-all duration-200 shrink-0 ${
                  activeCardIndex === i
                    ? `${q.colorBg} text-pop-ink shadow-neo scale-105`
                    : "bg-white text-slate-600 shadow-sm opacity-80 hover:opacity-100"
                }`}
              >
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${q.colorBg} border border-pop-ink`} />
                <span>{q.questNum}: {q.title.split(" ")[q.title.split(" ").length - 1]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Cards Deck: Stacking on desktop, natural clean flow on mobile */}
        <div ref={containerRef} className={`relative ${isDesktop ? "pb-24 lg:pb-36" : "pb-6"}`}>
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
