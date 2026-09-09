"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1D] text-[#E2E0DB] border-t border-[#2E2E32] pt-12 sm:pt-16 pb-8 sm:pb-12 text-sm mt-auto">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-10 sm:pb-12 border-b border-[#2E2E32]">
          {/* Brand Info */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#A9B4E8] text-black flex items-center justify-center font-black text-sm">
                <Compass className="w-5 h-5 stroke-[2.2] text-black" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white font-[family-name:var(--font-dm-sans)]">
                AuraPath
              </span>
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-[#A9B4E8] max-w-sm leading-relaxed font-semibold">
              The precision cognitive profiling & career architecture platform. Scenario-based behavioral psychometrics for students navigating 2026+ industry horizons.
            </p>
            <div className="mt-4 text-xs text-[#888888] font-bold">
              © {new Date().getFullYear()} AuraPath Cognitive Technologies. All rights reserved.
            </div>
          </div>

          {/* Discovery Column */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 sm:mb-4">
              Discovery
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E0DB] font-bold">
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/assessment">
                  Begin Assessment
                </Link>
              </li>
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/quests">
                  The 4 Quests
                </Link>
              </li>
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/decoder">
                  Parent vs You
                </Link>
              </li>
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/careers">
                  2026+ Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Audiences Column */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 sm:mb-4">
              Calibrated For
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E0DB] font-bold">
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/assessment">
                  Class 9 & 10 (Streams)
                </Link>
              </li>
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/assessment">
                  Class 11 & 12 (Degrees)
                </Link>
              </li>
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/assessment">
                  College & Early Grads
                </Link>
              </li>
              <li>
                <Link className="hover:text-white hover:underline transition-colors" href="/decoder">
                  Parents & Mentors
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Ethics Column */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Trust & Rigor
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E0DB] font-bold">
              <li>
                <span className="hover:text-white cursor-pointer">Big Five & RIASEC Models</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Privacy Charter (Zero Spam)</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Independent Industry Research</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Terms & Security</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footnote */}
        
      </div>
    </footer>
  );
}
