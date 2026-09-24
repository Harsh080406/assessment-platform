"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  SaveResponseSchema,
  SaveResponseInput,
  SubmitAssessmentSchema,
  StartAssessmentSchema,
} from "@/lib/validations/assessment";
import { AssessmentStatus, AttemptStatus, AuditResult, UserRole } from "@prisma/client";

export type AssessmentActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  locked?: boolean;
};

/**
 * 1. Start or Resume an Assessment Attempt
 * If an in-progress attempt exists for the student and assessment, resume it.
 * Otherwise, initialize a new attempt pinning assessmentVersion.
 */
export async function startOrResumeAssessmentAction(
  assessmentId?: string
): Promise<AssessmentActionResult<{ attemptId: string; resumed: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Please sign in to take the assessment." };
    }

    const userId = session.user.id;

    // Find the requested active assessment or the default active one
    const assessment = assessmentId
      ? await prisma.assessment.findUnique({
          where: { id: assessmentId, status: AssessmentStatus.ACTIVE },
        })
      : await prisma.assessment.findFirst({
          where: { status: AssessmentStatus.ACTIVE },
          orderBy: { createdAt: "desc" },
        });

    if (!assessment) {
      return { success: false, message: "No active assessment found." };
    }

    // Check for existing in-progress / unsubmitted attempt (Rule 5: Resume)
    const existingAttempt = await prisma.assessmentAttempt.findFirst({
      where: {
        userId,
        assessmentId: assessment.id,
        status: {
          in: [AttemptStatus.IN_PROGRESS, AttemptStatus.NOT_STARTED],
        },
      },
      orderBy: { startedAt: "desc" },
    });

    if (existingAttempt) {
      await createAuditLog({
        userId,
        action: "ASSESSMENT_RESUME",
        resource: "AssessmentAttempt",
        resourceId: existingAttempt.id,
        metadata: { assessmentId: assessment.id, version: existingAttempt.assessmentVersion },
        result: AuditResult.SUCCESS,
      });

      return {
        success: true,
        message: "Resuming existing in-progress assessment attempt.",
        data: { attemptId: existingAttempt.id, resumed: true },
      };
    }

    // Create a new AssessmentAttempt pinning assessmentVersion (Rule 1 & Rule 3)
    const newAttempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId: assessment.id,
        assessmentVersion: assessment.version,
        status: AttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    await createAuditLog({
      userId,
      action: "ASSESSMENT_START",
      resource: "AssessmentAttempt",
      resourceId: newAttempt.id,
      metadata: { assessmentId: assessment.id, version: assessment.version },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "New assessment attempt initialized.",
      data: { attemptId: newAttempt.id, resumed: false },
    };
  } catch (error) {
    console.error("[startOrResumeAssessmentAction error]:", error);
    return { success: false, message: "Failed to initialize assessment session." };
  }
}

/**
 * 2. Get Assessment Attempt Data (Sections, Questions, Existing Responses)
 */
export async function getAssessmentAttemptData(attemptId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                questions: {
                  orderBy: { displayOrder: "asc" },
                  include: {
                    options: {
                      orderBy: { displayOrder: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!attempt) {
      return { success: false, message: "Assessment attempt not found." };
    }

    // Ownership check (Students can only see their own attempt; Staff/Admin can view)
    if (attempt.userId !== userId && userRole !== UserRole.STAFF && userRole !== UserRole.ADMIN) {
      return { success: false, message: "You do not have permission to view this assessment attempt." };
    }

    const isLocked =
      attempt.status === AttemptStatus.SUBMITTED ||
      attempt.status === AttemptStatus.UNDER_REVIEW ||
      attempt.status === AttemptStatus.REPORT_IN_PREP ||
      attempt.status === AttemptStatus.PENDING_APPROVAL ||
      attempt.status === AttemptStatus.PUBLISHED;

    // Convert responses to a map of questionId -> answer
    const savedResponses: Record<string, { answer: any; questionVersion: number; answeredAt: Date }> = {};
    attempt.responses.forEach((resp) => {
      savedResponses[resp.questionId] = {
        answer: resp.answer,
        questionVersion: resp.questionVersion,
        answeredAt: resp.answeredAt,
      };
    });

    return {
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          status: attempt.status,
          assessmentVersion: attempt.assessmentVersion,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          isLocked,
        },
        assessment: {
          id: attempt.assessment.id,
          title: attempt.assessment.title,
          description: attempt.assessment.description,
          version: attempt.assessment.version,
          estimatedDurationMins: attempt.assessment.estimatedDurationMins,
          sections: attempt.assessment.sections,
        },
        savedResponses,
      },
    };
  } catch (error) {
    console.error("[getAssessmentAttemptData error]:", error);
    return { success: false, message: "Failed to load assessment data." };
  }
}

