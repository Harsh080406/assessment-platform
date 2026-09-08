"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DilemmaCard {
  id: string;
  student: string;
  classStage: string;
  quote: string;
  dilemma: string;
  answers: string;
}

const DILEMMAS: DilemmaCard[] = [
  {
    id: "stream-fear",
    student: "Ananya M.",
    classStage: "Class 10 ICSE",
    quote: "“Choosing a stream felt like locking in the next 10 years with zero data.”",
    dilemma: "Stream Decision",
    answers: "14.2k resolved",
  },
  {
    id: "pcm-vs-design",
    student: "Rohan S.",
    classStage: "Class 12 CBSE",
    quote: "“Pushed toward standard PCM, but my instinct was interactive systems.”",
    dilemma: "Aptitude Alignment",
    answers: "18.4k resolved",
  },
  {
    id: "good-at-this",
    student: "Devansh K.",
    classStage: "B.Tech 2nd Year",
    quote: "“Helped me pivot from herd expectations to high-growth Spatial AI.”",
    dilemma: "Career Pivot",
    answers: "21.6k resolved",
  },
];

export default function SocialProof() {
  return (
    <section className="py-14 sm:py-20 bg-[#FBFBF9] relative overflow-hidden" id="dilemmas">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Section Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A9B4E8] text-black text-xs font-bold uppercase tracking-wider mb-2.5 shadow-sm">
              <span className="text-black font-extrabold">Real Dilemmas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight font-[family-name:var(--font-dm-sans)]">
              SOUND FAMILIAR?
            </h2>
            <p className="text-[#333333] font-semibold text-sm sm:text-base mt-1.5 max-w-lg leading-relaxed">
              Confronting outdated career advice? See how students solved stream and career paralysis.
            </p>
          </div>

          <div className="self-start lg:self-auto bg-white border border-[#E2E0DB] px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A9D8C6] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A9D8C6]" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-black">
              48,290+ Students Guided This Month
            </span>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {DILEMMAS.map((item) => {
            return (
              <Link
                key={item.id}
                href="/assessment"
                className="group relative p-5 sm:p-6 bg-white border border-[#E2E0DB] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Small length accent border */}
                <div className="absolute top-0 left-6 w-12 h-[3px] bg-[#A9B4E8] rounded-full group-hover:w-16 transition-all duration-300" />

                <div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-[#EEF1FB] text-black border border-[#A9B4E8]/40 rounded-full">
                      {item.classStage}
                    </span>
                    <span className="text-[11px] font-bold text-[#444444]">
                      {item.dilemma}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold leading-snug text-black">
                    {item.quote}
                  </p>

                  <div className="mt-3 text-xs font-bold uppercase tracking-wider text-[#555555]">
                    — {item.student}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#E2E0DB] flex items-center justify-between">
                  <span className="text-xs font-bold text-black group-hover:text-[#7C89CC] transition-colors">
                    See Calibration
                  </span>
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 group-hover:text-[#7C89CC] transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
