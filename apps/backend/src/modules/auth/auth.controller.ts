import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service.js";
import { prisma } from "../../lib/prisma.js";

const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 chars"),
});

const LoginPasswordSchema = z.object({
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

const GoogleAuthSchema = z.object({
  email: z.string().trim().email("Valid email required"),
  name: z.string().optional(),
  providerAccountId: z.string().optional(),
});

const PhoneOtpRequestSchema = z.object({
  phone: z.string().trim().min(8, "Valid phone number required"),
});

const PhoneOtpVerifySchema = z.object({
  phone: z.string().trim().min(8),
  code: z.string().trim().length(6, "6-digit code required"),
});

const EmailOtpRequestSchema = z.object({
  email: z.string().trim().email("Valid email required"),
});

const EmailOtpVerifySchema = z.object({
  email: z.string().trim().email("Valid email required"),
  code: z.string().trim().length(6, "6-digit code required"),
});

const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Valid email required"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token required"),
  password: z.string().min(8, "Password must be at least 8 chars"),
});

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.register({ ...parsed.data, ip: req.ip });
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.query.token as string) || (req.body.token as string);
      if (!token) {
        res.status(400).json({ success: false, message: "Verification token required." });
        return;
      }
      const result = await AuthService.verifyEmail(token, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async loginPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = LoginPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.loginPassword(parsed.data.email, parsed.data.password, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async loginGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = GoogleAuthSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.loginGoogle({ ...parsed.data, ip: req.ip });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async requestPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = PhoneOtpRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.requestPhoneOtp(parsed.data.phone, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = PhoneOtpVerifySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.verifyPhoneOtp(parsed.data.phone, parsed.data.code, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async requestEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = EmailOtpRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.requestEmailOtp(parsed.data.email, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = EmailOtpVerifySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.verifyEmailOtp(parsed.data.email, parsed.data.code, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ForgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.forgotPassword(parsed.data.email, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ResetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await AuthService.resetPassword(parsed.data.token, parsed.data.password, req.ip);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { authMethods: true, studentProfile: true, staffProfile: true },
      });

      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          authMethods: user.authMethods.map((m: { type: string }) => m.type),
          profile: user.studentProfile || user.staffProfile || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
