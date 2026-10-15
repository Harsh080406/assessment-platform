"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Search,
  Settings,
  ChevronDown,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import StaffNotificationDropdown from "./StaffNotificationDropdown";
import SignOutButton from "@/components/SignOutButton";

interface StaffHeaderProps {
  staffName?: string;
  staffEmail?: string;
  staffInitials?: string;
  avatarUrl?: string | null;
  role?: string;
  onMenuToggle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StaffHeader({
  staffName = "Staff Evaluator",
  staffEmail = "staff@alderwoodvantage.com",
  staffInitials = "SE",
  avatarUrl,
  role = "STAFF",
  onMenuToggle,
  isCollapsed = false,
  onToggleCollapse,
}: StaffHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 h-14 sm:h-16 w-full flex items-center justify-between gap-3 sm:gap-4 shrink-0">
      {/* Left: Mobile Menu, Collapse Toggle & Command Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-lg">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle in Top Bar if collapsed */}
        {isCollapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <Link
          href="/portal"
          className="md:hidden flex items-center gap-2 shrink-0 min-w-0"
          title="Alderwood Vantage - Staff Portal"
        >
          <Image
            src="/AlderwoodVANTAGE.svg"
            alt="Alderwood Vantage Logo"
            width={34}
            height={28}
            draggable={false}
            className="h-7 w-auto object-contain shrink-0"
          />
          <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-sm font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
            Alderwood <span className="text-[#FF6B6B]">Vantage</span>
          </span>
        </Link>

        {/* Command Search Bar (Desktop / Tablet) */}
        <div className="relative w-full hidden sm:block">
          <input
            ref={searchInputRef}
            type="text"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search candidate, school, or assessment..."
            className="w-full pl-9 pr-9 py-1.5 sm:py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-normal text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <kbd
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] border border-[#E2E8F0] bg-white transition-opacity ${
              searchFocused ? "opacity-0" : "opacity-100"
            }`}
            title="Press / to focus search"
          >
            /
          </kbd>
        </div>
      </div>

      {/* Right: Notifications & Single User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Dropdown */}
        <StaffNotificationDropdown />

        {/* Single User Account Popover */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-1 ring-transparent group-hover:ring-[#4F46E5] transition-all shadow-2xs shrink-0">
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

            <div className="hidden md:block text-left max-w-[130px]">
              <div className="text-xs font-semibold text-[#0F172A] leading-tight truncate">
                {staffName}
              </div>
              <div className="text-[11px] text-[#64748B] truncate">
                {role}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block group-hover:text-[#0F172A] transition-colors" />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                <div className="text-xs font-bold text-[#0F172A] truncate">
                  {staffName}
                </div>
                <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {staffEmail}
                </div>
                <div className="mt-1.5">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {role} Evaluator
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/portal/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#64748B]" />
                  <span>Workstation Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#F1F5F9] px-2">
                <SignOutButton
                  showLabel={true}
                  className="w-full justify-start px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
