"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Flame, GraduationCap, Briefcase, Backpack } from "lucide-react";

export default function AgeStageSection() {
  return (
    <section className="py-24 bg-pop-paper border-b-2 border-pop-ink relative" id="age-personalization">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black tracking-widest text-pop-ink uppercase bg-pop-yellow border-2 border-pop-ink px-4 py-1.5 rounded-full shadow-neo rotate-[1deg] inline-block">
            Tailored Stage Engines
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-pop-ink mt-3 tracking-tight">
            WHERE ARE YOU RIGHT NOW?
          </h2>
          <p className="text-slate-600 font-bold text-base sm:text-lg mt-2">
            Our psychometric engines dynamically adapt questions and insights specifically to your educational milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stage 1: Class 8 - 10 */}
          <div className="bg-white rounded-3xl p-8 border-4 border-pop-ink shadow-neo-lg flex flex-col justify-between hover:shadow-neo-xl hover:-translate-y-1 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-14 h-14 rounded-2xl bg-pop-lime border-2 border-pop-ink shadow-neo flex items-center justify-center text-2xl">
                  🎒
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-pop-paper border border-pop-ink text-pop-ink">
                  Foundation
                </span>
              </div>

              <h3 className="text-2xl font-black text-pop-ink mt-1">Class 8 – 10</h3>
              <p className="text-sm font-semibold text-slate-600 mt-3 leading-relaxed">
                Understand your innate inclinations before peer pressure dictates your choices. Eliminate test anxiety and build genuine subject curiosity.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-lime border border-pop-ink shrink-0" />
                  Stream guidance (PCM, PCB, Commerce, Arts)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-lime border border-pop-ink shrink-0" />
                  Extracurricular &amp; passion alignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-lime border border-pop-ink shrink-0" />
                  Early superpower &amp; interest mapping
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-slate-100">
              <Link
                className="w-full py-3 rounded-2xl bg-pop-lime text-pop-ink font-black text-xs border-2 border-pop-ink shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
                href="/assessment?stage=8-10"
              >
                <span>Start Class 8–10 Track</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stage 2: Class 11 - 12 (POPULAR) */}
          <div className="bg-white rounded-3xl p-8 border-4 border-pop-ink shadow-neo-xl flex flex-col justify-between relative hover:-translate-y-1 transition-all">
            <div className="absolute -top-4 right-6 bg-pop-pink text-white text-xs font-black uppercase px-4 py-1 rounded-full border-2 border-pop-ink shadow-neo flex items-center gap-1.5 rotate-[2deg]">
              <Flame className="w-3.5 h-3.5 fill-white" />
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-14 h-14 rounded-2xl bg-pop-pink border-2 border-pop-ink shadow-neo flex items-center justify-center text-2xl">
                  🎓
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-pop-paper border border-pop-ink text-pop-ink">
                  Crossroad
                </span>
              </div>

              <h3 className="text-2xl font-black text-pop-ink mt-1">Class 11 – 12</h3>
              <p className="text-sm font-semibold text-slate-600 mt-3 leading-relaxed">
                Target the right colleges, degrees, and entrance exams with precision. Stop studying in the dark for degrees you might end up hating later.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-pink border border-pop-ink shrink-0" />
                  Undergraduate major compatibility
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-pink border border-pop-ink shrink-0" />
                  Global vs. local university course clarity
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-pink border border-pop-ink shrink-0" />
                  Entrance exam priority matrix
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-slate-100">
              <Link
                className="w-full py-3 rounded-2xl bg-pop-pink text-white font-black text-xs border-2 border-pop-ink shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
                href="/assessment?stage=11-12"
              >
                <span>Start Class 11–12 Track</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stage 3: College & Graduates */}
          <div className="bg-white rounded-3xl p-8 border-4 border-pop-ink shadow-neo-lg flex flex-col justify-between hover:shadow-neo-xl hover:-translate-y-1 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-14 h-14 rounded-2xl bg-pop-cyan border-2 border-pop-ink shadow-neo flex items-center justify-center text-2xl">
                  💼
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-pop-paper border border-pop-ink text-pop-ink">
                  Launchpad
                </span>
              </div>

              <h3 className="text-2xl font-black text-pop-ink mt-1">College &amp; Graduate</h3>
              <p className="text-sm font-semibold text-slate-600 mt-3 leading-relaxed">
                Already enrolled or recently graduated? Find high-fit modern job roles, internship priorities, or career pivot strategies.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-cyan border border-pop-ink shrink-0" />
                  Modern industry role matchmaking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-cyan border border-pop-ink shrink-0" />
                  Career pivot &amp; double-major strategies
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pop-cyan border border-pop-ink shrink-0" />
                  High-leverage portfolio building
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-slate-100">
              <Link
                className="w-full py-3 rounded-2xl bg-pop-cyan text-pop-ink font-black text-xs border-2 border-pop-ink shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
                href="/assessment?stage=college"
              >
                <span>Start College / Grad Track</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
