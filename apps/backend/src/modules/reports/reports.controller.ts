import { Request, Response, NextFunction } from "express";
import { ReportsService } from "./reports.service.js";
import { StorageService } from "../../lib/storage.js";

export class ReportsController {
  public static getSampleReport(_req: Request, res: Response, next: NextFunction): void {
    try {
      const report = ReportsService.generateSampleParentReport();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Secure stream for signed report URLs
   */
  public static async downloadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ref, exp, sig } = req.query as { ref?: string; exp?: string; sig?: string };

      if (!ref || !exp || !sig) {
        res.status(400).json({ success: false, message: "Missing signed URL parameters." });
        return;
      }

      const isValid = StorageService.verifySignedUrl(ref, exp, sig);
      if (!isValid) {
        res.status(403).json({ success: false, message: "Signed download link is invalid or has expired." });
        return;
      }

      const fileBuffer = await StorageService.getReportBuffer(ref);
      if (!fileBuffer) {
        res.status(404).json({ success: false, message: "Report file not found." });
        return;
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${ref}"`);
      res.send(fileBuffer);
    } catch (error) {
      next(error);
    }
  }
}

