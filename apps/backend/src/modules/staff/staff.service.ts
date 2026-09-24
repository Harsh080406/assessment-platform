import { prisma } from "../../lib/prisma.js";
import { StorageService } from "../../lib/storage.js";
import { createAuditLog } from "../../lib/audit.js";
import {
  AttemptStatus,
  ReportStatus,
  StaffDashboardStats,
  StaffSubmissionSummary,
  StaffSubmissionDetail,
  VersionedQuestionDetail,
} from "@aurapath/shared";
import { AttemptStatus as PrismaAttemptStatus, ReportStatus as PrismaReportStatus } from "@prisma/client";

export class StaffService {
  /**
   * Get queue counts for the staff dashboard
   */
  public static async getDashboardStats(): Promise<StaffDashboardStats> {
    const [submitted, underReview, reportInPrep, pendingApproval, published, total] = await Promise.all([
      prisma.assessmentAttempt.count({ where: { status: PrismaAttemptStatus.SUBMITTED } }),
      prisma.assessmentAttempt.count({ where: { status: PrismaAttemptStatus.UNDER_REVIEW } }),
      prisma.assessmentAttempt.count({ where: { status: PrismaAttemptStatus.REPORT_IN_PREP } }),
      prisma.assessmentAttempt.count({ where: { status: PrismaAttemptStatus.PENDING_APPROVAL } }),
      prisma.assessmentAttempt.count({ where: { status: PrismaAttemptStatus.PUBLISHED } }),
      prisma.assessmentAttempt.count({
        where: {
          status: {
            in: [
              PrismaAttemptStatus.SUBMITTED,
              PrismaAttemptStatus.UNDER_REVIEW,
              PrismaAttemptStatus.REPORT_IN_PREP,
              PrismaAttemptStatus.PENDING_APPROVAL,
              PrismaAttemptStatus.PUBLISHED,
            ],
          },
        },
      }),
    ]);

    return {
      submitted,
      underReview,
      reportInPrep,
      pendingApproval,
      published,
      total,
    };
  }

