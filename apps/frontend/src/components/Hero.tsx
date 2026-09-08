"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Rocket, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden"
      id="hero"
    >
      {/* Background Image - Modern Collaborative Team */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/hero-bg.jpg"
          alt="Modern Collaborative Student Team"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Directional scrim: darker on left to make text pop, clear on right for students */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FBFBF9]" />
      </div>

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10 max-w-[1700px] mr-auto">
        <div className="max-w-xl lg:max-w-2xl xl:max-w-[650px] flex flex-col items-start text-left">
            {/* Editorial Eyebrow Tag */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs mb-4 shadow-lg shadow-black/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A9B4E8]" />
              <span className="tracking-wider uppercase text-[10px] sm:text-xs text-white font-black drop-shadow-sm">
                Diagnostics • 2026+
              </span>
            </motion.div>

            {/* Grand Headline with Website Palette Gradient */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-[family-name:var(--font-dm-sans)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
            >
              STOP GUESSING <br />
              YOUR POTENTIAL. <br />
              <span className="bg-gradient-to-r from-[#A9B4E8] via-[#8E9BDD] to-[#F472B6] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(169,180,232,0.4)]">
                CALIBRATE YOUR TRAJECTORY.
              </span>
            </motion.h1>

            {/* Streamlined Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-zinc-100 max-w-lg font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              Map your natural problem-solving instincts to 2026+ high-growth careers in 20 minutes.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 w-full"
            >
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold bg-[#A9B4E8] text-black hover:bg-white rounded-xl shadow-xl shadow-[#A9B4E8]/25 transition-all duration-200 active:scale-[0.98]"
              >
                <Rocket className="w-4 h-4 stroke-[2.5] text-black" />
                <span className="text-black font-extrabold">Launch Assessment</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-black" />
              </Link>

              <Link
                href="/quests"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold bg-white text-black hover:bg-[#EEF1FB] border border-[#E2E0DB] rounded-xl shadow-md transition-all duration-200"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                <span className="text-black font-bold" style={{ color: "#000000" }}>Watch Video</span>
              </Link>
            </motion.div>

            {/* Bottom Stats Row - Compact & Mobile Friendly */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-7 sm:mt-10 pt-5 border-t border-[#C8C5BD] flex items-center gap-4 sm:gap-8 w-full"
            >
              <div>
                <div className="text-xl sm:text-3xl font-black text-black" style={{ color: "#000000" }}>10K+</div>
                <div className="text-[11px] sm:text-xs font-bold text-black mt-0.5" style={{ color: "#000000" }}>Guided</div>
              </div>
              <div className="w-px h-7 bg-[#C8C5BD]" />
              <div>
                <div className="text-xl sm:text-3xl font-black text-black" style={{ color: "#000000" }}>500+</div>
                <div className="text-[11px] sm:text-xs font-bold text-black mt-0.5" style={{ color: "#000000" }}>Roles</div>
              </div>
              <div className="w-px h-7 bg-[#C8C5BD]" />
              <div>
                <div className="text-xl sm:text-3xl font-black text-black" style={{ color: "#000000" }}>50+</div>
                <div className="text-[11px] sm:text-xs font-bold text-black mt-0.5" style={{ color: "#000000" }}>Partners</div>
              </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
