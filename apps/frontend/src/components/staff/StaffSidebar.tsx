"use client";

import { useEffect, useRef } from "react";
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
  RotateCcw,
  LogOut,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export interface StaffSidebarStats {
  submitted?: number;
  underReview?: number;
  reportInPrep?: number;
  pendingApproval?: number;
  published?: number;
  needsRevision?: number;
  total?: number;
}

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
  stats?: StaffSidebarStats;
}

export default function StaffSidebar({
  staffName = "Staff Evaluator",
  staffEmail = "staff@alderwoodvantage.com",
  staffInitials = "SE",
  avatarUrl,
  role = "STAFF",
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  stats,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatusParam = searchParams?.get("status") || "ALL";
  const drawerRef = useRef<HTMLElement>(null);

  // Close on Escape key on mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    {
      href: "/portal",
      label: "Live Queue",
      icon: ClipboardList,
      isActive: pathname === "/portal" && (currentStatusParam === "ALL" || !currentStatusParam),
      count: stats?.submitted,
      showCountAlways: true,
      countVariant: "neutral" as const,
    },
    {
      href: "/portal/under-review",
      label: "Under Review",
      icon: UserCheck,
      isActive:
        pathname.startsWith("/portal/under-review") ||
        (pathname === "/portal" && currentStatusParam === "UNDER_REVIEW"),
      count: stats?.underReview,
      showCountAlways: true,
      countVariant: "neutral" as const,
    },
    {
      href: "/portal/review",
      label: "Responses & Reports",
      icon: FileText,
      isActive: pathname.startsWith("/portal/review"),
      count: stats?.underReview,
      showCountAlways: true,
      countVariant: "neutral" as const,
    },
    {
      href: "/portal/needs-revision",
      label: "Needs Revision",
      icon: RotateCcw,
      isActive: pathname.startsWith("/portal/needs-revision"),
      count: stats?.needsRevision ?? 0,
      showCountAlways: false, // ONLY show badge if count > 0
      countVariant: "error" as const,
    },
    {
      href: "/portal?status=PENDING_APPROVAL",
      label: "Pending Signoff",
      icon: AlertCircle,
      isActive: pathname === "/portal" && currentStatusParam === "PENDING_APPROVAL",
      count: stats?.pendingApproval,
      showCountAlways: true,
      countVariant: "neutral" as const,
    },
    {
      href: "/portal/published",
      label: "Published Reports",
      icon: CheckCircle2,
      isActive:
        pathname.startsWith("/portal/published") ||
        (pathname === "/portal" && currentStatusParam === "PUBLISHED"),
      count: stats?.published,
      showCountAlways: true,
      countVariant: "neutral" as const,
    },
    {
      href: "/portal/settings",
      label: "Workstation Settings",
      icon: Settings,
      isActive: pathname.startsWith("/portal/settings"),
      count: undefined,
      showCountAlways: false,
      countVariant: "neutral" as const,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop / Scrim */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity duration-200"
        />
      )}

      {/* Sidebar Container: 248px expanded, 72px collapsed */}
      <aside
        ref={drawerRef}
        aria-label="Staff navigation sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:shadow-none"
        } w-[248px] ${isCollapsed ? "md:w-[72px]" : "md:w-[248px]"} overflow-x-hidden`}
      >
        {/* Top: Brand Header & Nav List */}
        <div className="flex flex-col h-full min-h-0 overflow-x-hidden">
          {/* Header Brand Area (56-64px height) */}
          <div
            className={`h-14 sm:h-16 border-b border-[#F1F5F9] flex items-center px-3.5 transition-all shrink-0 ${
              isCollapsed ? "md:px-2 md:justify-center" : "justify-between"
            }`}
          >
            {/* Desktop Collapsed View */}
            <div className={`hidden ${isCollapsed ? "md:flex" : "hidden"} items-center justify-center`}>
              <Link
                href="/portal"
                onClick={onClose}
                className="flex items-center justify-center p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-all cursor-pointer group"
                title="Alderwood Vantage Evaluator"
                aria-label="Alderwood Vantage Evaluator"
              >
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage Logo"
                  width={44}
                  height={38}
                  draggable={false}
                  className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </Link>
            </div>

            {/* Expanded Brand View */}
            <div className={`flex items-center justify-between w-full min-w-0 ${isCollapsed ? "md:hidden" : "flex"}`}>
              <Link
                href="/portal"
                onClick={onClose}
                className="flex items-center gap-3 min-w-0 flex-1 group"
                title="Alderwood Vantage - Staff Portal"
              >
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage Logo"
                  width={48}
                  height={42}
                  priority
                  draggable={false}
                  className="h-10 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
                />
                <div className="flex flex-col min-w-0 justify-center">
                  <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-[15px] font-black tracking-tight text-[#0F172A] leading-tight whitespace-nowrap">
                    Alderwood <span className="text-[#FF6B6B]">Vantage</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] tracking-tight leading-tight mt-0.5 whitespace-nowrap">
                    Evaluator Portal
                  </span>
                </div>
              </Link>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0 ml-1"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Primary evaluation queues"
            className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar min-h-0"
          >
            {/* Section Header */}
            <div className={`px-2.5 pt-1 pb-1.5 ${isCollapsed ? "md:hidden" : "block"}`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Evaluation Queue
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const hasCount = item.count !== undefined;
              const showBadge =
                hasCount &&
                (item.showCountAlways || (item.countVariant === "error" && item.count > 0));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={item.isActive ? "page" : undefined}
                  title={`${item.label}${hasCount && item.count !== undefined ? ` (${item.count})` : ""}`}
                  className={`group relative flex items-center rounded-xl text-xs font-medium transition-all ${
                    isCollapsed
                      ? "md:w-10 md:h-10 md:mx-auto md:justify-center justify-between px-3 py-2.5"
                      : "justify-between px-3 py-2"
                  } ${
                    item.isActive
                      ? "bg-[#0F172A] text-white shadow-2xs font-semibold"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        item.isActive
                          ? "text-white"
                          : "text-[#64748B] group-hover:text-[#0F172A]"
                      }`}
                      strokeWidth={1.75}
                    />
                    <span
                      className={`truncate text-xs ${
                        isCollapsed ? "md:hidden block" : "block"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Badge */}
                  {showBadge && (
                    <span
                      className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                        isCollapsed ? "md:hidden inline-block" : "inline-block"
                      } ${
                        item.countVariant === "error"
                          ? item.isActive
                            ? "bg-red-500/30 text-red-200 border border-red-400/40 font-bold"
                            : "bg-red-50 text-red-700 border border-red-200 font-bold"
                          : item.isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-[#475569] border border-slate-200/60"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: Minimal Sign Out & Hide Sidebar Toggle */}
          <div className="p-2.5 border-t border-[#F1F5F9] bg-[#FAFAFA]/80 shrink-0">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    suppressHydrationWarning
                    className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    title="Expand sidebar"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
                <SignOutButton
                  showLabel={false}
                  className="w-10 h-10 p-0 rounded-xl text-[#64748B] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sign Out"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-[#64748B]">
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    suppressHydrationWarning
                    className="hidden md:inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    title="Hide sidebar"
                    aria-label="Hide sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4 shrink-0" />
                    <span>Hide sidebar</span>
                  </button>
                )}
                <SignOutButton
                  showLabel={true}
                  className="p-1 px-2 text-[11px] font-medium text-[#64748B] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
