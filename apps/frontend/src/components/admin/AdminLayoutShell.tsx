"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  UserCog,
  Layers,
  ScrollText,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  adminInitials: string;
  avatarUrl?: string | null;
}

export default function AdminLayoutShell({
  children,
  adminName,
  adminEmail,
  adminInitials,
  avatarUrl,
}: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const mobileNavItems = [
    {
      href: "/console",
      label: "Overview",
      icon: LayoutDashboard,
      isActive: pathname === "/console",
    },
    {
      href: "/console/reports",
      label: "Approvals",
      icon: FileCheck,
      isActive: pathname.startsWith("/console/reports"),
    },
    {
      href: "/console/users",
      label: "Users",
      icon: Users,
      isActive: pathname.startsWith("/console/users"),
    },
    {
      href: "/console/staff",
      label: "Staff",
      icon: UserCog,
      isActive: pathname.startsWith("/console/staff"),
    },
    {
      href: "/console/assessments",
      label: "Engine",
      icon: Layers,
      isActive: pathname.startsWith("/console/assessments"),
    },
    {
      href: "/console/audit-logs",
      label: "Audit Logs",
      icon: ScrollText,
      isActive: pathname.startsWith("/console/audit-logs"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans selection:bg-[#FFD4CB] flex">
      {/* 1. Left Sidebar (Fixed on Desktop, Drawer on Mobile, Collapsible) */}
      <AdminSidebar
        adminName={adminName}
        adminEmail={adminEmail}
        adminInitials={adminInitials}
        avatarUrl={avatarUrl}
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
        <AdminHeader
          adminName={adminName}
          adminInitials={adminInitials}
          avatarUrl={avatarUrl}
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
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                item.isActive
                  ? "text-[#0F172A] font-extrabold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    item.isActive ? "text-red-600" : "text-[#64748B]"
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600" />
                )}
              </div>
              <span className="text-[9px] font-bold mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
