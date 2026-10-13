"use client";

import { useState, useMemo } from "react";
import {
  Timer,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AttemptStatus } from "@prisma/client";
import SlaBadge from "@/components/staff/SlaBadge";
import { reassignSubmissionAction } from "@/app/actions/admin";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminStatusPill from "@/components/admin/AdminStatusPill";
import {
  AdminTableToolbar,
  AdminTablePagination,
  AdminEmptyState,
} from "@/components/admin/AdminDataTable";

interface EvaluationItem {
  id: string;
  candidateName: string;
  candidateEmail: string | null;
  school: string | null;
  grade: string | null;
  assessmentTitle: string;
  status: AttemptStatus;
  assignedStaffId: string | null;
  assignedStaffName: string;
  submittedAt: string | null;
  dueDate: string | null;
  hoursRemaining: number;
  slaStatus: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
  isOverdue: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  specialty: string | null;
}

interface AdminSlaClientProps {
  initialSummary: {
    totalOverdue: number;
    totalDueToday: number;
    avgTurnaroundDays: number;
    totalInProgress: number;
  };
  initialEvaluations: EvaluationItem[];
  staffMembers: StaffMember[];
}

export default function AdminSlaClient({
  initialSummary,
  initialEvaluations,
  staffMembers,
}: AdminSlaClientProps) {
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(initialEvaluations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OVERDUE" | "DUE_SOON" | "UNASSIGNED">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reassignment Modal State
  const [reassignModalItem, setReassignModalItem] = useState<EvaluationItem | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [reassigning, setReassigning] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      if (statusFilter === "OVERDUE" && !item.isOverdue) return false;
      if (statusFilter === "DUE_SOON" && item.slaStatus !== "DUE_SOON") return false;
      if (statusFilter === "UNASSIGNED" && item.assignedStaffId) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.candidateName.toLowerCase().includes(q) ||
        (item.candidateEmail && item.candidateEmail.toLowerCase().includes(q)) ||
        (item.school && item.school.toLowerCase().includes(q)) ||
        item.assessmentTitle.toLowerCase().includes(q) ||
        item.assignedStaffName.toLowerCase().includes(q)
      );
    });
  }, [evaluations, statusFilter, searchQuery]);

  const paginatedEvaluations = filteredEvaluations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleOpenReassignModal = (item: EvaluationItem) => {
    setReassignModalItem(item);
    setSelectedStaffId(item.assignedStaffId || "");
  };

  const handleConfirmReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalItem || !selectedStaffId) return;

    setReassigning(true);
    setActionFeedback(null);

    try {
      const res = await reassignSubmissionAction(reassignModalItem.id, selectedStaffId);
      if (res.success) {
        const staffObj = staffMembers.find((s) => s.id === selectedStaffId);
        setEvaluations((prev) =>
          prev.map((item) =>
            item.id === reassignModalItem.id
              ? {
                  ...item,
                  assignedStaffId: selectedStaffId,
                  assignedStaffName: staffObj?.name || staffObj?.email || "Evaluator",
                }
              : item
          )
        );
        setActionFeedback({ type: "success", text: res.message });
        setReassignModalItem(null);
      } else {
        setActionFeedback({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message || "Failed to reassign." });
    } finally {
      setReassigning(false);
    }
  };

  const formatDueDateDisplay = (dueDate: string | null, isOverdue: boolean, hoursRemaining: number) => {
    if (!dueDate) return <span className="text-[#64748B]">—</span>;

    const dateStr = new Date(dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (isOverdue) {
      const overdueDays = Math.max(1, Math.abs(Math.round(hoursRemaining / 24)));
      return (
        <div className="leading-tight">
          <div className="font-semibold text-red-700 tabular-nums">{dateStr}</div>
          <div className="text-[11px] font-bold text-red-600">
            {overdueDays === 1 ? "1 day overdue" : `${overdueDays} days overdue`}
          </div>
        </div>
      );
    }

    if (hoursRemaining <= 24 && hoursRemaining > 0) {
      return (
        <div className="leading-tight">
          <div className="font-semibold text-amber-700 tabular-nums">{dateStr}</div>
          <div className="text-[11px] font-bold text-amber-600">Due today</div>
        </div>
      );
    }

    return (
      <div className="font-medium text-[#475569] tabular-nums">
        {dateStr}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Neutral Stat Cards (Breached highlighted red ONLY when > 0) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Breached / Overdue"
          value={initialSummary.totalOverdue}
          subtext="Requires re-allocation"
          icon={AlertTriangle}
          variant={initialSummary.totalOverdue > 0 ? "danger" : "neutral"}
        />
        <AdminStatCard
          label="Due Today (<24h)"
          value={initialSummary.totalDueToday}
          subtext="Approaching deadline"
          icon={Clock}
          variant={initialSummary.totalDueToday > 0 ? "warning" : "neutral"}
        />
        <AdminStatCard
          label="Avg Turnaround (30d)"
          value={`${initialSummary.avgTurnaroundDays}d`}
          subtext="Target SLA: ≤ 4.0 days"
          icon={Timer}
          variant="neutral"
        />
        <AdminStatCard
          label="Active in Pipeline"
          value={initialSummary.totalInProgress}
          subtext="Clinical evaluations underway"
          icon={RefreshCw}
          variant="neutral"
        />
      </div>

      {/* 2. Filter Tabs & Search Toolbar */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl overflow-x-auto scrollbar-none w-full sm:w-fit">
          {[
            { label: "All In-Progress", value: "ALL", count: evaluations.length },
            { label: "Overdue", value: "OVERDUE", count: evaluations.filter((e) => e.isOverdue).length },
            { label: "Due Today", value: "DUE_SOON", count: evaluations.filter((e) => e.slaStatus === "DUE_SOON").length },
            { label: "Unassigned", value: "UNASSIGNED", count: evaluations.filter((e) => !e.assignedStaffId).length },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                    isActive ? "bg-[#0F172A] text-white" : "bg-white text-[#64748B] border border-[#E2E8F0]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <AdminTableToolbar
          searchValue={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          searchPlaceholder="Search candidate, assessment, evaluator..."
        />
      </div>

      {/* 3. Table / Card Container (No horizontal overflow!) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filteredEvaluations.length === 0 ? (
          <AdminEmptyState
            title="No submissions match your filters"
            description="There are currently no active assessment evaluations matching the chosen criteria."
            action={
              (statusFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop Table View (>=768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4 w-[28%]">Candidate</th>
                    <th className="py-3 px-4 w-[20%]">Evaluator</th>
                    <th className="py-3 px-4 w-[16%]">Submitted</th>
                    <th className="py-3 px-4 w-[16%]">SLA Due Date</th>
                    <th className="py-3 px-4 w-[10%]">SLA</th>
                    <th className="py-3 px-4 w-[10%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {paginatedEvaluations.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        item.isOverdue ? "bg-red-50/25" : ""
                      }`}
                    >
                      {/* Candidate + Assessment as Subtext */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A] truncate">
                          {item.candidateName}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          {item.assessmentTitle}
                        </div>
                      </td>

                      {/* Evaluator */}
                      <td className="py-3.5 px-4">
                        {item.assignedStaffId ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] max-w-full truncate">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{item.assignedStaffName}</span>
                          </span>
                        ) : (
                          <AdminStatusPill label="Unassigned" variant="warning" />
                        )}
                      </td>

                      {/* Submitted */}
                      <td className="py-3.5 px-4 text-[#64748B] tabular-nums">
                        {item.submittedAt
                          ? new Date(item.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        {formatDueDateDisplay(item.dueDate, item.isOverdue, item.hoursRemaining)}
                      </td>

                      {/* SLA Badge */}
                      <td className="py-3.5 px-4">
                        <SlaBadge submittedAt={item.submittedAt} />
                      </td>

                      {/* Compact Reassign Button (Opens Modal) */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReassignModal(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<768px) */}
            <div className="md:hidden divide-y divide-[#F1F5F9]">
              {paginatedEvaluations.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] truncate">
                        {item.candidateName}
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        {item.assessmentTitle}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <SlaBadge submittedAt={item.submittedAt} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Evaluator</span>
                      <span className="font-semibold text-[#0F172A] truncate block">
                        {item.assignedStaffId ? item.assignedStaffName : "Unassigned"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Due Date</span>
                      {formatDueDateDisplay(item.dueDate, item.isOverdue, item.hoursRemaining)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReassignModal(item)}
                    className="w-full py-2 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Reassign Evaluator
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-[#F1F5F9]">
              <AdminTablePagination
                page={page}
                pageSize={pageSize}
                totalCount={filteredEvaluations.length}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* REASSIGN STAFF EVALUATOR MODAL */}
      {reassignModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <form
            onSubmit={handleConfirmReassign}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">
                Reassign Submission Evaluator
              </h3>
              <button
                type="button"
                onClick={() => setReassignModalItem(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1">
                <div className="font-bold text-[#0F172A]">
                  Candidate: {reassignModalItem.candidateName}
                </div>
                <div className="text-[#64748B]">
                  Assessment: {reassignModalItem.assessmentTitle}
                </div>
                <div className="text-[#64748B]">
                  Currently Assigned:{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {reassignModalItem.assignedStaffId
                      ? reassignModalItem.assignedStaffName
                      : "Unassigned"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="staff-select"
                  className="text-xs font-semibold text-[#0F172A] block mb-1"
                >
                  Select New Staff Evaluator
                </label>
                <select
                  id="staff-select"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="" disabled>
                    -- Choose Evaluator --
                  </option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.specialty || "Evaluator"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setReassignModalItem(null)}
                disabled={reassigning}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reassigning || !selectedStaffId || selectedStaffId === reassignModalItem.assignedStaffId}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {reassigning ? "Saving..." : "Confirm Reassignment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
