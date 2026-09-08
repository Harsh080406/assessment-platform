"use client";

import { useState } from "react";
import { Download, ShieldCheck, BarChart3, FileSpreadsheet, Lock } from "lucide-react";
import SampleReportModal from "./SampleReportModal";

export default function ParentsSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        className="py-14 sm:py-24 bg-pop-ink text-white relative overflow-hidden border-t-2 border-pop-ink"
        id="for-parents"
      >
        {/* Glow ambient shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pop-violet/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pop-pink/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-pop-lime uppercase bg-slate-900 border-2 border-pop-lime px-3.5 sm:px-4 py-1.5 rounded-full shadow-neo rotate-[1deg] inline-block">
              For Concerned Parents &amp; Mentors
            </span>
            <h2 className="text-2xl sm:text-5xl font-black mt-3 sm:mt-4 tracking-tight">
              Help them discover. Don’t decide for them.
            </h2>
            <p className="text-slate-300 mt-3 sm:mt-4 text-sm sm:text-lg font-medium leading-relaxed px-1">
              Career guidance used to be limited to whatever relatives and neighbours happened to study. Pathfinder equips your family with objective psychometric data and an exhaustive 24-page report.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 text-left">
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-slate-700 shadow-neo hover:border-pop-cyan transition-colors">
                <div className="text-pop-cyan text-lg sm:text-xl font-black mb-1.5 sm:mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-pop-cyan" />
                  100% Privacy
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Student data is never sold to third-party tuition centers, coaching marketing brokers, or universities.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-slate-700 shadow-neo hover:border-pop-lime transition-colors">
                <div className="text-pop-lime text-lg sm:text-xl font-black mb-1.5 sm:mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-pop-lime" />
                  93.4% Validity
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Standardized psychometrics calibrated on certified Big Five and RIASEC occupational frameworks.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-slate-700 shadow-neo hover:border-pop-pink transition-colors">
                <div className="text-pop-pink text-lg sm:text-xl font-black mb-1.5 sm:mb-2 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-pop-pink" />
                  Full 24-Page PDF
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Includes non-judgmental, constructive conversation prompts tailored for honest family dialogue.
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white text-pop-ink font-black text-xs sm:text-sm hover:bg-pop-lime transition-all border-2 border-white shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
              >
                <span>Download Sample Parent Report (PDF)</span>
                <Download className="w-4 h-4 text-pop-ink" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modal */}
      <SampleReportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
