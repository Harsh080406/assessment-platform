"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AuditResult, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type AdminSettingsData = {
  slaDays: number;
  featureFlags: {
    studentSignup: boolean;
    autoAssignment: boolean;
    maintenanceNotice: boolean;
    requireMfaForStaff: boolean;
  };
  lastUpdated: string | null;
  updatedBy: string | null;
};

export type SettingsActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

async function verifyAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please sign in.");
  }
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden. Access restricted to System Administrators.");
  }
  return session.user;
}

export async function getSystemSettingsAction(): Promise<SettingsActionResult<AdminSettingsData>> {
  try {
    await verifyAdminSession();

    const configs = await prisma.systemConfig.findMany();
    const configMap = new Map(configs.map((c) => [c.key, c.value]));

    const slaDays = parseInt(configMap.get("GLOBAL_SLA_DAYS") || "4", 10) || 4;

    const featureFlags = {
      studentSignup: configMap.get("FLAG_STUDENT_SIGNUP") !== "false", // default true
      autoAssignment: configMap.get("FLAG_AUTO_ASSIGNMENT") === "true", // default false
      maintenanceNotice: configMap.get("FLAG_MAINTENANCE_NOTICE") === "true", // default false
      requireMfaForStaff: configMap.get("FLAG_REQUIRE_MFA_STAFF") === "true", // default false
    };

    const latest = configs.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )[0];

    return {
      success: true,
      message: "Settings loaded successfully.",
      data: {
        slaDays,
        featureFlags,
        lastUpdated: latest?.updatedAt ? latest.updatedAt.toISOString() : null,
        updatedBy: latest?.updatedBy || null,
      },
    };
  } catch (error: any) {
    console.error("[getSystemSettingsAction error]:", error);
    return { success: false, message: error.message || "Failed to load system settings." };
  }
}

export async function updateSystemSettingsAction(data: {
  slaDays: number;
  featureFlags: {
    studentSignup: boolean;
    autoAssignment: boolean;
    maintenanceNotice: boolean;
    requireMfaForStaff: boolean;
  };
}): Promise<SettingsActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    if (data.slaDays < 1 || data.slaDays > 30) {
      return { success: false, message: "SLA turnaround must be between 1 and 30 days." };
    }

    const updates = [
      { key: "GLOBAL_SLA_DAYS", value: data.slaDays.toString() },
      { key: "FLAG_STUDENT_SIGNUP", value: data.featureFlags.studentSignup ? "true" : "false" },
      { key: "FLAG_AUTO_ASSIGNMENT", value: data.featureFlags.autoAssignment ? "true" : "false" },
      { key: "FLAG_MAINTENANCE_NOTICE", value: data.featureFlags.maintenanceNotice ? "true" : "false" },
      { key: "FLAG_REQUIRE_MFA_STAFF", value: data.featureFlags.requireMfaForStaff ? "true" : "false" },
    ];

    await prisma.$transaction(
      updates.map((item) =>
        prisma.systemConfig.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            updatedBy: adminUser.email || adminUser.id,
          },
          create: {
            key: item.key,
            value: item.value,
            updatedBy: adminUser.email || adminUser.id,
          },
        })
      )
    );

    await createAuditLog({
      userId: adminUser.id,
      action: "SYSTEM_CONFIG_UPDATED",
      resource: "SystemConfig",
      metadata: {
        slaDays: data.slaDays,
        featureFlags: data.featureFlags,
        updatedBy: adminUser.email,
      },
      result: AuditResult.SUCCESS,
    });

    revalidatePath("/console/settings");
    revalidatePath("/console/sla");
    revalidatePath("/portal");
    revalidatePath("/portal/under-review");
    revalidatePath("/");

    return {
      success: true,
      message: `System configuration saved. Global SLA set to ${data.slaDays} days.`,
    };
  } catch (error: any) {
    console.error("[updateSystemSettingsAction error]:", error);
    return { success: false, message: error.message || "Failed to save configuration." };
  }
}
