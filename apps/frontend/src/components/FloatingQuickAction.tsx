"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#A9B4E8] text-black font-extrabold text-xs sm:text-sm border border-[#8E9BDD] shadow-lg hover:bg-[#8E9BDD] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 stroke-[2.2] text-black" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight text-xs sm:text-sm text-black font-extrabold">Assessment</span>
              <span className="text-[10px] text-black/80 font-bold">20 mins • Free</span>
            </div>
            <ArrowRight className="w-4 h-4 stroke-[2.5] text-black group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
