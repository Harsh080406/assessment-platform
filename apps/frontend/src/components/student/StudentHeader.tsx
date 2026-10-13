"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Settings,
  X,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import SignOutButton from "@/components/SignOutButton";

interface StudentHeaderProps {
  studentName?: string;
  studentEmail?: string;
  studentInitials?: string;
  avatarUrl?: string | null;
  onMenuToggle?: () => void;
}

export default function StudentHeader({
  studentName = "Alex Student",
  studentEmail = "student@alderwoodvantage.com",
  studentInitials = "AS",
  avatarUrl,
  onMenuToggle,
}: StudentHeaderProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setProfileOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close profile popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard/assessments")) return "Assessments";
    if (path.startsWith("/dashboard/results")) return "Results & Reports";
    if (path.startsWith("/dashboard/notifications")) return "Notifications";
    if (path.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] h-16 w-full">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 max-w-[1200px] mx-auto">
        {/* Left Section: Mobile Menu, Mobile Title, Desktop Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden p-2 -ml-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Mark + Current Page Title */}
          <div className="flex items-center gap-2 md:hidden min-w-0">
            <Link href="/dashboard" className="shrink-0 flex items-center">
              <Image
                src="/AlderwoodVANTAGE.svg"
                alt="Alderwood Vantage Logo"
                width={28}
                height={24}
                className="h-6 w-auto object-contain"
                priority
              />
            </Link>
            <span className="text-sm font-bold text-[#0F172A] truncate">
              {getPageTitle(pathname)}
            </span>
          </div>

          {/* Desktop Search Input with '/' shortcut */}
          <div className="hidden md:block relative w-full max-w-sm">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessments, reports, topics..."
              className="w-full pl-9 pr-8 py-2 text-xs font-normal rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-white border border-[#E2E8F0] rounded shadow-2xs pointer-events-none">
              /
            </kbd>
          </div>
        </div>

        {/* Right Section: Mobile Search Button, Notification Bell, User Profile Popover */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Toggle mobile search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification dropdown */}
          <NotificationDropdown />

          {/* User profile dropdown trigger */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer group"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="Open user profile menu"
            >
              <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-[#E2E8F0]">
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

              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-[#0F172A] truncate max-w-[120px]">
                  {studentName}
                </span>
                <span className="text-[10px] text-[#64748B]">Student</span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 hidden sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile popover menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg p-2 z-50 animate-in fade-in-0 duration-150">
                <div className="p-2.5 pb-3 border-b border-[#F1F5F9] mb-1">
                  <div className="font-semibold text-xs text-[#0F172A] truncate">
                    {studentName}
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {studentEmail}
                  </div>
                  <div className="mt-2">
                    <span className="inline-block text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                      Student Account
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Profile & Settings</span>
                  </Link>

                  <div className="pt-1 mt-1 border-t border-[#F1F5F9]">
                    <div className="px-1">
                      <SignOutButton
                        showLabel={true}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left border-0 shadow-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-2.5 shadow-sm animate-in fade-in-0 duration-150">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessments, reports..."
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="p-1 absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
