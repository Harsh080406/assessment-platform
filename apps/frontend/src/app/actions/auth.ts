"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getEmailService } from "@/lib/email";
import { getSmsService } from "@/lib/sms";
import { normalizePhone } from "@/lib/utils/phone";
import {
  SignUpSchema,
  SignUpInput,
  ForgotPasswordSchema,
  ForgotPasswordInput,
  ResetPasswordSchema,
  ResetPasswordInput,
  VerifyEmailSchema,
  VerifyEmailInput,
  PhoneRequestOtpSchema,
  PhoneRequestOtpInput,
  EmailRequestOtpSchema,
  EmailRequestOtpInput,
} from "@/lib/validations/auth";
import { AuthType, AuditResult, OtpPurpose, UserRole, UserStatus } from "@prisma/client";

export type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  rateLimited?: boolean;
};

/**
 * Register a new Student account (Email + Password)
 */
export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  try {
    const validated = SignUpSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid input data",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { firstName, lastName, email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: null,
          studentProfile: {
            create: {
              firstName,
              lastName,
            },
          },
          authMethods: {
            create: {
              type: AuthType.PASSWORD,
            },
          },
        },
      });

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await tx.otpCode.create({
        data: {
          userId: newUser.id,
          destination: email,
          code: verificationToken,
          purpose: OtpPurpose.SIGNUP,
          expiresAt,
        },
      });

      return { user: newUser, verificationToken };
    });

    const emailService = getEmailService();
    await emailService.sendVerificationEmail(email, user.verificationToken);

    await createAuditLog({
      userId: user.user.id,
      action: "AUTH_REGISTER",
      resource: "User",
      resourceId: user.user.id,
      metadata: { email, role: UserRole.STUDENT, method: "password" },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("[signUpAction error]:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating your account. Please try again.",
    };
  }
}

/**
 * Verify Email with Token
 */
export async function verifyEmailAction(input: VerifyEmailInput): Promise<ActionResult> {
  try {
    const validated = VerifyEmailSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, message: "Invalid verification token" };
    }

    const { token } = validated.data;

    const otp = await prisma.otpCode.findFirst({
      where: {
        code: token,
        purpose: OtpPurpose.SIGNUP,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp || !otp.userId) {
      return {
        success: false,
        message: "Invalid or expired verification link. Please request a new one.",
      };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: otp.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: otp.userId,
      action: "AUTH_VERIFY_EMAIL",
      resource: "User",
      resourceId: otp.userId,
      metadata: { destination: otp.destination },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "Your email has been verified successfully! You can now log in.",
    };
  } catch (error) {
    console.error("[verifyEmailAction error]:", error);
    return {
      success: false,
      message: "An unexpected error occurred during email verification.",
    };
  }
}

/**
 * Request Password Reset Email
 */
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  try {
    const validated = ForgotPasswordSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: "Please provide a valid email address",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { email } = validated.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists, a password reset link has been dispatched.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: email,
        code: resetToken,
        purpose: OtpPurpose.RESET,
        expiresAt,
      },
    });

    const emailService = getEmailService();
    await emailService.sendPasswordResetEmail(email, resetToken);

    await createAuditLog({
      userId: user.id,
      action: "AUTH_FORGOT_PASSWORD",
      resource: "User",
      resourceId: user.id,
      metadata: { email },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "If an account with that email exists, a password reset link has been dispatched.",
    };
  } catch (error) {
    console.error("[forgotPasswordAction error]:", error);
    return {
      success: false,
      message: "An error occurred while requesting password reset. Please try again.",
    };
  }
}

/**
 * Reset Password with Token
 */
