"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";
import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";

interface StudentLayoutShellProps {
  children: React.ReactNode;
  studentName: string;
  studentEmail: string;
  studentInitials: string;
  avatarUrl?: string | null;
}

export default function StudentLayoutShell({
  children,
  studentName,
  studentEmail,
  studentInitials,
  avatarUrl,
}: StudentLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-collapse sidebar on tablet screens (768 - 1023px)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
        setIsCollapsed(true);
      } else if (width >= 1024) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Is assessment running? Hide mobile bottom nav if taking test
  const isTakingAssessment = pathname.startsWith("/take/");

  const mobileNavItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/dashboard/assessments",
      label: "Assessments",
      icon: FileText,
      isActive: pathname.startsWith("/dashboard/assessments"),
    },
    {
      href: "/dashboard/results",
      label: "Results",
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard/results"),
    },
    {
      href: "/dashboard/notifications",
      label: "Alerts",
      icon: Bell,
      isActive: pathname.startsWith("/dashboard/notifications"),
    },
    {
      href: "/dashboard/settings",
      label: "Profile",
      icon: Settings,
      isActive: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">
      {/* 1. Left Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <StudentSidebar
        studentName={studentName}
        studentEmail={studentEmail}
        studentInitials={studentInitials}
        avatarUrl={avatarUrl}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* 2. Main Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "md:pl-[72px]" : "md:pl-[248px]"
        }`}
      >
        {/* Top Header */}
        <StudentHeader
          studentName={studentName}
          studentEmail={studentEmail}
          studentInitials={studentInitials}
          avatarUrl={avatarUrl}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Content Area bounded to max 1200px centered */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-10 space-y-6 sm:space-y-8 min-w-0">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation (5 destinations, 56px, touch targets >= 44px, safe area) */}
      {!isTakingAssessment && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-md"
        >
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.isActive ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                  item.isActive
                    ? "text-[#0F172A]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      item.isActive ? "text-[#0F172A]" : "text-[#64748B]"
                    }`}
                  />
                  {item.isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0F172A]" />
                  )}
                </div>
                <span
                  className={`text-[10px] tracking-tight mt-1 transition-colors ${
                    item.isActive ? "font-bold text-[#0F172A]" : "font-medium text-[#64748B]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
