"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Bell,
  Search,
  Settings,
  Sparkles,
  ChevronRight,
  Shield,
} from "lucide-react";

interface StudentHeaderProps {
  studentName?: string;
  studentInitials?: string;
  avatarUrl?: string | null;
  onMenuToggle?: () => void;
}

export default function StudentHeader({
  studentName = "Alex Student",
  studentInitials = "AS",
  avatarUrl,
  onMenuToggle,
}: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 w-full">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle, Mobile Logo & Quick Search Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-md">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Logo */}
          <Link href="/dashboard" className="md:hidden flex items-center gap-1.5 shrink-0">
            <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-lg font-extrabold tracking-tight text-[#0F172A]">
              Aura<span className="text-[#FF6B6B]">Path</span>
            </span>
          </Link>

          {/* Quick Search / Command Input */}
          <div className="relative w-full hidden sm:block">
            <input
              type="text"
              placeholder="Search quests, careers, results..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
          </div>
        </div>

        {/* Right: Quick Status, Notifications & Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">


          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B6B] ring-2 ring-white" />
          </button>

          {/* User Profile Trigger */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F1F5F9] transition-all group"
            title="Profile & Settings"
          >
            <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-[#FF6B6B] transition-all shadow-xs">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={studentName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span>{studentInitials}</span>
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#FF6B6B] transition-colors leading-tight">
                {studentName}
              </div>
              <div className="text-[10px] text-[#94A3B8] font-medium">
                Student
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
