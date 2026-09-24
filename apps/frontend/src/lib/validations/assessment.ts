import { z } from "zod";

export const SaveResponseSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  questionVersion: z.number().int().positive().default(1),
  answer: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.record(z.string(), z.unknown()),
  ]),
});

export type SaveResponseInput = z.infer<typeof SaveResponseSchema>;

export const SubmitAssessmentSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
});

export type SubmitAssessmentInput = z.infer<typeof SubmitAssessmentSchema>;

export const StartAssessmentSchema = z.object({
  assessmentId: z.string().optional(),
});

export type StartAssessmentInput = z.infer<typeof StartAssessmentSchema>;

export const UpdateAttemptStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "REPORT_IN_PREP",
    "PENDING_APPROVAL",
    "PUBLISHED",
  ]),
});

export type UpdateAttemptStatusInput = z.infer<typeof UpdateAttemptStatusSchema>;

export const SaveExpertNotesSchema = z.object({
  notes: z.string().optional(),
});

export type SaveExpertNotesInput = z.infer<typeof SaveExpertNotesSchema>;
