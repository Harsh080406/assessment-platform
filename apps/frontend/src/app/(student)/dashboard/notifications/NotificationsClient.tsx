"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Send,
  ShieldAlert,
  Sparkles,
  CheckCheck,
  Clock,
  Mail,
  Check,
} from "lucide-react";
import {
  NotificationItem,
  NotificationCategoryPreference,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  updateNotificationPreferenceAction,
} from "@/app/actions/notifications";
import StudentPageHeader from "@/components/student/StudentPageHeader";

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  initialPreferences: NotificationCategoryPreference[];
}

export default function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
  initialPreferences,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [preferences, setPreferences] = useState<NotificationCategoryPreference[]>(initialPreferences);
  const [activeTab, setActiveTab] = useState<"inbox" | "preferences">("inbox");
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "REPORTS" | "SUBMISSIONS" | "SECURITY">("ALL");
  const [prefLoadingCategory, setPrefLoadingCategory] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationReadAction(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  };

  const handleTogglePref = async (category: string, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    setPrefLoadingCategory(category);
    // Optimistic update
    setPreferences((prev) =>
      prev.map((p) => (p.category === category ? { ...p, emailEnabled: nextEnabled } : p))
    );

    try {
      await updateNotificationPreferenceAction(category, nextEnabled);
    } catch {
      // Revert on error
      setPreferences((prev) =>
        prev.map((p) => (p.category === category ? { ...p, emailEnabled: currentEnabled } : p))
      );
    } finally {
      setPrefLoadingCategory(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REPORT_PUBLISHED":
        return <FileCheck2 className="w-4 h-4 text-emerald-700" />;
      case "SUBMISSION_CONFIRMED":
        return <Send className="w-4 h-4 text-[#4F46E5]" />;
      case "SECURITY_ALERT":
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "REPORT_PUBLISHED":
        return "Certified Report Ready";
      case "SUBMISSION_CONFIRMED":
        return "Submission Confirmed";
      case "SECURITY_ALERT":
        return "Security Alert";
      default:
        return type.replace(/_/g, " ");
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

  // Counts for each filter
  const filterCounts = {
    ALL: notifications.length,
    UNREAD: unreadCount,
    REPORTS: notifications.filter((n) => n.type === "REPORT_PUBLISHED").length,
    SUBMISSIONS: notifications.filter((n) => n.type === "SUBMISSION_CONFIRMED").length,
    SECURITY: notifications.filter((n) => n.type === "SECURITY_ALERT").length,
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "UNREAD") return !item.readAt;
    if (filter === "REPORTS") return item.type === "REPORT_PUBLISHED";
    if (filter === "SUBMISSIONS") return item.type === "SUBMISSION_CONFIRMED";
    if (filter === "SECURITY") return item.type === "SECURITY_ALERT";
    return true;
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Standard Unified Header */}
      <StudentPageHeader
        title="Notifications"
        description="Real-time updates regarding your assessment milestones, evaluation progress, and certified reports."
      />

      {/* Segmented Control (Inbox / Preferences) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] self-start">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 min-h-[36px] ${
              activeTab === "inbox"
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0F172A] text-white text-[10px] tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 min-h-[36px] ${
              activeTab === "preferences"
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>Delivery Preferences</span>
          </button>
        </div>

        {activeTab === "inbox" && unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-indigo-800 transition-colors cursor-pointer self-start sm:self-auto py-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {activeTab === "inbox" ? (
        <div className="space-y-4">
          {/* Horizontally Scrollable Filter Chips with Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { key: "ALL", label: "All" },
                { key: "UNREAD", label: "Unread" },
                { key: "REPORTS", label: "Reports" },
                { key: "SUBMISSIONS", label: "Submissions" },
                { key: "SECURITY", label: "Security" },
              ] as const
            ).map((tab) => {
              const count = filterCounts[tab.key];
              const isSelected = filter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 min-h-[36px] border ${
                    isSelected
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-2xs font-semibold"
                      : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Notifications List Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden divide-y divide-[#E2E8F0]">
            {filteredNotifications.length === 0 ? (
              /* Friendly Empty State: no decorative bell illustration */
              <div className="p-8 sm:p-12 text-center space-y-2">
                <h3 className="font-bold text-base text-[#0F172A]">
                  You&apos;re all caught up
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
                  No new notifications in this view. We will notify you when evaluation updates or certified reports are ready.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !item.readAt;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isUnread) handleMarkRead(item.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (isUnread) handleMarkRead(item.id);
                      }
                    }}
                    className={`w-full p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-colors cursor-pointer group text-left focus:outline-none focus:bg-[#F8FAFC] ${
                      isUnread ? "bg-[#FFF9F8] hover:bg-[#FFF4F2]" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {/* Quiet Icon Tile */}
                    <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                            {getNotificationTitle(item.type)}
                          </span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#FF6B6B] shrink-0" />
                          )}
                        </div>

                        <span className="text-[11px] text-[#94A3B8] shrink-0 font-medium">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Delivery Preferences Tab */
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0F172A]">
              Email notification preferences
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Choose which milestone notifications are forwarded to your primary registered email address.
            </p>
          </div>

          <div className="divide-y divide-[#F1F5F9] pt-1">
            {preferences.map((pref) => {
              const isLoading = prefLoadingCategory === pref.category;

              return (
                <div
                  key={pref.category}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5 max-w-lg">
                    <span className="text-xs font-semibold text-[#0F172A] block">
                      {pref.category.replace(/_/g, " ")}
                    </span>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      {pref.category === "REPORTS" &&
                        "Receive an email when your official certified leadership blueprint is ready for download."}
                      {pref.category === "SUBMISSIONS" &&
                        "Receive confirmation receipts and locked response summaries upon submission."}
                      {pref.category === "EVALUATION_UPDATES" &&
                        "Stay updated when licensed evaluators begin and complete reviews of your assessment."}
                      {pref.category === "SECURITY" &&
                        "Crucial alerts regarding new sign-ins and password adjustments."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePref(pref.category, pref.emailEnabled)}
                    disabled={isLoading || pref.category === "SECURITY"}
                    role="switch"
                    aria-checked={pref.emailEnabled}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                      pref.emailEnabled ? "bg-[#4F46E5]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        pref.emailEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
