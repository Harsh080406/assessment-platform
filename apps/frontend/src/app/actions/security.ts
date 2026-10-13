"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AuditResult, AuthType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
        sessionVersion: { increment: 1 },
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
