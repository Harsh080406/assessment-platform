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
            <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? "lg:hidden" : "flex"}`}>
              <Link
                href="/console"
                className="flex items-center gap-2 group min-w-0"
                title="Alderwood Vantage Admin Console"
              >
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage Logo"
                  width={34}
                  height={28}
                  draggable={false}
                  className="h-7 w-auto object-contain shrink-0"
                />
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-sm font-bold tracking-tight text-[#0F172A] truncate">
                    Alderwood <span className="text-[#FF6B6B]">Vantage</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase">
                    Admin Console
                  </span>
                </div>
              </Link>
            </div>

            {/* Collapsed Brand Icon (Icon-rail view) */}
            {isCollapsed && (
              <Link
                href="/console"
                className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                title="Alderwood Vantage Overview"
              >
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage Logo"
                  width={28}
                  height={24}
                  className="h-6 w-auto object-contain"
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
                              className={`truncate leading-none ${
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

          {/* Bottom Footer: Desktop Collapse Toggle */}
          <div className="p-3 border-t border-[#F1F5F9] hidden lg:flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-[#94A3B8]">
                  v2.4 Governance
                </span>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
