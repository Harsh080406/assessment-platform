import { prisma } from "@/lib/prisma";
import { AuditResult } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
  result?: AuditResult;
}

export async function createAuditLog({
  userId,
  action,
  resource,
  resourceId,
  ipAddress,
  metadata,
  result = AuditResult.SUCCESS,
}: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        resource,
        resourceId: resourceId ?? null,
        ipAddress: ipAddress ?? null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        result,
      },
    });
  } catch (error) {
    // Non-blocking in dev if db is unreachable, but log error to console
    console.error("[AuditLog Error]: Failed to create audit log entry", error);
    return null;
  }
}
