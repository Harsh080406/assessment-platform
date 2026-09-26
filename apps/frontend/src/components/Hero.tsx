"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Rocket, Play, Sparkles, BarChart3, TrendingUp, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const HERO_PHRASES = [
  "Calibrate Your Trajectory.",
  "Discover Your Strengths.",
  "Architect Your Future.",
  "Unlock Your Potential.",
  "Map Your Career Path.",
];

export default function Hero() {
  const { openAuth } = useAuth();

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(HERO_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = HERO_PHRASES[phraseIndex];

    let timer: NodeJS.Timeout;

    if (!isDeleting && displayedText === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    } else {
      const speed = isDeleting ? 38 : 75;
      timer = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting
            ? currentPhrase.substring(0, prev.length - 1)
            : currentPhrase.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, phraseIndex]);

  return (
    <section
      className="relative pt-6 sm:pt-10 md:pt-16 lg:pt-20 pb-12 sm:pb-20 lg:pb-28 overflow-hidden bg-[#FAFAF8]"
      id="hero"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-[#FF6B6B]/5 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* LEFT COLUMN: Headlines & CTAs (~50% on desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left z-10">
            
            

            {/* 2. Headline with Typewriter Animation */}
            <motion.h1
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[38px] xs:text-[44px] sm:text-[56px] md:text-[64px] lg:text-[68px] xl:text-[76px] 2xl:text-[84px] font-black tracking-[-0.035em] text-[#0F172A] leading-[1.0] sm:leading-[0.98] text-left mb-3 sm:mb-0 min-h-[160px] sm:min-h-[220px] lg:min-h-[240px]"
            >
              Stop Guessing <br />
              Your Potential. <br />
              <span className="text-[#FF6B6B] inline-block">
                {displayedText}
              </span>
            </motion.h1>

            {/* 3. Supporting Description */}
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ color: "#000000" }}
              className="mt-0 sm:mt-6 mb-5 sm:mb-0 text-sm sm:text-lg lg:text-[19px] 2xl:text-xl text-[#000000] max-w-[350px] sm:max-w-[640px] font-bold leading-[1.45] sm:leading-[1.6]"
            >
              Map your natural problem-solving instincts to 2026+ high-growth careers in just 20 minutes.
            </motion.p>

            {/* 4 & 5. Mobile & Desktop CTAs */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 sm:mt-8"
            >
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-[52px] sm:h-[60px] px-6 sm:px-9 text-sm sm:text-base font-extrabold bg-[#FF6B6B] hover:bg-[#F95858] text-white rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer text-center group"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] text-white" />
                <span>Sign Up Free</span>
              </button>

              <Link
                href="/quests"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-[52px] sm:h-[60px] px-6 sm:px-9 text-sm sm:text-base font-extrabold bg-[#0F172A] hover:bg-black text-white rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer text-center group"
              >
                <span>Explore The 4 Modules</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform shrink-0 text-white" />
              </Link>
            </motion.div>
          </div>

          {/* 6. RIGHT COLUMN: Student Visual & Integrated SaaS Floating Cards (~50% on desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end mt-7 sm:mt-10 lg:mt-0">
            <div className="relative w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[460px] lg:max-w-[540px] xl:max-w-[620px] 2xl:max-w-[680px] h-[270px] xs:h-[290px] sm:h-[460px] lg:h-[520px] xl:h-[580px] flex items-center justify-center">
              
              {/* Soft Ambient Radial Backlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B6B]/15 via-[#A9B4E8]/20 to-[#A9D8C6]/20 rounded-full blur-3xl -z-10 transform scale-95" />
              
              {/* Circular Backdrop Ring */}
              <div className="absolute w-[210px] h-[210px] xs:w-[230px] xs:h-[230px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] xl:w-[500px] xl:h-[500px] bg-gradient-to-br from-[#FFF0EE] to-[#EEF2FF] rounded-full border border-[#FED7CC]/40 shadow-inner -z-10 bottom-2" />

              {/* Student Visual Cutout Image */}
              <div className="relative w-full h-full flex items-end justify-center z-10">
                <Image
                  src="/ChatGPT Image Sep 26, 2026, 01_16_28 PM_upscayl_5x_upscayl-standard-4x.png"
                  alt="AuraPath Student discovering career trajectory"
                  fill
                  priority
                  className="object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:scale-[1.01]"
                  sizes="(max-width: 640px) 340px, (max-width: 1024px) 540px, 680px"
                />
              </div>

              {/* Top-Right Decorative Pill: "Discover • Align • Succeed" (Hidden on Mobile) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="hidden sm:flex absolute -top-3 right-2 sm:right-4 z-20 -rotate-3 pointer-events-none"
              >
                <span className="text-xs sm:text-sm font-extrabold italic text-[#FF6B6B] bg-white px-3.5 py-1.5 rounded-full border border-[#FED7CC] shadow-sm">
                  Discover • Align • Succeed
                </span>
              </motion.div>

              {/* CARD 1 (Upper Left): "Your Future Starts with Self-Knowledge" */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: -8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="absolute top-1 -left-1 xs:top-2 xs:left-0 sm:top-6 sm:-left-4 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3.5 border border-[#E2E8F0] shadow-md flex items-center gap-2 sm:gap-3 z-20 max-w-[170px] xs:max-w-[195px] sm:max-w-[240px]"
              >
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FFF0EE] border border-[#FED7CC]/60 flex items-center justify-center text-[#FF6B6B] font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#FF6B6B]" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight truncate">
                    Your Future Starts
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-medium text-[#64748B] leading-tight truncate">
                    with Self-Knowledge
                  </div>
                </div>
              </motion.div>

              {/* CARD 2 (Lower Right): "Better Decisions Brighter Futures" */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="absolute bottom-2 -right-1 xs:bottom-3 xs:right-0 sm:bottom-6 sm:-right-4 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3.5 border border-[#E2E8F0] shadow-md flex items-center gap-2 sm:gap-3 z-20 max-w-[170px] xs:max-w-[195px] sm:max-w-[240px]"
              >
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A] font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#16A34A]" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight truncate">
                    Better Decisions
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-[#16A34A] leading-tight truncate">
                    Brighter Futures
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
