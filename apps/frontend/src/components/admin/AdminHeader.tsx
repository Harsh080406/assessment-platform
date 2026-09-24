"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Bell,
  Search,
  ShieldAlert,
  Crown,
} from "lucide-react";

interface AdminHeaderProps {
  adminName?: string;
  adminInitials?: string;
  avatarUrl?: string | null;
  onMenuToggle?: () => void;
}

export default function AdminHeader({
  adminName = "Admin Governor",
  adminInitials = "AG",
  avatarUrl,
  onMenuToggle,
}: AdminHeaderProps) {
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
          <Link href="/console" className="md:hidden flex items-center gap-1.5 shrink-0">
            <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-lg font-extrabold tracking-tight text-[#0F172A]">
              Aura<span className="text-[#FF6B6B]">Path</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
              Admin
            </span>
          </Link>

          {/* Quick Search Bar */}
          <div className="relative w-full hidden sm:block">
            <input
              type="text"
              placeholder="Search platform resources, users, reports..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
          </div>
        </div>

        {/* Right: Quick Status, Notifications & Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Methodology Status Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-[11px] font-extrabold text-red-700">
            <Crown className="w-3.5 h-3.5 text-red-600" />
            <span>Platform Governance Mode</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          </button>

          {/* Admin User Profile Trigger */}
          <div
            className="flex items-center gap-2.5 p-1.5 rounded-xl transition-all group"
            title={`${adminName} (System Governor)`}
          >
            <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-red-500 transition-all shadow-xs">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={adminName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span>{adminInitials}</span>
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#0F172A] leading-tight">
                {adminName}
              </div>
              <div className="text-[10px] text-red-600 font-extrabold flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
