"use client";

import Link from "next/link";
import { ShieldCheck, Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 sm:pt-16 pb-8 sm:pb-12 text-slate-600 text-sm mt-auto">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-10 sm:pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-deepIndigo to-brand-vividViolet flex items-center justify-center text-white font-black text-sm shadow-sm">
                P
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Pathfinder
              </span>
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              The modern student discovery platform. Combining behavioral psychometrics with emerging career constellations for students in Class 8 through University.
            </p>
            <div className="mt-4 text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} Pathfinder EdTech Technologies Inc. All rights reserved.
            </div>
          </div>

          {/* Discovery Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4">
              Discovery
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/assessment">
                  Take Assessment
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/careers">
                  Career Library
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/quests">
                  The 4 Quests
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/decoder">
                  Parent vs You
                </Link>
              </li>
            </ul>
          </div>

          {/* Audiences Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4">
              For You
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/assessment">
                  Middle School (8-10)
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/assessment">
                  High School (11-12)
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/assessment">
                  University Students
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900 transition-colors" href="/decoder">
                  Parents &amp; Mentors
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Trust &amp; Ethics
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Psychometric Validity</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Student Privacy Charter</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Editorial Independence</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Contact Counselors</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            Designed with empathy for the next generation of builders, thinkers, and explorers.
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Systems Operational
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Encrypted Assessment Protocol
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
