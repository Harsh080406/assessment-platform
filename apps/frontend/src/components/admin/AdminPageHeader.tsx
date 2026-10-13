"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  breadcrumbHref?: string;
  breadcrumbLabel?: string;
  action?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  breadcrumbHref,
  breadcrumbLabel = "Back to Overview",
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-[#E2E8F0]">
      <div className="space-y-1 max-w-3xl min-w-0">
        {breadcrumbHref && (
          <nav aria-label="Breadcrumb">
            <Link
              href={breadcrumbHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors mb-1 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{breadcrumbLabel}</span>
            </Link>
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-2 sm:line-clamp-1">
          {description}
        </p>
      </div>

      {action && (
        <div className="shrink-0 flex items-center gap-2.5 sm:self-center">
          {action}
        </div>
      )}
    </header>
  );
}
