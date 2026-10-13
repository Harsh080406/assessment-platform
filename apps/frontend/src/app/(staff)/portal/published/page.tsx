import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStaffSubmissionsAction, getStaffDashboardStatsAction } from "@/app/actions/staff";
import StaffSubmissionsClient from "../StaffSubmissionsClient";
import StaffPageHeader from "@/components/staff/StaffPageHeader";

export default async function StaffPublishedReportsPage() {
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/login?callbackUrl=/portal/published");
  }

  const [statsRes, submissionsRes] = await Promise.all([
    getStaffDashboardStatsAction(),
    getStaffSubmissionsAction(),
  ]);

  const stats = statsRes.success && statsRes.data
    ? statsRes.data
    : { submitted: 0, underReview: 0, reportInPrep: 0, pendingApproval: 0, published: 0, needsRevision: 0, total: 0, myAssigned: 0, myOverdue: 0 };

  const submissions = submissionsRes.success && submissionsRes.data
    ? submissionsRes.data.submissions
    : [];

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* 1. Consistent Page Header */}
      <StaffPageHeader
        title="Published Reports"
        description="Certified candidate guidance reports published to candidate dashboards."
        count={stats.published}
        countLabel="published"
      />

      {/* 2. Submissions Workspace Pre-filtered to PUBLISHED */}
      <StaffSubmissionsClient
        initialSubmissions={submissions}
        defaultStatus="PUBLISHED"
        currentUserId={session.user.id}
        stats={stats}
        showPipelineStrip={false}
        showWorkloadCard={false}
        pageMode="PUBLISHED"
      />
    </div>
  );
}
