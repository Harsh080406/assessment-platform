import crypto from "crypto";
import { UserRole } from "@prisma/client";

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aurapath-activation-secret-key-2026";

interface ActivationPayload {
  email: string;
  role: UserRole;
  exp: number; // Unix timestamp in ms
}

/**
 * Generates an expiring HMAC-signed activation token for Staff/Admin invites (valid 48h).
 */
export function generateActivationToken(email: string, role: UserRole): string {
  const payload: ActivationPayload = {
    email: email.toLowerCase().trim(),
    role,
    exp: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto.createHmac("sha256", SECRET).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${hmac}`;
}

/**
 * Verifies an activation token and returns the payload if valid and not expired.
 */
export function verifyActivationToken(token: string): { email: string; role: UserRole } | null {
  try {
    const [payloadBase64, hmac] = token.split(".");
    if (!payloadBase64 || !hmac) return null;

    const expectedHmac = crypto
      .createHmac("sha256", SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }

    const payload: ActivationPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.exp) {
      return null;
    }

    return { email: payload.email, role: payload.role };
  } catch (error) {
    console.error("[ActivationToken Verification Failed]:", error);
    return null;
  }
}
