"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

interface StudentSidebarProps {
  studentName?: string;
  studentEmail?: string;
  studentInitials?: string;
  avatarUrl?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StudentSidebar({
  studentName = "Alex Student",
  studentEmail = "student@alderwoodvantage.com",
  studentInitials = "AS",
  avatarUrl,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: StudentSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/dashboard/assessments",
      label: "Assessments",
      icon: FileText,
      isActive: pathname.startsWith("/dashboard/assessments"),
      badge: "4",
    },
    {
      href: "/dashboard/results",
      label: "Results & Reports",
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard/results"),
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      isActive: pathname.startsWith("/dashboard/notifications"),
    },
    {
      href: "/dashboard/settings",
      label: "Profile & Settings",
      icon: Settings,
      isActive: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Persistent Sidebar (248px desktop, 72px tablet / collapsed) */}
      <aside
        aria-label="Student Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-200 ease-in-out md:translate-x-0 overflow-x-hidden ${
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0 shadow-none"
        } ${isCollapsed ? "w-[72px]" : "w-[248px]"}`}
      >
        {/* Top: Brand Header & Nav List */}
        <div className="flex flex-col h-full min-h-0 overflow-x-hidden">
          {/* Header */}
          <div
            className={`h-16 border-b border-[#F1F5F9] flex items-center px-4 ${
              isCollapsed ? "justify-center px-2" : "justify-between"
            }`}
          >
            {isCollapsed ? (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center justify-center p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-all cursor-pointer group"
                title="Alderwood Vantage Student"
                aria-label="Alderwood Vantage Student"
              >
                <Image
                  src="/AlderwoodVANTAGE.svg"
                  alt="Alderwood Vantage"
                  width={44}
                  height={38}
                  draggable={false}
                  className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </Link>
            ) : (
              <div className="flex items-center justify-between w-full min-w-0">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                  title="Alderwood Vantage Student"
                >
                  <Image
                    src="/AlderwoodVANTAGE.svg"
                    alt="Alderwood Vantage"
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
                      Student Portal
                    </span>
                  </div>
                </Link>

                {/* Mobile Drawer Close */}
                <button
                  type="button"
                  onClick={onClose}
                  className="md:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            {!isCollapsed && (
              <div className="px-3 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Learning Journey
                </span>
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={item.isActive ? "page" : undefined}
                  title={item.label}
                  className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed
                      ? "w-10 h-10 mx-auto justify-center"
                      : "justify-between px-3 py-2.5"
                  } ${
                    item.isActive
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        item.isActive
                          ? "text-white"
                          : "text-[#64748B] group-hover:text-[#0F172A]"
                      }`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        item.isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-[#0F172A] text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
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
                    className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
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
                    className="hidden md:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
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
