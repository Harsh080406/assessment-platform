"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X, ArrowRight, User, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onOpenAuth?: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const pathname = usePathname();
  const { openAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleAuth = (mode: "login" | "signup" = "login") => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      openAuth(mode);
    }
  };

  const navLinks = [
    { href: "/", label: "Home", subtitle: "Overview" },
    { href: "/quests", label: "The 4 Modules", tag: "Roadmap", tagBg: "bg-[#A9B4E8]" },
    { href: "/decoder", label: "Parent vs You", tag: "Perspective", tagBg: "bg-[#EEF1FB]" },
    { href: "/careers", label: "Careers", tag: "2026+ Horizons", tagBg: "bg-[#A9D8C6]" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBFBF9]/90 backdrop-blur-xl border-b border-[#E2E8F0] shadow-xs"
          : "bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#E2E8F0]"
      }`}
    >
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-14 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-xs">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B6B]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#0F172A]">
                Aura<span className="text-[#FF6B6B]">Path</span>
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                Matrix
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links with Active Page Indicators */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-semibold">
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                  active
                    ? "bg-[#FFF0EE] text-[#0F172A] font-extrabold border border-[#FED7CC] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/70 font-semibold"
                }`}
              >
                {active && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B6B] shrink-0 animate-pulse shadow-xs" />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleAuth("login")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F172A] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F172A]" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => handleAuth("signup")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold bg-[#FF6B6B] hover:bg-[#F95858] text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>Sign Up</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all hover:bg-[#F8FAFC]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#0F172A]" /> : <Menu className="w-4 h-4 text-[#0F172A]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer with Active Page Indicators */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E0DB] bg-white px-4 pt-3 pb-6 space-y-3 shadow-md animate-fade-in max-h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="flex flex-col space-y-1 font-bold text-sm text-black">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-3 rounded-xl flex items-center justify-between transition-all ${
                    active
                      ? "bg-[#FFF0EE] border border-[#FED7CC] text-black font-extrabold shadow-xs"
                      : "hover:bg-[#EEF1FB] border border-transparent hover:border-[#E2E0DB] text-black"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {active && <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse shrink-0" />}
                    <span>{link.label}</span>
                  </div>
                  {active ? (
                    <span className="text-[10px] bg-[#FF6B6B] text-white px-2 py-0.5 rounded-full uppercase font-extrabold shadow-xs">
                      Active
                    </span>
                  ) : link.tag ? (
                    <span className={`text-[10px] ${link.tagBg} text-black px-2 py-0.5 rounded-full uppercase font-bold`}>
                      {link.tag}
                    </span>
                  ) : link.subtitle ? (
                    <span className="text-xs text-[#555555]">{link.subtitle}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E2E0DB] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAuth("signup");
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#FF6B6B] text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#F95858] shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span className="text-white">Sign Up Free</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAuth("login");
              }}
              className="w-full py-3 px-4 rounded-xl border border-[#E2E0DB] bg-white text-[#0F172A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-all"
            >
              <User className="w-4 h-4 text-[#0F172A]" />
              <span>Account Sign In</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
