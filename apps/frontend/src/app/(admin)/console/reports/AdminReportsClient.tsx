"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  Check,
  X,
  History,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { ReportStatus } from "@prisma/client";
import {
  approveReportAction,
  rejectReportAction,
  publishReportAction,
} from "@/app/actions/admin";
import AdminStatusPill, { AdminTag } from "@/components/admin/AdminStatusPill";
import {
  AdminTableToolbar,
  AdminTablePagination,
  AdminEmptyState,
  pluralize,
} from "@/components/admin/AdminDataTable";

export interface ReportVersion {
  id: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  status: ReportStatus;
  rejectionReason?: string | null;
  fileReference: string;
  previewUrl: string;
}

export interface ReportItem {
  id: string;
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  assessmentTitle: string;
  fileReference: string;
  version: number;
  status: ReportStatus;
  uploadedBy: string;
  approvedBy: string | null;
  uploadedAt: string;
  publishedAt: string | null;
  previewUrl: string;
  versionHistory?: ReportVersion[];
}

interface AdminReportsClientProps {
  initialReports: ReportItem[];
}

const statusTabs = [
  { label: "All Queue", value: "ALL" },
  { label: "Pending Signoff", value: ReportStatus.PENDING_APPROVAL },
  { label: "Approved", value: ReportStatus.APPROVED },
  { label: "Published", value: ReportStatus.PUBLISHED },
  { label: "Rejected", value: ReportStatus.REJECTED },
];

