"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Inbox,
  Filter,
} from "lucide-react";

// Helper: Pluralize string cleanly
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

// Helper: Format fallback dashes
export function formatFallback(val: string | null | undefined): string {
  if (!val || val.trim() === "" || val === "Unspecified" || val === "N/A" || val === "Unspecified / N/A") {
    return "—";
  }
  return val;
}

// ═══════════════════════════════════════════════════════
// 1. Table Toolbar: Search, Filters & Active Filter Chips
// ═══════════════════════════════════════════════════════
export interface ActiveFilter {
  key: string;
  label: string;
  valueLabel: string;
}

interface AdminTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearAllFilters?: () => void;
  actions?: React.ReactNode;
}

export function AdminTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters,
  activeFilters = [],
  onRemoveFilter,
  onClearAllFilters,
  actions,
}: AdminTableToolbarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-[#0F172A]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Filters / Right Actions */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
          {filters && (
            <>
              {/* Desktop view for filters */}
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {filters}
              </div>

              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen((prev) => !prev)}
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A]"
              >
                <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Filters {activeFilters.length > 0 ? `(${activeFilters.length})` : ""}</span>
              </button>
            </>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Mobile Filter Collapse */}
      {mobileFilterOpen && filters && (
        <div className="sm:hidden p-3.5 bg-white border border-[#E2E8F0] rounded-xl space-y-2.5 animate-in fade-in-0 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9]">
            <span className="text-xs font-bold text-[#0F172A]">Filter Records</span>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="text-[#64748B] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">{filters}</div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-medium text-[#64748B]">Active:</span>
          {activeFilters.map((af) => (
            <span
              key={af.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A]"
            >
              <span className="text-[#64748B]">{af.label}:</span>
              <span className="font-semibold">{af.valueLabel}</span>
              {onRemoveFilter && (
                <button
                  type="button"
                  onClick={() => onRemoveFilter(af.key)}
                  className="hover:text-red-600 transition-colors ml-0.5"
                  aria-label={`Remove filter ${af.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}

          {onClearAllFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-xs font-semibold text-[#4F46E5] hover:underline ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 2. Table Pagination Bar
// ═══════════════════════════════════════════════════════
interface AdminTablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
}

export function AdminTablePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: AdminTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(totalCount, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 px-1 text-xs text-[#64748B]">
      <div className="flex items-center gap-3">
        <span className="tabular-nums font-medium">
          Showing <span className="font-bold text-[#0F172A]">{startItem}</span>–
          <span className="font-bold text-[#0F172A]">{endItem}</span> of{" "}
          <span className="font-bold text-[#0F172A]">{totalCount}</span> records
        </span>

        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="py-1 px-2 rounded-md bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-medium tabular-nums">
          Page <span className="font-bold text-[#0F172A]">{page}</span> of{" "}
          <span className="font-bold text-[#0F172A]">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 3. Row Actions Overflow Menu
// ═══════════════════════════════════════════════════════
export interface OverflowActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  isDestructive?: boolean;
  disabled?: boolean;
}

interface AdminRowActionsProps {
  primaryAction?: React.ReactNode;
  overflowActions?: OverflowActionItem[];
}

export function AdminRowActions({
  primaryAction,
  overflowActions = [],
}: AdminRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-end gap-1.5" ref={menuRef}>
      {primaryAction}

      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            aria-label="Row actions menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-[#E2E8F0] shadow-lg py-1 z-40 animate-in fade-in-0 duration-100">
              {overflowActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={action.disabled}
                    onClick={() => {
                      setMenuOpen(false);
                      action.onClick();
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-40 ${
                      action.isDestructive
                        ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                        : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 4. Empty State Component
// ═══════════════════════════════════════════════════════
interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-[#E2E8F0] space-y-3">
      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
