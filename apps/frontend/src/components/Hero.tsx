"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, UserPlus } from "lucide-react";
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
      className="relative pt-6 sm:pt-10 md:pt-14 lg:pt-16 pb-10 sm:pb-16 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-[#FDF8F6] to-[#FBFBF9] border-b border-[#E2E8F0]/80"
      id="hero"
    >
      {/* Background Ambient Glow & Light Themed Accents */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft Warm Coral/Blush Radial Glow in Top Left */}
        <div className="absolute -top-24 -left-20 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full bg-gradient-to-br from-[#FF6B6B]/10 via-[#FED7CC]/20 to-transparent blur-3xl" />

        {/* Subtle Soft Lavender/Sky Glow on Right Behind Student Image */}
        <div className="absolute top-12 right-0 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full bg-gradient-to-bl from-[#EEF2FF]/60 via-[#F3F5FC]/30 to-transparent blur-3xl" />

        {/* Elegant Micro-Grid Pattern for Studio Editorial Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.22] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 max-w-[1920px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* LEFT COLUMN: Headlines & CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left z-10">
            
            {/* 1. Headline with Typewriter Animation */}
            <motion.h1
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[34px] xs:text-[40px] sm:text-[50px] md:text-[56px] lg:text-[60px] xl:text-[68px] 2xl:text-[74px] font-black tracking-[-0.035em] text-[#0F172A] leading-[1.06] sm:leading-[1.0] text-left mb-3 sm:mb-0"
            >
              Stop Guessing <br />
              Your Potential.
              <span className="text-[#FF6B6B] block min-h-[2.25em] sm:min-h-[2.1em] mt-0.5">
                {displayedText || "\u00A0"}
                <span className="inline-block w-[3px] sm:w-[4px] h-[0.82em] bg-[#FF6B6B] align-middle ml-1.5 animate-pulse" />
              </span>
            </motion.h1>

            {/* 2. Supporting Description */}
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2 sm:mt-5 mb-5 sm:mb-0 text-sm sm:text-base lg:text-[18px] text-[#475569] max-w-[350px] sm:max-w-[620px] font-semibold leading-relaxed"
            >
              From self-discovery to leadership: a validated assessment, expert counselling, mentorship and a 5-year pathway that helps every student become the leader, innovator and builder they can be.
            </motion.p>

            {/* 3. Action CTAs */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 sm:mt-8"
            >
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-[50px] sm:h-[56px] px-6 sm:px-9 text-sm sm:text-base font-extrabold bg-[#FF6B6B] hover:bg-[#F95858] text-white rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer text-center group whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] text-white" />
                <span>Sign Up Free</span>
              </button>

              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-[50px] sm:h-[56px] px-6 sm:px-9 text-sm sm:text-base font-extrabold bg-[#0F172A] hover:bg-black text-white rounded-xl sm:rounded-2xl shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer text-center group whitespace-nowrap"
              >
                <span>See How It Works</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform shrink-0 text-white" />
              </Link>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Hero Visual Image */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end mt-4 sm:mt-6 lg:mt-0 select-none">
            <div
              className="relative w-full max-w-[260px] xs:max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] xl:max-w-[460px] 2xl:max-w-[500px] aspect-[955/926] select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <Image
                src="/hero-student.webp"
                alt="Smiling Student with Laptop and Backpack - Alderwood Vantage"
                fill
                priority
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="object-contain object-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-transform duration-500 hover:scale-[1.01] pointer-events-none select-none"
                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 35vw, 480px"
                style={
                  {
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitUserDrag: "none",
                    pointerEvents: "none",
                  } as React.CSSProperties
                }
              />
              <div
                className="absolute inset-0 z-10 select-none cursor-default"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                aria-hidden="true"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
