import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AuthType, AuditResult, UserRole, UserStatus } from "@prisma/client";

/**
 * Dev utility endpoint to simulate Google OAuth account creation or account linking
 * GET /api/test/google-auth?email=test@example.com&name=Test+User
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test routes disabled in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase();
  const rawName = searchParams.get("name") || "Google Student";

  if (!email) {
    return NextResponse.json(
      { error: "Query param 'email' is required, e.g. /api/test/google-auth?email=student@example.com" },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { authMethods: true, studentProfile: true },
    });

    if (existingUser) {
      const hasGoogleMethod = existingUser.authMethods.some(
        (m) => m.type === AuthType.GOOGLE
      );

      if (!hasGoogleMethod) {
        await prisma.authMethod.create({
          data: {
            userId: existingUser.id,
            type: AuthType.GOOGLE,
            providerAccountId: `google_mock_${Date.now()}`,
          },
        });
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: existingUser.emailVerified ?? new Date(),
          lastLoginAt: new Date(),
        },
      });

      await createAuditLog({
        userId: existingUser.id,
        action: "AUTH_LOGIN",
        resource: "User",
        resourceId: existingUser.id,
        metadata: {
          email,
          method: "google",
          accountLinked: !hasGoogleMethod,
          role: existingUser.role,
        },
        result: AuditResult.SUCCESS,
      });

      const updated = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: { authMethods: true, studentProfile: true },
      });

      return NextResponse.json({
        success: true,
        scenario: hasGoogleMethod ? "existing_google_login" : "account_linked",
        message: hasGoogleMethod
          ? `Existing user with Google auth signed in`
          : `Linked Google OAuth method to existing user (${existingUser.email})`,
        user: {
          id: updated?.id,
          email: updated?.email,
          role: updated?.role,
          emailVerified: updated?.emailVerified,
          authMethods: updated?.authMethods.map((m) => m.type),
        },
      });
    }

    // New user path
    const nameParts = rawName.trim().split(" ");
    const firstName = nameParts[0] || "Student";
    const lastName = nameParts.slice(1).join(" ") || "User";

    const newUser = await prisma.$transaction(async (tx) => {
      return await tx.user.create({
        data: {
          email,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(),
          lastLoginAt: new Date(),
          studentProfile: {
            create: {
              firstName,
              lastName,
            },
          },
          authMethods: {
            create: {
              type: AuthType.GOOGLE,
              providerAccountId: `google_mock_${Date.now()}`,
            },
          },
        },
        include: { authMethods: true, studentProfile: true },
      });
    });

    await createAuditLog({
      userId: newUser.id,
      action: "AUTH_REGISTER",
      resource: "User",
      resourceId: newUser.id,
      metadata: { email, method: "google", role: UserRole.STUDENT },
      result: AuditResult.SUCCESS,
    });

    await createAuditLog({
      userId: newUser.id,
      action: "AUTH_LOGIN",
      resource: "User",
      resourceId: newUser.id,
      metadata: { email, method: "google", role: UserRole.STUDENT },
      result: AuditResult.SUCCESS,
    });

    return NextResponse.json({
      success: true,
      scenario: "new_google_user_registered",
      message: `Created new user via Google OAuth (${newUser.email}) with emailVerified=true and no passwordHash`,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        authMethods: newUser.authMethods.map((m) => m.type),
        studentProfile: newUser.studentProfile,
      },
    });
  } catch (error) {
    console.error("[Test Google Auth error]:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
