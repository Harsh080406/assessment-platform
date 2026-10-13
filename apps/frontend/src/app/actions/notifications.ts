"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export type NotificationCategoryPreference = {
  category: string;
  label: string;
  description: string;
  emailEnabled: boolean;
};

const DEFAULT_CATEGORIES: Array<{ category: string; label: string; description: string }> = [
  {
    category: "REPORTS",
    label: "Certified Career Reports",
    description: "Receive instant notifications when your certified psychologist evaluation report is published.",
  },
  {
    category: "SUBMISSIONS",
    label: "Assessment Submissions",
    description: "Confirmation notices when your responses are locked and queued for expert review.",
  },
  {
    category: "SECURITY",
    label: "Security & Account Alerts",
    description: "Crucial alerts regarding password updates, new device logins, and session terminations.",
  },
  {
    category: "SYSTEM",
    label: "System & Milestone Updates",
    description: "Important platform announcements, methodology updates, and turnaround alerts.",
  },
];

async function verifyStudent() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please sign in.");
  }
  return session.user;
}

export async function getStudentNotificationsAction(): Promise<{
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  message?: string;
}> {
  try {
    const user = await verifyStudent();

    const [dbNotifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          readAt: null,
        },
      }),
    ]);

    const formatted: NotificationItem[] = dbNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    }));

    return {
      success: true,
      notifications: formatted,
      unreadCount,
    };
  } catch (error) {
    console.error("[getStudentNotificationsAction error]:", error);
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      message: error instanceof Error ? error.message : "Failed to load notifications.",
    };
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const user = await verifyStudent();

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");

    return { success: true, message: "Notification marked as read." };
  } catch (error) {
    console.error("[markNotificationReadAction error]:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update notification.",
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const user = await verifyStudent();

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");

    return { success: true, message: "All notifications marked as read." };
  } catch (error) {
    console.error("[markAllNotificationsReadAction error]:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark all as read.",
    };
  }
}

export async function getNotificationPreferencesAction(): Promise<{
  success: boolean;
  preferences: NotificationCategoryPreference[];
  message?: string;
}> {
  try {
    const user = await verifyStudent();

    const existing = await prisma.notificationPreference.findMany({
      where: { userId: user.id },
    });

    const prefMap = new Map<string, boolean>();
    for (const p of existing) {
      prefMap.set(p.category, p.emailEnabled);
    }

    const preferences: NotificationCategoryPreference[] = DEFAULT_CATEGORIES.map((cat) => ({
      category: cat.category,
      label: cat.label,
      description: cat.description,
      emailEnabled: prefMap.has(cat.category) ? prefMap.get(cat.category)! : true,
    }));

    return {
      success: true,
      preferences,
    };
  } catch (error) {
    console.error("[getNotificationPreferencesAction error]:", error);
    return {
      success: false,
      preferences: [],
      message: error instanceof Error ? error.message : "Failed to load preferences.",
    };
  }
}

export async function updateNotificationPreferenceAction(
  category: string,
  emailEnabled: boolean
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const user = await verifyStudent();

    await prisma.notificationPreference.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category,
        },
      },
      update: {
        emailEnabled,
      },
      create: {
        userId: user.id,
        category,
        emailEnabled,
      },
    });

    revalidatePath("/dashboard/notifications");

    return { success: true, message: "Preference updated successfully." };
  } catch (error) {
    console.error("[updateNotificationPreferenceAction error]:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save preference.",
    };
  }
}