  /**
   * Get list of submissions with filtering and pagination
   */
  public static async getSubmissions(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ submissions: StaffSubmissionSummary[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: {
        in: [
          PrismaAttemptStatus.SUBMITTED,
          PrismaAttemptStatus.UNDER_REVIEW,
          PrismaAttemptStatus.REPORT_IN_PREP,
          PrismaAttemptStatus.PENDING_APPROVAL,
          PrismaAttemptStatus.PUBLISHED,
        ],
      },
    };

    if (params.status && params.status !== "ALL") {
      whereClause.status = params.status as PrismaAttemptStatus;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      whereClause.OR = [
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { studentProfile: { firstName: { contains: q, mode: "insensitive" } } } },
        { user: { studentProfile: { lastName: { contains: q, mode: "insensitive" } } } },
        { user: { studentProfile: { school: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const [attempts, total] = await Promise.all([
      prisma.assessmentAttempt.findMany({
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
        skip,
        take: limit,
      }),
      prisma.assessmentAttempt.count({ where: whereClause }),
    ]);

    const submissions: StaffSubmissionSummary[] = attempts.map((att: any) => {
      const profile = att.user?.studentProfile;
      const studentName = profile
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : att.user?.email || "Anonymous Student";

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
        status: att.status as AttemptStatus,
        reportsCount: att.reports?.length || 0,
        latestReportStatus: (latestReport?.status as ReportStatus) || null,
        latestReportId: latestReport?.id || null,
      };
    });

    return {
      submissions,
      total,
      page,
      limit,
    };
  }

  /**
   * Get detailed submission inspection view (with question-versioned responses)
   */
  public static async getSubmissionDetail(
    attemptId: string,
    actorUserId: string,
    ipAddress?: string
  ): Promise<StaffSubmissionDetail | null> {
    const attempt: any = await prisma.assessmentAttempt.findUnique({
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

    if (!attempt) return null;

    // Audit log this sensitive expert response inspection
    await createAuditLog({
      userId: actorUserId,
      action: "STAFF_VIEW_SUBMISSION_RESPONSES",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      ipAddress,
      metadata: {
        studentId: attempt.userId,
        assessmentId: attempt.assessmentId,
        assessmentVersion: attempt.assessmentVersion,
        status: attempt.status,
      },
    });

    // Map saved responses by questionId
    const responseMap = new Map<string, any>();
    if (attempt.responses && Array.isArray(attempt.responses)) {
      attempt.responses.forEach((resp: any) => {
        responseMap.set(resp.questionId, resp);
      });
    }

    const profile = attempt.user?.studentProfile;

    const sections = (attempt.assessment?.sections || []).map((sec: any) => {
      const questions: VersionedQuestionDetail[] = (sec.questions || []).map((q: any) => {
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
          options: (q.options || []).map((opt: any) => ({
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

    const reports = (attempt.reports || []).map((rep: any) => ({
      id: rep.id,
      version: rep.version,
      status: rep.status as ReportStatus,
      fileReference: rep.fileReference,
      uploadedBy: rep.uploadedBy,
      uploadedAt: rep.uploadedAt.toISOString(),
      approvedBy: rep.approvedBy || null,
      publishedAt: rep.publishedAt ? rep.publishedAt.toISOString() : null,
    }));

    return {
      attempt: {
        id: attempt.id,
        userId: attempt.userId,
        assessmentId: attempt.assessmentId,
        assessmentTitle: attempt.assessment?.title || "Psychometric Assessment",
        assessmentVersion: attempt.assessmentVersion,
        status: attempt.status as AttemptStatus,
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
    };
  }

  /**
   * Transition attempt status in the expert review workflow
   */
  public static async updateAttemptStatus(
    attemptId: string,
    nextStatus: AttemptStatus,
    actorUserId: string,
    ipAddress?: string
  ): Promise<{ success: boolean; status: AttemptStatus }> {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Assessment attempt not found.");
    }

    const currentStatus = attempt.status;

    // Validate state machine transitions
    const validTransitions: Record<string, string[]> = {
      [PrismaAttemptStatus.SUBMITTED]: [PrismaAttemptStatus.UNDER_REVIEW],
      [PrismaAttemptStatus.UNDER_REVIEW]: [PrismaAttemptStatus.REPORT_IN_PREP, PrismaAttemptStatus.SUBMITTED],
      [PrismaAttemptStatus.REPORT_IN_PREP]: [PrismaAttemptStatus.PENDING_APPROVAL, PrismaAttemptStatus.UNDER_REVIEW],
      [PrismaAttemptStatus.PENDING_APPROVAL]: [PrismaAttemptStatus.REPORT_IN_PREP, PrismaAttemptStatus.PUBLISHED],
      [PrismaAttemptStatus.PUBLISHED]: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus as PrismaAttemptStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}.`);
    }

    const updated = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: nextStatus as PrismaAttemptStatus },
    });

    await createAuditLog({
      userId: actorUserId,
      action: "STAFF_UPDATE_ATTEMPT_STATUS",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      ipAddress,
      metadata: {
        from: currentStatus,
        to: nextStatus,
      },
    });

    return {
      success: true,
      status: updated.status as AttemptStatus,
    };
  }

  /**
   * Upload diagnostic report PDF and transition attempt to PENDING_APPROVAL
   */
  public static async uploadReport(
    attemptId: string,
    fileBuffer: Buffer,
    originalName: string,
    actorUserId: string,
    ipAddress?: string
  ) {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { reports: true },
    });

    if (!attempt) {
      throw new Error("Assessment attempt not found.");
    }

    // Save PDF securely
    const stored = await StorageService.saveReport(attemptId, fileBuffer, originalName);

    const version = (attempt.reports?.length || 0) + 1;

    // Create Report record
    const report = await prisma.report.create({
      data: {
        attemptId: attempt.id,
        studentId: attempt.userId,
        fileReference: stored.fileReference,
        version,
        status: PrismaReportStatus.PENDING_APPROVAL,
        uploadedBy: actorUserId,
        uploadedAt: new Date(),
      },
    });

    // Update attempt status to PENDING_APPROVAL
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: PrismaAttemptStatus.PENDING_APPROVAL },
    });

    // Audit log the upload
    await createAuditLog({
      userId: actorUserId,
      action: "STAFF_UPLOAD_REPORT_PDF",
      resource: "Report",
      resourceId: report.id,
      ipAddress,
      metadata: {
        attemptId,
        studentId: attempt.userId,
        fileReference: stored.fileReference,
        fileSize: stored.fileSize,
        version,
      },
    });

    const previewUrl = StorageService.generateSignedUrl(stored.fileReference, 60);

    return {
      reportId: report.id,
      attemptId,
      version: report.version,
      status: report.status as ReportStatus,
      fileReference: report.fileReference,
      previewUrl,
    };
  }
}
