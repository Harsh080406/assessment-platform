import { auth } from "@/auth";
import { Shield, ClipboardList, CheckCircle, Clock, FileText, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { getStaffDashboardStatsAction, getStaffSubmissionsAction } from "@/app/actions/staff";
import StaffSubmissionsClient from "./StaffSubmissionsClient";

export default async function StaffPortalPage() {
  const session = await auth();

  const [statsRes, submissionsRes] = await Promise.all([
    getStaffDashboardStatsAction(),
    getStaffSubmissionsAction(),
  ]);

  const stats = statsRes.success && statsRes.data
    ? statsRes.data
    : { submitted: 0, underReview: 0, reportInPrep: 0, pendingApproval: 0, published: 0, total: 0 };

  const submissions = submissionsRes.success && submissionsRes.data
    ? submissionsRes.data.submissions
    : [];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Header & Title Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#E0E7FE] text-xs font-bold text-[#4F46E5]">
            <Shield className="w-3.5 h-3.5" />
            <span>Role: {session?.user?.role || "STAFF"} Evaluator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Expert Evaluation Workspace
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Manual psychometric evaluation queue. Review candidate response trajectories, evaluate cognitive dimensions, and upload certified guidance reports.
          </p>
        </div>

        {/* Live Queue Counter Badge */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center shrink-0 min-w-[160px]">
          <div className="text-2xl font-black text-[#0F172A]">{stats.total}</div>
          <div className="text-xs font-bold text-[#64748B] mt-0.5">Total In Pipeline</div>
          <div className="text-[10px] text-[#4F46E5] font-semibold mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Realtime Sync Active
          </div>
        </div>
      </div>

      {/* 2. Real Queue Metric KPI Cards (5 Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
        {/* New Intake */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">New Intake</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.submitted}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Submitted assessments</p>
        </div>

        {/* In Review */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">In Review</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.underReview}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Currently evaluating</p>
        </div>

        {/* Report In Prep */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Report Prep</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.reportInPrep}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Drafting diagnosis</p>
        </div>

        {/* Pending Approval */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Signoff</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.pendingApproval}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Awaiting Admin signoff</p>
        </div>

        {/* Published */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.published}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Published to candidates</p>
        </div>
      </div>

      {/* 3. Submissions Table / Cards Component */}
      <StaffSubmissionsClient initialSubmissions={submissions} />
    </div>
  );
}
