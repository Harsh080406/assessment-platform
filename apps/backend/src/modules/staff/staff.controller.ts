import { Request, Response, NextFunction } from "express";
import { StaffService } from "./staff.service.js";
import { UpdateAttemptStatusSchema } from "@aurapath/shared";

export class StaffController {
  /**
   * Get queue counts for staff dashboard
   */
  public static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await StaffService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List submissions with filters
   */
  public static async getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await StaffService.getSubmissions({ status, search, page, limit });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get submission inspection detail
   */
  public static async getSubmissionDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = String(req.params.attemptId);
      if (!attemptId) {
        res.status(400).json({ success: false, message: "Attempt ID is required." });
        return;
      }

      const actorUserId = req.user?.id || "anonymous-staff";
      const ipAddress = req.ip || req.socket.remoteAddress;

      const detail = await StaffService.getSubmissionDetail(attemptId, actorUserId, ipAddress);
      if (!detail) {
        res.status(404).json({ success: false, message: "Submission not found." });
        return;
      }

      res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update status transition (e.g. SUBMITTED -> UNDER_REVIEW -> REPORT_IN_PREP)
   */
  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = String(req.params.attemptId);
      if (!attemptId) {
        res.status(400).json({ success: false, message: "Attempt ID is required." });
        return;
      }

      const parsed = UpdateAttemptStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }

      const actorUserId = req.user?.id || "anonymous-staff";
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await StaffService.updateAttemptStatus(attemptId, parsed.data.status, actorUserId, ipAddress);
      res.status(200).json({
        success: true,
        message: `Attempt status transitioned to ${result.status}`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update attempt status." });
    }
  }

  /**
   * Upload diagnostic report PDF for a student attempt
   */
  public static async uploadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = String(req.params.attemptId);
      if (!attemptId) {
        res.status(400).json({ success: false, message: "Attempt ID is required." });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: "PDF report file is required." });
        return;
      }

      const actorUserId = req.user?.id || "anonymous-staff";
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await StaffService.uploadReport(
        attemptId,
        req.file.buffer,
        req.file.originalname,
        actorUserId,
        ipAddress
      );

      res.status(201).json({
        success: true,
        message: "Diagnostic report uploaded successfully. Status moved to PENDING_APPROVAL.",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to upload report." });
    }
  }
}
