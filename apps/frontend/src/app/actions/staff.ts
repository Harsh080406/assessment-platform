"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { StorageService } from "@/lib/storage";
import { AttemptStatus, AuditResult, ReportStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type StaffActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Ensure current user has STAFF or ADMIN role
 */
async function verifyStaffSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please sign in.");
  }
  if (session.user.role !== UserRole.STAFF && session.user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden. Access restricted to Staff and Admin accounts.");
  }
  return session.user;
}

/**
 * 1. Get real queue metrics for Staff Dashboard
 */
export async function getStaffDashboardStatsAction(): Promise<
  StaffActionResult<{
    submitted: number;
    underReview: number;
    reportInPrep: number;
    pendingApproval: number;
    published: number;
    total: number;
  }>
> {
  try {
    await verifyStaffSession();

    const [submitted, underReview, reportInPrep, pendingApproval, published, total] = await Promise.all([
      prisma.assessmentAttempt.count({ where: { status: AttemptStatus.SUBMITTED } }),
      prisma.assessmentAttempt.count({ where: { status: AttemptStatus.UNDER_REVIEW } }),
      prisma.assessmentAttempt.count({ where: { status: AttemptStatus.REPORT_IN_PREP } }),
      prisma.assessmentAttempt.count({ where: { status: AttemptStatus.PENDING_APPROVAL } }),
      prisma.assessmentAttempt.count({ where: { status: AttemptStatus.PUBLISHED } }),
      prisma.assessmentAttempt.count({
        where: {
          status: {
            in: [
              AttemptStatus.SUBMITTED,
              AttemptStatus.UNDER_REVIEW,
              AttemptStatus.REPORT_IN_PREP,
              AttemptStatus.PENDING_APPROVAL,
              AttemptStatus.PUBLISHED,
            ],
          },
        },
      }),
    ]);

    return {
      success: true,
      message: "Staff queue statistics retrieved.",
      data: {
        submitted,
        underReview,
        reportInPrep,
        pendingApproval,
        published,
        total,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch staff statistics." };
  }
}

/**
 * 2. Get list of student assessment submissions
 */
export async function getStaffSubmissionsAction(params?: {
  status?: string;
  search?: string;
}): Promise<
  StaffActionResult<{
    submissions: Array<{
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
    }>;
  }>
> {
  try {
    await verifyStaffSession();

    const whereClause: any = {
      status: {
        in: [
          AttemptStatus.SUBMITTED,
          AttemptStatus.UNDER_REVIEW,
          AttemptStatus.REPORT_IN_PREP,
          AttemptStatus.PENDING_APPROVAL,
          AttemptStatus.PUBLISHED,
        ],
      },
    };

    if (params?.status && params.status !== "ALL") {
      whereClause.status = params.status as AttemptStatus;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      whereClause.OR = [
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { studentProfile: { firstName: { contains: q, mode: "insensitive" } } } },
        { user: { studentProfile: { lastName: { contains: q, mode: "insensitive" } } } },
        { user: { studentProfile: { school: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const attempts = await prisma.assessmentAttempt.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
        assessment: true,
        reports: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ submittedAt: "desc" }, { startedAt: "desc" }],
    });

    const submissions = attempts.map((att) => {
      const profile = att.user?.studentProfile;
      const studentName = profile
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : att.user?.email || "Student";

      const latestReport = att.reports?.[0];

      return {
        id: att.id,
        studentId: att.userId,
        studentName,
        studentEmail: att.user?.email || null,
        school: profile?.school || null,
        grade: profile?.grade || null,
        assessmentTitle: att.assessment?.title || "Psychometric Assessment",
        assessmentVersion: att.assessmentVersion,
        startedAt: att.startedAt.toISOString(),
        submittedAt: att.submittedAt ? att.submittedAt.toISOString() : null,
        status: att.status,
        reportsCount: att.reports?.length || 0,
        latestReportStatus: latestReport?.status || null,
      };
    });

    return {
      success: true,
      message: "Submissions retrieved successfully.",
      data: { submissions },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to load submissions." };
  }
}

/**
 * 3. Get detailed submission inspection view (with question-versioned responses)
 */
export async function getStaffSubmissionDetailAction(attemptId: string) {
  try {
    const user = await verifyStaffSession();

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
        assessment: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                questions: {
                  orderBy: { displayOrder: "asc" },
                  include: {
                    options: { orderBy: { displayOrder: "asc" } },
                  },
                },
              },
            },
          },
        },
        responses: true,
        reports: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!attempt) {
      return { success: false, message: "Submission not found." };
    }

    // Audit log this sensitive review inspection
    await createAuditLog({
      userId: user.id,
      action: "STAFF_VIEW_SUBMISSION_RESPONSES",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      metadata: {
        studentId: attempt.userId,
        assessmentId: attempt.assessmentId,
        assessmentVersion: attempt.assessmentVersion,
        attemptStatus: attempt.status,
      },
      result: AuditResult.SUCCESS,
    });

    // Map saved responses by questionId
    const responseMap = new Map<string, any>();
    attempt.responses.forEach((resp) => {
      responseMap.set(resp.questionId, resp);
    });

    const profile = attempt.user?.studentProfile;

    const sections = (attempt.assessment?.sections || []).map((sec) => {
      const questions = (sec.questions || []).map((q) => {
        const savedResp = responseMap.get(q.id);
        return {
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          version: q.version,
          displayOrder: q.displayOrder,
          required: q.required,
          sectionTitle: sec.title,
          sectionDisplayOrder: sec.displayOrder,
          options: (q.options || []).map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
            displayOrder: opt.displayOrder,
          })),
          studentAnswer: savedResp ? savedResp.answer : null,
          answeredAt: savedResp?.answeredAt ? savedResp.answeredAt.toISOString() : undefined,
        };
      });

      return {
        id: sec.id,
        title: sec.title,
        description: sec.description,
        questions,
      };
    });

    const reports = (attempt.reports || []).map((rep) => ({
      id: rep.id,
      version: rep.version,
      status: rep.status,
      fileReference: rep.fileReference,
      uploadedBy: rep.uploadedBy,
      uploadedAt: rep.uploadedAt.toISOString(),
      approvedBy: rep.approvedBy || null,
      publishedAt: rep.publishedAt ? rep.publishedAt.toISOString() : null,
      previewUrl: StorageService.generateSignedUrl(rep.fileReference, 60),
    }));

    return {
      success: true,
      message: "Submission details retrieved.",
      data: {
        attempt: {
          id: attempt.id,
          userId: attempt.userId,
          assessmentId: attempt.assessmentId,
          assessmentTitle: attempt.assessment?.title || "Psychometric Assessment",
          assessmentVersion: attempt.assessmentVersion,
          status: attempt.status,
          startedAt: attempt.startedAt.toISOString(),
          submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
        },
        student: {
          id: attempt.user?.id || attempt.userId,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          email: attempt.user?.email,
          phone: profile?.phone || attempt.user?.phone,
          school: profile?.school,
          grade: profile?.grade,
          country: profile?.country,
          educationLevel: profile?.educationLevel,
        },
        sections,
        reports,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to load submission details." };
  }
}

