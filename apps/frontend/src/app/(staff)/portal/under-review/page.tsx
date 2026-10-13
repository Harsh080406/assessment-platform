import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStaffSubmissionsAction, getStaffDashboardStatsAction } from "@/app/actions/staff";
import StaffSubmissionsClient from "../StaffSubmissionsClient";
import StaffPageHeader from "@/components/staff/StaffPageHeader";

export default async function StaffUnderReviewPage() {
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/login?callbackUrl=/portal/under-review");
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
        title="Under Review"
        description="Active candidate evaluations currently being scored and formulated into guidance reports."
        count={stats.underReview}
        countLabel="in review"
      />

      {/* 2. Submissions Workspace Pre-filtered to UNDER_REVIEW */}
      <StaffSubmissionsClient
        initialSubmissions={submissions}
        defaultStatus="UNDER_REVIEW"
        currentUserId={session.user.id}
        stats={stats}
        showPipelineStrip={false}
        showWorkloadCard={false}
        pageMode="UNDER_REVIEW"
      />
    </div>
  );
}
