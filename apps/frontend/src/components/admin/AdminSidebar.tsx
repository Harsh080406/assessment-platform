"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  UserCog,
  Layers,
  ScrollText,
  Timer,
  Shield,
  Settings,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingApprovalsCount?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export default function AdminSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  pendingApprovalsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement>(null);

  // Close mobile drawer on Escape key
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

  // Grouped Navigation Structure
  const navGroups: NavGroup[] = [
    {
      groupLabel: "Operations",
      items: [
        {
          href: "/console",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/console/reports",
          label: "Report approvals",
          icon: FileCheck,
          badgeCount: pendingApprovalsCount,
        },
        {
          href: "/console/sla",
          label: "SLA monitoring",
          icon: Timer,
        },
      ],
    },
    {
      groupLabel: "People",
      items: [
        {
          href: "/console/users",
          label: "User governance",
          icon: Users,
        },
        {
          href: "/console/staff",
          label: "Staff & workload",
          icon: UserCog,
        },
      ],
    },
    {
      groupLabel: "Assessments & delivery",
      items: [
        {
          href: "/console/assessments",
          label: "Assessments",
          icon: Layers,
        },
        {
          href: "/console/notifications",
          label: "Email templates",
          icon: Mail,
        },
      ],
    },
    {
      groupLabel: "Security & system",
      items: [
        {
          href: "/console/audit-logs",
          label: "Audit trail",
          icon: ScrollText,
        },
        {
          href: "/console/security",
          label: "Security center",
          icon: Shield,
        },
        {
          href: "/console/settings",
          label: "System settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/console") {
      return pathname === "/console";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop (Scrim) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={drawerRef}
        aria-label="Admin Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full shadow-none lg:shadow-none"
        } w-[280px] ${isCollapsed ? "lg:w-[72px]" : "lg:w-[248px]"}`}
      >
        {/* Top: Brand Header */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Row */}
          <div
            className={`h-16 border-b border-[#F1F5F9] flex items-center justify-between px-4 transition-all shrink-0 ${
              isCollapsed ? "lg:px-2 lg:justify-center" : ""
            }`}
          >
            {/* Expanded Brand View */}
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "lg:hidden" : "flex"}`}>
              <Link
                href="/console"
                className="flex items-center gap-3 group min-w-0"
                title="Alderwood Vantage Admin Console"
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
                    Admin Console
                  </span>
                </div>
              </Link>
            </div>

            {/* Collapsed Brand Icon (Icon-rail view) */}
            {isCollapsed && (
              <Link
                href="/console"
                className="hidden lg:flex items-center justify-center p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-all cursor-pointer group"
                title="Alderwood Vantage Overview"
              >
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage Logo"
                  width={44}
                  height={38}
                  className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </Link>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups (Scrollable) */}
          <nav
            className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200"
            aria-label="Main Administration Menu"
          >
            {navGroups.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                {/* Section Eyebrow Label */}
                {!isCollapsed ? (
                  <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {group.groupLabel}
                  </div>
                ) : (
                  <div className="hidden lg:block h-px bg-[#F1F5F9] my-2 mx-1" aria-hidden="true" />
                )}

                {/* Section Items */}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isLinkActive(item.href);
                    const Icon = item.icon;
                    const hasCount = item.badgeCount !== undefined && item.badgeCount > 0;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => onClose?.()}
                          aria-current={active ? "page" : undefined}
                          title={isCollapsed ? item.label : undefined}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group ${
                            active
                              ? "bg-[#0F172A] text-white shadow-xs"
                              : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                          } ${isCollapsed ? "lg:justify-center lg:px-2" : "justify-between"}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                active ? "text-white" : "text-[#64748B] group-hover:text-[#0F172A]"
                              }`}
                            />
                            <span
                              className={`truncate leading-normal py-0.5 ${
                                isCollapsed ? "lg:hidden" : "inline"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>

                          {/* Real count badge only (e.g. pending approvals > 0 in amber) */}
                          {hasCount && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums border ${
                                isCollapsed ? "lg:hidden" : "inline"
                              } ${
                                active
                                  ? "bg-amber-400 text-slate-900 border-amber-300"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Bottom Rail: Hide Sidebar Toggle & Sign Out */}
          <div className="p-3 border-t border-[#F1F5F9] bg-[#FAFAFA] overflow-x-hidden">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    suppressHydrationWarning
                    className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    title="Expand sidebar"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
                <SignOutButton
                  showLabel={false}
                  className="w-10 h-10 p-0 border border-[#E2E8F0] hover:border-red-200 bg-white hover:bg-red-50 text-[#64748B] hover:text-red-600 rounded-xl transition-colors shadow-2xs"
                  title="Sign out"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between px-1 gap-2 overflow-x-hidden">
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    suppressHydrationWarning
                    className="hidden lg:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
                    title="Hide sidebar"
                    aria-label="Hide sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4 shrink-0" />
                    <span>Hide sidebar</span>
                  </button>
                )}

                <SignOutButton
                  showLabel={true}
                  className="text-xs font-medium text-[#64748B] hover:text-red-600 bg-transparent border-0 p-0 hover:bg-transparent shadow-none"
                  title="Sign out"
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
