"use client";

interface MarqueeTickerProps {
  reverse?: boolean;
  theme?: "dark" | "light";
}

const ITEMS_1 = [
  "SCENARIO-BASED ADAPTIVE COGNITIVE MATRIX",
  "180+ VERIFIED 2026+ CAREER HORIZONS",
  "BIG FIVE & RIASEC PSYCHOMETRIC CALIBRATION",
  "ZERO TEST ANXIETY • NO ROTE MEMORIZATION",
  "5-DIMENSION COGNITIVE RADAR PROFILE",
  "REAL ENTRY-SALARY BENCHMARKS & ROADMAPS",
  "100% PRIVATE • ZERO SPAM",
];

const ITEMS_2 = [
  "ACTIONABLE 4-YEAR COLLEGE MAJOR BLUEPRINTS",
  "DISCOVER HIDDEN PROBLEM-SOLVING INSTINCTS",
  "DIVERGENT THINKERS & SYSTEMS ARCHITECTS",
  "END STREAM PARALYSIS & UNCERTAINTY",
  "HIGH-GROWTH INDUSTRY DOMAINS MAPPED",
  "PSYCHOMETRIC RIGOR MEETS INTUITIVE DESIGN",
];

export default function MarqueeTicker({
  reverse = false,
  theme = "light",
}: MarqueeTickerProps) {
  const items = reverse ? ITEMS_2 : ITEMS_1;
  const repeated = [...items, ...items, ...items, ...items];

  const themeClasses =
    theme === "dark"
      ? "bg-[#2B2B2E] text-[#FBFBF9] border-y border-[#EDEBE7]"
      : "bg-[#F1F3FC] text-[#2B2B2E] border-y border-[#EDEBE7]";

  return (
    <div className={`overflow-hidden py-3 select-none ${themeClasses}`}>
      <div className={reverse ? "animate-ticker-reverse" : "animate-ticker"}>
        {repeated.map((item, idx) => (
          <div key={idx} className="flex items-center mx-5 gap-5 shrink-0 text-xs sm:text-sm font-bold tracking-widest uppercase">
            <span>{item}</span>
            <span className="text-[#A9B4E8] text-xs">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
