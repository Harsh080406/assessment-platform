import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "./assessment.service.js";
import { prisma } from "../../lib/prisma.js";
import {
  SaveResponseSchema,
  SubmitAssessmentSchema,
  StartAssessmentSchema,
} from "@aurapath/shared";
import { AttemptStatus } from "@prisma/client";

export class AssessmentController {
  /**
   * Diagnostic static questions for fast intake
   */
  public static getQuestions(req: Request, res: Response, next: NextFunction): void {
    try {
      const stage = (req.query.stage as string) || "11-12";
      const questions = AssessmentService.getQuestions(stage);
      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start or Resume Assessment Attempt (Pins assessmentVersion)
   */
  public static async startOrResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = StartAssessmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }

      const userId = (req as any).user?.id || req.body.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "User authentication required." });
        return;
      }

      const assessmentId = parsed.data.assessmentId;

      const assessment = assessmentId
        ? await prisma.assessment.findUnique({
            where: { id: assessmentId, status: "ACTIVE" },
          })
        : await prisma.assessment.findFirst({
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
          });

      if (!assessment) {
        res.status(404).json({ success: false, message: "No active assessment found." });
        return;
      }

      // Check for existing unsubmitted attempt (Resume logic)
      const existingAttempt = await prisma.assessmentAttempt.findFirst({
        where: {
          userId,
          assessmentId: assessment.id,
          status: { in: [AttemptStatus.IN_PROGRESS, AttemptStatus.NOT_STARTED] },
        },
        orderBy: { startedAt: "desc" },
      });

      if (existingAttempt) {
        res.status(200).json({
          success: true,
          message: "Resumed active assessment attempt.",
          data: { attemptId: existingAttempt.id, resumed: true },
        });
        return;
      }

      // Create new attempt pinning assessmentVersion
      const newAttempt = await prisma.assessmentAttempt.create({
        data: {
          userId,
          assessmentId: assessment.id,
          assessmentVersion: assessment.version,
          status: AttemptStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });

      res.status(201).json({
        success: true,
        message: "New assessment attempt initialized.",
        data: { attemptId: newAttempt.id, resumed: false },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Attempt Details, Sections, Questions, and Existing Responses
   */
  public static async getAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = String(req.params.id);
      if (!attemptId) {
        res.status(400).json({ success: false, message: "Attempt ID parameter required." });
        return;
      }

      const attempt: any = await prisma.assessmentAttempt.findUnique({
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
                      options: { orderBy: { displayOrder: "asc" } },
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
        res.status(404).json({ success: false, message: "Attempt not found." });
        return;
      }

      const isLocked = attempt.status === AttemptStatus.SUBMITTED;

      const savedResponses: Record<string, { answer: any; questionVersion: number; answeredAt: Date }> = {};
      if (attempt.responses && Array.isArray(attempt.responses)) {
        attempt.responses.forEach((resp: any) => {
          savedResponses[resp.questionId] = {
            answer: resp.answer,
            questionVersion: resp.questionVersion,
            answeredAt: resp.answeredAt,
          };
        });
      }

      res.status(200).json({
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
          assessment: attempt.assessment
            ? {
                id: attempt.assessment.id,
                title: attempt.assessment.title,
                description: attempt.assessment.description,
                version: attempt.assessment.version,
                estimatedDurationMins: attempt.assessment.estimatedDurationMins,
                sections: attempt.assessment.sections,
              }
            : null,
          savedResponses,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Auto-save Response with Server Lock Enforcement & Question Version Pinning
   */
  public static async saveResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = SaveResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }

      const { attemptId, questionId, answer } = parsed.data;

      const attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: attemptId },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: "Attempt not found." });
        return;
      }

      // Lock enforcement: reject if submitted
      if (attempt.status === AttemptStatus.SUBMITTED) {
        res.status(403).json({
          success: false,
          message: "Attempt is submitted and locked. Modifications are rejected.",
          locked: true,
        });
        return;
      }

      // Pin exact question version
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        res.status(404).json({ success: false, message: "Question not found." });
        return;
      }

      const questionVersion = question.version;

      const responseRecord = await prisma.response.upsert({
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

      res.status(200).json({
        success: true,
        message: "Response saved.",
        data: { answeredAt: responseRecord.answeredAt },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Assessment Attempt (Permanent Lock)
   */
  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = SubmitAssessmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }

      const { attemptId } = parsed.data;

      const attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: attemptId },
        include: { responses: true },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: "Attempt not found." });
        return;
      }

      if (attempt.status === AttemptStatus.SUBMITTED) {
        res.status(200).json({
          success: true,
          message: "Assessment was already submitted.",
          locked: true,
        });
        return;
      }

      await prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      res.status(200).json({
        success: true,
        message: "Assessment submitted successfully and locked for expert evaluation.",
        locked: true,
      });
    } catch (error) {
      next(error);
    }
  }
}
