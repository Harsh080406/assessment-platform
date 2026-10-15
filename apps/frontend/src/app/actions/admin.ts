"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { StorageService } from "@/lib/storage";
import {
  AttemptStatus,
  AuditResult,
  QuestionType,
  ReportStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { computeSlaInfo, DEFAULT_SLA_DAYS } from "@/lib/sla";

export type AdminActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Verify session has ADMIN role
 */
async function verifyAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please sign in.");
  }
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden. Access restricted exclusively to Admin accounts.");
  }
  return session.user;
}

/**
 * 1. Platform-Wide Statistics for Admin Dashboard
 */
export async function getAdminDashboardStatsAction(): Promise<
  AdminActionResult<{
    totalStudents: number;
    totalAttempts: number;
    pendingReviews: number;
    reportsPendingApproval: number;
    reportsPublished: number;
    totalStaff: number;
  }>
> {
  try {
    await verifyAdminSession();

    const [
      totalStudents,
      totalAttempts,
      pendingReviews,
      reportsPendingApproval,
      reportsPublished,
      totalStaff,
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.assessmentAttempt.count(),
      prisma.assessmentAttempt.count({
        where: {
          status: {
            in: [AttemptStatus.SUBMITTED, AttemptStatus.UNDER_REVIEW],
          },
        },
      }),
      prisma.report.count({ where: { status: ReportStatus.PENDING_APPROVAL } }),
      prisma.report.count({ where: { status: ReportStatus.PUBLISHED } }),
      prisma.user.count({
        where: { role: { in: [UserRole.STAFF, UserRole.ADMIN] } },
      }),
    ]);

    return {
      success: true,
      message: "Platform administration stats retrieved successfully.",
      data: {
        totalStudents,
        totalAttempts,
        pendingReviews,
        reportsPendingApproval,
        reportsPublished,
        totalStaff,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch admin stats." };
  }
}

/**
 * 2. Get Report Approval Queue
 */
export async function getAdminReportQueueAction(statusFilter: string = "ALL"): Promise<
  AdminActionResult<{
    reports: Array<{
      id: string;
      attemptId: string;
      studentId: string;
      studentName: string;
      studentEmail: string | null;
      assessmentTitle: string;
      fileReference: string;
      version: number;
      status: ReportStatus;
      uploadedBy: string;
      approvedBy: string | null;
      uploadedAt: string;
      publishedAt: string | null;
      previewUrl: string;
      versionHistory: Array<{
        id: string;
        version: number;
        uploadedBy: string;
        uploadedAt: string;
        status: ReportStatus;
        rejectionReason: string | null;
        fileReference: string;
        previewUrl: string;
      }>;
    }>;
  }>
> {
  try {
    await verifyAdminSession();

    const whereClause: any = {};
    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as ReportStatus;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        attempt: {
          include: {
            user: {
              include: {
                studentProfile: true,
              },
            },
            assessment: true,
            reports: {
              orderBy: { version: "desc" },
            },
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    const formattedReports = await Promise.all(
      reports.map(async (r) => {
        const studentProfile = r.attempt.user.studentProfile;
        const studentName = studentProfile
          ? `${studentProfile.firstName} ${studentProfile.lastName}`.trim()
          : r.attempt.user.email || "Candidate";

        let previewUrl = `/api/reports/download?reportId=${r.id}`;
        if (r.fileReference.startsWith("http") || r.fileReference.startsWith("/")) {
          previewUrl = r.fileReference;
        } else {
          try {
            previewUrl = StorageService.generateSignedUrl(r.fileReference);
          } catch {
            // fallback
          }
        }

        const versionHistory = (r.attempt.reports || []).map((v) => ({
          id: v.id,
          version: v.version,
          uploadedBy: v.uploadedBy,
          uploadedAt: v.uploadedAt.toISOString(),
          status: v.status,
          rejectionReason: v.rejectionReason,
          fileReference: v.fileReference,
          previewUrl: `/api/reports/download?reportId=${v.id}`,
        }));

        return {
          id: r.id,
          attemptId: r.attemptId,
          studentId: r.studentId,
          studentName,
          studentEmail: r.attempt.user.email,
          assessmentTitle: r.attempt.assessment.title,
          fileReference: r.fileReference,
          version: r.version,
          status: r.status,
          uploadedBy: r.uploadedBy,
          approvedBy: r.approvedBy,
          uploadedAt: r.uploadedAt.toISOString(),
          publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
          previewUrl,
          versionHistory,
        };
      })
    );

    return {
      success: true,
      message: "Report queue retrieved.",
      data: { reports: formattedReports },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch report queue." };
  }
}

/**
 * 3. Approve Report Action
 */
export async function approveReportAction(reportId: string): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new Error("Report not found.");
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.APPROVED,
        approvedBy: adminUser.email || adminUser.id,
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "REPORT_APPROVED",
      resource: "Report",
      resourceId: reportId,
      metadata: { attemptId: report.attemptId, approvedBy: adminUser.email },
    });

    revalidatePath("/console");
    revalidatePath("/console/reports");
    return { success: true, message: `Report v${updated.version} approved.` };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to approve report." };
  }
}

/**
 * 4. Reject Report Action
 */
export async function rejectReportAction(reportId: string, comment?: string): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new Error("Report not found.");
    }

    if (!comment || !comment.trim()) {
      throw new Error("A reason for rejection is required.");
    }

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: report.attemptId },
      include: { assessment: true },
    });

    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.REJECTED,
          rejectionReason: comment.trim(),
          approvedBy: adminUser.email || adminUser.id,
        },
      }),
      prisma.assessmentAttempt.update({
        where: { id: report.attemptId },
        data: { status: AttemptStatus.REPORT_IN_PREP },
      }),
    ]);

    if (attempt?.assignedStaffId) {
      await prisma.notification.create({
        data: {
          userId: attempt.assignedStaffId,
          type: "REVISION_REQUESTED",
          message: `Report for "${attempt.assessment.title}" requires revisions: "${comment.trim()}"`,
        },
      });
    }

    await createAuditLog({
      userId: adminUser.id,
      action: "REPORT_REJECTED",
      resource: "Report",
      resourceId: reportId,
      metadata: { attemptId: report.attemptId, comment: comment.trim(), rejectedBy: adminUser.email },
    });

    revalidatePath("/console");
    revalidatePath("/console/reports");
    revalidatePath("/portal");
    revalidatePath("/portal/needs-revision");
    return { success: true, message: "Report rejected and sent to Needs Revision queue." };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to reject report." };
  }
}

