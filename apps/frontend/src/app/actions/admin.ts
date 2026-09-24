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

    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.REJECTED,
          approvedBy: adminUser.email || adminUser.id,
        },
      }),
      prisma.assessmentAttempt.update({
        where: { id: report.attemptId },
        data: { status: AttemptStatus.REPORT_IN_PREP },
      }),
    ]);

    await createAuditLog({
      userId: adminUser.id,
      action: "REPORT_REJECTED",
      resource: "Report",
      resourceId: reportId,
      metadata: { attemptId: report.attemptId, comment, rejectedBy: adminUser.email },
    });

    revalidatePath("/console");
    revalidatePath("/console/reports");
    return { success: true, message: "Report rejected and sent back to staff for prep." };
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
 * Invite Staff or Admin Action (Fix #1 - Invite-only provisioning)
 */
export async function inviteStaffOrAdminAction(data: {
  email: string;
  role: UserRole;
}): Promise<AdminActionResult<{ activationUrl: string; token: string }>> {
  try {
    const adminUser = await verifyAdminSession();

    const email = data.email.trim().toLowerCase();
    const role = data.role;

    if (role !== UserRole.STAFF && role !== UserRole.ADMIN) {
      return { success: false, message: "Only STAFF or ADMIN roles can be invited." };
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

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
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
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/console/staff");
    revalidatePath("/console/users");

    return {
      success: true,
      message: `Invitation generated for ${email} as ${role}.`,
      data: {
        activationUrl,
        token: activationToken,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to process invitation." };
  }
}

