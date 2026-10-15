"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AuditResult, AuthType, OtpPurpose } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getEmailService } from "@/lib/email";

export type SecurityActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

async function verifyStudentSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please sign in.");
  }
  return session.user;
}

export async function getStudentSecurityInfoAction(): Promise<
  SecurityActionResult<{
    email: string | null;
    hasPassword: boolean;
    linkedMethods: Array<{
      type: string;
      label: string;
      isActive: boolean;
      identifier?: string | null;
    }>;
    sessionVersion: number;
  }>
> {
  try {
    const user = await verifyStudentSession();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        authMethods: true,
      },
    });

    if (!dbUser) {
      throw new Error("User record not found.");
    }

    const hasPassword = Boolean(dbUser.passwordHash);
    const hasGoogle = dbUser.authMethods.some((m) => m.type === AuthType.GOOGLE);
    const hasEmailOtp = Boolean(dbUser.email);
    const hasPhoneOtp = Boolean(dbUser.phone && dbUser.phoneVerified);

    const linkedMethods = [
      {
        type: "PASSWORD",
        label: "Password Sign-in",
        isActive: hasPassword,
        identifier: hasPassword ? "Configured" : "Not Set",
      },
      {
        type: "GOOGLE",
        label: "Google Account",
        isActive: hasGoogle,
        identifier: hasGoogle ? dbUser.email : "Not linked",
      },
      {
        type: "EMAIL_OTP",
        label: "Email Verification Code (OTP)",
        isActive: hasEmailOtp,
        identifier: dbUser.email,
      },
      {
        type: "PHONE_OTP",
        label: "Phone SMS OTP",
        isActive: hasPhoneOtp,
        identifier: dbUser.phone ? dbUser.phone : "Not configured",
      },
    ];

    return {
      success: true,
      message: "Security status retrieved.",
      data: {
        email: dbUser.email,
        hasPassword,
        linkedMethods,
        sessionVersion: dbUser.sessionVersion,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to load security info." };
  }
}

export async function changeStudentPasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<SecurityActionResult> {
  try {
    const user = await verifyStudentSession();

    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: "New password must be at least 8 characters long." };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      throw new Error("User not found.");
    }

    if (dbUser.passwordHash) {
      if (!currentPassword) {
        return { success: false, message: "Current password is required." };
      }
      const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        return { success: false, message: "Incorrect current password." };
      }
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    // Ensure password auth method is registered
    const existingAuth = await prisma.authMethod.findFirst({
      where: { userId: user.id, type: AuthType.PASSWORD },
    });
    if (!existingAuth) {
      await prisma.authMethod.create({
        data: {
          userId: user.id,
          type: AuthType.PASSWORD,
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "USER_PASSWORD_CHANGE",
      resource: "User",
      resourceId: user.id,
      result: AuditResult.SUCCESS,
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SECURITY_ALERT",
        message: "Your account password was successfully updated.",
      },
    });

    revalidatePath("/dashboard/settings/security");
    return {
      success: true,
      message: "Password changed successfully. Your other active sessions have been invalidated.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to change password." };
  }
}

export async function revokeAllSessionsAction(): Promise<SecurityActionResult> {
  try {
    const user = await verifyStudentSession();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        sessionVersion: { increment: 1 },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "GLOBAL_SESSION_REVOKED",
      resource: "User",
      resourceId: user.id,
      metadata: { initiatedBy: user.email },
      result: AuditResult.SUCCESS,
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SECURITY_ALERT",
        message: "All active sessions have been terminated. You will need to log back in on other devices.",
      },
    });

    revalidatePath("/dashboard/settings/security");
    return {
      success: true,
      message: "Successfully logged out of all other devices. All existing sessions have been invalidated.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to revoke sessions." };
  }
}

/**
 * Request a 6-digit OTP to be sent to the authenticated student's registered email
 */
export async function requestStudentPasswordResetOtpAction(): Promise<
  SecurityActionResult<{ destination: string; maskedEmail: string }>
> {
  try {
    const sessionUser = await verifyStudentSession();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return { success: false, message: "No registered email address found for this account." };
    }

    // Check rate limit: max 5 active/recent OTPs in 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.otpCode.count({
      where: {
        destination: user.email,
        purpose: OtpPurpose.RESET,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 5) {
      return {
        success: false,
        message: "Too many reset attempts. Please wait an hour before requesting a new code.",
      };
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: user.email,
        code: otpCode,
        purpose: OtpPurpose.RESET,
        expiresAt,
      },
    });

    const emailService = getEmailService();
    await emailService.sendPasswordResetOtpEmail(user.email, otpCode);

    await createAuditLog({
      userId: user.id,
      action: "AUTH_FORGOT_PASSWORD_OTP_SENT",
      resource: "User",
      resourceId: user.id,
      metadata: { email: user.email },
      result: AuditResult.SUCCESS,
    });

    const parts = user.email.split("@");
    const maskedEmail =
      parts[0].length <= 2
        ? `${parts[0]}***@${parts[1]}`
        : `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}`;

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}.`,
      data: { destination: user.email, maskedEmail },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to dispatch verification code." };
  }
}

/**
 * Verify the 6-digit OTP entered by the student
 */
export async function verifyStudentPasswordResetOtpAction(
  code: string
): Promise<SecurityActionResult> {
  try {
    const sessionUser = await verifyStudentSession();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return { success: false, message: "User not found." };
    }

    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      return { success: false, message: "Please enter a valid 6-digit verification code." };
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        destination: user.email,
        code: trimmed,
        purpose: OtpPurpose.RESET,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return {
        success: false,
        message: "Invalid or expired verification code. Please check your email or request a new code.",
      };
    }

    return {
      success: true,
      message: "Verification code confirmed successfully.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to verify code." };
  }
}

/**
 * Complete the password reset with verified OTP and save new password to database
 */
export async function resetStudentPasswordWithOtpAction(
  code: string,
  newPassword: string
): Promise<SecurityActionResult> {
  try {
    const sessionUser = await verifyStudentSession();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return { success: false, message: "User record not found." };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: "New password must be at least 8 characters long." };
    }

    const trimmed = code.trim();
    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        destination: user.email,
        code: trimmed,
        purpose: OtpPurpose.RESET,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return {
        success: false,
        message: "Invalid or expired verification code. Please request a new code to continue.",
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
        },
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: user.id,
      action: "AUTH_RESET_PASSWORD_WITH_OTP",
      resource: "User",
      resourceId: user.id,
      metadata: { email: user.email },
      result: AuditResult.SUCCESS,
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SECURITY_ALERT",
        message: "Your account password was updated successfully via email OTP verification.",
      },
    });

    revalidatePath("/dashboard/settings/security");
    return {
      success: true,
      message: "Password updated successfully in database! Your new credentials are now active.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update password." };
  }
}
