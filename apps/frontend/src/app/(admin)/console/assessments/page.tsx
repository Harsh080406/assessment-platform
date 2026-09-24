import { auth } from "@/auth";
import { getAdminAssessmentsAction } from "@/app/actions/admin";
import AdminAssessmentsClient from "./AdminAssessmentsClient";
import { Layers } from "lucide-react";

export default async function AdminAssessmentsPage() {
  await auth();
  const res = await getAdminAssessmentsAction();
  const assessments = res.success && res.data ? res.data.assessments : [];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" /> Assessment Engine Versioning
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Assessment & Question Governance
        </h1>
        <p className="text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Manage psychometric dilemmas, sections, and questions. Editing a question with existing student responses enforces automatic copy-on-write versioning (v+1) to guarantee historical audit integrity.
        </p>
      </div>

      <AdminAssessmentsClient initialAssessments={assessments} />
    </div>
  );
}
