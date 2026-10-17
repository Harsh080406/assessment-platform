"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  Bell,
  Search,
  X,
  User,
  Shield,
  ChevronDown,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import AdminNotificationBell from "./AdminNotificationBell";

interface AdminHeaderProps {
  adminName?: string;
  adminEmail?: string;
  adminInitials?: string;
  avatarUrl?: string | null;
  onMenuToggle?: () => void;
}

// Map pathname to readable page title for mobile top bar
const PAGE_TITLES: Record<string, string> = {
  "/console": "Overview",
  "/console/reports": "Report Approvals",
  "/console/sla": "SLA Monitoring",
  "/console/users": "User Governance",
  "/console/staff": "Staff & Workload",
  "/console/assessments": "Assessments",
  "/console/notifications": "Email Templates",
  "/console/audit-logs": "Audit Trail",
  "/console/security": "Security Center",
  "/console/settings": "System Settings",
};

export default function AdminHeader({
  adminName = "Admin Governor",
  adminEmail = "admin@alderwoodvantage.com",
  adminInitials = "AG",
  avatarUrl,
  onMenuToggle,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentPageTitle =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([route]) => pathname.startsWith(route))?.[1] ||
    "Admin Console";

  // Global "/" keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setMobileSearchOpen(true);
      }
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-3">
      {/* Mobile Search Overlay */}
      {mobileSearchOpen ? (
        <div className="flex items-center gap-2 w-full animate-in fade-in-0 duration-150 sm:hidden">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              ref={searchInputRef}
              id="admin-mobile-search"
              name="search"
              type="search"
              autoComplete="off"
              aria-label="Search resources, users, reports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, users, reports..."
              suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-[#64748B] hover:text-[#0F172A]"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Left: Mobile Menu Toggle & Title / Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-xl">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shrink-0"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Title View */}
            <div className="lg:hidden flex items-center gap-2 min-w-0">
              <Link href="/console" className="shrink-0">
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage Logo"
                  width={24}
                  height={20}
                  className="h-5 w-auto object-contain"
                />
              </Link>
              <h1 className="text-sm font-bold text-[#0F172A] truncate">
                {currentPageTitle}
              </h1>
            </div>

            {/* Desktop Search Bar with "/" hint */}
            <div className="relative w-full hidden sm:block max-w-md">
              <input
                ref={searchInputRef}
                id="admin-desktop-search"
                name="search"
                type="search"
                autoComplete="off"
                aria-label="Search resources, users, reports"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, users, reports..."
                suppressHydrationWarning
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
              <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[10px] font-semibold text-[#94A3B8] bg-white border border-[#E2E8F0] rounded shadow-2xs pointer-events-none">
                /
              </kbd>
            </div>
          </div>

          {/* Right: Search (mobile trigger), Quiet Admin Pill, Bell, and User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="sm:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quiet Outlined Neutral Label (Replaces red "Platform Governance Mode" pill) */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#475569]">
              <Shield className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Admin</span>
            </div>

            {/* Notification Bell Dropdown */}
            <AdminNotificationBell />

            {/* ONE User Menu (Dropdown) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                suppressHydrationWarning
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors group cursor-pointer"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={adminName}
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>{adminInitials}</span>
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-[#0F172A] truncate max-w-[120px]">
                    {adminName}
                  </span>
                  <span className="text-[10px] text-[#64748B]">Admin</span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block group-hover:text-[#0F172A] transition-colors" />
              </button>

              {/* Profile Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E2E8F0] shadow-lg py-1.5 z-50 animate-in fade-in-0 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-[#F1F5F9]">
                    <div className="text-xs font-bold text-[#0F172A] truncate">
                      {adminName}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono truncate">
                      {adminEmail}
                    </div>
                    <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">
                      Role: Admin
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/console/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Console Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[#F1F5F9] px-2">
                    <SignOutButton className="w-full py-1.5 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg justify-start" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
