"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ClipboardList,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Shield,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

interface StaffSidebarProps {
  staffName?: string;
  staffEmail?: string;
  staffInitials?: string;
  avatarUrl?: string | null;
  role?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StaffSidebar({
  staffName = "Staff Evaluator",
  staffEmail = "staff@aurapath.com",
  staffInitials = "SE",
  avatarUrl,
  role = "STAFF",
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatusParam = searchParams?.get("status") || "ALL";

  const navItems = [
    {
      href: "/portal",
      label: "Live Queue",
      icon: ClipboardList,
      isActive: pathname === "/portal" && currentStatusParam === "ALL",
      badge: "Intake",
    },
    {
      href: "/portal?status=UNDER_REVIEW",
      label: "Under Review",
      icon: UserCheck,
      isActive: pathname === "/portal" && currentStatusParam === "UNDER_REVIEW",
    },
    {
      href: "/portal?status=REPORT_IN_PREP",
      label: "Report In Prep",
      icon: FileText,
      isActive: pathname === "/portal" && currentStatusParam === "REPORT_IN_PREP",
    },
    {
      href: "/portal?status=PENDING_APPROVAL",
      label: "Pending Signoff",
      icon: AlertCircle,
      isActive: pathname === "/portal" && currentStatusParam === "PENDING_APPROVAL",
    },
    {
      href: "/portal?status=PUBLISHED",
      label: "Published Reports",
      icon: CheckCircle2,
      isActive: pathname === "/portal" && currentStatusParam === "PUBLISHED",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none md:shadow-none"
        } w-[280px] ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Top: Brand Header & Navigation */}
        <div className="flex flex-col h-full">
          {/* Brand Logo & Portal Tag / Mobile Close / Desktop Collapse Toggle */}
          <div
            className={`h-16 border-b border-[#F1F5F9] flex items-center justify-between px-4 sm:px-5 transition-all ${
              isCollapsed ? "md:px-3 md:justify-center" : ""
            }`}
          >
            {/* Desktop Collapsed Icon View */}
            <div className={`hidden ${isCollapsed ? "md:flex" : "hidden"} items-center justify-center`}>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl bg-[#0F172A] hover:bg-black text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs group"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <span className="group-hover:hidden flex items-center justify-center font-extrabold text-sm tracking-tighter">
                  <span className="text-[#FF6B6B]">A</span>P
                </span>
                <PanelLeftOpen className="w-4 h-4 hidden group-hover:block text-white" />
              </button>
            </div>

            {/* Full Expanded View (always on mobile, and desktop when expanded) */}
            <div className={`flex items-center justify-between w-full ${isCollapsed ? "md:hidden" : "flex"}`}>
              <Link href="/portal" onClick={onClose} className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-xl font-extrabold tracking-tight text-[#0F172A]">
                  Aura<span className="text-[#FF6B6B]">Path</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-md border border-[#E0E7FE]">
                  Staff
                </span>
              </Link>

              {/* Explicit Mobile Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Collapse Toggle Button */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {/* Evaluation Workspace Section Header */}
            <div className={`px-3 pb-2 ${isCollapsed ? "md:hidden" : "block"}`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Evaluation Queue
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    isCollapsed
                      ? "md:w-10 md:h-10 md:mx-auto md:justify-center justify-between px-3.5 py-3 md:py-2.5"
                      : "justify-between px-3.5 py-3 md:py-2.5"
                  } ${
                    item.isActive
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        item.isActive ? "text-[#FF6B6B]" : "text-[#64748B]"
                      }`}
                    />
                    <span className={isCollapsed ? "md:hidden block" : "block"}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#F1F5F9] text-[#64748B]"
                      } ${isCollapsed ? "md:hidden block" : "block"}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom: Staff Profile & Sign Out Bar */}
          <div className="p-3 border-t border-[#F1F5F9] bg-[#FAFAFA]">
            {/* Desktop Collapsed View */}
            <div className={`hidden ${isCollapsed ? "md:flex" : "hidden"} flex-col items-center gap-2.5`}>
              <div
                className="relative w-9 h-9 rounded-xl bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs"
                title={`${staffName} (${role})`}
              >
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

              <SignOutButton
                showLabel={false}
                className="w-9 h-9 p-0 border border-[#E2E8F0] hover:border-red-200 bg-white hover:bg-red-50 text-[#64748B] hover:text-red-600 rounded-xl shadow-xs"
                title="Sign Out"
              />
            </div>

            {/* Mobile & Desktop Expanded View */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs ${isCollapsed ? "md:hidden" : "flex"}`}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-[#0F172A] truncate">
                    {staffName}
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-[#4F46E5]" />
                    <span>{role} Evaluator</span>
                  </div>
                </div>
              </div>

              <SignOutButton
                showLabel={false}
                className="p-1.5 border-0 hover:bg-red-50 text-[#64748B] hover:text-red-600 rounded-lg shadow-none"
                title="Sign Out"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
