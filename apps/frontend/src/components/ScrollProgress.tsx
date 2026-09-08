"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Progress Bar Line */}
      <motion.div
        className="h-1.5 origin-left bg-gradient-to-r from-pop-lime via-pop-cyan via-pop-pink to-pop-orange shadow-[0_0_12px_rgba(204,255,0,0.8)]"
        style={{ scaleX }}
      />
    </div>
  );
}
