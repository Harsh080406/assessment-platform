"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  adminInitials: string;
  avatarUrl?: string | null;
  pendingApprovalsCount?: number;
}

export default function AdminLayoutShell({
  children,
  adminName,
  adminEmail,
  adminInitials,
  avatarUrl,
  pendingApprovalsCount = 0,
}: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Set default collapsed state for tablet viewports (768px - 1023px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans flex antialiased">
      {/* 1. Left Sidebar (Fixed on Desktop, Drawer on Mobile, Collapsible to 72px icon rail) */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* 2. Main Content Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"
        }`}
      >
        {/* Top Header (64px) */}
        <AdminHeader
          adminName={adminName}
          adminEmail={adminEmail}
          adminInitials={adminInitials}
          avatarUrl={avatarUrl}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Main Content Area: 1280px max-width, responsive padding */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1280px] mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
