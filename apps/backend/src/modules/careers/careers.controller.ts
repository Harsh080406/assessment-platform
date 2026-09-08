import { Request, Response, NextFunction } from "express";
import { CareersService } from "./careers.service.js";

export class CareersController {
  public static list(req: Request, res: Response, next: NextFunction): void {
    try {
      const stream = req.query.stream as string | undefined;
      const q = req.query.q as string | undefined;
      const careers = CareersService.listCareers(stream, q);

      res.status(200).json({
        success: true,
        count: careers.length,
        data: careers,
      });
    } catch (error) {
      next(error);
    }
  }

  public static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = String(req.params.id);
      const career = CareersService.getCareerById(id);

      if (!career) {
        res.status(404).json({
          success: false,
          message: `Career with id '${id}' was not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }
}
