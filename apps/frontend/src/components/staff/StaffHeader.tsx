"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Bell,
  Search,
  Shield,
  UserCheck,
} from "lucide-react";

interface StaffHeaderProps {
  staffName?: string;
  staffInitials?: string;
  avatarUrl?: string | null;
  role?: string;
  onMenuToggle?: () => void;
}

export default function StaffHeader({
  staffName = "Staff Evaluator",
  staffInitials = "SE",
  avatarUrl,
  role = "STAFF",
  onMenuToggle,
}: StaffHeaderProps) {
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
          <Link href="/portal" className="md:hidden flex items-center gap-1.5 shrink-0">
            <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-lg font-extrabold tracking-tight text-[#0F172A]">
              Aura<span className="text-[#FF6B6B]">Path</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#EEF2FF] text-[#4F46E5] px-1.5 py-0.5 rounded border border-[#E0E7FE]">
              Staff
            </span>
          </Link>

          {/* Quick Search / Candidate Search Input */}
          <div className="relative w-full hidden sm:block">
            <input
              type="text"
              placeholder="Search candidate, school, assessment..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
          </div>
        </div>

        {/* Right: Quick Status, Notifications & Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Methodology Status Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#E0E7FE] text-[11px] font-bold text-[#4F46E5]">
            <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Certified Evaluator Queue</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#4F46E5] ring-2 ring-white" />
          </button>

          {/* Staff Profile Indicator */}
          <div
            className="flex items-center gap-2.5 p-1.5 rounded-xl transition-all group"
            title={`${staffName} (${role})`}
          >
            <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-[#4F46E5] transition-all shadow-xs">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={staffName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span>{staffInitials}</span>
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#0F172A] leading-tight">
                {staffName}
              </div>
              <div className="text-[10px] text-[#4F46E5] font-extrabold flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>{role} Evaluator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
