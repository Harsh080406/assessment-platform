"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles, Zap, Flame, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 overflow-hidden bg-student-grid border-b-2 border-pop-ink"
      id="hero"
    >
      {/* Background kinetic gradient shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pop-lime/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 text-center relative z-10 max-w-6xl mx-auto">
        {/* Floating Student Stickers */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full bg-pop-lime text-pop-ink border-2 border-pop-ink font-black text-[10px] sm:text-xs shadow-neo rotate-[-1.5deg]"
          >
            <span>FOR STUDENTS WHO REFUSE TO GUESS</span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-pop-pink text-white border-2 border-pop-ink font-black text-[10px] sm:text-xs shadow-neo rotate-[1.5deg]"
          >
            <Flame className="w-3 h-3 fill-white" />
            <span>CLASS 8 TO GRADS</span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-pop-ink border-2 border-pop-ink font-black text-xs shadow-neo"
          >
            <span>NO BORING TESTS ✦</span>
          </motion.div>
        </div>

        {/* Big Bold Headline */}
        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-pop-ink leading-[1.12] sm:leading-[1.06]"
        >
          WHAT ARE YOU <br className="hidden sm:inline" />
          <span className="relative inline-block mt-1 sm:mt-2">
            <span className="relative z-10 px-2.5 sm:px-4 py-0.5 sm:py-1 bg-pop-lime border-2 sm:border-3 border-pop-ink shadow-neo sm:shadow-neo-lg text-pop-ink rounded-xl sm:rounded-2xl rotate-[-1deg] inline-block text-2xl xs:text-3xl sm:text-6xl lg:text-7xl xl:text-8xl">
              ACTUALLY BUILT FOR?
            </span>
          </span>
        </motion.h1>

        {/* Relatable Subheading */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-4 sm:mt-6 text-sm sm:text-xl text-slate-700 max-w-2xl mx-auto font-bold leading-relaxed px-1"
        >
          Stop letting relatives, WhatsApp groups, and outdated advice pick your future. Uncover your real cognitive strengths and modern 2026+ career horizons in 20 minutes.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-none mx-auto"
        >
          <Link
            href="/assessment"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-lg font-black text-pop-ink bg-pop-lime hover:bg-[#b8e600] rounded-2xl border-3 border-pop-ink shadow-neo-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pop-ink fill-pop-ink" />
            <span>Discover My Superpowers</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </Link>

          <Link
            href="/quests"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-4 text-sm sm:text-base font-black text-pop-ink bg-white hover:bg-slate-50 rounded-2xl border-3 border-pop-ink shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pop-ink" />
            <span>See The 4 Quests</span>
          </Link>
        </motion.div>

        {/* Trust & Live Indicator Strip */}
        
      </div>
    </section>
  );
}
