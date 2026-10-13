"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  RotateCcw,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { AttemptStatus, ReportStatus } from "@prisma/client";
import SlaBadge from "@/components/staff/SlaBadge";
import { computeSlaInfo } from "@/lib/sla";
import { claimSubmissionAction } from "@/app/actions/staff";
import { StaffSidebarStats } from "@/components/staff/StaffSidebar";

export interface SubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  school?: string | null;
  grade?: string | null;
  assessmentTitle: string;
  assessmentVersion: number;
  startedAt: string;
  submittedAt: string | null;
  status: AttemptStatus;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  reportsCount: number;
  latestReportStatus?: ReportStatus | null;
  latestReportId?: string | null;
  fileReference?: string | null;
  publishedAt?: string | null;
}

interface StaffSubmissionsClientProps {
  initialSubmissions: SubmissionItem[];
  defaultStatus?: string;
  currentUserId?: string;
  slaDays?: number;
  stats?: StaffSidebarStats;
  showPipelineStrip?: boolean;
  showWorkloadCard?: boolean;
  pageMode?: "DEFAULT" | "UNDER_REVIEW" | "PUBLISHED";
}

export default function StaffSubmissionsClient({
  initialSubmissions,
  defaultStatus,
  currentUserId,
  slaDays = 4,
  stats,
  showPipelineStrip = true,
  showWorkloadCard = true,
  pageMode = "DEFAULT",
}: StaffSubmissionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameter
  const urlStatusParam = searchParams?.get("status");

  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    urlStatusParam || defaultStatus || "ALL"
  );
  const [queueTab, setQueueTab] = useState<"ALL" | "UNASSIGNED" | "MY_ASSIGNED">("ALL");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [alertBanner, setAlertBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    if (urlStatusParam) {
      setSelectedStatus(urlStatusParam);
    } else if (defaultStatus) {
      setSelectedStatus(defaultStatus);
    } else {
      setSelectedStatus("ALL");
    }
  }, [urlStatusParam, defaultStatus]);

  // Update status filter and reflect in URL
  const handleStatusChange = useCallback(
    (newStatus: string) => {
      setSelectedStatus(newStatus);
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (newStatus === "ALL") {
        params.delete("status");
      } else {
        params.set("status", newStatus);
      }
      const qs = params.toString();
      const newUrl = qs ? `?${qs}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const myAssignedCount = useMemo(
    () => submissions.filter((s) => s.assignedStaffId && s.assignedStaffId === currentUserId).length,
    [submissions, currentUserId]
  );

  const myOverdueCount = useMemo(() => {
    return submissions.filter((s) => {
      if (s.assignedStaffId !== currentUserId) return false;
      const sla = computeSlaInfo(s.submittedAt, slaDays);
      return sla?.isOverdue;
    }).length;
  }, [submissions, currentUserId, slaDays]);

  const handleClaim = async (attemptId: string) => {
    setClaimingId(attemptId);
    setAlertBanner(null);
    try {
      const res = await claimSubmissionAction(attemptId);
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === attemptId
              ? {
                  ...s,
                  assignedStaffId: currentUserId || null,
                  assignedStaffName: res.data?.assignedStaffName || "You",
                  status: s.status === AttemptStatus.SUBMITTED ? AttemptStatus.UNDER_REVIEW : s.status,
                }
              : s
          )
        );
        setAlertBanner({ type: "success", text: res.message });
      } else {
        setAlertBanner({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setAlertBanner({ type: "error", text: err.message || "Failed to claim submission." });
    } finally {
      setClaimingId(null);
    }
  };

  // Filter pipeline
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Queue ownership tab
      if (queueTab === "UNASSIGNED" && sub.assignedStaffId) {
        return false;
      }
      if (queueTab === "MY_ASSIGNED" && sub.assignedStaffId !== currentUserId) {
        return false;
      }

      // 2. Overdue toggle
      if (overdueOnly) {
        const sla = computeSlaInfo(sub.submittedAt, slaDays);
        if (!sla?.isOverdue) return false;
      }

      // 3. Status filter
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "OVERDUE") {
          const sla = computeSlaInfo(sub.submittedAt, slaDays);
          if (!sla?.isOverdue) return false;
        } else if (selectedStatus === "NEEDS_REVISION") {
          if (sub.latestReportStatus !== ReportStatus.REJECTED) return false;
        } else if (sub.status !== selectedStatus) {
          return false;
        }
      }

      // 4. Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = sub.studentName.toLowerCase().includes(q);
        const matchEmail = sub.studentEmail ? sub.studentEmail.toLowerCase().includes(q) : false;
        const matchSchool = sub.school ? sub.school.toLowerCase().includes(q) : false;
        const matchAssessment = sub.assessmentTitle.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchSchool && !matchAssessment) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, queueTab, overdueOnly, selectedStatus, searchQuery, currentUserId, slaDays]);

  // Ownership tab counts based on current status
  const tabCounts = useMemo(() => {
    const base = submissions.filter((sub) => {
      if (overdueOnly) {
        const sla = computeSlaInfo(sub.submittedAt, slaDays);
        if (!sla?.isOverdue) return false;
      }
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "OVERDUE") {
          const sla = computeSlaInfo(sub.submittedAt, slaDays);
          return !!sla?.isOverdue;
        }
        if (selectedStatus === "NEEDS_REVISION") {
          return sub.latestReportStatus === ReportStatus.REJECTED;
        }
        return sub.status === selectedStatus;
      }
      return true;
    });

    return {
      all: base.length,
      unassigned: base.filter((s) => !s.assignedStaffId).length,
      myAssigned: base.filter((s) => s.assignedStaffId === currentUserId).length,
    };
  }, [submissions, selectedStatus, overdueOnly, currentUserId, slaDays]);

  // Clean status badge helper
  const renderStatusBadge = (status: AttemptStatus, latestReportStatus?: ReportStatus | null) => {
    if (latestReportStatus === ReportStatus.REJECTED) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span>Needs revision</span>
        </span>
      );
    }

    switch (status) {
      case AttemptStatus.SUBMITTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>New intake</span>
          </span>
        );
      case AttemptStatus.UNDER_REVIEW:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>In review</span>
          </span>
        );
      case AttemptStatus.REPORT_IN_PREP:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Report prep</span>
          </span>
        );
      case AttemptStatus.PENDING_APPROVAL:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>Signoff pending</span>
          </span>
        );
      case AttemptStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Published</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Pipeline strip segments
  const pipelineSegments = [
    {
      key: AttemptStatus.SUBMITTED,
      label: "New intake",
      count: stats?.submitted ?? 0,
      isError: false,
    },
    {
      key: AttemptStatus.UNDER_REVIEW,
      label: "In review",
      count: stats?.underReview ?? 0,
      isError: false,
    },
    {
      key: AttemptStatus.REPORT_IN_PREP,
      label: "Report prep",
      count: stats?.reportInPrep ?? 0,
      isError: false,
    },
    {
      key: "NEEDS_REVISION",
      label: "Needs revision",
      count: stats?.needsRevision ?? 0,
      isError: (stats?.needsRevision ?? 0) > 0,
    },
    {
      key: AttemptStatus.PENDING_APPROVAL,
      label: "Signoff",
      count: stats?.pendingApproval ?? 0,
      isError: false,
    },
    {
      key: AttemptStatus.PUBLISHED,
      label: "Completed",
      count: stats?.published ?? 0,
      isError: false,
    },
  ];

  const formatCleanDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSchoolGrade = (school?: string | null, grade?: string | null) => {
    const isPlaceholderSchool = !school || school.toLowerCase().includes("unspecified");
    const isPlaceholderGrade = !grade || grade.toLowerCase().includes("general");

    if (isPlaceholderSchool && isPlaceholderGrade) return "—";
    if (!isPlaceholderSchool && !isPlaceholderGrade) return `${school} • ${grade}`;
    if (!isPlaceholderSchool) return school;
    return grade;
  };

  const hasActiveFilters = selectedStatus !== "ALL" || overdueOnly || searchQuery.length > 0;

  const handleClearFilters = () => {
    setSearchQuery("");
    setOverdueOnly(false);
    handleStatusChange("ALL");
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Optional Compact Pipeline Strip (Live Queue page only) */}
      {showPipelineStrip && stats && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[#E2E8F0]">
            {pipelineSegments.map((seg) => {
              const isSelected = selectedStatus === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => handleStatusChange(isSelected ? "ALL" : seg.key)}
                  className={`p-3.5 sm:p-4 text-left transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-slate-50/80 ring-1 ring-inset ring-slate-300"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span
                      className={`text-xl sm:text-2xl font-semibold tabular-nums ${
                        seg.isError
                          ? "text-red-700 font-bold"
                          : isSelected
                          ? "text-[#0F172A]"
                          : "text-[#1E293B]"
                      }`}
                    >
                      {seg.count}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4F46E5]">
                        Filtered
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5 font-medium group-hover:text-[#0F172A] transition-colors">
                    {seg.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Optional Workload Card (Live Queue page only) */}
      {showWorkloadCard && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-[#475569]" />
            </div>
            <div className="text-xs sm:text-sm text-[#334155]">
              You have <strong className="font-semibold text-[#0F172A]">{myAssignedCount}</strong> active evaluation
              {myAssignedCount === 1 ? "" : "s"} assigned
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {myOverdueCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-50 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span>{myOverdueCount} overdue</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>SLA on track</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setQueueTab("MY_ASSIGNED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                queueTab === "MY_ASSIGNED"
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#334155] border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              Focus my workload
            </button>
          </div>
        </div>
      )}

      {/* Alert Banner for Actions */}
      {alertBanner && (
        <div
          role="status"
          className={`p-3 px-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            alertBanner.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          <span>{alertBanner.text}</span>
          <button
            type="button"
            onClick={() => setAlertBanner(null)}
            className="text-xs font-semibold underline hover:opacity-75 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Main Data Surface: Tabs, Filters & Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Top Controls Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FCFDFD]">
          {/* Left: Ownership Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setQueueTab("ALL")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                queueTab === "ALL"
                  ? "bg-white text-[#0F172A] shadow-2xs font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>All Submissions</span>
              <span className="text-[11px] tabular-nums text-[#94A3B8] font-normal">
                ({tabCounts.all})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueTab("UNASSIGNED")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                queueTab === "UNASSIGNED"
                  ? "bg-white text-[#0F172A] shadow-2xs font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>Unassigned</span>
              <span className="text-[11px] tabular-nums text-[#94A3B8] font-normal">
                ({tabCounts.unassigned})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueTab("MY_ASSIGNED")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                queueTab === "MY_ASSIGNED"
                  ? "bg-white text-[#0F172A] shadow-2xs font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>My Assigned</span>
              <span className="text-[11px] tabular-nums text-[#94A3B8] font-normal">
                ({tabCounts.myAssigned})
              </span>
            </button>
          </div>

          {/* Right: Status Dropdown, Overdue Toggle, Search Field */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Status Selector Dropdown */}
            <div className="relative">
              <select
                aria-label="Filter by evaluation status"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] cursor-pointer"
              >
                <option value="ALL">Status: All</option>
                <option value={AttemptStatus.SUBMITTED}>Status: New intake</option>
                <option value={AttemptStatus.UNDER_REVIEW}>Status: In review</option>
                <option value={AttemptStatus.REPORT_IN_PREP}>Status: Report prep</option>
                <option value="NEEDS_REVISION">Status: Needs revision</option>
                <option value={AttemptStatus.PENDING_APPROVAL}>Status: Pending signoff</option>
                <option value={AttemptStatus.PUBLISHED}>Status: Published</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Overdue Toggle Button */}
            <button
              type="button"
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                overdueOnly
                  ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:bg-slate-50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${overdueOnly ? "bg-red-600" : "bg-slate-300"}`} />
              <span>Overdue</span>
            </button>

            {/* Table Search */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Filter by candidate, school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Clear All */}
        {hasActiveFilters && (
          <div className="px-3.5 sm:px-4 py-2 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#64748B]">Active filters:</span>

            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                <span>Status: {selectedStatus.replace(/_/g, " ")}</span>
                <button
                  type="button"
                  onClick={() => handleStatusChange("ALL")}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {overdueOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                <span>Overdue only</span>
                <button
                  type="button"
                  onClick={() => setOverdueOnly(false)}
                  className="text-red-500 hover:text-red-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                <span>Search: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-medium text-[#4F46E5] hover:underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 4. Table (Desktop / Tablet >= 768px): No Horizontal Scroll at 1024px+ */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 font-semibold">
                  Candidate
                </th>
                <th scope="col" className="py-3 px-3 font-semibold">
                  Assessment
                </th>
                <th scope="col" className="py-3 px-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="py-3 px-3 font-semibold">
                  SLA
                </th>
                <th scope="col" className="py-3 px-3 font-semibold">
                  Submitted
                </th>
                <th scope="col" className="py-3 px-3 font-semibold">
                  Assigned To
                </th>
                <th scope="col" className="py-3 px-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#94A3B8]">
                        <Filter className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#0F172A]">
                        {hasActiveFilters
                          ? "No submissions match these filters"
                          : "No submissions in this queue"}
                      </h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {hasActiveFilters
                          ? "Try clearing your search query or switching your status filter."
                          : "New candidate assessment submissions will appear here automatically."}
                      </p>
                      {hasActiveFilters && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-[#0F172A] transition-colors"
                          >
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const showEmail =
                    sub.studentEmail &&
                    sub.studentEmail.toLowerCase() !== sub.studentName.toLowerCase();
                  const schoolGrade = formatSchoolGrade(sub.school, sub.grade);
                  const isClaimedByMe = sub.assignedStaffId === currentUserId;
                  const isUnassigned = !sub.assignedStaffId;
                  const isClaiming = claimingId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Candidate Cell */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="font-semibold text-[#0F172A] leading-snug">
                          {sub.studentName}
                        </div>
                        <div className="text-[11px] text-[#64748B] space-y-0.5 mt-0.5">
                          {showEmail && <div className="truncate">{sub.studentEmail}</div>}
                          <div className="truncate">{schoolGrade}</div>
                        </div>
                      </td>

                      {/* 2. Assessment Cell */}
                      <td className="py-3.5 px-3 min-w-[150px] max-w-[200px]">
                        <div
                          className="font-medium text-[#1E293B] truncate"
                          title={sub.assessmentTitle}
                        >
                          {sub.assessmentTitle}
                        </div>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          v{sub.assessmentVersion}
                        </span>
                      </td>

                      {/* 3. Status Cell */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderStatusBadge(sub.status, sub.latestReportStatus)}
                      </td>

                      {/* 4. SLA Cell */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <SlaBadge submittedAt={sub.submittedAt} slaDays={slaDays} />
                      </td>

                      {/* 5. Submitted Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#64748B] tabular-nums">
                        <span title={sub.submittedAt || undefined}>
                          {formatCleanDate(sub.submittedAt)}
                        </span>
                      </td>

                      {/* 6. Assigned To */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-xs">
                        {sub.assignedStaffName ? (
                          <span
                            className={
                              isClaimedByMe ? "font-semibold text-indigo-700" : "text-[#475569]"
                            }
                          >
                            {isClaimedByMe ? "You" : sub.assignedStaffName}
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] font-normal">Unclaimed</span>
                        )}
                      </td>

                      {/* 7. Action Cell */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {sub.status === AttemptStatus.PUBLISHED ? (
                          <Link
                            href={`/portal/review/${sub.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0] transition-colors"
                          >
                            <span>View Report</span>
                          </Link>
                        ) : isUnassigned ? (
                          <button
                            type="button"
                            disabled={isClaiming}
                            onClick={() => handleClaim(sub.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] hover:border-[#4F46E5] text-[#0F172A] hover:text-[#4F46E5] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            <span>{isClaiming ? "Claiming..." : "Claim"}</span>
                          </button>
                        ) : (
                          <Link
                            href={`/portal/review/${sub.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F172A] hover:bg-slate-800 text-white transition-all shadow-2xs"
                          >
                            <span>Evaluate</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Mobile Cards View (< 768px): Zero Horizontal Scroll */}
        <div className="md:hidden divide-y divide-[#F1F5F9]">
          {filteredSubmissions.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#94A3B8]">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                {hasActiveFilters
                  ? "No submissions match these filters"
                  : "No submissions in this queue"}
              </h3>
              <p className="text-xs text-[#64748B]">
                {hasActiveFilters
                  ? "Try adjusting your filters or clearing search terms."
                  : "New candidate assessment submissions will appear here automatically."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-[#0F172A]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const showEmail =
                sub.studentEmail &&
                sub.studentEmail.toLowerCase() !== sub.studentName.toLowerCase();
              const schoolGrade = formatSchoolGrade(sub.school, sub.grade);
              const isClaimedByMe = sub.assignedStaffId === currentUserId;
              const isUnassigned = !sub.assignedStaffId;
              const isClaiming = claimingId === sub.id;

              return (
                <div key={sub.id} className="p-4 space-y-3">
                  {/* Top Line: Name + Status & SLA */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0F172A] leading-snug">
                        {sub.studentName}
                      </div>
                      {showEmail && (
                        <div className="text-[11px] text-[#64748B] truncate">
                          {sub.studentEmail}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {renderStatusBadge(sub.status, sub.latestReportStatus)}
                      <SlaBadge submittedAt={sub.submittedAt} slaDays={slaDays} />
                    </div>
                  </div>

                  {/* Middle Line: Assessment & Meta */}
                  <div className="text-xs text-[#64748B] space-y-1 bg-slate-50 p-2.5 rounded-lg">
                    <div className="font-medium text-[#1E293B] truncate">
                      {sub.assessmentTitle} <span className="font-mono text-[10px] text-slate-400">v{sub.assessmentVersion}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{schoolGrade}</span>
                      <span className="tabular-nums">Sub: {formatCleanDate(sub.submittedAt)}</span>
                    </div>
                    <div className="text-[11px]">
                      Assigned:{" "}
                      {sub.assignedStaffName ? (
                        <strong className={isClaimedByMe ? "text-indigo-700" : "text-[#1E293B]"}>
                          {isClaimedByMe ? "You" : sub.assignedStaffName}
                        </strong>
                      ) : (
                        <span className="text-slate-400">Unclaimed</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Line: Full-width Touch Button */}
                  <div>
                    {sub.status === AttemptStatus.PUBLISHED ? (
                      <Link
                        href={`/portal/review/${sub.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 transition-colors"
                      >
                        <span>View Published Report</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : isUnassigned ? (
                      <button
                        type="button"
                        disabled={isClaiming}
                        onClick={() => handleClaim(sub.id)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {isClaiming ? "Claiming..." : "Claim Submission"}
                      </button>
                    ) : (
                      <Link
                        href={`/portal/review/${sub.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        <span>Evaluate Assessment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
