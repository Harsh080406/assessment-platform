import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestEmailOtpAction } from "@/app/actions/auth";
import { OtpPurpose } from "@prisma/client";

/**
 * Dev utility to inspect or test Email OTP codes:
 * 1. GET /api/test/email-otp?email=student@example.com → Returns recent OTP codes and attempt counts
 * 2. POST /api/test/email-otp { email: "student@example.com" } → Dispatches an Email OTP
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test routes disabled in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Query param 'email' is required" }, { status: 400 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const codes = await prisma.otpCode.findMany({
    where: { destination: email, purpose: OtpPurpose.LOGIN },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const hourlyCount = await prisma.otpCode.count({
    where: { destination: email, createdAt: { gte: oneHourAgo } },
  });

  const user = await prisma.user.findUnique({
    where: { email },
    include: { authMethods: true, studentProfile: true },
  });

  return NextResponse.json({
    email,
    hourlyRequestsCount: hourlyCount,
    rateLimitRemaining: Math.max(0, 5 - hourlyCount),
    isRateLimited: hourlyCount >= 5,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          authMethods: user.authMethods.map((m) => m.type),
        }
      : null,
    recentOtpCodes: codes.map((c) => ({
      code: c.code,
      purpose: c.purpose,
      attempts: c.attempts,
      consumedAt: c.consumedAt,
      expiresAt: c.expiresAt,
      isExpired: new Date() > c.expiresAt,
      isConsumed: !!c.consumedAt,
      createdAt: c.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test routes disabled in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await requestEmailOtpAction({ email: body.email });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
