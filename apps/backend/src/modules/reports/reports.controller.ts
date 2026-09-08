import { Request, Response, NextFunction } from "express";
import { ReportsService } from "./reports.service.js";

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
}
