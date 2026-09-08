import { Request, Response, NextFunction } from "express";

export class AuthController {
  public static login(req: Request, res: Response, next: NextFunction): void {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: "Email and password are required." });
        return;
      }

      // Mock enterprise token generation
      res.status(200).json({
        success: true,
        message: "Authentication successful.",
        token: `mock_jwt_${Date.now()}`,
        user: {
          id: "usr_101",
          email,
          role: "STUDENT",
          name: email.split("@")[0],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static register(req: Request, res: Response, next: NextFunction): void {
    try {
      const { email, name, role = "STUDENT" } = req.body;
      if (!email || !name) {
        res.status(400).json({ success: false, message: "Name and email are required." });
        return;
      }

      res.status(201).json({
        success: true,
        message: "Candidate profile registered successfully.",
        token: `mock_jwt_${Date.now()}`,
        user: {
          id: `usr_${Date.now()}`,
          name,
          email,
          role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
