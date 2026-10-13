"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AuditResult, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAllContentBlocks, getContentBlock, DEFAULT_CONTENT_BLOCKS } from "@/lib/content";

export type ContentActionResult<T = unknown> = {
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
    throw new Error("Forbidden. Access restricted to Administrator accounts.");
  }
  return session.user;
}

export async function getContentBlocksAction(): Promise<
  ContentActionResult<{ blocks: Array<{ key: string; title: string; body: string }> }>
> {
  try {
    await verifyAdminSession();
    const blocks = await getAllContentBlocks();
    return { success: true, message: "Content blocks retrieved.", data: { blocks } };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to load content blocks." };
  }
}

export async function updateContentBlockAction(
  key: string,
  title: string,
  body: string
): Promise<ContentActionResult> {
  try {
    const adminUser = await verifyAdminSession();

    if (!key || !title) {
      return { success: false, message: "Content block key and title are required." };
    }

    const updated = await prisma.contentBlock.upsert({
      where: { key },
      update: {
        title,
        body,
        updatedBy: adminUser.email || adminUser.id,
      },
      create: {
        key,
        title,
        body,
        updatedBy: adminUser.email || adminUser.id,
      },
    });

    await createAuditLog({
      userId: adminUser.id,
      action: "CONTENT_UPDATED",
      resource: "ContentBlock",
      resourceId: key,
      metadata: {
        title,
        updatedBy: adminUser.email,
        bodyLength: body.length,
      },
      result: AuditResult.SUCCESS,
    });

    // Revalidate public landing and console
    revalidatePath("/");
    revalidatePath("/decoder");
    revalidatePath("/careers");
    revalidatePath("/console/content");

    return {
      success: true,
      message: `Content block "${title}" updated successfully. Public pages updated.`,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to save content block." };
  }
}
