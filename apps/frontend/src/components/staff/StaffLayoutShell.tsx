"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import StaffSidebar from "./StaffSidebar";
import StaffHeader from "./StaffHeader";

interface StaffLayoutShellProps {
  children: React.ReactNode;
  staffName: string;
  staffEmail: string;
  staffInitials: string;
  role: string;
  avatarUrl?: string | null;
}

export default function StaffLayoutShell({
  children,
  staffName,
  staffEmail,
  staffInitials,
  role,
  avatarUrl,
}: StaffLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatusParam = searchParams?.get("status") || "ALL";

  const mobileNavItems = [
    {
      href: "/portal",
      label: "Intake Queue",
      icon: ClipboardList,
      isActive: pathname === "/portal" && currentStatusParam === "ALL",
    },
    {
      href: "/portal?status=UNDER_REVIEW",
      label: "In Review",
      icon: UserCheck,
      isActive: pathname === "/portal" && currentStatusParam === "UNDER_REVIEW",
    },
    {
      href: "/portal?status=REPORT_IN_PREP",
      label: "Drafting",
      icon: FileText,
      isActive: pathname === "/portal" && currentStatusParam === "REPORT_IN_PREP",
    },
    {
      href: "/portal?status=PENDING_APPROVAL",
      label: "Signoff",
      icon: AlertCircle,
      isActive: pathname === "/portal" && currentStatusParam === "PENDING_APPROVAL",
    },
    {
      href: "/portal?status=PUBLISHED",
      label: "Published",
      icon: CheckCircle2,
      isActive: pathname === "/portal" && currentStatusParam === "PUBLISHED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans selection:bg-[#FFD4CB] flex">
      {/* 1. Left Sidebar (Fixed on Desktop, Drawer on Mobile, Collapsible) */}
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
      />

      {/* 2. Main Application Canvas with Smooth Padding Transition & Content Buffer */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Compact SaaS Top Header */}
        <StaffHeader
          staffName={staffName}
          staffInitials={staffInitials}
          avatarUrl={avatarUrl}
          role={role}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content Canvas with Generous Spacing & Centered Safe Max-Width */}
        <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-5 sm:py-8 pb-24 md:pb-8 max-w-[1680px] mx-auto space-y-6 sm:space-y-8">
          {children}
        </main>
      </div>

      {/* 3. Sticky Mobile Bottom Navigation Bar (Phone View UX) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                item.isActive
                  ? "text-[#0F172A] font-extrabold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    item.isActive ? "text-[#4F46E5]" : "text-[#64748B]"
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4F46E5]" />
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
