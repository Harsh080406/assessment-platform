"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  getStaffAlertsAction,
  markStaffAlertReadAction,
  markAllStaffAlertsReadAction,
  StaffAlertItem,
} from "@/app/actions/staff";

export default function StaffNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<StaffAlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = async () => {
    try {
      const res = await getStaffAlertsAction();
      if (res.success) {
        setAlerts(res.alerts);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Silently catch in header
    }
  };

  useEffect(() => {
    fetchAlerts();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchAlerts();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, readAt: new Date().toISOString() } : a))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markStaffAlertReadAction(id);
  };

  const handleMarkAllRead = async () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    await markAllStaffAlertsReadAction();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "REVISION_REQUESTED":
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case "SUBMISSION_ASSIGNED":
        return <UserCheck className="w-4 h-4 text-[#4F46E5]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
        aria-label="Staff Notifications & Alerts"
        title="Evaluator Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4F46E5] text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A]">Staff Alerts & Queue Events</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#0F172A] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-60" />
                No pending queue alerts.
              </div>
            ) : (
              alerts.map((a) => {
                const isUnread = !a.readAt;
                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      if (isUnread) handleMarkRead(a.id);
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                      isUnread ? "bg-indigo-50/30" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {getAlertIcon(a.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                          {a.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(a.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-snug line-clamp-2 ${
                          isUnread ? "font-semibold text-[#0F172A]" : "text-slate-600"
                        }`}
                      >
                        {a.message}
                      </p>

                      {a.type === "REVISION_REQUESTED" && (
                        <Link
                          href="/portal/needs-revision"
                          onClick={() => setIsOpen(false)}
                          className="mt-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                        >
                          <span>Open Needs Revision Queue</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}

                      {a.type === "SUBMISSION_ASSIGNED" && (
                        <Link
                          href="/portal"
                          onClick={() => setIsOpen(false)}
                          className="mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                        >
                          <span>View Assigned Queue</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#4F46E5] shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/80 border-t border-[#E2E8F0] text-center">
            <Link
              href="/portal/settings"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Manage Notification & Alert Preferences</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
