"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Menu, X, ArrowRight, User } from "lucide-react";

interface NavbarProps {
  onOpenAuth?: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b-2 border-pop-ink transition-all">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-14 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-pop-lime border-2 border-pop-ink flex items-center justify-center shadow-neo group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all duration-200">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-pop-ink fill-pop-ink" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-pop-ink">
                Pathfinder
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-md bg-pop-pink text-white border border-pop-ink rotate-[-2deg] shadow-[2px_2px_0px_#0B0F19]">
                Student
              </span>
            </div>
            <span className="hidden sm:block text-[10px] tracking-widest font-black uppercase text-slate-500">
              Stop Guessing Your Potential
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links — Only 1 link for the whole home page, plus dedicated pages */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-black text-slate-700">
          <Link
            href="/"
            className="hover:text-pop-violet hover:-translate-y-0.5 transition-all"
          >
            Home
          </Link>
          <Link
            href="/quests"
            className="hover:text-pop-orange hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-pop-orange animate-ping" />
            The 4 Quests
          </Link>
          <Link
            href="/decoder"
            className="hover:text-pop-cyan hover:-translate-y-0.5 transition-all"
          >
            Parent vs You
          </Link>
          <Link
            href="/careers"
            className="hover:text-pop-violet hover:-translate-y-0.5 transition-all"
          >
            Careers
          </Link>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenAuth}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-pop-ink px-4 py-2.5 rounded-xl border-2 border-pop-ink hover:bg-slate-100 transition-all shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer"
          >
            <User className="w-4 h-4" />
            Log in
          </button>

          <Link
            href="/assessment"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-black text-pop-ink bg-pop-lime hover:bg-[#b8e600] px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl border-2 border-pop-ink shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-150 cursor-pointer shrink-0"
          >
            <span className="hidden xs:inline">Start Free Quiz</span>
            <span className="xs:hidden">Start Quiz</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-pop-ink border-2 border-pop-ink hover:bg-slate-100 shadow-neo cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-pop-ink bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-neo-lg animate-fade-in max-h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="flex flex-col space-y-1 font-black text-sm text-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-slate-100 border border-transparent hover:border-pop-ink flex items-center justify-between"
            >
              <span>Home</span>
              <span className="text-xs text-slate-400">Main</span>
            </Link>
            <Link
              href="/quests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-pop-orange/20 border border-transparent hover:border-pop-ink flex items-center justify-between"
            >
              <span>The 4 Quests</span>
              <span className="text-[10px] bg-pop-orange text-white px-2 py-0.5 rounded-full uppercase font-black">
                Roadmap
              </span>
            </Link>
            <Link
              href="/decoder"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-pop-cyan/20 border border-transparent hover:border-pop-ink flex items-center justify-between"
            >
              <span>Parent vs You</span>
              <span className="text-[10px] bg-pop-cyan text-pop-ink px-2 py-0.5 rounded-full uppercase font-black">
                Reality Check
              </span>
            </Link>
            <Link
              href="/careers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-pop-violet/20 border border-transparent hover:border-pop-ink flex items-center justify-between"
            >
              <span>Careers Directory</span>
              <span className="text-[10px] bg-pop-violet text-white px-2 py-0.5 rounded-full uppercase font-black">
                2026+ Jobs
              </span>
            </Link>
          </nav>

          <div className="pt-3 border-t-2 border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth?.();
              }}
              className="w-full text-center py-3 rounded-xl border-2 border-pop-ink font-black text-xs shadow-neo cursor-pointer hover:bg-slate-50"
            >
              Log In
            </button>
            <Link
              href="/assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-xl bg-pop-lime text-pop-ink font-black text-xs sm:text-sm border-2 border-pop-ink shadow-neo"
            >
              Start Free Assessment Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