export default function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Reject Comment Modal State
  const [rejectingReportId, setRejectingReportId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  // PDF Preview Panel State
  const [previewingReport, setPreviewingReport] = useState<ReportItem | null>(null);

  // Version History Modal State
  const [historyModalReport, setHistoryModalReport] = useState<ReportItem | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesStatus = selectedStatus === "ALL" || r.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      (r.studentEmail && r.studentEmail.toLowerCase().includes(q)) ||
      r.assessmentTitle.toLowerCase().includes(q) ||
      r.uploadedBy.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  const handleApprove = (reportId: string) => {
    setActionMessage(null);
    startTransition(async () => {
      const res = await approveReportAction(reportId);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: ReportStatus.APPROVED } : r
          )
        );
        setActionMessage({ text: res.message, type: "success" });
      } else {
        setActionMessage({ text: res.message, type: "error" });
      }
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReportId) return;

    setActionMessage(null);
    startTransition(async () => {
      const res = await rejectReportAction(rejectingReportId, rejectComment);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === rejectingReportId ? { ...r, status: ReportStatus.REJECTED } : r
          )
        );
        setActionMessage({ text: res.message, type: "success" });
        setRejectingReportId(null);
        setRejectComment("");
      } else {
        setActionMessage({ text: res.message, type: "error" });
      }
    });
  };

  const handlePublish = (reportId: string) => {
    setActionMessage(null);
    startTransition(async () => {
      const res = await publishReportAction(reportId);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, status: ReportStatus.PUBLISHED, publishedAt: new Date().toISOString() }
              : r
          )
        );
        setActionMessage({ text: res.message, type: "success" });
      } else {
        setActionMessage({ text: res.message, type: "error" });
      }
    });
  };

  const renderStatusPill = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING_APPROVAL:
        return <AdminStatusPill label="Pending Signoff" variant="warning" />;
      case ReportStatus.APPROVED:
        return <AdminStatusPill label="Approved" variant="info" />;
      case ReportStatus.PUBLISHED:
        return <AdminStatusPill label="Published" variant="success" />;
      case ReportStatus.REJECTED:
        return <AdminStatusPill label="Rejected" variant="danger" />;
      default:
        return <AdminStatusPill label={status} variant="neutral" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toast Feedback */}
      {actionMessage && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Segmented Control & Search Toolbar */}
      <div className="space-y-3">
        {/* Segmented Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl overflow-x-auto scrollbar-none w-full sm:w-fit">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.value;
            const count =
              tab.value === "ALL"
                ? reports.length
                : reports.filter((r) => r.status === tab.value).length;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.value);
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
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Toolbar */}
        <AdminTableToolbar
          searchValue={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          searchPlaceholder="Search candidate, email, assessment, evaluator..."
        />
      </div>

      {/* Data Container: Desktop Table (>=768px) and Mobile Cards (<768px) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filteredReports.length === 0 ? (
          <AdminEmptyState
            title="No reports match your filters"
            description="There are currently no uploaded PDF reports matching the selected status or query."
            action={
              (selectedStatus !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus("ALL");
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
                    <th className="py-3 px-4 w-[24%]">Assessment & Version</th>
                    <th className="py-3 px-4 w-[16%]">Evaluator</th>
                    <th className="py-3 px-4 w-[14%]">Status</th>
                    <th className="py-3 px-4 w-[18%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {paginatedReports.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A] truncate">
                          {r.studentName}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate font-mono">
                          {r.studentEmail || "—"}
                        </div>
                      </td>

                      {/* Assessment */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F172A] truncate" title={r.assessmentTitle}>
                          {r.assessmentTitle}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <AdminTag>v{r.version}.0 PDF</AdminTag>
                          {r.versionHistory && r.versionHistory.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setHistoryModalReport(r)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              <History className="w-3 h-3" />
                              <span>{pluralize(r.versionHistory.length, "version", "versions")}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Evaluator */}
                      <td className="py-3.5 px-4 text-[#475569]">
                        <div className="font-semibold truncate">{r.uploadedBy}</div>
                        <div className="text-[11px] text-[#64748B] tabular-nums">
                          {new Date(r.uploadedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{renderStatusPill(r.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview PDF */}
                          <button
                            type="button"
                            onClick={() => setPreviewingReport(r)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] transition-colors"
                            title="Preview PDF Document"
                            aria-label="Preview PDF"
                          >
                            <Eye className="w-4 h-4 text-[#475569]" />
                          </button>

                          {/* Approve (Primary navy) */}
                          {r.status === ReportStatus.PENDING_APPROVAL && (
                            <button
                              type="button"
                              onClick={() => handleApprove(r.id)}
                              disabled={isPending}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {/* Reject (Destructive secondary red outline) */}
                          {(r.status === ReportStatus.PENDING_APPROVAL ||
                            r.status === ReportStatus.APPROVED) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingReportId(r.id);
                                setRejectComment("");
                              }}
                              disabled={isPending}
                              className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors"
                            >
                              Reject
                            </button>
                          )}

                          {/* Publish */}
                          {(r.status === ReportStatus.PENDING_APPROVAL ||
                            r.status === ReportStatus.APPROVED) && (
                            <button
                              type="button"
                              onClick={() => handlePublish(r.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </button>
                          )}

                          {r.status === ReportStatus.PUBLISHED && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Live
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (<768px) */}
            <div className="md:hidden divide-y divide-[#F1F5F9]">
              {paginatedReports.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] truncate">
                        {r.studentName}
                      </div>
                      <div className="text-xs text-[#64748B] font-mono truncate">
                        {r.studentEmail || "—"}
                      </div>
                    </div>
                    <div className="shrink-0">{renderStatusPill(r.status)}</div>
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1 text-xs">
                    <div className="font-semibold text-[#0F172A] truncate">
                      {r.assessmentTitle}
                    </div>
                    <div className="flex items-center justify-between text-[#64748B] text-[11px]">
                      <span>By: {r.uploadedBy}</span>
                      <span>v{r.version}.0</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreviewingReport(r)}
                      className="flex-1 py-2 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview PDF</span>
                    </button>

                    {r.status === ReportStatus.PENDING_APPROVAL && (
                      <button
                        type="button"
                        onClick={() => handleApprove(r.id)}
                        disabled={isPending}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B]"
                      >
                        Approve
                      </button>
                    )}

                    {(r.status === ReportStatus.PENDING_APPROVAL ||
                      r.status === ReportStatus.APPROVED) && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingReportId(r.id);
                          setRejectComment("");
                        }}
                        disabled={isPending}
                        className="py-2 px-3 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                      >
                        Reject
                      </button>
                    )}

                    {(r.status === ReportStatus.PENDING_APPROVAL ||
                      r.status === ReportStatus.APPROVED) && (
                      <button
                        type="button"
                        onClick={() => handlePublish(r.id)}
                        disabled={isPending}
                        className="py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[#F1F5F9]">
              <AdminTablePagination
                page={page}
                pageSize={pageSize}
                totalCount={filteredReports.length}
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

      {/* PDF PREVIEW SIDE PANEL / MODAL */}
      {previewingReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="min-w-0 pr-4">
                <h3 className="font-bold text-sm text-[#0F172A] truncate">
                  PDF Preview: {previewingReport.studentName}
                </h3>
                <p className="text-xs text-[#64748B] truncate">
                  {previewingReport.assessmentTitle} • v{previewingReport.version}.0
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingReport(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-[#F8FAFC] p-2 min-h-[460px]">
              <iframe
                src={previewingReport.previewUrl}
                className="w-full h-full min-h-[460px] rounded-lg border border-[#E2E8F0] bg-white"
                title="Report PDF Preview"
              />
            </div>

            <div className="p-3.5 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
              <a
                href={previewingReport.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                <span>Open PDF in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setPreviewingReport(null)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL WITH REASON */}
      {rejectingReportId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">
                Reject Candidate Report
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReportId(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                aria-label="Close reject dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rejection-reason"
                className="text-xs font-semibold text-[#0F172A] block"
              >
                Reason for Rejection (Required)
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                required
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="State specific formatting issues or recommendations for the evaluator..."
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
              <p className="text-[11px] text-[#64748B]">
                This will move the attempt back to Needs Revision and notify the assigned staff evaluator.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setRejectingReportId(null)}
                disabled={isPending}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !rejectComment.trim()}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {historyModalReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Report Version History
                </h3>
                <p className="text-xs text-[#64748B]">
                  {historyModalReport.studentName} • {historyModalReport.assessmentTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalReport(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                aria-label="Close history modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {historyModalReport.versionHistory?.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">Version v{ver.version}.0</span>
                    {renderStatusPill(ver.status)}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Uploaded by {ver.uploadedBy} on{" "}
                    {new Date(ver.uploadedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {ver.rejectionReason && (
                    <div className="p-2 bg-red-50 text-red-800 rounded border border-red-200 text-[11px]">
                      <span className="font-bold">Rejection note: </span>
                      {ver.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setHistoryModalReport(null)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
