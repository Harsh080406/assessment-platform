import { auth } from "@/auth";
import Link from "next/link";
import {
  Users,
  FileCheck,
  UserCog,
  Layers,
  ScrollText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getAdminDashboardStatsAction } from "@/app/actions/admin";

export default async function AdminConsolePage() {
  const session = await auth();

  const statsRes = await getAdminDashboardStatsAction();
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

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Governance Context Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-700">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Super Admin Access • Role: {session?.user?.role || "ADMIN"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Platform Administration Console
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Global governance workspace. Oversee student profiles, staff assignments, report approvals, engine assessment versioning, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/console/reports"
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Review Pending Reports ({stats.reportsPendingApproval})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF6B6B]" />
          </Link>
        </div>
      </div>

      {/* 2. Platform-Wide Counts Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Total Students</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.totalStudents}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Registered candidate profiles</p>
        </div>

        {/* Total Attempts */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Total Attempts</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.totalAttempts}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Assessments initiated</p>
        </div>

        {/* Pending Reviews */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Pending Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.pendingReviews}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Intake & Under Review queue</p>
        </div>

        {/* Reports Pending Approval */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Pending Signoff</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.reportsPendingApproval}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">PDFs awaiting admin approval</p>
        </div>

        {/* Reports Published */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Published Reports</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">{stats.reportsPublished}</div>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Certified reports active</p>
        </div>
      </div>

      {/* 3. Phase 4 Governance Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report Approval Queue */}
        <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Report Approval & Publishing</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Preview expert uploaded PDF reports, trigger Approve/Reject actions, and publish certified reports directly to candidate dashboards.
            </p>
          </div>
          <Link
            href="/console/reports"
            className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group"
          >
            <span>Open Report Queue ({stats.reportsPendingApproval} pending)</span>
            <ArrowRight className="w-4 h-4 text-[#4F46E5] group-hover:text-[#FF6B6B]" />
          </Link>
        </div>

        {/* User Governance */}
        <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">User Management & Access</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Search candidate database, disable/re-enable student accounts, and trigger password access reset routines.
            </p>
          </div>
          <Link
            href="/console/users"
            className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group"
          >
            <span>Manage Candidate Users ({stats.totalStudents})</span>
            <ArrowRight className="w-4 h-4 text-[#4F46E5] group-hover:text-[#FF6B6B]" />
          </Link>
        </div>

        {/* Staff & Workload */}
        <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <UserCog className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Staff Workload & RBAC</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Assign evaluator roles (Student, Staff, Admin), monitor evaluator active review workloads, and control team access.
            </p>
          </div>
          <Link
            href="/console/staff"
            className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group"
          >
            <span>Manage Staff & Workload ({stats.totalStaff})</span>
            <ArrowRight className="w-4 h-4 text-[#4F46E5] group-hover:text-[#FF6B6B]" />
          </Link>
        </div>

        {/* Assessment Engine Versioning */}
        <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Assessment Engine & Copy-on-Write</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              CRUD assessment dilemmas & questions. Editing questions with existing responses automatically generates a NEW version (v+1) without mutating past student data.
            </p>
          </div>
          <Link
            href="/console/assessments"
            className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group"
          >
            <span>Open Assessment Versioning</span>
            <ArrowRight className="w-4 h-4 text-[#4F46E5] group-hover:text-[#FF6B6B]" />
          </Link>
        </div>

        {/* Audit Trail Log */}
        <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all md:col-span-2 lg:col-span-2">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ScrollText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">System Audit Trail Viewer</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Filterable audit log table recording system logins, report state transitions, account status updates, question version creations, and cryptographic event logs.
            </p>
          </div>
          <Link
            href="/console/audit-logs"
            className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group"
          >
            <span>View Immutable Audit Logs</span>
            <ArrowRight className="w-4 h-4 text-[#4F46E5] group-hover:text-[#FF6B6B]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
