"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyStackHowItWorks from "@/components/StickyStackHowItWorks";
import FloatingQuickAction from "@/components/FloatingQuickAction";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function QuestsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-pop-paper text-pop-ink font-sans selection:bg-pop-lime selection:text-pop-ink">
      <Navbar />

      <main className="flex-1">
        {/* Unified The 4 Stacking Cards Section */}
        <StickyStackHowItWorks />

        {/* Bottom Launch Banner */}
        <section className="py-12 sm:py-16 bg-pop-ink text-white border-t-4 border-pop-ink">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-pop-lime text-pop-ink px-3 py-1 rounded-full border border-pop-ink shadow-neo mb-3 sm:mb-4">
              <Zap className="w-3.5 h-3.5 fill-pop-ink" />
              Ready to Begin?
            </span>
            <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight">
              START WITH QUEST 01 TODAY
            </h2>
            <p className="text-slate-300 font-medium text-xs sm:text-base mt-2 sm:mt-3 max-w-xl mx-auto px-1">
              It takes 60 seconds to calibrate your genesis stage. No spam, no test anxiety, and 100% private.
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Link
                href="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-pop-lime text-pop-ink font-black text-sm sm:text-base hover:bg-[#b8e600] transition-all shadow-neo border-2 border-white"
              >
                <span>Launch Genesis Profile</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingQuickAction />
    </div>
  );
}
