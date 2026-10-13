import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStaffDashboardStatsAction, getStaffSubmissionsAction } from "@/app/actions/staff";
import StaffSubmissionsClient from "./StaffSubmissionsClient";
import StaffPageHeader from "@/components/staff/StaffPageHeader";
import { DEFAULT_SLA_DAYS } from "@/lib/sla";

export default async function StaffPortalPage() {
  const session = await auth();

  const [statsRes, submissionsRes, slaConfig] = await Promise.all([
    getStaffDashboardStatsAction(),
    getStaffSubmissionsAction(),
    prisma.systemConfig.findUnique({ where: { key: "GLOBAL_SLA_DAYS" } }),
  ]);

  const slaDays = slaConfig ? parseInt(slaConfig.value, 10) || DEFAULT_SLA_DAYS : DEFAULT_SLA_DAYS;

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
        title="Live Queue"
        description="Review candidate responses, score them, and upload certified guidance reports."
        count={stats.total}
        countLabel="in pipeline"
      />

      {/* 2. Interactive Pipeline Strip, Workload Card & Submissions Workspace */}
      <StaffSubmissionsClient
        initialSubmissions={submissions}
        currentUserId={session?.user?.id}
        slaDays={slaDays}
        stats={stats}
        showPipelineStrip={true}
        showWorkloadCard={true}
        pageMode="DEFAULT"
      />
    </div>
  );
}
