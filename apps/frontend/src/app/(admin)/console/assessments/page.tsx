import { auth } from "@/auth";
import { getAdminAssessmentsAction } from "@/app/actions/admin";
import AdminAssessmentsClient from "./AdminAssessmentsClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminAssessmentsPage() {
  await auth();
  const res = await getAdminAssessmentsAction();
  const assessments = res.success && res.data ? res.data.assessments : [];

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Assessments"
        description="Govern assessment dilemmas, psychometric modules, and copy-on-write versioning."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminAssessmentsClient initialAssessments={assessments} />
    </div>
  );
}
