"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingQuickAction() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="hidden md:block fixed bottom-6 right-6 z-40"
        >
          <Link
            href="/assessment"
            className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-pop-lime text-pop-ink font-black text-xs sm:text-sm border-2 sm:border-3 border-pop-ink shadow-neo sm:shadow-neo-lg hover:shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pop-ink text-pop-lime flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pop-lime" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight text-xs sm:text-sm">Quick Quiz</span>
              <span className="text-[9px] sm:text-[10px] text-slate-700 font-bold hidden xs:inline">20 mins • Free</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
