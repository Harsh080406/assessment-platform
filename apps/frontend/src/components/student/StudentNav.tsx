"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Compass, BarChart3 } from "lucide-react";

export default function StudentNav() {
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
    },
    {
      href: "/dashboard/careers",
      label: "Career Insights",
      icon: Compass,
      isActive: pathname.startsWith("/dashboard/careers"),
    },
    {
      href: "/dashboard/results",
      label: "Results",
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard/results"),
    },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all ${
              item.isActive
                ? "bg-[#FFF0EE] text-[#0F172A] border border-[#FED7CC] shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#191F2D] hover:bg-gray-100/60 font-semibold"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                item.isActive ? "text-[#FF6B6B]" : "text-[#8C95A6]"
              }`}
            />
            <span>{item.label}</span>
            {item.isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] shrink-0 animate-pulse ml-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
