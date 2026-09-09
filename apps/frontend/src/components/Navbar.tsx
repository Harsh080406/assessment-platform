"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Menu, X, ArrowRight, User } from "lucide-react";

interface NavbarProps {
  onOpenAuth?: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBFBF9]/75 backdrop-blur-xl border-b border-[#E2E0DB]/80 shadow-sm"
          : "bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#E2E0DB]"
      }`}
    >
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-14 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#A9B4E8] text-black flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] text-black" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-black font-[family-name:var(--font-dm-sans)]">
                AuraPath
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#EEF1FB] text-black border border-[#A9B4E8]/40">
                Cognitive Matrix
              </span>
            </div>
            <span className="hidden sm:block text-[10px] tracking-widest font-bold uppercase text-[#444444]">
              Calibrate Your True Trajectory
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-black">
          <Link
            href="/"
            className="text-black hover:text-[#7C89CC] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#A9B4E8] after:transition-all"
          >
            Home
          </Link>
          <Link
            href="/quests"
            className="text-[#333333] hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#A9B4E8] after:transition-all"
          >
            The 4 Quests
          </Link>
          <Link
            href="/decoder"
            className="text-[#333333] hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#A9B4E8] after:transition-all"
          >
            Parent vs You
          </Link>
          <Link
            href="/careers"
            className="text-[#333333] hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#A9B4E8] after:transition-all"
          >
            Careers
          </Link>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenAuth}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-white text-black border border-[#E2E0DB] hover:bg-[#EEF1FB] px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
          >
            <User className="w-4 h-4 text-black" />
            <span className="text-black">Sign In</span>
          </button>

          <Link
            href="/assessment"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold bg-[#A9B4E8] text-black hover:bg-[#8E9BDD] px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <span className="hidden xs:inline text-black font-extrabold">Begin Assessment</span>
            <span className="xs:hidden text-black font-extrabold">Start Quiz</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] text-black" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white text-black border border-[#E2E0DB] shadow-sm cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center transition-all"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E0DB] bg-white px-4 pt-3 pb-6 space-y-3 shadow-md animate-fade-in max-h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="flex flex-col space-y-1 font-bold text-sm text-black">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-[#EEF1FB] border border-transparent hover:border-[#E2E0DB] flex items-center justify-between transition-all text-black"
            >
              <span>Home</span>
              <span className="text-xs text-[#555555]">Overview</span>
            </Link>
            <Link
              href="/quests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-[#EEF1FB] border border-transparent hover:border-[#E2E0DB] flex items-center justify-between transition-all text-black"
            >
              <span>The 4 Quests</span>
              <span className="text-[10px] bg-[#A9B4E8] text-black px-2 py-0.5 rounded-full uppercase font-bold">
                Roadmap
              </span>
            </Link>
            <Link
              href="/decoder"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-[#EEF1FB] border border-transparent hover:border-[#E2E0DB] flex items-center justify-between transition-all text-black"
            >
              <span>Parent vs You</span>
              <span className="text-[10px] bg-[#EEF1FB] text-black px-2 py-0.5 rounded-full uppercase font-bold">
                Perspective
              </span>
            </Link>
            <Link
              href="/careers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl hover:bg-[#EEF1FB] border border-transparent hover:border-[#E2E0DB] flex items-center justify-between transition-all text-black"
            >
              <span>Careers Directory</span>
              <span className="text-[10px] bg-[#A9D8C6] text-black px-2 py-0.5 rounded-full uppercase font-bold">
                2026+ Horizons
              </span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#E2E0DB] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth?.();
              }}
              className="w-full py-3 px-4 rounded-xl border border-[#E2E0DB] bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#EEF1FB] shadow-sm transition-all"
            >
              <User className="w-4 h-4 text-black" />
              <span className="text-black">Account Sign In</span>
            </button>
            <Link
              href="/assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#A9B4E8] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#8E9BDD] transition-all active:scale-[0.98]"
            >
              <span className="text-black font-bold">Launch Assessment</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
