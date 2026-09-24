"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
    questNum: "MODULE A",
    title: "Psychometric Assessment",
    tagline: "Pinpoint core cognitive architecture & problem-solving styles",
    description:
      "A comprehensive evaluation of your intrinsic processing style, analytical instincts, cognitive patterns, and decision frameworks.",
    timeTag: "Takes 15 mins",
    stageTag: "Class 8 to College",
    colorBg: "bg-white",
    textColor: "text-[#0F172A]",
    badgeBg: "bg-[#EEF2FF]",
    badgeText: "text-[#4F46E5]",
    icon: "🧭",
    points: [
      "Measures core cognitive processing style",
      "Evaluates analytical vs intuitive tendencies",
      "Tailors scenarios to your educational stage",
    ],
    hudBadgeTitle: "MODULE A DIAGNOSTIC",
    hudBadgeValue: "Cognitive Processing & Analytics",
    hudPreviewText: "Zero anxiety • 100% student private",
    ctaText: "Start Module A",
    ctaLink: "/assessment",
  },
  {
    id: "quest-2",
    stepNum: 2,
    questNum: "MODULE B",
    title: "Competency Self-Report",
    tagline: "Calibrate behavioral strengths, work preferences, and leadership traits",
    description:
      "Self-report behavioral competencies, workplace collaboration rhythms, stress adaptation, and interpersonal leadership preferences.",
    timeTag: "Takes 20 mins",
    stageTag: "Self-Report Matrix",
    colorBg: "bg-white",
    textColor: "text-[#0F172A]",
    badgeBg: "bg-[#EEF2FF]",
    badgeText: "text-[#4F46E5]",
    icon: "⚡",
    points: [
      "Dynamic behavioral competency matrix",
      "Measures team collaboration & leadership style",
      "Evaluates emotional resilience & stress response",
    ],
    hudBadgeTitle: "COMPETENCY MATRIX",
    hudBadgeValue: "Behavioral & Leadership Drivers",
    hudPreviewText: "Measures natural workplace instincts",
    ctaText: "Start Module B",
    ctaLink: "/assessment",
  },
  {
    id: "quest-3",
    stepNum: 3,
    questNum: "MODULE C",
    title: "Situational Judgment Test",
    tagline: "Battle real-world scenario dilemmas and ethical workplace trade-offs",
    description:
      "Tackle immersive real-world situational dilemmas that test your practical problem solving, ethical reasoning, and critical decision-making.",
    timeTag: "Takes 15 mins",
    stageTag: "Scenario Dilemmas",
    colorBg: "bg-white",
    textColor: "text-[#0F172A]",
    badgeBg: "bg-[#F0FDF4]",
    badgeText: "text-[#16A34A]",
    icon: "🧠",
    points: [
      "Real-world situational judgment scenarios",
      "Evaluates crisis management & ethics",
      "Identifies practical problem-solving superpowers",
    ],
    hudBadgeTitle: "SITUATIONAL ENGINE",
    hudBadgeValue: "Practical Dilemma Synthesis",
    hudPreviewText: "Real-world Scenario Evaluation",
    ctaText: "Start Module C",
    ctaLink: "/assessment",
  },
  {
    id: "quest-4",
    stepNum: 4,
    questNum: "MODULE D",
    title: "Aptitude: Verbal Reasoning",
    tagline: "Assess logical deduction, verbal comprehension, and structural analysis",
    description:
      "Diagnose verbal aptitude, complex passage analysis, logical inference, and conceptual reasoning precision for future-proof academic and career pathways.",
    timeTag: "Takes 18 mins",
    stageTag: "Verbal & Logic",
    colorBg: "bg-white",
    textColor: "text-[#0F172A]",
    badgeBg: "bg-[#FFF0EE]",
    badgeText: "text-[#FF6B6B]",
    icon: "🚀",
    points: [
      "Verbal comprehension & logic inference",
      "Structured critical thinking benchmarks",
      "Actionable academic & skill roadmap",
    ],
    hudBadgeTitle: "APTITUDE ENGINE",
    hudBadgeValue: "Verbal Reasoning & Inference",
    hudPreviewText: "Critical Thinking Calibration",
    ctaText: "Start Module D",
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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      id={quest.id}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group scroll-mt-24 lg:scroll-mt-32 w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-10 flex flex-col justify-between overflow-hidden border border-[#CBD5E1] hover:border-[#FF6B6B]/60 text-black shadow-xs hover:shadow-2xl transition-all duration-300 ${
        isDesktop
          ? "sticky top-24 lg:top-28 h-[460px]"
          : "relative h-auto mb-6 sm:mb-8"
      } ${quest.colorBg}`}
      style={{
        zIndex: isDesktop ? index + 1 : 1,
        marginBottom: isDesktop ? (isLast ? "0" : "2.5rem") : undefined,
        transformOrigin: "top center",
        transform: isDesktop ? `scale(${scale})` : undefined,
        boxShadow: isDesktop
          ? index > 0
            ? "0 -8px 24px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.08)"
            : "0 4px 16px -4px rgba(0,0,0,0.08)"
          : undefined,
      }}
    >
      {/* Interactive Cursor Spotlight Backlight */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl transition-opacity duration-300 opacity-100 z-0"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 107, 107, 0.07), transparent 60%)`,
          }}
        />
      )}

      {/* 1. Card Top Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-[#CBD5E1] pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quest / Module Badge */}
          <motion.span
            whileHover={{ scale: 1.08 }}
            className="px-3 py-1 sm:py-1.5 rounded-lg font-black text-xs sm:text-sm uppercase border border-[#0F172A] bg-black text-white shadow-xs cursor-default"
          >
            {quest.questNum}
          </motion.span>
          {/* Stage Tag */}
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] text-black">
            <Target className="w-3.5 h-3.5 text-black" />
            <span className="text-black" style={{ color: "#000000" }}>{quest.stageTag}</span>
          </span>
          {/* Time Tag */}
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] text-black">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span className="text-black" style={{ color: "#000000" }}>{quest.timeTag}</span>
          </span>
        </div>

        {/* Step Indicator & Segmented Progress Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] text-black">
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black" style={{ color: "#000000" }}>
            {quest.stepNum}/4
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 sm:h-2.5 w-2.5 sm:w-3.5 rounded-sm transition-colors ${
                  step <= quest.stepNum
                    ? "bg-[#000000]"
                    : "bg-[#CBD5E1]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center my-auto py-3 sm:py-6">
        {/* Left Column: Headlines, Description, Feature Badges */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-black group-hover:text-[#0F172A] transition-colors" style={{ color: "#000000" }}>
            {quest.title}
          </h3>
          <p className="text-sm sm:text-base lg:text-lg font-black mt-1.5 sm:mt-2 text-black" style={{ color: "#000000" }}>
            {quest.tagline}
          </p>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm lg:text-base font-bold leading-relaxed max-w-2xl text-black" style={{ color: "#000000" }}>
            {quest.description}
          </p>

          {/* Bullet Points */}
          <div className="mt-3.5 sm:mt-5 flex flex-wrap gap-2">
            {quest.points.map((pt) => (
              <motion.span
                key={pt}
                whileHover={{ scale: 1.03, y: -1 }}
                className="text-[11px] sm:text-xs lg:text-sm font-bold px-3 py-1 sm:py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-black inline-flex items-center gap-1.5 transition-shadow shadow-xs hover:border-[#FF6B6B]/40"
                style={{ color: "#000000" }}
              >
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black bg-[#A9D8C6] text-black" style={{ color: "#000000" }}>
                  ✓
                </span>
                <span className="text-black font-bold" style={{ color: "#000000" }}>{pt}</span>
              </motion.span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Preview HUD Card */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-stretch justify-center">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-2xl border border-[#CBD5E1] group-hover:border-[#FF6B6B]/50 p-4 sm:p-5 lg:p-6 shadow-xs group-hover:shadow-lg flex flex-col gap-3 sm:gap-4 mt-2 lg:mt-0 bg-[#F8FAFC] text-black transition-all"
          >
            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
              <motion.div
                whileHover={{ rotate: [0, -12, 12, 0], scale: 1.15 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 border border-[#CBD5E1] bg-white text-black shadow-xs"
              >
                {quest.icon}
              </motion.div>
              <div className="text-right">
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black" style={{ color: "#000000" }}>
                  {quest.hudBadgeTitle}
                </div>
                <div className="text-xs sm:text-sm font-black truncate max-w-[200px] sm:max-w-none text-black" style={{ color: "#000000" }}>
                  {quest.hudBadgeValue}
                </div>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs font-bold p-2.5 rounded-lg border border-[#CBD5E1] flex items-center gap-1.5 bg-white text-black">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#FF6B6B]" />
              <span className="truncate text-black font-bold" style={{ color: "#000000" }}>{quest.hudPreviewText}</span>
            </div>

            <Link
              href={quest.ctaLink}
              className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#FF6B6B] hover:bg-[#F95858] text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98] group/btn"
            >
              <span className="text-white font-bold">{quest.ctaText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-white group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 3. Card Bottom Bar */}
      <div className="relative z-10 flex items-center justify-end pt-2.5 sm:pt-3 border-t border-[#CBD5E1] text-[10px] sm:text-xs font-bold mt-2 text-black">
        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-bold text-black">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-black" />
          <span className="text-black font-bold" style={{ color: "#000000" }}>Diagnostic Pipeline Verified</span>
        </span>
      </div>
    </motion.div>
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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:bg-[#F8FAFC] transition-colors mb-5 bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-black" />
            <span className="text-black">Back to Home</span>
          </Link>

          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-wider uppercase bg-[#EEF2FF] text-black border border-[#E0E7FE] px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
              <Compass className="w-3.5 h-3.5 stroke-[2.2] text-[#4F46E5]" />
              <span className="text-black">The Complete Assessment Framework</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black mt-2 tracking-tight">
            THE 4 ASSESSMENT MODULES
          </h1>
          <p className="text-black font-semibold text-sm sm:text-lg mt-3 max-w-2xl mx-auto px-1 leading-relaxed">
            Four specialized diagnostic modules evaluating your cognitive architecture, behavioral competencies, situational judgment, and verbal reasoning.
          </p>

          {/* Mini Step Indicator Badges */}
          <div className="mt-8 flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar py-1 gap-2.5 justify-start sm:justify-center px-1">
            {QUESTS.map((q, i) => (
              <a
                key={q.id}
                href={`#${q.id}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 border ${
                  activeCardIndex === i
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-white text-black border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeCardIndex === i ? "bg-[#FF6B6B]" : "bg-[#CBD5E1]"}`} />
                <span className="text-inherit">{q.questNum}: {q.title}</span>
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