/**
 * 4. Transition attempt status in the expert review workflow
 */
export async function updateSubmissionStatusAction(
  attemptId: string,
  nextStatus: AttemptStatus
): Promise<StaffActionResult<{ status: AttemptStatus }>> {
  try {
    const user = await verifyStaffSession();

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return { success: false, message: "Assessment attempt not found." };
    }

    const currentStatus = attempt.status;

    // Validate state machine transitions
    const validTransitions: Record<string, AttemptStatus[]> = {
      [AttemptStatus.SUBMITTED]: [AttemptStatus.UNDER_REVIEW],
      [AttemptStatus.UNDER_REVIEW]: [AttemptStatus.REPORT_IN_PREP, AttemptStatus.SUBMITTED],
      [AttemptStatus.REPORT_IN_PREP]: [AttemptStatus.PENDING_APPROVAL, AttemptStatus.UNDER_REVIEW],
      [AttemptStatus.PENDING_APPROVAL]: [AttemptStatus.REPORT_IN_PREP, AttemptStatus.PUBLISHED],
      [AttemptStatus.PUBLISHED]: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      return {
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
      };
    }

    const updated = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: nextStatus },
    });

    await createAuditLog({
      userId: user.id,
      action: "STAFF_UPDATE_ATTEMPT_STATUS",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      metadata: { from: currentStatus, to: nextStatus },
      result: AuditResult.SUCCESS,
    });

    revalidatePath(`/portal`);
    revalidatePath(`/portal/review/${attemptId}`);

    return {
      success: true,
      message: `Status transitioned to ${nextStatus}`,
      data: { status: updated.status },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update status." };
  }
}

/**
 * 5. Upload Diagnostic Report PDF
 */
export async function uploadSubmissionReportAction(
  formData: FormData
): Promise<StaffActionResult<{ reportId: string; previewUrl: string; version: number }>> {
  try {
    const user = await verifyStaffSession();

    const attemptId = formData.get("attemptId") as string;
    const file = formData.get("reportPdf") as File | null;

    if (!attemptId || !file) {
      return { success: false, message: "Attempt ID and report PDF file are required." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!StorageService.isValidPdfBuffer(buffer)) {
      return {
        success: false,
        message: "Invalid file. The uploaded file is not a valid PDF document with %PDF- header.",
      };
    }

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { reports: true },
    });

    if (!attempt) {
      return { success: false, message: "Assessment attempt not found." };
    }

    // Save report in private storage
    const stored = await StorageService.saveReport(attemptId, buffer, file.name);
    const version = (attempt.reports?.length || 0) + 1;

    // Create Report record
    const report = await prisma.report.create({
      data: {
        attemptId: attempt.id,
        studentId: attempt.userId,
        fileReference: stored.fileReference,
        version,
        status: ReportStatus.PENDING_APPROVAL,
        uploadedBy: user.id,
        uploadedAt: new Date(),
      },
    });

    // Move attempt status to PENDING_APPROVAL
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.PENDING_APPROVAL },
    });

    // Audit log the upload
    await createAuditLog({
      userId: user.id,
      action: "STAFF_UPLOAD_REPORT_PDF",
      resource: "Report",
      resourceId: report.id,
      metadata: {
        attemptId,
        studentId: attempt.userId,
        fileReference: stored.fileReference,
        fileSize: stored.fileSize,
        version,
      },
      result: AuditResult.SUCCESS,
    });

    const previewUrl = StorageService.generateSignedUrl(stored.fileReference, 60);

    revalidatePath(`/portal`);
    revalidatePath(`/portal/review/${attemptId}`);

    return {
      success: true,
      message: "Diagnostic report uploaded successfully. Status moved to Pending Approval.",
      data: {
        reportId: report.id,
        previewUrl,
        version: report.version,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to upload report." };
  }
}