export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  try {
    const validated = ResetPasswordSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid input data",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { token, password } = validated.data;

    const otp = await prisma.otpCode.findFirst({
      where: {
        code: token,
        purpose: OtpPurpose.RESET,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp || !otp.userId) {
      return {
        success: false,
        message: "Invalid or expired reset link. Please request a new one.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: otp.userId },
        data: { passwordHash },
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: otp.userId,
      action: "AUTH_RESET_PASSWORD",
      resource: "User",
      resourceId: otp.userId,
      metadata: { destination: otp.destination },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  } catch (error) {
    console.error("[resetPasswordAction error]:", error);
    return {
      success: false,
      message: "An error occurred while resetting your password. Please try again.",
    };
  }
}

/**
 * Request Phone OTP for login / registration
 * Rate limited to max 5 requests per hour per phone number.
 */
export async function requestPhoneOtpAction(input: PhoneRequestOtpInput): Promise<ActionResult<{ expiresAt: string }>> {
  try {
    const validated = PhoneRequestOtpSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: "Please provide a valid phone number",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const normalizedPhone = normalizePhone(validated.data.phone);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequestsCount = await prisma.otpCode.count({
      where: {
        destination: normalizedPhone,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentRequestsCount >= 5) {
      await createAuditLog({
        action: "AUTH_OTP_REQUEST",
        resource: "OtpCode",
        metadata: {
          destination: normalizedPhone,
          method: "phone_otp",
          reason: "Rate limit exceeded (max 5/hour)",
          recentCount: recentRequestsCount,
        },
        result: AuditResult.FAILURE,
      });

      return {
        success: false,
        message: "Rate limit exceeded: You have reached the maximum of 5 OTP requests per hour. Please wait before trying again.",
        rateLimited: true,
      };
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.create({
      data: {
        destination: normalizedPhone,
        code: otpCode,
        purpose: OtpPurpose.LOGIN,
        expiresAt,
        attempts: 0,
      },
    });

    const smsService = getSmsService();
    await smsService.sendOtp(normalizedPhone, otpCode);

    await createAuditLog({
      action: "AUTH_OTP_REQUEST",
      resource: "OtpCode",
      metadata: {
        destination: normalizedPhone,
        method: "phone_otp",
        purpose: "LOGIN",
      },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: `Security code dispatched to ${normalizedPhone}. Valid for 10 minutes.`,
      data: { expiresAt: expiresAt.toISOString() },
    };
  } catch (error) {
    console.error("[requestPhoneOtpAction error]:", error);
    return {
      success: false,
      message: "Failed to dispatch security code. Please try again.",
    };
  }
}

/**
 * Request Email OTP (Passwordless Magic Code)
 * Rate limited to max 5 requests per hour per email address.
 */
export async function requestEmailOtpAction(input: EmailRequestOtpInput): Promise<ActionResult<{ expiresAt: string }>> {
  try {
    const validated = EmailRequestOtpSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: "Please provide a valid email address",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const email = validated.data.email.toLowerCase();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequestsCount = await prisma.otpCode.count({
      where: {
        destination: email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentRequestsCount >= 5) {
      await createAuditLog({
        action: "AUTH_OTP_REQUEST",
        resource: "OtpCode",
        metadata: {
          destination: email,
          method: "email_otp",
          reason: "Rate limit exceeded (max 5/hour)",
          recentCount: recentRequestsCount,
        },
        result: AuditResult.FAILURE,
      });

      return {
        success: false,
        message: "Rate limit exceeded: You have reached the maximum of 5 code requests per hour. Please wait before trying again.",
        rateLimited: true,
      };
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.create({
      data: {
        destination: email,
        code: otpCode,
        purpose: OtpPurpose.LOGIN,
        expiresAt,
        attempts: 0,
      },
    });

    const emailService = getEmailService();
    await emailService.sendLoginOtpEmail(email, otpCode);

    await createAuditLog({
      action: "AUTH_OTP_REQUEST",
      resource: "OtpCode",
      metadata: {
        destination: email,
        method: "email_otp",
        purpose: "LOGIN",
      },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: `One-time security code dispatched to ${email}. Valid for 10 minutes.`,
      data: { expiresAt: expiresAt.toISOString() },
    };
  } catch (error) {
    console.error("[requestEmailOtpAction error]:", error);
    return {
      success: false,
      message: "Failed to dispatch email security code. Please try again.",
    };
  }
}

/**
 * Activate invited Staff / Admin account with Password (Fix #1)
 */
export async function activateAccountAction(data: {
  token: string;
  password: string;
}): Promise<ActionResult> {
  try {
    const { verifyActivationToken } = await import("@/lib/activationToken");
    const payload = verifyActivationToken(data.token);

    if (!payload) {
      return {
        success: false,
        message: "This activation token is invalid or has expired. Please request a new invitation.",
      };
    }

    const { email } = payload;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { authMethods: true },
    });

    if (!user) {
      return { success: false, message: "Invited account not found." };
    }

    if (user.status === UserStatus.ACTIVE) {
      return {
        success: true,
        message: "Your account is already active. Please proceed to log in.",
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long.",
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          passwordHash,
          emailVerified: user.emailVerified ?? new Date(),
        },
      });

      const hasPasswordMethod = user.authMethods.some((m) => m.type === AuthType.PASSWORD);
      if (!hasPasswordMethod) {
        await tx.authMethod.create({
          data: {
            userId: user.id,
            type: AuthType.PASSWORD,
          },
        });
      }
    });

    await createAuditLog({
      userId: user.id,
      action: "STAFF_ADMIN_ACTIVATED",
      resource: "User",
      resourceId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        method: "password",
      },
      result: AuditResult.SUCCESS,
    });

    return {
      success: true,
      message: "Account successfully activated! You can now log in with your email and password.",
    };
  } catch (error: any) {
    console.error("[activateAccountAction error]:", error);
    return {
      success: false,
      message: error.message || "Failed to activate account. Please try again.",
    };
  }
}

