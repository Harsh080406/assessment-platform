"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Upload,
  Eye,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { ReportStatus } from "@prisma/client";
import {
  approveReportAction,
  rejectReportAction,
  publishReportAction,
} from "@/app/actions/admin";

interface ReportItem {
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
}

interface AdminReportsClientProps {
  initialReports: ReportItem[];
}

export default function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Reject Comment Modal State
  const [rejectingReportId, setRejectingReportId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  // PDF Preview Modal State
  const [previewingReport, setPreviewingReport] = useState<ReportItem | null>(null);

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

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING_APPROVAL:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Pending Signoff
          </span>
        );
      case ReportStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Check className="w-3.5 h-3.5 text-blue-600" /> Approved
          </span>
        );
      case ReportStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published
          </span>
        );
      case ReportStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const statusTabs = [
    { label: "All Queue", value: "ALL" },
    { label: "Pending Signoff", value: ReportStatus.PENDING_APPROVAL },
    { label: "Approved", value: ReportStatus.APPROVED },
    { label: "Published", value: ReportStatus.PUBLISHED },
    { label: "Rejected", value: ReportStatus.REJECTED },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
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
          <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedStatus === tab.value
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, email, assessment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Filter className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#0F172A]">No reports found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              There are currently no uploaded PDF reports matching the selected status or search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-4">Assessment & Version</th>
                  <th className="py-3.5 px-4">Uploaded By</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Uploaded Date</th>
                  <th className="py-3.5 px-6 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Candidate */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0F172A] text-sm">{r.studentName}</div>
                      <div className="text-[11px] text-[#64748B]">{r.studentEmail || "No email"}</div>
                    </td>

                    {/* Assessment */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#0F172A]">{r.assessmentTitle}</div>
                      <div className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">
                        v{r.version}.0 PDF Document
                      </div>
                    </td>

                    {/* Uploaded By */}
                    <td className="py-4 px-4 text-[#475569]">
                      <div className="font-semibold">{r.uploadedBy}</div>
                      {r.approvedBy && (
                        <div className="text-[10px] text-[#64748B]">Signoff: {r.approvedBy}</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">{getStatusBadge(r.status)}</td>

                    {/* Date */}
                    <td className="py-4 px-4 text-[#64748B] font-mono text-[11px]">
                      {new Date(r.uploadedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview PDF */}
                        <button
                          onClick={() => setPreviewingReport(r)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] transition-colors"
                          title="Preview PDF Document"
                        >
                          <Eye className="w-4 h-4 text-[#4F46E5]" />
                        </button>

                        {/* Approve Button */}
                        {r.status === ReportStatus.PENDING_APPROVAL && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {/* Reject Button */}
                        {(r.status === ReportStatus.PENDING_APPROVAL ||
                          r.status === ReportStatus.APPROVED) && (
                          <button
                            onClick={() => setRejectingReportId(r.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        )}

                        {/* Publish Button */}
                        {(r.status === ReportStatus.PENDING_APPROVAL ||
                          r.status === ReportStatus.APPROVED) && (
                          <button
                            onClick={() => handlePublish(r.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            <span>Publish to Student</span>
                          </button>
                        )}

                        {r.status === ReportStatus.PUBLISHED && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            Live on Dashboard
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF PREVIEW MODAL */}
      {previewingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  PDF Report Preview: {previewingReport.studentName}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {previewingReport.assessmentTitle} • Version v{previewingReport.version}.0
                </p>
              </div>
              <button
                onClick={() => setPreviewingReport(null)}
                className="p-1.5 rounded-lg hover:bg-[#E2E8F0] text-[#64748B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-[#F1F5F9] p-2 min-h-[500px]">
              <iframe
                src={previewingReport.previewUrl}
                className="w-full h-full min-h-[500px] rounded-xl border border-[#E2E8F0] bg-white"
                title="Report PDF Preview"
              />
            </div>
            <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
              <a
                href={previewingReport.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                Open PDF in new tab
              </a>
              <button
                onClick={() => setPreviewingReport(null)}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT COMMENT MODAL */}
      {rejectingReportId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <MessageSquare className="w-5 h-5" />
                <h3>Reject Report & Provide Feedback</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingReportId(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Rejecting this report will set the attempt status back to <strong>Report In Prep</strong> so staff evaluators can revise and re-upload.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A]">Rejection Feedback / Notes</label>
              <textarea
                required
                rows={4}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Explain why this report is rejected (e.g., radar alignment missing, incorrect score bounds)..."
                className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReportId(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
