import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "./assessment.service.js";

export class AssessmentController {
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

  public static submitAssessment(req: Request, res: Response, next: NextFunction): void {
    try {
      const { responses } = req.body;
      if (!responses || typeof responses !== "object") {
        res.status(400).json({
          success: false,
          message: "Invalid submission payload. 'responses' map is required.",
        });
        return;
      }

      const evaluation = AssessmentService.evaluateSubmission(responses);
      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }
}
