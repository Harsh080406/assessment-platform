"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, Flame, ArrowRight } from "lucide-react";

interface DilemmaCard {
  id: string;
  student: string;
  classStage: string;
  quote: string;
  dilemma: string;
  answers: string;
  cardBg: string;
  borderBg: string;
  textColor: string;
  rotateDeg: string;
  emoji: string;
}

const DILEMMAS: DilemmaCard[] = [
  {
    id: "pcm-vs-design",
    student: "Rohan S.",
    classStage: "Class 11 CBSE",
    quote: "“Everyone told me to take PCM, but I spend every night designing 3D worlds.”",
    dilemma: "Science Stream Dilemma",
    answers: "18.4k students resolved",
    cardBg: "bg-pop-lime",
    borderBg: "border-pop-ink",
    textColor: "text-pop-ink",
    rotateDeg: "rotate-[-1.5deg]",
    emoji: "🎨",
  },
  {
    id: "stream-fear",
    student: "Ananya M.",
    classStage: "Class 10 ICSE",
    quote: "“Choosing a stream right now feels like signing away the next 10 years of my life.”",
    dilemma: "Stream Locking Anxiety",
    answers: "14.2k students resolved",
    cardBg: "bg-pop-pink",
    borderBg: "border-pop-ink",
    textColor: "text-white",
    rotateDeg: "rotate-[1.5deg]",
    emoji: "😱",
  },
  {
    id: "good-at-this",
    student: "Devansh K.",
    classStage: "B.Tech 2nd Year",
    quote: "“Am I actually good at coding, or was I just pressured into following the flock?”",
    dilemma: "Aptitude vs. Peer Pressure",
    answers: "21.6k students resolved",
    cardBg: "bg-pop-cyan",
    borderBg: "border-pop-ink",
    textColor: "text-pop-ink",
    rotateDeg: "rotate-[-1deg]",
    emoji: "⚡",
  },
  {
    id: "parent-talk",
    student: "Meera P.",
    classStage: "Class 12 State Board",
    quote: "“How do I show my parents that modern venture & AI jobs pay more than traditional jobs?”",
    dilemma: "Family Conviction Gap",
    answers: "16.8k students resolved",
    cardBg: "bg-pop-yellow",
    borderBg: "border-pop-ink",
    textColor: "text-pop-ink",
    rotateDeg: "rotate-[2deg]",
    emoji: "🗣️",
  },
  {
    id: "pivot",
    student: "Kabir T.",
    classStage: "Recent Graduate",
    quote: "“I have a commerce degree, but I want to break into tech policy and data ethics.”",
    dilemma: "Non-Linear Career Pivot",
    answers: "11.3k students resolved",
    cardBg: "bg-pop-orange",
    borderBg: "border-pop-ink",
    textColor: "text-white",
    rotateDeg: "rotate-[-2deg]",
    emoji: "🚀",
  },
];

export default function SocialProof() {
  return (
    <section className="py-14 sm:py-20 bg-pop-paper border-b-2 border-pop-ink relative overflow-hidden" id="dilemmas">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pop-ink text-pop-lime text-xs font-black uppercase tracking-wider mb-2 border border-pop-lime shadow-neo">
              <Flame className="w-3.5 h-3.5 text-pop-pink fill-pop-pink" />
              <span>Real Student Voices</span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-black text-pop-ink tracking-tight mt-1">
              SOUND FAMILIAR?
            </h2>
            <p className="text-slate-600 font-bold text-sm sm:text-lg mt-2 max-w-xl">
              You aren't broken, confused, or unmotivated. You're just asking the big questions everyone ignores.
            </p>
          </div>

          <div className="self-start lg:self-auto bg-white border-2 border-pop-ink px-3.5 sm:px-4 py-2 rounded-2xl shadow-neo flex items-center gap-2.5 sm:gap-3">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pop-pink opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-pop-pink" />
            </span>
            <span className="text-xs sm:text-sm font-black text-pop-ink">
              48,290+ Students Found Direction This Month
            </span>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {DILEMMAS.map((item) => (
            <Link
              key={item.id}
              href="/assessment"
              className={`group p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-3 ${item.borderBg} ${item.cardBg} sm:${item.rotateDeg} rotate-0 shadow-neo hover:rotate-0 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-neo-lg transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/90 text-pop-ink border border-pop-ink">
                    {item.classStage}
                  </span>
                </div>

                <p className={`text-sm sm:text-base font-black leading-snug ${item.textColor}`}>
                  {item.quote}
                </p>

                <div className="mt-3 text-[11px] font-bold opacity-80 uppercase tracking-wide">
                  — {item.student}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-black/15 flex items-center justify-between">
                <span className={`text-[11px] font-black ${item.textColor}`}>
                  {item.answers}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
