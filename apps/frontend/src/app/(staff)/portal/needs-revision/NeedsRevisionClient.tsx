"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  ArrowRight,
  FileText,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";
import StaffPageHeader from "@/components/staff/StaffPageHeader";

interface RevisionItem {
  attemptId: string;
  candidateName: string;
  candidateEmail: string | null;
  school: string | null;
  grade: string | null;
  assessmentTitle: string;
  assessmentVersion: number;
  assignedStaffName: string;
  originalEvaluator: string;
  rejectionReason: string;
  submittedAt: string | null;
  rejectedAt: string;
  daysSinceRejection: number;
  reportId: string;
  fileReference: string;
}

interface NeedsRevisionClientProps {
  initialItems: RevisionItem[];
}

export default function NeedsRevisionClient({ initialItems }: NeedsRevisionClientProps) {
  const [items] = useState<RevisionItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.candidateName.toLowerCase().includes(q) ||
        (item.candidateEmail && item.candidateEmail.toLowerCase().includes(q)) ||
        (item.school && item.school.toLowerCase().includes(q)) ||
        item.assignedStaffName.toLowerCase().includes(q) ||
        item.rejectionReason.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* 1. Consistent Page Header */}
      <StaffPageHeader
        title="Needs Revision"
        description="Assessment reports returned by administrators. Review feedback and update clinical evaluations."
        count={items.length}
        countLabel="needs revision"
      />

      {/* 2. Content Surface */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Search & Counter Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] bg-[#FCFDFD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-medium text-[#64748B]">
            Showing <strong className="text-[#0F172A] font-semibold">{filteredItems.length}</strong> returned report{filteredItems.length === 1 ? "" : "s"}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, reason, school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
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

        {/* 3. Items List */}
        {filteredItems.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#94A3B8]">
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A]">
              {searchQuery ? "No matching returned reports" : "Nothing needs revision"}
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? "Try searching with a different candidate name, school, or keyword."
                : "Reports returned by administrators will appear here for revision."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-[#0F172A]"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {filteredItems.map((item) => {
              const daysText =
                item.daysSinceRejection === 0
                  ? "Rejected today"
                  : `${item.daysSinceRejection}d ago`;

              return (
                <div
                  key={item.reportId}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Header line: Candidate name, email, school */}
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold text-sm text-[#0F172A]">
                        {item.candidateName}
                      </span>
                      {item.candidateEmail && (
                        <span className="text-xs text-[#64748B]">
                          • {item.candidateEmail}
                        </span>
                      )}
                      {(item.school || item.grade) && (
                        <span className="text-xs text-[#64748B]">
                          • {item.school || "—"} ({item.grade || "—"})
                        </span>
                      )}
                    </div>

                    {/* Admin Rejection Feedback Box */}
                    <div className="p-3 bg-red-50/80 border border-red-200/80 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-red-900 text-[11px] uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Administrator Feedback</span>
                      </div>
                      <p className="text-red-900 leading-relaxed font-normal">
                        &quot;{item.rejectionReason}&quot;
                      </p>
                    </div>

                    {/* Meta line */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.assessmentTitle} (v{item.assessmentVersion})</span>
                      </span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-[#0F172A]">{item.assignedStaffName}</strong></span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{daysText}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="shrink-0 w-full lg:w-auto">
                    <Link
                      href={`/portal/review/${item.attemptId}`}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                    >
                      <span>Open & Revise</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
