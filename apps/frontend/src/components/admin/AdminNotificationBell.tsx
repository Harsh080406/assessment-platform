"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileCheck,
  Timer,
  ShieldAlert,
  UserPlus,
  ExternalLink,
  Check,
  Loader2,
  Sparkles,
  Inbox,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  getAdminNotificationsAction,
  markAdminNotificationReadAction,
  markAllAdminNotificationsReadAction,
  AdminNotificationItem,
} from "@/app/actions/admin";

export default function AdminNotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getAdminNotificationsAction();
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("[AdminNotificationBell] Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 45s for fresh administrative operational alerts
    const interval = setInterval(fetchNotifications, 45000);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fetchNotifications]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkItemRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    startTransition(async () => {
      await markAdminNotificationReadAction(id);
    });
  };

  const handleMarkAllRead = async () => {
    if (isMarkingAll || unreadCount === 0) return;
    setIsMarkingAll(true);

    const liveIds = notifications.filter((n) => n.id.startsWith("live-")).map((n) => n.id);

    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await markAllAdminNotificationsReadAction(liveIds);
    } catch (err) {
      console.error("[AdminNotificationBell] Error marking all read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleItemClick = async (item: AdminNotificationItem) => {
    if (!item.readAt) {
      await handleMarkItemRead(item.id);
    }
    setIsOpen(false);
    if (item.href) {
      router.push(item.href);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "REPORT_PENDING_APPROVAL":
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case "SLA_BREACH":
        return <Timer className="w-4 h-4 text-rose-600" />;
      case "SECURITY_ALERT":
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case "USER_SIGNUP":
        return <UserPlus className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#64748B]" />;
    }
  };

  const getItemIconBg = (type: string) => {
    switch (type) {
      case "REPORT_PENDING_APPROVAL":
        return "bg-emerald-50 border-emerald-200";
      case "SLA_BREACH":
        return "bg-rose-50 border-rose-200";
      case "SECURITY_ALERT":
        return "bg-amber-50 border-amber-200";
      case "USER_SIGNUP":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-slate-100 border-slate-200";
    }
  };

  const filteredNotifications =
    activeTab === "UNREAD"
      ? notifications.filter((n) => !n.readAt)
      : notifications;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Bell Button Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer flex items-center justify-center ${
          isOpen ? "bg-[#F1F5F9] text-[#0F172A]" : ""
        }`}
        aria-label="Platform Notifications & Operational Alerts"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Admin Notifications & Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white shadow-xs animate-in fade-in zoom-in duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[340px] sm:w-[400px] rounded-2xl bg-white border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden ring-1 ring-slate-900/5 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#E2E8F0] bg-slate-50/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                  Notification Center
                </span>
                {unreadCount > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    All caught up
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#0F172A] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isMarkingAll ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#64748B]" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-[#64748B]" />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-[#0F172A] text-white"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("UNREAD")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === "UNREAD"
                    ? "bg-[#0F172A] text-white"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F1F5F9] focus:outline-none">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#94A3B8] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#64748B]" />
                <span>Loading admin notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#94A3B8] flex flex-col items-center justify-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">
                    {activeTab === "UNREAD" ? "No unread alerts" : "No notifications yet"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeTab === "UNREAD"
                      ? "All administrative queues and security events are acknowledged."
                      : "Operational events will appear here in real-time."}
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !item.readAt;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group relative ${
                      isUnread ? "bg-indigo-50/20" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getItemIconBg(
                        item.type
                      )}`}
                    >
                      {getItemIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isUnread ? "text-[#0F172A]" : "text-[#475569]"
                          }`}
                        >
                          {item.title}
                        </span>

                        {item.priority === "CRITICAL" && (
                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                            Urgent
                          </span>
                        )}
                        {item.priority === "HIGH" && (
                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                            Action
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        {item.href && (
                          <span className="text-[10px] font-semibold text-[#0F172A] group-hover:underline flex items-center gap-0.5">
                            Open <ArrowRight className="w-2.5 h-2.5 inline" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator / Mark read toggle */}
                    <div className="shrink-0 flex items-center pt-1">
                      {isUnread ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkItemRead(item.id, e)}
                          title="Mark as read"
                          className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50 group-hover:bg-blue-700 transition-colors"
                        />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Operational Shortcuts */}
          <div className="px-4 py-2.5 border-t border-[#E2E8F0] bg-slate-50/70 flex items-center justify-between text-[11px] text-[#64748B]">
            <Link
              href="/console/audit-logs"
              onClick={() => setIsOpen(false)}
              className="font-medium hover:text-[#0F172A] transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-[#64748B]" />
              Audit Trail
            </Link>

            <Link
              href="/console/notifications"
              onClick={() => setIsOpen(false)}
              className="font-medium hover:text-[#0F172A] transition-colors flex items-center gap-1"
            >
              Email Templates
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