/**
 * 3. Auto-save Response (Debounced write to Response pinning questionVersion)
 * Enforces server-side lock: strictly rejects writes if status is SUBMITTED.
 */
export async function saveResponseAction(
  input: SaveResponseInput
): Promise<AssessmentActionResult<{ answeredAt: Date }>> {
  try {
    const validated = SaveResponseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, message: "Invalid response payload." };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const { attemptId, questionId, answer } = validated.data;

    // 1. Fetch Attempt & Verify Ownership
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return { success: false, message: "Assessment attempt not found." };
    }

    if (attempt.userId !== session.user.id) {
      return { success: false, message: "Unauthorized attempt modification." };
    }

    // 2. SERVER-SIDE LOCK ENFORCEMENT (Rule 5 & Rule 7)
    // If status is SUBMITTED or beyond, no further writes are accepted.
    if (
      attempt.status === AttemptStatus.SUBMITTED ||
      attempt.status === AttemptStatus.UNDER_REVIEW ||
      attempt.status === AttemptStatus.REPORT_IN_PREP ||
      attempt.status === AttemptStatus.PENDING_APPROVAL ||
      attempt.status === AttemptStatus.PUBLISHED
    ) {
      await createAuditLog({
        userId: session.user.id,
        action: "RESPONSE_WRITE_REJECTED",
        resource: "AssessmentAttempt",
        resourceId: attemptId,
        metadata: { questionId, attemptStatus: attempt.status, reason: "Attempt is submitted and locked" },
        result: AuditResult.FAILURE,
      });

      return {
        success: false,
        message: "Attempt is locked after submission. No further changes can be recorded.",
        locked: true,
      };
    }

    // 3. Fetch Question to pin exact questionVersion (Rule 1 & Rule 3)
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return { success: false, message: "Question not found." };
    }

    const questionVersion = question.version;

    // 4. Upsert Response record keyed on (attemptId, questionId)
    const response = await prisma.response.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        answer: answer as any,
        questionVersion,
        answeredAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        questionVersion,
        answer: answer as any,
        answeredAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Response saved.",
      data: { answeredAt: response.answeredAt },
    };
  } catch (error) {
    console.error("[saveResponseAction error]:", error);
    return { success: false, message: "Failed to save response." };
  }
}

/**
 * 4. Submit Assessment Attempt
 * Changes status to SUBMITTED and permanently locks the attempt.
 */
export async function submitAssessmentAction(
  input: { attemptId: string }
): Promise<AssessmentActionResult> {
  try {
    const validated = SubmitAssessmentSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, message: "Invalid attempt identifier." };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const { attemptId } = validated.data;

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: true,
        assessment: {
          include: {
            sections: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return { success: false, message: "Attempt not found." };
    }

    if (attempt.userId !== session.user.id) {
      return { success: false, message: "Unauthorized submission." };
    }

    if (attempt.status === AttemptStatus.SUBMITTED) {
      return {
        success: true,
        message: "Assessment was already submitted.",
        locked: true,
      };
    }

    // Update status to SUBMITTED and record submittedAt timestamp
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    // Create Audit Log entry (Rule 7)
    await createAuditLog({
      userId: session.user.id,
      action: "ASSESSMENT_SUBMIT",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      metadata: {
        assessmentId: attempt.assessmentId,
        assessmentVersion: attempt.assessmentVersion,
        responseCount: attempt.responses.length,
      },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "Assessment submitted successfully! Your responses have been locked for human expert evaluation.",
      locked: true,
    };
  } catch (error) {
    console.error("[submitAssessmentAction error]:", error);
    return { success: false, message: "Failed to submit assessment." };
  }
}
