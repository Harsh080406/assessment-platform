import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AttemptStatus } from "@prisma/client";
import StudentPlansClient from "./StudentPlansClient";

export default async function StudentPlansPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/plans");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      attempts: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          submittedAt: true,
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  const studentName = user?.studentProfile
    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`.trim()
    : session.user.name || "Alex Student";

  const firstName = user?.studentProfile?.firstName || studentName.split(" ")[0] || "Student";
  const studentEmail = user?.email || session.user.email || "";
  const studentGrade = user?.studentProfile?.grade || user?.studentProfile?.educationLevel || "Student";
  const studentSchool = user?.studentProfile?.school || null;

  const attempts = user?.attempts || [];
  const hasCompletedAssessment = attempts.some(
    (a) =>
      a.status === AttemptStatus.SUBMITTED ||
      a.status === AttemptStatus.UNDER_REVIEW ||
      a.status === AttemptStatus.REPORT_IN_PREP ||
      a.status === AttemptStatus.PENDING_APPROVAL ||
      a.status === AttemptStatus.PUBLISHED
  );
  const hasStartedAssessment = attempts.some(
    (a) => a.status === AttemptStatus.IN_PROGRESS || a.status === AttemptStatus.NOT_STARTED
  );

  return (
    <StudentPlansClient
      firstName={firstName}
      studentName={studentName}
      studentEmail={studentEmail}
      studentGrade={studentGrade}
      studentSchool={studentSchool}
      hasStartedAssessment={hasStartedAssessment}
      hasCompletedAssessment={hasCompletedAssessment}
    />
  );
}
