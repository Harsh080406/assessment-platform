import { User, UserStatus, AuditResult } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

/**
 * Fix #5: Consolidated login authorization check.
 * Checks account status, lockout timers, and validity before granting login.
 */
export async function assertUserLoginAllowed(
  user: { id: string; status: UserStatus; lockedUntil?: Date | null; email?: string | null },
  method: string
): Promise<void> {
  // Check 1: Brute-force lockout check (Fix #6)
  if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
    const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / (1000 * 60));
    await createAuditLog({
      userId: user.id,
      action: "AUTH_LOCKOUT",
      resource: "User",
      resourceId: user.id,
      metadata: {
        email: user.email || null,
        method,
        reason: "Login attempt while account is locked out",
        lockedUntil: user.lockedUntil,
      },
      result: AuditResult.FAILURE,
    });
    throw new Error(`ACCOUNT_LOCKED: Account temporarily locked due to failed attempts. Try again in ${minutesLeft} minute(s).`);
  }

  // Check 2: Account active status check
  if (user.status !== UserStatus.ACTIVE) {
    await createAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN",
      resource: "User",
      resourceId: user.id,
      metadata: {
        email: user.email || null,
        method,
        reason: `Account status is ${user.status}`,
      },
      result: AuditResult.FAILURE,
    });
    throw new Error(`ACCOUNT_INACTIVE: Account is currently ${user.status.toLowerCase()}. Please contact support.`);
  }
}

/**
 * Fix #6: Handle password login failure, increment failed attempts, trigger lockout at 5 failures.
 */
export async function handleFailedPasswordAttempt(
  userId: string,
  email: string,
  currentAttempts: number = 0
): Promise<void> {
  const nextAttempts = currentAttempts + 1;
  const isLockoutTriggered = nextAttempts >= 5;
  const lockedUntil = isLockoutTriggered ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15-min lockout

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: nextAttempts,
      lockedUntil,
    },
  });

  if (isLockoutTriggered) {
    await createAuditLog({
      userId,
      action: "AUTH_LOCKOUT",
      resource: "User",
      resourceId: userId,
      metadata: {
        email,
        method: "password",
        failedAttempts: nextAttempts,
        lockoutDurationMins: 15,
      },
      result: AuditResult.FAILURE,
    });
  }
}

/**
 * Reset failed password attempts on successful login.
 */
export async function resetFailedPasswordAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}
