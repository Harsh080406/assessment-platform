"use client";

import { Clock, Brain, Compass, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Step {
  step: string;
  number: string;
  title: string;
  description: string;
  timeTag: string;
  bgLight: string;
  textColor: string;
  hoverBg: string;
  accentBorder: string;
}

const STEPS: Step[] = [
  {
    step: "01",
    number: "01",
    title: "Create Your Profile",
    description:
      "Tell us where you are right now — school class, college semester, or recent grad looking for direction.",
    timeTag: "Takes 60 seconds",
    bgLight: "bg-purple-100",
    textColor: "text-brand-vividViolet",
    hoverBg: "group-hover:bg-brand-vividViolet",
    accentBorder: "hover:border-brand-vividViolet",
  },
  {
    step: "02",
    number: "02",
    title: "Take The Assessment",
    description:
      "Engage with intuitive, scenario-based dilemmas. No trick questions, no memorized formulas. Just your natural mind.",
    timeTag: "Adaptive 20 mins",
    bgLight: "bg-cyan-100",
    textColor: "text-brand-electricCyan",
    hoverBg: "group-hover:bg-brand-electricCyan",
    accentBorder: "hover:border-brand-electricCyan",
  },
  {
    step: "03",
    number: "03",
    title: "Understand Your Results",
    description:
      "Unlock your distinct Student Archetype with multi-dimensional psychometrics, cognitive instincts, and energy zones.",
    timeTag: "Instant interactive profile",
    bgLight: "bg-emerald-100",
    textColor: "text-brand-emeraldLime",
    hoverBg: "group-hover:bg-brand-emeraldLime",
    accentBorder: "hover:border-brand-emeraldLime",
  },
  {
    step: "04",
    number: "04",
    title: "Explore Career Paths",
    description:
      "Receive matched degrees, high-growth modern roles, salary horizons, and concrete step-by-step preparation guides.",
    timeTag: "Future-proof roadmaps",
    bgLight: "bg-orange-100",
    textColor: "text-brand-warmCoral",
    hoverBg: "group-hover:bg-brand-warmCoral",
    accentBorder: "hover:border-brand-warmCoral",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-brand-vividViolet bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Clarity In 4 Simple Steps
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            HOW PATHFINDER WORKS
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            No robotic scorecards. A deeply personal, scientifically grounded roadmap designed for modern students.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => (
            <div
              key={item.number}
              className={`relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card hover:translate-y-[-4px] transition-all group ${item.accentBorder} flex flex-col justify-between`}
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl ${item.bgLight} ${item.textColor} flex items-center justify-center font-black text-2xl mb-6 ${item.hoverBg} group-hover:text-white transition-colors`}
                >
                  {item.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold flex items-center justify-between">
                <span className={`${item.textColor}`}>{item.timeTag}</span>
                <Link
                  href="/assessment"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-900"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
