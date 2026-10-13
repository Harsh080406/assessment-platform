"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { StorageService } from "@/lib/storage";
import { AttemptStatus, AuditResult, ReportStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEFAULT_SLA_DAYS } from "@/lib/sla";
import { toStaffSectionDTO } from "@/lib/serializers/assessment";

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
    needsRevision: number;
    total: number;
    myAssigned: number;
    myOverdue: number;
  }>
> {
  try {
    const user = await verifyStaffSession();

    const [submitted, underReview, reportInPrep, pendingApproval, published, needsRevision, total, myActiveAttempts] =
      await Promise.all([
        prisma.assessmentAttempt.count({ where: { status: AttemptStatus.SUBMITTED } }),
        prisma.assessmentAttempt.count({ where: { status: AttemptStatus.UNDER_REVIEW } }),
        prisma.assessmentAttempt.count({ where: { status: AttemptStatus.REPORT_IN_PREP } }),
        prisma.assessmentAttempt.count({ where: { status: AttemptStatus.PENDING_APPROVAL } }),
        prisma.assessmentAttempt.count({ where: { status: AttemptStatus.PUBLISHED } }),
        prisma.report.count({ where: { status: ReportStatus.REJECTED } }),
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
        prisma.assessmentAttempt.findMany({
          where: {
            assignedStaffId: user.id,
            status: {
              in: [
                AttemptStatus.SUBMITTED,
                AttemptStatus.UNDER_REVIEW,
                AttemptStatus.REPORT_IN_PREP,
              ],
            },
          },
          select: { submittedAt: true },
        }),
      ]);

    const myAssigned = myActiveAttempts.length;
    const now = Date.now();
    const slaMs = DEFAULT_SLA_DAYS * 24 * 60 * 60 * 1000;
    const myOverdue = myActiveAttempts.filter(
      (a) => a.submittedAt && now - a.submittedAt.getTime() > slaMs
    ).length;

    return {
      success: true,
      message: "Staff queue statistics retrieved.",
      data: {
        submitted,
        underReview,
        reportInPrep,
        pendingApproval,
        published,
        needsRevision,
        total,
        myAssigned,
        myOverdue,
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
        assignedStaff: {
          select: {
            id: true,
            email: true,
            role: true,
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
        assignedStaffId: att.assignedStaffId || null,
        assignedStaffName: att.assignedStaff ? (att.assignedStaff.email || "Evaluator") : null,
        reportsCount: att.reports?.length || 0,
        latestReportStatus: latestReport?.status || null,
        latestReportId: latestReport?.id || null,
        fileReference: latestReport?.fileReference || null,
        publishedAt: latestReport?.publishedAt ? latestReport.publishedAt.toISOString() : (att.submittedAt ? att.submittedAt.toISOString() : null),
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
 * Claim an unassigned submission (Priority 1b)
 */
export async function claimSubmissionAction(
  attemptId: string
): Promise<StaffActionResult<{ assignedStaffName: string }>> {
  try {
    const user = await verifyStaffSession();

    const existing = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assignedStaff: true,
      },
    });

    if (!existing) {
      return { success: false, message: "Submission not found." };
    }

    // Check evaluator availability setting
    const profile = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile && !profile.available) {
      return {
        success: false,
        message: "You are currently marked as Unavailable for new assignments in your settings. Please update your status to Available to claim submissions.",
      };
    }

    if (existing.assignedStaffId && existing.assignedStaffId !== user.id) {
      const assignedName = existing.assignedStaff?.email || "another evaluator";
      return {
        success: false,
        message: `Already claimed by ${assignedName}. Please refresh the queue.`,
      };
    }

    // Atomically claim if unassigned or already assigned to self
    const updated = await prisma.assessmentAttempt.updateMany({
      where: {
        id: attemptId,
        OR: [{ assignedStaffId: null }, { assignedStaffId: user.id }],
      },
      data: {
        assignedStaffId: user.id,
        status: existing.status === AttemptStatus.SUBMITTED ? AttemptStatus.UNDER_REVIEW : existing.status,
      },
    });

    if (updated.count === 0) {
      return {
        success: false,
        message: "Another evaluator just claimed this submission.",
      };
    }

    await createAuditLog({
      userId: user.id,
      action: "SUBMISSION_ASSIGNED",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      metadata: { actorRole: user.role, assignedTo: user.email },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/under-review");
    revalidatePath("/console/sla");

    return {
      success: true,
      message: "Submission claimed successfully.",
      data: { assignedStaffName: user.name || user.email || "You" },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to claim submission." };
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

    const sections = (attempt.assessment?.sections || []).map((sec) =>
      toStaffSectionDTO(sec, responseMap)
    );

    const reports = (attempt.reports || []).map((rep) => ({
      id: rep.id,
      version: rep.version,
      status: rep.status,
      rejectionReason: rep.rejectionReason || null,
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
          bio: profile?.bio || null,
          dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
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
    revalidatePath(`/portal/needs-revision`);
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

/**
 * Priority 2a: Get Needs Revision Queue items
 */
export async function getStaffNeedsRevisionAction(): Promise<
  StaffActionResult<{
    items: Array<{
      attemptId: string;
      candidateName: string;
      candidateEmail: string | null;
      school: string | null;
      grade: string | null;
      assessmentTitle: string;
      assessmentVersion: number;
      assignedStaffName: string;
      originalEvaluator: string;
      rejectionReason: string;
      submittedAt: string | null;
      rejectedAt: string;
      daysSinceRejection: number;
      reportId: string;
      fileReference: string;
    }>;
  }>
> {
  try {
    await verifyStaffSession();

    const rejectedReports = await prisma.report.findMany({
      where: {
        status: ReportStatus.REJECTED,
      },
      include: {
        attempt: {
          include: {
            user: {
              include: {
                studentProfile: true,
              },
            },
            assignedStaff: {
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

    const now = Date.now();
    const items = rejectedReports.map((rep) => {
      const studentProfile = rep.attempt.user?.studentProfile;
      const candidateName = studentProfile
        ? `${studentProfile.firstName} ${studentProfile.lastName}`.trim()
        : rep.attempt.user?.email || "Candidate";

      const staffProfile = rep.attempt.assignedStaff?.studentProfile;
      const assignedStaffName = rep.attempt.assignedStaff
        ? (staffProfile ? `${staffProfile.firstName} ${staffProfile.lastName}`.trim() : rep.attempt.assignedStaff.email || "Staff")
        : "Unassigned";

      const diffMs = now - rep.uploadedAt.getTime();
      const daysSinceRejection = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      return {
        attemptId: rep.attemptId,
        candidateName,
        candidateEmail: rep.attempt.user?.email || null,
        school: studentProfile?.school || null,
        grade: studentProfile?.grade || null,
        assessmentTitle: rep.attempt.assessment?.title || "Psychometric Assessment",
        assessmentVersion: rep.attempt.assessmentVersion,
        assignedStaffName,
        originalEvaluator: rep.uploadedBy || assignedStaffName,
        rejectionReason: rep.rejectionReason || "Report requires revision before admin signoff.",
        submittedAt: rep.attempt.submittedAt ? rep.attempt.submittedAt.toISOString() : null,
        rejectedAt: rep.uploadedAt.toISOString(),
        daysSinceRejection,
        reportId: rep.id,
        fileReference: rep.fileReference,
      };
    });

    return {
      success: true,
      message: "Needs revision items loaded.",
      data: { items },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to load revision queue." };
  }
}

/**
 * 12. Staff Self-Service Actions (Priority 8)
 */
export type StaffSelfSettingsData = {
  staffId: string;
  specialty: string;
  available: boolean;
  emailNotifications: boolean;
  slaAlerts: boolean;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  status: string;
  memberSince: string;
  lastLoginAt: string | null;
};

export async function getStaffSelfSettingsAction(): Promise<StaffActionResult<StaffSelfSettingsData>> {
  try {
    const user = await verifyStaffSession();

    const [dbUser, profileRaw, pref, slaPref] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.staffProfile.findUnique({
        where: { userId: user.id },
      }),
      prisma.notificationPreference.findUnique({
        where: {
          userId_category: {
            userId: user.id,
            category: "STAFF_ASSIGNMENTS",
          },
        },
      }),
      prisma.notificationPreference.findUnique({
        where: {
          userId_category: {
            userId: user.id,
            category: "STAFF_SLA_ALERTS",
          },
        },
      }),
    ]);

    let profile = profileRaw;
    if (!profile) {
      profile = await prisma.staffProfile.create({
        data: {
          userId: user.id,
          specialty: "Psychometric Career Counselor",
          available: true,
          active: true,
        },
      });
    }

    return {
      success: true,
      message: "Settings loaded.",
      data: {
        staffId: dbUser?.id || user.id,
        specialty: profile.specialty || "Psychometric Career Counselor",
        available: profile.available,
        emailNotifications: pref ? pref.emailEnabled : true,
        slaAlerts: slaPref ? slaPref.emailEnabled : true,
        email: dbUser?.email || user.email || null,
        phone: dbUser?.phone || null,
        name: user.name || dbUser?.email?.split("@")[0] || "Staff Evaluator",
        role: dbUser?.role || user.role || "STAFF",
        status: dbUser?.status || "ACTIVE",
        memberSince: dbUser?.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
        lastLoginAt: dbUser?.lastLoginAt ? dbUser.lastLoginAt.toISOString() : null,
      },
    };
  } catch (error: any) {
    console.error("[getStaffSelfSettingsAction error]:", error);
    return { success: false, message: error.message || "Failed to load staff settings." };
  }
}

export async function updateStaffSelfSettingsAction(data: {
  phone?: string | null;
  specialty: string;
  available: boolean;
  emailNotifications: boolean;
  slaAlerts?: boolean;
}): Promise<StaffActionResult> {
  try {
    const user = await verifyStaffSession();

    if (data.phone !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: data.phone?.trim() || null,
        },
      });
    }

    await prisma.staffProfile.upsert({
      where: { userId: user.id },
      update: {
        specialty: data.specialty.trim(),
        available: data.available,
      },
      create: {
        userId: user.id,
        specialty: data.specialty.trim(),
        available: data.available,
        active: true,
      },
    });

    await prisma.notificationPreference.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category: "STAFF_ASSIGNMENTS",
        },
      },
      update: {
        emailEnabled: data.emailNotifications,
      },
      create: {
        userId: user.id,
        category: "STAFF_ASSIGNMENTS",
        emailEnabled: data.emailNotifications,
      },
    });

    if (data.slaAlerts !== undefined) {
      await prisma.notificationPreference.upsert({
        where: {
          userId_category: {
            userId: user.id,
            category: "STAFF_SLA_ALERTS",
          },
        },
        update: {
          emailEnabled: data.slaAlerts,
        },
        create: {
          userId: user.id,
          category: "STAFF_SLA_ALERTS",
          emailEnabled: data.slaAlerts,
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "STAFF_PROFILE_UPDATED",
      resource: "StaffProfile",
      resourceId: user.id,
      metadata: {
        specialty: data.specialty,
        available: data.available,
        emailNotifications: data.emailNotifications,
        phone: data.phone,
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/settings");
    revalidatePath("/console/staff");
    revalidatePath("/console/sla");

    return {
      success: true,
      message: "Staff profile and workstation settings updated successfully.",
    };
  } catch (error: any) {
    console.error("[updateStaffSelfSettingsAction error]:", error);
    return { success: false, message: error.message || "Failed to update staff settings." };
  }
}

export type StaffAlertItem = {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export async function getStaffAlertsAction(): Promise<{
  success: boolean;
  alerts: StaffAlertItem[];
  unreadCount: number;
  message?: string;
}> {
  try {
    const user = await verifyStaffSession();

    const [alerts, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          readAt: null,
        },
      }),
    ]);

    return {
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        readAt: a.readAt ? a.readAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch (error) {
    return {
      success: false,
      alerts: [],
      unreadCount: 0,
      message: error instanceof Error ? error.message : "Failed to load alerts.",
    };
  }
}

export async function markStaffAlertReadAction(alertId: string): Promise<StaffActionResult> {
  try {
    const user = await verifyStaffSession();

    await prisma.notification.updateMany({
      where: {
        id: alertId,
        userId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/portal");

    return { success: true, message: "Alert marked as read." };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update alert." };
  }
}

export async function markAllStaffAlertsReadAction(): Promise<StaffActionResult> {
  try {
    const user = await verifyStaffSession();

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/portal");

    return { success: true, message: "All alerts marked as read." };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to mark alerts read." };
  }
}


