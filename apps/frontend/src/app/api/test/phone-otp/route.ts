import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestPhoneOtpAction } from "@/app/actions/auth";
import { normalizePhone } from "@/lib/utils/phone";
import { OtpPurpose } from "@prisma/client";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test routes disabled in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Query param 'phone' is required" }, { status: 400 });
  }

  const normalized = normalizePhone(phone);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const codes = await prisma.otpCode.findMany({
    where: { destination: normalized, purpose: OtpPurpose.LOGIN },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const hourlyCount = await prisma.otpCode.count({
    where: { destination: normalized, createdAt: { gte: oneHourAgo } },
  });

  const user = await prisma.user.findUnique({
    where: { phone: normalized },
    include: { authMethods: true, studentProfile: true },
  });

  return NextResponse.json({
    phone: normalized,
    hourlyRequestsCount: hourlyCount,
    rateLimitRemaining: Math.max(0, 5 - hourlyCount),
    isRateLimited: hourlyCount >= 5,
    user: user
      ? {
          id: user.id,
          phone: user.phone,
          role: user.role,
          phoneVerified: user.phoneVerified,
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
    const result = await requestPhoneOtpAction({ phone: body.phone });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
