import Link from "next/link";
import {
  Users,
  FileCheck,
  UserCog,
  Layers,
  ScrollText,
  Timer,
  Shield,
  Settings,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  getAdminDashboardStatsAction,
  getAdminSlaMonitoringAction,
} from "@/app/actions/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import type { LucideIcon } from "lucide-react";

interface ShortcutItem {
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "amber" | "red";
}

interface ShortcutGroup {
  group: string;
  items: ShortcutItem[];
}

export default async function AdminConsolePage() {
  const [statsRes, slaRes] = await Promise.all([
    getAdminDashboardStatsAction(),
    getAdminSlaMonitoringAction(),
  ]);

  const stats = statsRes.success && statsRes.data
    ? statsRes.data
    : {
        totalStudents: 0,
        totalAttempts: 0,
        pendingReviews: 0,
        reportsPendingApproval: 0,
        reportsPublished: 0,
        totalStaff: 0,
      };

  const totalOverdue =
    slaRes.success && slaRes.data ? slaRes.data.summary.totalOverdue : 0;

  // Shortcut items grouped like the sidebar
  const shortcutGroups: ShortcutGroup[] = [
    {
      group: "Operations",
      items: [
        {
          title: "Report approvals",
          desc: "Review candidate reports awaiting administrative signoff",
          href: "/console/reports",
          icon: FileCheck,
          badge: stats.reportsPendingApproval > 0 ? `${stats.reportsPendingApproval} pending` : undefined,
          badgeVariant: "amber" as const,
        },
        {
          title: "SLA monitoring",
          desc: "Track turnaround times and reassign stalled evaluations",
          href: "/console/sla",
          icon: Timer,
          badge: totalOverdue > 0 ? `${totalOverdue} overdue` : undefined,
          badgeVariant: "red" as const,
        },
      ],
    },
    {
      group: "People",
      items: [
        {
          title: "User governance",
          desc: "Manage candidate student accounts, status, and credentials",
          href: "/console/users",
          icon: Users,
        },
        {
          title: "Staff & workload",
          desc: "Allocate evaluator caseloads and manage internal RBAC roles",
          href: "/console/staff",
          icon: UserCog,
        },
      ],
    },
    {
      group: "Assessments & Templates",
      items: [
        {
          title: "Assessments",
          desc: "Govern assessment question banks and copy-on-write versioning",
          href: "/console/assessments",
          icon: Layers,
        },
        {
          title: "Email templates",
          desc: "Configure transaction email subjects, bodies, and merge tags",
          href: "/console/notifications",
          icon: Mail,
        },
      ],
    },
    {
      group: "Security & System",
      items: [
        {
          title: "Audit trail",
          desc: "Inspect immutable audit logs and security-critical events",
          href: "/console/audit-logs",
          icon: ScrollText,
        },
        {
          title: "Security center",
          desc: "Oversee privileged accounts, MFA status, and session security",
          href: "/console/security",
          icon: Shield,
        },
        {
          title: "System settings",
          desc: "Configure global SLA turnaround windows and feature flags",
          href: "/console/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Standard Page Header */}
      <AdminPageHeader
        title="Platform Administration Overview"
        description="Global governance workspace for operations, candidate accounts, evaluation SLAs, and system configurations."
        action={
          <Link
            href="/console/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Review pending reports</span>
            {stats.reportsPendingApproval > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 tabular-nums">
                {stats.reportsPendingApproval}
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* 2. Needs Attention Strip (neutral unless > 0) */}
      <section aria-labelledby="needs-attention-heading" className="space-y-2">
        <h2 id="needs-attention-heading" className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Needs Attention
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pending Reviews */}
          <Link
            href="/console/sla"
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              stats.pendingReviews > 0
                ? "bg-amber-50/60 border-amber-200 hover:border-amber-300"
                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  stats.pendingReviews > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] truncate">
                  Evaluations in Progress
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Active in staff clinical pipeline
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-base font-bold tabular-nums ${stats.pendingReviews > 0 ? "text-amber-800" : "text-[#0F172A]"}`}>
                {stats.pendingReviews}
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </div>
          </Link>

          {/* Pending Signoff */}
          <Link
            href="/console/reports"
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              stats.reportsPendingApproval > 0
                ? "bg-amber-50/60 border-amber-200 hover:border-amber-300"
                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  stats.reportsPendingApproval > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] truncate">
                  Pending Admin Signoff
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Completed reports awaiting approval
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-base font-bold tabular-nums ${stats.reportsPendingApproval > 0 ? "text-amber-800" : "text-[#0F172A]"}`}>
                {stats.reportsPendingApproval}
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </div>
          </Link>

          {/* Breached SLA */}
          <Link
            href="/console/sla"
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              totalOverdue > 0
                ? "bg-red-50/60 border-red-200 hover:border-red-300"
                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  totalOverdue > 0
                    ? "bg-red-100 text-red-700"
                    : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] truncate">
                  SLA Breached Evaluations
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Past turnaround guarantee window
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-base font-bold tabular-nums ${totalOverdue > 0 ? "text-red-700" : "text-[#0F172A]"}`}>
                {totalOverdue}
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Platform Summary: One row of neutral stat cards (5-up desktop, 2-up mobile) */}
      <section aria-labelledby="platform-summary-heading" className="space-y-2">
        <h2 id="platform-summary-heading" className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Platform Metrics Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <AdminStatCard
            label="Total Students"
            value={stats.totalStudents}
            subtext="Registered candidate accounts"
            icon={Users}
          />
          <AdminStatCard
            label="Total Attempts"
            value={stats.totalAttempts}
            subtext="Assessments started"
            icon={TrendingUp}
          />
          <AdminStatCard
            label="Pending Reviews"
            value={stats.pendingReviews}
            subtext="Active in intake queue"
            icon={Clock}
          />
          <AdminStatCard
            label="Pending Signoff"
            value={stats.reportsPendingApproval}
            subtext="PDFs awaiting approval"
            icon={AlertCircle}
          />
          <AdminStatCard
            label="Published Reports"
            value={stats.reportsPublished}
            subtext="Certified active reports"
            icon={CheckCircle2}
            className="col-span-2 lg:col-span-1"
          />
        </div>
      </section>

      {/* 4. Shortcuts: Compact grid of simple link rows grouped like the sidebar */}
      <section aria-labelledby="shortcuts-heading" className="space-y-3">
        <h2 id="shortcuts-heading" className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Platform Administration Shortcuts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shortcutGroups.map((group) => (
            <div
              key={group.group}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2 flex flex-col justify-between"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] pb-1 border-b border-[#F1F5F9]">
                {group.group}
              </div>

              <div className="space-y-1.5 flex-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="p-2 rounded-lg hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] group-hover:text-[#0F172A] shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                              item.badgeVariant === "red"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0F172A] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
