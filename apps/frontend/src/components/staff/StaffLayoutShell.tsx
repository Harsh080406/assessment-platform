"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  UserCheck,
  CheckCircle2,
  RotateCcw,
  Settings,
} from "lucide-react";
import StaffSidebar, { StaffSidebarStats } from "./StaffSidebar";
import StaffHeader from "./StaffHeader";

interface StaffLayoutShellProps {
  children: React.ReactNode;
  staffName: string;
  staffEmail: string;
  staffInitials: string;
  role: string;
  avatarUrl?: string | null;
  stats?: StaffSidebarStats;
}

export default function StaffLayoutShell({
  children,
  staffName,
  staffEmail,
  staffInitials,
  role,
  avatarUrl,
  stats,
}: StaffLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatusParam = searchParams?.get("status") || "ALL";

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, searchParams]);

  // Responsive default: on tablet (768-1023px), collapse sidebar to 72px rail
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 5 Core Mobile Bottom Nav destinations
  const mobileNavItems = [
    {
      href: "/portal",
      label: "Queue",
      icon: ClipboardList,
      isActive: pathname === "/portal" && (currentStatusParam === "ALL" || !currentStatusParam),
      badgeCount: stats?.submitted,
      showBadge: Boolean(stats?.submitted && stats.submitted > 0),
      badgeVariant: "neutral" as const,
    },
    {
      href: "/portal/under-review",
      label: "Review",
      icon: UserCheck,
      isActive:
        pathname.startsWith("/portal/under-review") ||
        (pathname === "/portal" && currentStatusParam === "UNDER_REVIEW"),
      badgeCount: stats?.underReview,
      showBadge: Boolean(stats?.underReview && stats.underReview > 0),
      badgeVariant: "neutral" as const,
    },
    {
      href: "/portal/needs-revision",
      label: "Revision",
      icon: RotateCcw,
      isActive: pathname.startsWith("/portal/needs-revision"),
      badgeCount: stats?.needsRevision,
      showBadge: Boolean(stats?.needsRevision && stats.needsRevision > 0),
      badgeVariant: "error" as const,
    },
    {
      href: "/portal/published",
      label: "Published",
      icon: CheckCircle2,
      isActive:
        pathname.startsWith("/portal/published") ||
        (pathname === "/portal" && currentStatusParam === "PUBLISHED"),
      badgeCount: stats?.published,
      showBadge: false,
      badgeVariant: "neutral" as const,
    },
    {
      href: "/portal/settings",
      label: "Settings",
      icon: Settings,
      isActive: pathname.startsWith("/portal/settings"),
      badgeCount: undefined,
      showBadge: false,
      badgeVariant: "neutral" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col">
      {/* 1. Persistent / Drawer Sidebar (248px expanded, 72px icon rail) */}
      <StaffSidebar
        staffName={staffName}
        staffEmail={staffEmail}
        staffInitials={staffInitials}
        avatarUrl={avatarUrl}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        stats={stats}
      />

      {/* 2. Main Content Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "md:pl-[72px]" : "md:pl-[248px]"
        }`}
      >
        {/* Slim Top Bar (56-64px) */}
        <StaffHeader
          staffName={staffName}
          staffEmail={staffEmail}
          staffInitials={staffInitials}
          avatarUrl={avatarUrl}
          role={role}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />

        {/* Page Content: 1280px centered max-width, 24px desktop / 16px mobile padding */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Tab Bar (5 Primary Destinations, Touch Friendly, Safe Areas) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-3 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors min-h-[44px] ${
                item.isActive
                  ? "text-[#0F172A] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    item.isActive ? "text-[#0F172A]" : "text-[#64748B]"
                  }`}
                  strokeWidth={item.isActive ? 2 : 1.75}
                />
                {item.showBadge && item.badgeCount !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold tabular-nums flex items-center justify-center ring-2 ring-white ${
                      item.badgeVariant === "error"
                        ? "bg-red-600 text-white"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium mt-1 leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