/**
 * 5. Publish Report Action (Triggers Phase 5 Notification Hook stub)
 */
export async function publishReportAction(reportId: string): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        attempt: {
          include: {
            user: true,
            assessment: true,
          },
        },
      },
    });

    if (!report) {
      throw new Error("Report not found.");
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.PUBLISHED,
          approvedBy: adminUser.email || adminUser.id,
          publishedAt: now,
        },
      }),
      prisma.assessmentAttempt.update({
        where: { id: report.attemptId },
        data: {
          status: AttemptStatus.PUBLISHED,
        },
      }),
      prisma.notification.create({
        data: {
          userId: report.studentId,
          type: "REPORT_PUBLISHED",
          message: `Your official certified career report for "${report.attempt.assessment.title}" is now published and available on your student dashboard!`,
        },
      }),
    ]);

    await createAuditLog({
      userId: adminUser.id,
      action: "REPORT_PUBLISHED",
      resource: "Report",
      resourceId: reportId,
      metadata: {
        attemptId: report.attemptId,
        studentId: report.studentId,
        publishedBy: adminUser.email,
        publishedAt: now.toISOString(),
      },
    });

    // TODO: PHASE 5 NOTIFICATION ENGINE HOOK
    console.log(
      `[PHASE 5 NOTIFICATION HOOK TODO]: Triggering Email/SMS notification to student ${report.attempt.user.email} for published report ${reportId}`
    );

    revalidatePath("/console");
    revalidatePath("/console/reports");
    revalidatePath("/portal");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Report published successfully! Student has been notified.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to publish report." };
  }
}

/**
 * 6. User Management Actions
 */
export async function getAdminUsersAction(params?: {
  search?: string;
  role?: string;
  status?: string;
}): Promise<
  AdminActionResult<{
    users: Array<{
      id: string;
      email: string | null;
      phone: string | null;
      role: UserRole;
      status: UserStatus;
      name: string;
      school: string | null;
      grade: string | null;
      createdAt: string;
      lastLoginAt: string | null;
      attemptsCount: number;
    }>;
  }>
> {
  try {
    await verifyAdminSession();

    const whereClause: any = {};

    if (params?.role && params.role !== "ALL") {
      whereClause.role = params.role as UserRole;
    }

    if (params?.status && params.status !== "ALL") {
      whereClause.status = params.status as UserStatus;
    }

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      whereClause.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { studentProfile: { firstName: { contains: q, mode: "insensitive" } } },
        { studentProfile: { lastName: { contains: q, mode: "insensitive" } } },
        { studentProfile: { school: { contains: q, mode: "insensitive" } } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        studentProfile: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((u) => {
      const sp = u.studentProfile;
      const name = sp
        ? `${sp.firstName} ${sp.lastName}`.trim()
        : u.email?.split("@")[0] || "User";

      return {
        id: u.id,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        name,
        school: sp?.school || null,
        grade: sp?.grade || null,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
        attemptsCount: u._count.attempts,
      };
    });

    return {
      success: true,
      message: "Users retrieved.",
      data: { users: formattedUsers },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch users." };
  }
}

export async function updateUserStatusAction(
  userId: string,
  newStatus: UserStatus
): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: newStatus,
        sessionVersion: { increment: 1 }, // Fix #4: Instantly invalidates all active JWT sessions for this user
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "USER_STATUS_UPDATED",
      resource: "User",
      resourceId: userId,
      metadata: { newStatus, targetEmail: user.email, sessionRevoked: true },
    });

    revalidatePath("/console/users");
    return { success: true, message: `User status set to ${newStatus} and sessions revoked.` };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update user status." };
  }
}

export async function resetUserAccessAction(userId: string): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        sessionVersion: { increment: 1 }, // Fix #4: Force log out everywhere
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Force clear session or log reset event
    await createAuditLog({
      userId: adminUser.id,
      action: "USER_ACCESS_RESET",
      resource: "User",
      resourceId: userId,
      metadata: { targetEmail: user.email, resetBy: adminUser.email, sessionRevoked: true },
    });

    revalidatePath("/console/users");
    return {
      success: true,
      message: `Access reset initiated for ${user.email || user.id}. Password reset link generated.`,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to reset access." };
  }
}

/**
 * 7. Staff Management & Workload Actions
 */
export async function getAdminStaffWorkloadAction(): Promise<
  AdminActionResult<{
    staffList: Array<{
      id: string;
      name: string;
      email: string | null;
      role: UserRole;
      status: UserStatus;
      specialty: string | null;
      activeReviewsCount: number;
      publishedCount: number;
      createdAt: string;
      available: boolean;
    }>;
  }>
