"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  School,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { AttemptStatus, ReportStatus } from "@prisma/client";

interface SubmissionItem {
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
  reportsCount: number;
  latestReportStatus?: ReportStatus | null;
}

interface StaffSubmissionsClientProps {
  initialSubmissions: SubmissionItem[];
}

export default function StaffSubmissionsClient({ initialSubmissions }: StaffSubmissionsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredSubmissions = useMemo(() => {
    return initialSubmissions.filter((sub) => {
      const matchesStatus =
        selectedStatus === "ALL" || sub.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        (sub.studentEmail && sub.studentEmail.toLowerCase().includes(q)) ||
        (sub.school && sub.school.toLowerCase().includes(q)) ||
        (sub.grade && sub.grade.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [initialSubmissions, searchQuery, selectedStatus]);

  const getStatusBadge = (status: AttemptStatus) => {
    switch (status) {
      case AttemptStatus.SUBMITTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> New Intake
          </span>
        );
      case AttemptStatus.UNDER_REVIEW:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> In Review
          </span>
        );
      case AttemptStatus.REPORT_IN_PREP:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Report Prep
          </span>
        );
      case AttemptStatus.PENDING_APPROVAL:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600" /> Pending Admin Signoff
          </span>
        );
      case AttemptStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const statusFilters = [
    { label: "All Candidates", value: "ALL" },
    { label: "New Intake", value: AttemptStatus.SUBMITTED },
    { label: "Under Review", value: AttemptStatus.UNDER_REVIEW },
    { label: "Report Prep", value: AttemptStatus.REPORT_IN_PREP },
    { label: "Pending Signoff", value: AttemptStatus.PENDING_APPROVAL },
    { label: "Published", value: AttemptStatus.PUBLISHED },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Control Bar: Filters & Search */}
      <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {statusFilters.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedStatus === tab.value
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, email, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredSubmissions.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <Filter className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-[#0F172A]">No submissions match criteria</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
            There are currently no candidate assessment submissions matching the selected status filter or search keywords.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-4">School & Grade</th>
                  <th className="py-3.5 px-4">Assessment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium">
                {filteredSubmissions.map((sub) => {
                  const initials = sub.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "CN";

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      {/* Candidate Avatar & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#0F172A] text-sm group-hover:text-[#4F46E5] transition-colors">
                              {sub.studentName}
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate">
                              {sub.studentEmail || "No email provided"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School & Grade */}
                      <td className="py-4 px-4 text-[#475569]">
                        <div className="font-semibold text-[#0F172A]">
                          {sub.school || "Unspecified School"}
                        </div>
                        <div className="text-[11px] text-[#64748B] font-medium">
                          {sub.grade || "General Grade"}
                        </div>
                      </td>

                      {/* Assessment Title */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#0F172A]">
                          {sub.assessmentTitle}
                        </div>
                        <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">
                          v{sub.assessmentVersion}.0 Engine
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-[#64748B] font-mono text-[11px]">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "In Progress"}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/portal/review/${sub.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-black text-white shadow-xs transition-all hover:gap-2"
                        >
                          <span>Evaluate</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#FF6B6B]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden divide-y divide-[#E2E8F0]">
            {filteredSubmissions.map((sub) => {
              const initials = sub.studentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "CN";

              return (
                <div key={sub.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0F172A]">
                          {sub.studentName}
                        </h4>
                        <p className="text-[11px] text-[#64748B]">
                          {sub.studentEmail || "No email"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                    <div>
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                        School / Grade
                      </span>
                      <span className="font-semibold text-[#0F172A] block truncate">
                        {sub.school || "Standard"} • {sub.grade || "Class 12"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                        Submitted Date
                      </span>
                      <span className="font-semibold text-[#0F172A] block truncate">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "In Progress"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/portal/review/${sub.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 bg-[#0F172A] text-white shadow-xs"
                  >
                    <span>Evaluate Candidate Attempt</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF6B6B]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
