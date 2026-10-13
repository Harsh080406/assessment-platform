"use client";

interface MarqueeTickerProps {
  reverse?: boolean;
  theme?: "dark" | "light";
}

const ITEMS_1 = [
  "FIND YOUR VANTAGE",
  "RAISING LEADERS, NOT JUST EMPLOYEES",
  "PREPARE FOR EVERYTHING THE FUTURE CAN ASK",
  "ACADEMICALLY VALIDATED BY PHD ACADEMICIANS",
  "DESIGNED BY CORPORATE LEADERSHIP & HR PROFESSIONALS",
  "DDI MASTER FACILITATOR & EPSHRM, IIM CALCUTTA",
  "100% CONFIDENTIAL • PARENTAL CONSENT ASSURED",
];

const ITEMS_2 = [
  "ONE ASSESSMENT • FOUR LENSES ON POTENTIAL",
  "MODULE 1: SPARK (WHAT ENERGISES YOU)",
  "MODULE 2: WIRING (HOW YOU NATURALLY OPERATE)",
  "MODULE 3: HORSEPOWER (COGNITIVE APTITUDE)",
  "MODULE 4: EDGE (LEADERSHIP COMPETENCIES)",
  "EXECUTIVE LEADERSHIP BLUEPRINT & 5-YEAR ROADMAP",
  "VENTURE • FAMILY BUSINESS • PROFESSIONAL CAREER",
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