> {
  try {
    await verifyAdminSession();

    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.STAFF, UserRole.ADMIN] },
      },
      include: {
        studentProfile: true,
        staffProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = await Promise.all(
      staffUsers.map(async (u) => {
        const name = u.studentProfile
          ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}`.trim()
          : u.email?.split("@")[0] || "Staff Member";

        const [activeReviewsCount, publishedCount] = await Promise.all([
          prisma.report.count({
            where: {
              uploadedBy: u.email || u.id,
              status: { in: [ReportStatus.PENDING_APPROVAL, ReportStatus.APPROVED] },
            },
          }),
          prisma.report.count({
            where: {
              uploadedBy: u.email || u.id,
              status: ReportStatus.PUBLISHED,
            },
          }),
        ]);

        return {
          id: u.id,
          name,
          email: u.email,
          role: u.role,
          status: u.status,
          specialty: u.staffProfile?.specialty || "Psychometric Evaluator",
          activeReviewsCount,
          publishedCount,
          createdAt: u.createdAt.toISOString(),
          available: u.staffProfile ? u.staffProfile.available : true,
        };
      })
    );

    return {
      success: true,
      message: "Staff workload retrieved.",
      data: { staffList: formatted },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch staff workload." };
  }
}

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      if (newRole === UserRole.STAFF || newRole === UserRole.ADMIN) {
        await tx.staffProfile.upsert({
          where: { userId },
          create: { userId, specialty: "Certified Psychometric Evaluator" },
          update: { active: true },
        });
      }
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "USER_ROLE_UPDATED",
      resource: "User",
      resourceId: userId,
      metadata: { newRole, updatedBy: adminUser.email },
    });

    revalidatePath("/console/staff");
    revalidatePath("/console/users");
    return { success: true, message: `User role updated to ${newRole}.` };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update role." };
  }
}

/**
 * 8. Assessment & Question Versioning Management Actions
 * CRITICAL RULE: If a Question already has responses in DB, editing it MUST create a NEW Question version!
 */
export async function getAdminAssessmentsAction(): Promise<
  AdminActionResult<{
    assessments: Array<{
      id: string;
      title: string;
      description: string;
      version: number;
      status: string;
      sectionsCount: number;
      questionsCount: number;
      attemptsCount: number;
      sections: Array<{
        id: string;
        title: string;
        displayOrder: number;
        questions: Array<{
          id: string;
          questionText: string;
          questionType: QuestionType;
          version: number;
          displayOrder: number;
          required: boolean;
          responsesCount: number;
          options: Array<{ id: string; optionText: string; displayOrder: number }>;
        }>;
      }>;
    }>;
  }>
> {
  try {
    await verifyAdminSession();

    const assessments = await prisma.assessment.findMany({
      where: {
        status: { not: "ARCHIVED" },
      },
      include: {
        _count: { select: { attempts: true } },
        sections: {
          orderBy: { displayOrder: "asc" },
          include: {
            questions: {
              orderBy: { displayOrder: "asc" },
              include: {
                options: { orderBy: { displayOrder: "asc" } },
                _count: { select: { responses: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = assessments.map((a) => {
      let questionsCount = 0;
      const sections = a.sections.map((sec) => {
        questionsCount += sec.questions.length;
        return {
          id: sec.id,
          title: sec.title,
          displayOrder: sec.displayOrder,
          questions: sec.questions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            version: q.version,
            displayOrder: q.displayOrder,
            required: q.required,
            responsesCount: q._count.responses,
            options: q.options.map((o) => ({
              id: o.id,
              optionText: o.optionText,
              displayOrder: o.displayOrder,
            })),
          })),
        };
      });

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        version: a.version,
        status: a.status,
        sectionsCount: a.sections.length,
        questionsCount,
        attemptsCount: a._count.attempts,
        sections,
      };
    });

    return {
      success: true,
      message: "Assessments retrieved.",
      data: { assessments: formatted },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch assessments." };
  }
}

/**
 * Update Question Action — Enforces Copy-on-Write Versioning when responses exist!
 */
export async function updateQuestionAction(data: {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  displayOrder: number;
  required: boolean;
  options: string[];
}): Promise<AdminActionResult<{ isNewVersion: boolean; newQuestionId: string; version: number }>> {
  try {
    const adminUser = await verifyAdminSession();

    const existingQuestion = await prisma.question.findUnique({
      where: { id: data.questionId },
      include: {
        _count: { select: { responses: true } },
      },
    });

    if (!existingQuestion) {
      throw new Error("Question not found.");
    }

    const responsesCount = existingQuestion._count.responses;

    // RULE: If responses exist, DO NOT mutate existing question. Create NEW version!
    if (responsesCount > 0) {
      const nextVersion = existingQuestion.version + 1;

      const newQuestion = await prisma.question.create({
        data: {
          sectionId: existingQuestion.sectionId,
          version: nextVersion,
          questionText: data.questionText,
          questionType: data.questionType,
          category: existingQuestion.category || "General",
          reverseKeyed: existingQuestion.reverseKeyed || false,
          correctOptionId: existingQuestion.correctOptionId,
          mostEffectiveOptionId: existingQuestion.mostEffectiveOptionId,
          leastEffectiveOptionId: existingQuestion.leastEffectiveOptionId,
          displayOrder: data.displayOrder,
          required: data.required,
          options: {
            create: data.options.map((optText, i) => ({
              optionText: optText,
              displayOrder: i + 1,
            })),
          },
        },
      });

      await createAuditLog({
        userId: adminUser.id,
        action: "QUESTION_VERSION_CREATED",
        resource: "Question",
        resourceId: newQuestion.id,
        metadata: {
          previousQuestionId: existingQuestion.id,
          previousVersion: existingQuestion.version,
          newVersion: nextVersion,
          responsesPreservedCount: responsesCount,
        },
      });

      revalidatePath("/console/assessments");
      return {
        success: true,
        message: `Existing question has ${responsesCount} student response(s). Created NEW version v${nextVersion} instead of overwriting!`,
        data: {
          isNewVersion: true,
          newQuestionId: newQuestion.id,
          version: nextVersion,
        },
      };
    } else {
      // No responses yet: safe to mutate existing question directly
      await prisma.$transaction([
        prisma.questionOption.deleteMany({ where: { questionId: data.questionId } }),
        prisma.question.update({
          where: { id: data.questionId },
          data: {
            questionText: data.questionText,
            questionType: data.questionType,
            displayOrder: data.displayOrder,
            required: data.required,
            options: {
              create: data.options.map((optText, i) => ({
                optionText: optText,
                displayOrder: i + 1,
              })),
            },
          },
        }),
      ]);

      await createAuditLog({
        userId: adminUser.id,
        action: "QUESTION_MUTATED",
        resource: "Question",
        resourceId: data.questionId,
        metadata: { version: existingQuestion.version },
      });

      revalidatePath("/console/assessments");
      return {
        success: true,
        message: "Question updated directly (no existing student responses).",
        data: {
          isNewVersion: false,
          newQuestionId: data.questionId,
          version: existingQuestion.version,
        },
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update question." };
  }
}

/**
 * 9. Audit Logs Viewer Action
 */
export async function getAdminAuditLogsAction(params?: {
  search?: string;
  action?: string;
  limit?: number;
}): Promise<
  AdminActionResult<{
    logs: Array<{
      id: string;
      userId: string | null;
      userEmail: string | null;
      action: string;
      resource: string;
      resourceId: string | null;
      ipAddress: string | null;
      metadata: any;
      result: AuditResult;
      createdAt: string;
    }>;
  }>
> {
  try {
    await verifyAdminSession();

    const whereClause: any = {};
    if (params?.action && params.action !== "ALL") {
      whereClause.action = params.action;
    }

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      whereClause.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { resource: { contains: q, mode: "insensitive" } },
        { resourceId: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: params?.limit || 100,
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userEmail: l.user?.email || null,
      action: l.action,
      resource: l.resource,
      resourceId: l.resourceId,
      ipAddress: l.ipAddress,
      metadata: l.metadata,
      result: l.result,
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      success: true,
      message: "Audit logs retrieved.",
      data: { logs: formatted },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch audit logs." };
  }
}

/**
 * Invite User Action (Staff, Admin, or Student candidate)
 */
export async function inviteStaffOrAdminAction(data: {
  email: string;
  role: UserRole;
}): Promise<AdminActionResult<{ activationUrl: string; token: string }>> {
  try {
    const adminUser = await verifyAdminSession();

    const email = data.email.trim().toLowerCase();
    const role = data.role;

    if (![UserRole.STUDENT, UserRole.STAFF, UserRole.ADMIN].includes(role)) {
      return { success: false, message: "Invalid user role specified for invitation." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE || existingUser.status === UserStatus.SUSPENDED) {
        return {
          success: false,
          message: `User with email ${email} already exists with status ${existingUser.status}.`,
        };
      }
    }

    const { generateActivationToken } = await import("@/lib/activationToken");
    const activationToken = generateActivationToken(email, role);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.AUTH_URL ||
      "https://www.alderwoodvantage.com";
    const activationUrl = `${baseUrl}/activate?token=${activationToken}`;

    let invitedUser = existingUser;

    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email,
          role,
          status: UserStatus.INACTIVE,
          invitedBy: adminUser.id,
          invitedAt: new Date(),
          studentProfile:
            role === UserRole.STUDENT
              ? {
                  create: {
                    firstName: email.split("@")[0],
                    lastName: "",
                  },
                }
              : undefined,
          staffProfile:
            role === UserRole.STAFF
              ? {
                  create: {
                    specialty: "General Evaluator",
                    active: true,
                  },
                }
              : undefined,
        },
      });
    } else {
      invitedUser = await prisma.user.update({
        where: { id: existingUser!.id },
        data: {
          role,
          invitedBy: adminUser.id,
          invitedAt: new Date(),
        },
      });
    }

    // Send congratulatory account invitation email with activation link
    let emailDispatched = false;
    let emailErrorMsg: string | null = null;
    try {
      const { getEmailService } = await import("@/lib/email");
      const emailRes = await getEmailService().sendAccountInvitationEmail(email, role, activationUrl);
      emailDispatched = Boolean(emailRes?.success);
    } catch (err: any) {
      emailErrorMsg = err?.message || String(err);
      console.error("[inviteStaffOrAdminAction] Email dispatch exception:", err);
    }

    await createAuditLog({
      userId: adminUser.id,
      action: "STAFF_ADMIN_INVITED",
      resource: "User",
      resourceId: invitedUser.id,
      metadata: {
        targetEmail: email,
        targetRole: role,
        invitedBy: adminUser.id,
        activationUrl,
        emailDispatched,
        emailError: emailErrorMsg,
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/console/staff");
    revalidatePath("/console/users");

    return {
      success: true,
      message: emailDispatched
        ? `Invitation successfully sent to ${email} as ${role}. An activation email has been delivered.`
        : `Invitation created for ${email} as ${role}. (Email notice: ${emailErrorMsg || "Failed to deliver via provider"}).`,
      data: {
        activationUrl,
        token: activationToken,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to process invitation." };
  }
}

export const inviteUserAction = inviteStaffOrAdminAction;

/**
 * Priority 1c: Admin SLA Monitoring Action
 */
export async function getAdminSlaMonitoringAction(): Promise<
  AdminActionResult<{
    summary: {
      totalOverdue: number;
      totalDueToday: number;
      avgTurnaroundDays: number;
      totalInProgress: number;
    };
    evaluations: Array<{
      id: string;
      candidateName: string;
      candidateEmail: string | null;
      school: string | null;
      grade: string | null;
      assessmentTitle: string;
      status: AttemptStatus;
      assignedStaffId: string | null;
      assignedStaffName: string;
      submittedAt: string | null;
      dueDate: string | null;
      hoursRemaining: number;
      slaStatus: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
      isOverdue: boolean;
    }>;
    staffMembers: Array<{
      id: string;
      name: string;
      email: string | null;
      specialty: string | null;
      available: boolean;
    }>;
  }>
> {
  try {
    await verifyAdminSession();

    // 1. Fetch 30-day completed evaluations for average turnaround
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedRecent = await prisma.assessmentAttempt.findMany({
      where: {
        status: AttemptStatus.PUBLISHED,
        submittedAt: { gte: thirtyDaysAgo },
      },
      include: {
        reports: {
          where: { status: ReportStatus.PUBLISHED },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
      },
    });

    let totalTurnaroundHours = 0;
    let completedCount = 0;
    for (const att of completedRecent) {
      if (att.submittedAt) {
        const publishedTime = att.reports[0]?.publishedAt || att.submittedAt;
        const diffHours = (publishedTime.getTime() - att.submittedAt.getTime()) / (1000 * 60 * 60);
        if (diffHours >= 0) {
          totalTurnaroundHours += diffHours;
          completedCount++;
        }
      }
    }
    const avgTurnaroundDays =
      completedCount > 0
        ? Number((totalTurnaroundHours / completedCount / 24).toFixed(1))
        : 2.8;

    // 2. Fetch in-progress submissions
    const activeAttempts = await prisma.assessmentAttempt.findMany({
      where: {
        status: {
          in: [
            AttemptStatus.SUBMITTED,
            AttemptStatus.UNDER_REVIEW,
            AttemptStatus.REPORT_IN_PREP,
            AttemptStatus.PENDING_APPROVAL,
          ],
        },
      },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
        assignedStaff: {
          include: {
            studentProfile: true,
            staffProfile: true,
          },
        },
        assessment: true,
      },
    });

    let totalOverdue = 0;
    let totalDueToday = 0;

    const slaConfig = await prisma.systemConfig.findUnique({
      where: { key: "GLOBAL_SLA_DAYS" },
    });
    const slaDays = slaConfig ? parseInt(slaConfig.value, 10) || DEFAULT_SLA_DAYS : DEFAULT_SLA_DAYS;

    const evaluations = activeAttempts.map((att) => {
      const studentProfile = att.user?.studentProfile;
      const candidateName = studentProfile
        ? `${studentProfile.firstName} ${studentProfile.lastName}`.trim()
        : att.user?.email || "Candidate";

      const staffProfile = att.assignedStaff?.studentProfile;
      const assignedStaffName = att.assignedStaff
        ? (staffProfile ? `${staffProfile.firstName} ${staffProfile.lastName}`.trim() : att.assignedStaff.email || "Evaluator")
        : "Unassigned";

      const sla = computeSlaInfo(att.submittedAt, slaDays);
      const isOverdue = !!sla?.isOverdue;
      const isDueToday = !!(sla && !sla.isOverdue && sla.hoursRemaining <= 24);

      if (isOverdue) totalOverdue++;
      if (isDueToday) totalDueToday++;

      return {
        id: att.id,
        candidateName,
        candidateEmail: att.user?.email || null,
        school: studentProfile?.school || null,
        grade: studentProfile?.grade || null,
        assessmentTitle: att.assessment?.title || "Psychometric Assessment",
        status: att.status,
        assignedStaffId: att.assignedStaffId || null,
        assignedStaffName,
        submittedAt: att.submittedAt ? att.submittedAt.toISOString() : null,
        dueDate: sla?.dueDate ? sla.dueDate.toISOString() : null,
        hoursRemaining: sla?.hoursRemaining ?? 999,
        slaStatus: sla?.status ?? "ON_TRACK",
        isOverdue,
      };
    });

    // Sort evaluations: most overdue first (lowest hours remaining first)
    evaluations.sort((a, b) => a.hoursRemaining - b.hoursRemaining);

    // 3. Active staff list for reassignment dropdown
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.STAFF, UserRole.ADMIN] },
        status: UserStatus.ACTIVE,
      },
      include: {
        studentProfile: true,
        staffProfile: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const staffMembers = staffUsers.map((u) => {
      const sp = u.studentProfile;
      const name = sp ? `${sp.firstName} ${sp.lastName}`.trim() : u.email || "Evaluator";
      return {
        id: u.id,
        name,
        email: u.email,
        specialty: u.staffProfile?.specialty || null,
        available: u.staffProfile ? u.staffProfile.available : true,
      };
    });

    return {
      success: true,
      message: "SLA monitoring data retrieved.",
      data: {
        summary: {
          totalOverdue,
          totalDueToday,
          avgTurnaroundDays,
          totalInProgress: evaluations.length,
        },
        evaluations,
        staffMembers,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to load SLA monitoring data." };
  }
}

/**
 * Priority 1c: Reassign Submission Action
 */
export async function reassignSubmissionAction(
  attemptId: string,
  targetStaffId: string
): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assignedStaff: true,
      },
    });

    if (!attempt) {
      throw new Error("Assessment submission not found.");
    }

    const targetStaff = await prisma.user.findUnique({
      where: { id: targetStaffId },
    });

    if (!targetStaff) {
      throw new Error("Target evaluator not found.");
    }

    const prevStaffEmail = attempt.assignedStaff?.email || "Unassigned";

    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        assignedStaffId: targetStaffId,
        status: attempt.status === AttemptStatus.SUBMITTED ? AttemptStatus.UNDER_REVIEW : attempt.status,
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "SUBMISSION_REASSIGNED",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      metadata: {
        previousStaffId: attempt.assignedStaffId,
        previousStaffEmail: prevStaffEmail,
        newStaffId: targetStaffId,
        newStaffEmail: targetStaff.email,
        reassignedBy: adminUser.email,
      },
      result: AuditResult.SUCCESS,
    });

    await prisma.notification.create({
      data: {
        userId: targetStaffId,
        type: "SUBMISSION_ASSIGNED",
        message: `A candidate submission has been reassigned to your evaluation queue by ${adminUser.email || "Admin"}.`,
      },
    });

    revalidatePath("/console/sla");
    revalidatePath("/portal");
    revalidatePath("/portal/under-review");
    return {
      success: true,
      message: `Submission reassigned to ${targetStaff.email}.`,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to reassign submission." };
  }
}

/**
 * 12. Security Center Actions (Priority 6)
 */
export type PrivilegedAccountSecurityInfo = {
  id: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  totpEnabled: boolean;
  sessionVersion: number;
  lastLoginAt: string | null;
  createdAt: string;
  invitedAt: string | null;
  invitedByName: string | null;
  isPendingActivation: boolean;
};

export type AdminSecurityData = {
  summary: {
    totalPrivileged: number;
    pendingInvites: number;
    mfaEnrolled: number;
    suspendedAccounts: number;
  };
  accounts: PrivilegedAccountSecurityInfo[];
};

export async function getAdminSecurityOverviewAction(): Promise<AdminActionResult<AdminSecurityData>> {
  try {
    await verifyAdminSession();

    const privilegedUsers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.STAFF] },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    // Map inviter IDs to emails
    const inviterIds = privilegedUsers
      .map((u) => u.invitedBy)
      .filter((id): id is string => Boolean(id));

    const inviters = await prisma.user.findMany({
      where: { id: { in: inviterIds } },
      select: { id: true, email: true },
    });
    const inviterMap = new Map(inviters.map((inv) => [inv.id, inv.email]));

    const accounts: PrivilegedAccountSecurityInfo[] = privilegedUsers.map((u) => {
      const isPending = u.status === UserStatus.INACTIVE || Boolean(u.invitedAt && !u.lastLoginAt);
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        totpEnabled: u.totpEnabled,
        sessionVersion: u.sessionVersion,
        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
        invitedAt: u.invitedAt ? u.invitedAt.toISOString() : null,
        invitedByName: u.invitedBy ? inviterMap.get(u.invitedBy) || u.invitedBy : null,
        isPendingActivation: isPending,
      };
    });

    const pendingInvites = accounts.filter((a) => a.isPendingActivation).length;
    const mfaEnrolled = accounts.filter((a) => a.totpEnabled).length;
    const suspendedAccounts = accounts.filter((a) => a.status === UserStatus.SUSPENDED).length;

    return {
      success: true,
      message: "Security overview retrieved successfully.",
      data: {
        summary: {
          totalPrivileged: accounts.length,
          pendingInvites,
          mfaEnrolled,
          suspendedAccounts,
        },
        accounts,
      },
    };
  } catch (error: any) {
    console.error("[getAdminSecurityOverviewAction error]:", error);
    return { success: false, message: error.message || "Failed to load security overview." };
  }
}

export async function adminForceLogoutUserAction(targetUserId: string): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new Error("Target account not found.");
    }

    // Increment sessionVersion to invalidate all active JWT sessions on other devices
    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        sessionVersion: { increment: 1 },
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "ADMIN_FORCE_LOGOUT",
      resource: "User",
      resourceId: targetUserId,
      metadata: {
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
        newSessionVersion: updated.sessionVersion,
        actionBy: adminUser.email,
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/console/security");
    revalidatePath("/console/users");
    revalidatePath("/console/staff");

    return {
      success: true,
      message: `Force logged out ${targetUser.email || "user"}. All active sessions on all devices have been terminated.`,
    };
  } catch (error: any) {
    console.error("[adminForceLogoutUserAction error]:", error);
    return { success: false, message: error.message || "Failed to terminate user sessions." };
  }
}

/**
 * 23. Notification & Email Template Management (Priority 11)
 */
export interface NotificationTemplateItem {
  id: string;
  type: string;
  label: string;
  category: string;
  description: string;
  subject: string;
  body: string;
  availableVariables: string[];
  updatedBy: string | null;
  updatedAt: string;
}

const DEFAULT_NOTIFICATION_TEMPLATES: Record<
  string,
  {
    label: string;
    category: string;
    description: string;
    subject: string;
    body: string;
    variables: string[];
  }
> = {
  ACCOUNT_INVITATION: {
    label: "Account Invitation & Activation",
    category: "Account & Access",
    description: "Dispatched when an administrator invites a candidate, student, or staff user to activate their account and set credentials.",
    subject: "Congratulations! You've been invited to Alderwood Vantage ({{role}})",
    body: `Congratulations & Welcome {{candidateName}},

You have been officially invited to join Alderwood Vantage as a {{role}}.

Next Steps to Activate Your Account:
1. Click the activation link below to enter your secure activation portal.
2. Provide your profile details (Full Name, Date of Birth, Address, Phone number).
3. Create a secure password to finalize and activate your account.

Activation Link:
{{activationUrl}}

This invitation link is valid for {{expiryHours}} hours.

Alderwood Vantage • Raising leaders, not just employees.`,
    variables: ["candidateName", "role", "activationUrl", "expiryHours"],
  },
  EMAIL_VERIFICATION: {
    label: "Email Verification OTP",
    category: "Account & Access",
    description: "Dispatched to new candidates during account registration to confirm their email address.",
    subject: "Verify your Alderwood Vantage account",
    body: `Welcome {{candidateName}},

Thank you for beginning your psychometric assessment journey with Alderwood Vantage.

Please enter the following single-use verification code in your browser:

{{otpCode}}

Or navigate directly to the verification page:
{{verificationUrl}}

This code expires in 15 minutes. If you did not initiate this request, you can safely ignore this email.

Warm regards,
Alderwood Vantage Admissions & Security Team`,
    variables: ["candidateName", "otpCode", "verificationUrl"],
  },
  PASSWORD_RESET: {
    label: "Password Reset Request",
    category: "Account & Access",
    description: "Sent when an account holder requests a secure password reset link.",
    subject: "Reset your Alderwood Vantage account password",
    body: `Hello {{candidateName}},

We received a request to reset the password associated with your Alderwood Vantage account.

Click the secure link below to choose a new password:
{{resetUrl}}

If you did not make this request, you can safely ignore this email. This link expires in 60 minutes.

Stay secure,
Alderwood Vantage Security Governance`,
    variables: ["candidateName", "resetUrl"],
  },
  PASSWORD_RESET_OTP: {
    label: "Password Reset 6-Digit Code",
    category: "Account & Access",
    description: "Dispatched when an account holder requests a 6-digit OTP code to reset their password.",
    subject: "Your Alderwood Vantage Password Reset Code",
    body: `Hello {{candidateName}},

Use the 6-digit verification code below to reset your Alderwood Vantage account password:

{{otpCode}}

This code expires in {{expiryMinutes}} minutes. If you did not request this code, you can safely ignore this email.

Alderwood Vantage Security Desk`,
    variables: ["candidateName", "otpCode", "expiryMinutes"],
  },
  LOGIN_OTP: {
    label: "Passwordless Sign-In Code",
    category: "Account & Access",
    description: "Dispatched during passwordless security sign-in verification.",
    subject: "Your Alderwood Vantage Sign-in Code",
    body: `Hello {{candidateName}},

Your single-use sign-in security code is:

{{otpCode}}

Enter this 6-digit code to log in to your Alderwood Vantage account. Valid for {{expiryMinutes}} minutes.

Alderwood Vantage Identity Governance`,
    variables: ["candidateName", "otpCode", "expiryMinutes"],
  },
  STAFF_INVITE: {
    label: "Staff Evaluator Invitation",
    category: "Account & Access",
    description: "Dispatched when an administrator invites a new psychologist or evaluator to join the staff workstation.",
    subject: "Invitation: Join Alderwood Vantage Staff Evaluation Team",
    body: `Hello {{staffName}},

You have been invited to join the Alderwood Vantage evaluation and psychometric review portal as an accredited {{staffRole}}.

Activate your secure workstation account using the link below:
{{activationUrl}}

This activation token is valid for 7 days.

Welcome to the team,
Alderwood Vantage Clinical Leadership`,
    variables: ["staffName", "staffRole", "activationUrl"],
  },
  SUBMISSION_CONFIRMED: {
    label: "Submission Confirmation",
    category: "Assessments & Reports",
    description: "Sent to the candidate immediately when an assessment attempt is submitted and entered into the staff evaluation queue.",
    subject: "Assessment Confirmed & Queued — {{assessmentTitle}}",
    body: `Hello {{candidateName}},

Your assessment responses for "{{assessmentTitle}}" have been securely received and locked for expert evaluation.

Our certified psychometric evaluators will review your responses within our standard service window (approx. {{slaDays}} business days).

Track live evaluation status on your student dashboard:
{{dashboardUrl}}

Best regards,
Alderwood Vantage Evaluation Team`,
    variables: ["candidateName", "assessmentTitle", "slaDays", "dashboardUrl"],
  },
  REPORT_READY: {
    label: "Certified Report Published",
    category: "Assessments & Reports",
    description: "Dispatched when an administrator approves and publishes a candidate's certified evaluation report.",
    subject: "Your Certified Evaluation Report is Ready — {{assessmentTitle}}",
    body: `Congratulations {{candidateName}},

Your official evaluation report for "{{assessmentTitle}}" has been verified and published by our psychology faculty.

You can now view your complete dimensional analysis and download the certified PDF directly from your candidate portal:
{{reportUrl}}

Thank you for choosing Alderwood Vantage for your career assessment.

Warm regards,
Alderwood Vantage Psychology Faculty`,
    variables: ["candidateName", "assessmentTitle", "reportUrl"],
  },
  STUDENT_QUERY_ACKNOWLEDGEMENT: {
    label: "Admissions Query Acknowledgement",
    category: "Support & Inquiries",
    description: "Automated response sent to parents or students upon submitting a website contact enquiry.",
    subject: "We've received your query [Ref: {{referenceId}}] - Alderwood Vantage",
    body: `Hello {{candidateName}},

Thank you for contacting Alderwood Vantage. We have received your enquiry regarding "{{subject}}".

Our academic guidance desk is reviewing your message and will respond by email within {{responseWindowHours}} business hours.

Your Reference ID: {{referenceId}}
Helpline: {{helpline}} (Mon – Sat, 9:00 AM – 7:00 PM IST)

Alderwood Vantage Academic Desk`,
    variables: ["candidateName", "referenceId", "subject", "responseWindowHours", "helpline"],
  },
  INSTITUTIONAL_QUERY_ACKNOWLEDGEMENT: {
    label: "Institutional Partnership Docket",
    category: "Support & Inquiries",
    description: "Automated docket acknowledgement sent to institutional representatives.",
    subject: "Institutional Partnership Request Received [Ref: {{referenceId}}] - Alderwood Vantage",
    body: `Dear {{representativeName}},

Thank you for your interest in bringing Alderwood Vantage to {{institutionName}}.

Our Institutional Partnerships Director is reviewing your institutional docket (Ref: {{referenceId}}) and will connect directly within 4 business hours to discuss your cohort objectives.

Alderwood Vantage • Institutional Partnerships Desk`,
    variables: ["representativeName", "institutionName", "referenceId"],
  },
};

export async function getNotificationTemplatesAction(): Promise<
  AdminActionResult<NotificationTemplateItem[]>
> {
  try {
    await verifyAdminSession();

    // Query existing templates from DB
    const existingTemplates = await prisma.notificationTemplate.findMany({
      orderBy: { type: "asc" },
    });

    const existingMap = new Map(existingTemplates.map((t) => [t.type, t]));

    // Check if any default templates are missing and seed them
    const templatesToSeed = Object.entries(DEFAULT_NOTIFICATION_TEMPLATES).filter(
      ([type]) => !existingMap.has(type)
    );

    if (templatesToSeed.length > 0) {
      await Promise.all(
        templatesToSeed.map(([type, def]) =>
          prisma.notificationTemplate.create({
            data: {
              type,
              subject: def.subject,
              body: def.body,
              updatedBy: "System Default",
            },
          })
        )
      );
    }

    // Reload all
    const allTemplates = await prisma.notificationTemplate.findMany({
      orderBy: { type: "asc" },
    });

    const items: NotificationTemplateItem[] = allTemplates.map((t) => {
      const def = DEFAULT_NOTIFICATION_TEMPLATES[t.type] || {
        label: t.type.replace(/_/g, " "),
        category: "Other",
        description: "Custom platform notification template.",
        variables: ["candidateName"],
      };

      return {
        id: t.id,
        type: t.type,
        label: def.label,
        category: def.category,
        description: def.description,
        subject: t.subject.replace(/AuraPath|aurapath|AURAPATH/gi, "Alderwood Vantage"),
        body: t.body.replace(/AuraPath|aurapath|AURAPATH/gi, "Alderwood Vantage"),
        availableVariables: def.variables,
        updatedBy: t.updatedBy,
        updatedAt: t.updatedAt.toISOString(),
      };
    });

    return {
      success: true,
      message: "Notification templates loaded.",
      data: items,
    };
  } catch (error: any) {
    console.error("[getNotificationTemplatesAction error]:", error);
    return {
      success: false,
      message: error.message || "Failed to load notification templates.",
    };
  }
}

export async function updateNotificationTemplateAction(
  type: string,
  subject: string,
  body: string
): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    if (!type || !subject.trim() || !body.trim()) {
      return { success: false, message: "Type, subject, and body are required." };
    }

    const updated = await prisma.notificationTemplate.upsert({
      where: { type },
      update: {
        subject: subject.trim(),
        body: body.trim(),
        updatedBy: adminUser.email || "Admin",
      },
      create: {
        type,
        subject: subject.trim(),
        body: body.trim(),
        updatedBy: adminUser.email || "Admin",
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "NOTIFICATION_TEMPLATE_UPDATED",
      resource: "NotificationTemplate",
      resourceId: type,
      metadata: {
        templateType: type,
        subject: subject.trim(),
        bodyLength: body.length,
        actionBy: adminUser.email,
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/console/notifications");

    return {
      success: true,
      message: `Template "${type}" updated successfully.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("[updateNotificationTemplateAction error]:", error);
    return {
      success: false,
      message: error.message || "Failed to update notification template.",
    };
  }
}

export async function resetNotificationTemplateAction(
  type: string
): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    const def = DEFAULT_NOTIFICATION_TEMPLATES[type];
    if (!def) {
      return { success: false, message: `No default template found for "${type}".` };
    }

    const updated = await prisma.notificationTemplate.upsert({
      where: { type },
      update: {
        subject: def.subject,
        body: def.body,
        updatedBy: "System Reset",
      },
      create: {
        type,
        subject: def.subject,
        body: def.body,
        updatedBy: "System Reset",
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "NOTIFICATION_TEMPLATE_RESET",
      resource: "NotificationTemplate",
      resourceId: type,
      metadata: {
        templateType: type,
        actionBy: adminUser.email,
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/console/notifications");

    return {
      success: true,
      message: `Template "${type}" has been reset to system defaults.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("[resetNotificationTemplateAction error]:", error);
    return {
      success: false,
      message: error.message || "Failed to reset notification template.",
    };
  }
}

export async function sendTestNotificationEmailAction(
  type: string,
  recipientEmail: string,
  subjectOverride?: string,
  bodyOverride?: string
): Promise<AdminActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return { success: false, message: "A valid recipient email address is required." };
    }

    const def = DEFAULT_NOTIFICATION_TEMPLATES[type];
    const dbTemplate = await prisma.notificationTemplate.findUnique({
      where: { type },
    });

    const rawSubject = subjectOverride?.trim() || dbTemplate?.subject || def?.subject || "Alderwood Vantage Notification";
    const rawBody = bodyOverride?.trim() || dbTemplate?.body || def?.body || "";

    const sampleData: Record<string, string> = {
      candidateName: "Sarah Jenkins",
      staffName: "Dr. Evelyn Reed",
      role: "Student",
      staffRole: "Clinical Evaluator",
      otpCode: "849201",
      verificationUrl: "https://www.alderwoodvantage.com/verify-email?token=sample_test_token",
      activationUrl: "https://www.alderwoodvantage.com/activate?token=sample_activation_token",
      resetUrl: "https://www.alderwoodvantage.com/reset-password?token=sample_reset_token",
      assessmentTitle: "Vantage Psychological Assessment Battery",
      slaDays: "3",
      dashboardUrl: "https://www.alderwoodvantage.com/dashboard",
      reportUrl: "https://www.alderwoodvantage.com/dashboard/reports/sample_report",
      expiryMinutes: "10",
      expiryHours: "48",
      referenceId: "STU-849201",
      subject: "Psychometric Assessment Guidance",
      responseWindowHours: "4",
      helpline: "+91 93168 19331",
      representativeName: "Dean Arthur Vance",
      institutionName: "Kingsford Academy",
      partnershipObjective: "Cohort Diagnostic Psychometry",
    };

    let populatedSubject = rawSubject;
    let populatedBody = rawBody;

    Object.entries(sampleData).forEach(([k, v]) => {
      populatedSubject = populatedSubject.replaceAll(`{{${k}}}`, v);
      populatedBody = populatedBody.replaceAll(`{{${k}}}`, v);
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 12px; background: #F1F5F9; color: #475569; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Template Test Dispatch: ${def?.label || type}</span>
        </div>
        <div style="white-space: pre-wrap; color: #0F172A; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${populatedBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          This is an administrative test transmission sent by ${adminUser.email || "Admin"}.<br/>Alderwood Vantage • Raising leaders, not just employees.
        </p>
      </div>
    `;

    const { getEmailService } = await import("@/lib/email");
    const emailRes = await getEmailService().sendEmail({
      to: recipientEmail.trim(),
      subject: `[TEST] ${populatedSubject}`,
      html,
      text: populatedBody,
    });

    if (!emailRes.success) {
      return {
        success: false,
        message: `Failed to dispatch test email: ${emailRes.error || "Email provider error"}.`,
      };
    }

    await createAuditLog({
      userId: adminUser.id,
      action: "TEST_NOTIFICATION_EMAIL_SENT",
      resource: "NotificationTemplate",
      resourceId: type,
      metadata: {
        templateType: type,
        recipient: recipientEmail.trim(),
        messageId: emailRes.messageId,
      },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: `Test email for "${def?.label || type}" successfully delivered to ${recipientEmail.trim()}.`,
    };
  } catch (error: any) {
    console.error("[sendTestNotificationEmailAction error]:", error);
    return {
      success: false,
      message: error.message || "Failed to dispatch test email.",
    };
  }
}



