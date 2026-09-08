"use client";

interface MarqueeTickerProps {
  reverse?: boolean;
  theme?: "lime" | "dark" | "pink" | "cyan";
}

const ITEMS_1 = [
  "⚡ STOP GUESSING YOUR LIFE",
  "🎯 0% BORING QUESTIONNAIRES",
  "🧠 REAL PSYCHOMETRIC POTENTIAL",
  "🚫 NO MORE RELATIVES TELLING YOU WHAT TO STUDY",
  "✨ 48,000+ STUDENTS UNLOCKED",
  "🚀 CLASS 8 TO UNIVERSITY GRADS",
  "🧬 DISCOVER YOUR SUPERPOWERS",
  "🔮 FUTURE-PROOF CAREERS",
];

const ITEMS_2 = [
  "🔥 WHAT ARE YOU ACTUALLY BUILT FOR?",
  "💡 BIG FIVE PERSONALITY THEORY",
  "🎓 FIND YOUR EXACT COLLEGE MAJOR",
  "📈 SALARY BENCHMARKS & ROADMAPS",
  "🎨 DIVERGENT THINKERS WELCOME",
  "⚡ TAKE THE 3-MIN QUICK QUIZ",
  "💼 ZERO PRESSURE • 100% CLARITY",
];

export default function MarqueeTicker({
  reverse = false,
  theme = "lime",
}: MarqueeTickerProps) {
  const items = reverse ? ITEMS_2 : ITEMS_1;
  const repeated = [...items, ...items, ...items, ...items];

  const getThemeClasses = () => {
    switch (theme) {
      case "lime":
        return "bg-pop-lime text-pop-ink border-y-2 border-pop-ink font-black";
      case "dark":
        return "bg-pop-ink text-white border-y-2 border-pop-lime font-black";
      case "pink":
        return "bg-pop-pink text-white border-y-2 border-pop-ink font-black";
      case "cyan":
        return "bg-pop-cyan text-pop-ink border-y-2 border-pop-ink font-black";
      default:
        return "bg-pop-lime text-pop-ink border-y-2 border-pop-ink font-black";
    }
  };

  return (
    <div className={`overflow-hidden py-3 select-none ${getThemeClasses()}`}>
      <div className={reverse ? "animate-marquee-reverse" : "animate-marquee"}>
        {repeated.map((item, idx) => (
          <div key={idx} className="flex items-center mx-4 gap-4 shrink-0 text-xs sm:text-sm md:text-base tracking-wider uppercase">
            <span>{item}</span>
            <span className="text-base opacity-70">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
