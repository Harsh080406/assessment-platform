"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, ArrowRight, User, UserPlus } from "lucide-react";
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
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/packages", label: "Packages" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href.startsWith("/#")) {
      return false;
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
      <div className="w-full px-2.5 sm:px-6 lg:px-8 xl:px-14 h-16 sm:h-20 flex items-center justify-between gap-2 lg:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 xl:gap-3.5 group shrink min-w-0">
          <Image
            src="/AlderwoodVANTAGE.svg"
            alt="Alderwood Vantage Logo"
            width={76}
            height={60}
            priority
            draggable={false}
            className="h-8 sm:h-10 lg:h-11 xl:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center">
              <span className="text-xs min-[360px]:text-sm sm:text-base lg:text-lg xl:text-2xl font-extrabold tracking-tight text-[#0F172A] whitespace-nowrap">
                Alderwood <span className="text-[#FF6B6B]">Vantage</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links with Active Page Indicators */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold">
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2.5 xl:px-3.5 py-1.5 xl:py-2 flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-lg ${
                  active
                    ? "text-[#0F172A] font-bold after:absolute after:bottom-0.5 after:left-2.5 xl:after:left-3.5 after:right-2.5 xl:after:right-3.5 after:h-0.5 after:bg-[#FF6B6B] after:rounded-full"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/50 font-semibold"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 shrink-0">
          <button
            onClick={() => handleAuth("login")}
            className="hidden sm:inline-flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-slate-100/80 px-2.5 xl:px-4 py-1.5 sm:py-2 xl:py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F172A]" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => handleAuth("signup")}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-xs xl:text-sm font-extrabold bg-[#FF6B6B] hover:bg-[#F95858] text-white px-2.5 sm:px-3.5 xl:px-5 py-1.5 sm:py-2 xl:py-2.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B]"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>Sign Up</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-white text-[#0F172A] border border-[#E2E8F0] shadow-xs cursor-pointer shrink-0 min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center transition-all hover:bg-[#F8FAFC]"
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
                  className={`px-3.5 py-3 rounded-xl flex items-center transition-all ${
                    active
                      ? "text-[#0F172A] font-bold border-l-2 border-[#FF6B6B] bg-slate-50/80"
                      : "hover:bg-slate-50 text-[#334155] font-medium"
                  }`}
                >
                  <span>{link.label}</span>
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
