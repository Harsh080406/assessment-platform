import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { createAuditLog } from "../../lib/audit.js";
import { getEmailService } from "../../lib/email.js";
import { getSmsService } from "../../lib/sms.js";
import { generateToken } from "../../middleware/auth.js";
import { AuthType, AuditResult, OtpPurpose, UserRole, UserStatus, Prisma } from "@prisma/client";

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s\-()]/g, "");
}

export class AuthService {
  /**
   * 1. Register with Email + Password
   */
  public static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    ip?: string;
  }) {
    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: null,
          studentProfile: {
            create: {
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
            },
          },
          authMethods: {
            create: { type: AuthType.PASSWORD },
          },
        },
        include: { studentProfile: true },
      });

      await tx.otpCode.create({
        data: {
          userId: newUser.id,
          destination: email,
          code: verificationToken,
          purpose: OtpPurpose.SIGNUP,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return newUser;
    });

    await getEmailService().sendVerificationEmail(email, verificationToken);

    await createAuditLog({
      userId: user.id,
      action: "AUTH_REGISTER",
      resource: "User",
      resourceId: user.id,
      ipAddress: data.ip,
      metadata: { email, method: "password" },
      result: AuditResult.SUCCESS,
    });

    return {
      message: "Account created. Please verify your email before signing in.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * 2. Verify Email Token
   */
  public static async verifyEmail(token: string, ip?: string) {
    const otp = await prisma.otpCode.findFirst({
      where: {
        code: token,
        purpose: OtpPurpose.SIGNUP,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp || !otp.userId) {
      throw new Error("Invalid or expired verification token.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: otp.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: otp.userId,
      action: "AUTH_VERIFY_EMAIL",
      resource: "User",
      resourceId: otp.userId,
      ipAddress: ip,
      result: AuditResult.SUCCESS,
    });

    return { message: "Email verified successfully. You can now log in." };
  }

  /**
   * 3. Login with Email + Password
   */
  public static async loginPassword(emailRaw: string, passwordRaw: string, ip?: string) {
    const email = emailRaw.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true, staffProfile: true },
    });

    if (!user || !user.passwordHash) {
      await createAuditLog({
        action: "AUTH_LOGIN",
        resource: "User",
        ipAddress: ip,
        metadata: { email, method: "password", reason: "User not found or no password" },
        result: AuditResult.FAILURE,
      });
      throw new Error("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) {
      await createAuditLog({
        userId: user.id,
        action: "AUTH_LOGIN",
        resource: "User",
        resourceId: user.id,
        ipAddress: ip,
        metadata: { email, method: "password", reason: "Password mismatch" },
        result: AuditResult.FAILURE,
      });
      throw new Error("Invalid email or password.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error("Account is inactive or suspended.");
    }

    if (!user.emailVerified) {
      throw new Error("Email is not verified. Please check your inbox for verification instructions.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN",
      resource: "User",
      resourceId: user.id,
      ipAddress: ip,
      metadata: { email, method: "password", role: user.role },
      result: AuditResult.SUCCESS,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    const name = user.studentProfile
      ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
      : user.email;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * 4. Google OAuth Sign-In / Account Linking
   */
  public static async loginGoogle(data: {
    email: string;
    name?: string;
    providerAccountId?: string;
    ip?: string;
  }) {
    const email = data.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { authMethods: true, studentProfile: true },
    });

    if (existingUser) {
      if (existingUser.status !== UserStatus.ACTIVE) {
        throw new Error("Account is inactive or suspended.");
      }

      const hasGoogleMethod = existingUser.authMethods.some((m: { type: string }) => m.type === AuthType.GOOGLE);
      if (!hasGoogleMethod) {
        await prisma.authMethod.create({
          data: {
            userId: existingUser.id,
            type: AuthType.GOOGLE,
            providerAccountId: data.providerAccountId || null,
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
        ipAddress: data.ip,
        metadata: { email, method: "google", accountLinked: !hasGoogleMethod },
        result: AuditResult.SUCCESS,
      });

      const token = generateToken({
        id: existingUser.id,
        email: existingUser.email,
        phone: existingUser.phone,
        role: existingUser.role,
        status: existingUser.status,
      });

      return {
        token,
        accountLinked: !hasGoogleMethod,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          status: existingUser.status,
        },
      };
    }

    // New Google User
    const rawName = data.name || "Student User";
    const nameParts = rawName.trim().split(" ");
    const firstName = nameParts[0] || "Student";
    const lastName = nameParts.slice(1).join(" ") || "User";

    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return await tx.user.create({
        data: {
          email,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(),
          lastLoginAt: new Date(),
          studentProfile: {
            create: { firstName, lastName },
          },
          authMethods: {
            create: {
              type: AuthType.GOOGLE,
              providerAccountId: data.providerAccountId || null,
            },
          },
        },
        include: { studentProfile: true },
      });
    });

    await createAuditLog({
      userId: newUser.id,
      action: "AUTH_REGISTER",
      resource: "User",
      resourceId: newUser.id,
      ipAddress: data.ip,
      metadata: { email, method: "google" },
      result: AuditResult.SUCCESS,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
    });

    return {
      token,
      accountLinked: false,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    };
  }

  /**
   * 5. Phone OTP Request (Max 5/hr)
   */
  public static async requestPhoneOtp(phoneRaw: string, ip?: string) {
    const normalizedPhone = normalizePhone(phoneRaw);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await prisma.otpCode.count({
      where: { destination: normalizedPhone, createdAt: { gte: oneHourAgo } },
    });

    if (count >= 5) {
      await createAuditLog({
        action: "AUTH_OTP_REQUEST",
        resource: "OtpCode",
        ipAddress: ip,
        metadata: { destination: normalizedPhone, method: "phone_otp", reason: "Rate limited" },
        result: AuditResult.FAILURE,
      });
      throw new Error("Rate limit exceeded: Maximum 5 OTP requests per hour.");
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        destination: normalizedPhone,
        code: otpCode,
        purpose: OtpPurpose.LOGIN,
        expiresAt,
        attempts: 0,
      },
    });

    await getSmsService().sendOtp(normalizedPhone, otpCode);

    await createAuditLog({
      action: "AUTH_OTP_REQUEST",
      resource: "OtpCode",
      ipAddress: ip,
      metadata: { destination: normalizedPhone, method: "phone_otp" },
      result: AuditResult.SUCCESS,
    });

    return { message: `Code sent to ${normalizedPhone}. Valid for 10 minutes.` };
  }

  /**
   * 6. Phone OTP Verify (Max 5 attempts)
   */
  public static async verifyPhoneOtp(phoneRaw: string, code: string, ip?: string) {
    const normalizedPhone = normalizePhone(phoneRaw);

    const otp = await prisma.otpCode.findFirst({
      where: { destination: normalizedPhone, purpose: OtpPurpose.LOGIN, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) throw new Error("No active security code found.");
    if (new Date() > otp.expiresAt) throw new Error("Security code has expired.");
    if (otp.attempts >= 5) {
      await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
      throw new Error("Maximum attempts exceeded. Code invalidated.");
    }

    if (otp.code !== code) {
      const attempts = otp.attempts + 1;
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts, consumedAt: attempts >= 5 ? new Date() : null },
      });
      await createAuditLog({
        action: "AUTH_LOGIN",
        resource: "User",
        ipAddress: ip,
        metadata: { destination: normalizedPhone, method: "phone_otp", reason: "Code mismatch" },
        result: AuditResult.FAILURE,
      });
      throw new Error(`Incorrect code. ${Math.max(0, 5 - attempts)} attempts remaining.`);
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: { authMethods: true, studentProfile: true },
    });

    if (user) {
      if (user.status !== UserStatus.ACTIVE) throw new Error("Account is inactive.");
      const hasPhone = user.authMethods.some((m: { type: string }) => m.type === AuthType.PHONE_OTP);
      if (!hasPhone) {
        await prisma.authMethod.create({
          data: { userId: user.id, type: AuthType.PHONE_OTP },
        });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: user.phoneVerified ?? new Date(), lastLoginAt: new Date() },
        include: { authMethods: true, studentProfile: true },
      });
    } else {
      const last4 = normalizedPhone.slice(-4);
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          phoneVerified: new Date(),
          lastLoginAt: new Date(),
          studentProfile: {
            create: { firstName: "Student", lastName: `#${last4}`, phone: normalizedPhone },
          },
          authMethods: { create: { type: AuthType.PHONE_OTP } },
        },
        include: { authMethods: true, studentProfile: true },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN",
      resource: "User",
      resourceId: user.id,
      ipAddress: ip,
      metadata: { phone: normalizedPhone, method: "phone_otp" },
      result: AuditResult.SUCCESS,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    return { token, user: { id: user.id, phone: user.phone, role: user.role } };
  }

  /**
   * 7. Email OTP Request (Max 5/hr)
   */
  public static async requestEmailOtp(emailRaw: string, ip?: string) {
    const email = emailRaw.toLowerCase().trim();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await prisma.otpCode.count({
      where: { destination: email, createdAt: { gte: oneHourAgo } },
    });

    if (count >= 5) {
      await createAuditLog({
        action: "AUTH_OTP_REQUEST",
        resource: "OtpCode",
        ipAddress: ip,
        metadata: { destination: email, method: "email_otp", reason: "Rate limited" },
        result: AuditResult.FAILURE,
      });
      throw new Error("Rate limit exceeded: Maximum 5 requests per hour.");
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        destination: email,
        code: otpCode,
        purpose: OtpPurpose.LOGIN,
        expiresAt,
        attempts: 0,
      },
    });

    await getEmailService().sendLoginOtpEmail(email, otpCode);

    await createAuditLog({
      action: "AUTH_OTP_REQUEST",
      resource: "OtpCode",
      ipAddress: ip,
      metadata: { destination: email, method: "email_otp" },
      result: AuditResult.SUCCESS,
    });

    return { message: `Code sent to ${email}. Valid for 10 minutes.` };
  }

  /**
   * 8. Email OTP Verify (Max 5 attempts)
   */
  public static async verifyEmailOtp(emailRaw: string, code: string, ip?: string) {
    const email = emailRaw.toLowerCase().trim();

    const otp = await prisma.otpCode.findFirst({
      where: { destination: email, purpose: OtpPurpose.LOGIN, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) throw new Error("No active security code found.");
    if (new Date() > otp.expiresAt) throw new Error("Security code has expired.");
    if (otp.attempts >= 5) {
      await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
      throw new Error("Maximum attempts exceeded. Code invalidated.");
    }

    if (otp.code !== code) {
      const attempts = otp.attempts + 1;
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts, consumedAt: attempts >= 5 ? new Date() : null },
      });
      await createAuditLog({
        action: "AUTH_LOGIN",
        resource: "User",
        ipAddress: ip,
        metadata: { destination: email, method: "email_otp", reason: "Code mismatch" },
        result: AuditResult.FAILURE,
      });
      throw new Error(`Incorrect code. ${Math.max(0, 5 - attempts)} attempts remaining.`);
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    let user = await prisma.user.findUnique({
      where: { email },
      include: { authMethods: true, studentProfile: true },
    });

    if (user) {
      if (user.status !== UserStatus.ACTIVE) throw new Error("Account is inactive.");
      const hasEmailOtp = user.authMethods.some((m: { type: string }) => m.type === AuthType.EMAIL_OTP);
      if (!hasEmailOtp) {
        await prisma.authMethod.create({
          data: { userId: user.id, type: AuthType.EMAIL_OTP },
        });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: user.emailVerified ?? new Date(), lastLoginAt: new Date() },
        include: { authMethods: true, studentProfile: true },
      });
    } else {
      const localPart = email.split("@")[0] || "student";
      user = await prisma.user.create({
        data: {
          email,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(),
          lastLoginAt: new Date(),
          studentProfile: {
            create: { firstName: "Student", lastName: localPart },
          },
          authMethods: { create: { type: AuthType.EMAIL_OTP } },
        },
        include: { authMethods: true, studentProfile: true },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN",
      resource: "User",
      resourceId: user.id,
      ipAddress: ip,
      metadata: { email, method: "email_otp" },
      result: AuditResult.SUCCESS,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  /**
   * 9. Forgot Password
   */
  public static async forgotPassword(emailRaw: string, ip?: string) {
    const email = emailRaw.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: "If an account exists with this email, a reset link has been dispatched." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: email,
        code: resetToken,
        purpose: OtpPurpose.RESET,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await getEmailService().sendPasswordResetEmail(email, resetToken);

    await createAuditLog({
      userId: user.id,
      action: "AUTH_FORGOT_PASSWORD",
      resource: "User",
      resourceId: user.id,
      ipAddress: ip,
      result: AuditResult.SUCCESS,
    });

    return { message: "If an account exists with this email, a reset link has been dispatched." };
  }

  /**
   * 10. Reset Password
   */
  public static async resetPassword(token: string, newPasswordRaw: string, ip?: string) {
    const otp = await prisma.otpCode.findFirst({
      where: {
        code: token,
        purpose: OtpPurpose.RESET,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp || !otp.userId) {
      throw new Error("Invalid or expired password reset token.");
    }

    const passwordHash = await bcrypt.hash(newPasswordRaw, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: otp.userId },
        data: { passwordHash },
      }),
      prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    await createAuditLog({
      userId: otp.userId,
      action: "AUTH_RESET_PASSWORD",
      resource: "User",
      resourceId: otp.userId,
      ipAddress: ip,
      result: AuditResult.SUCCESS,
    });

    return { message: "Password reset successfully. You can now log in." };
  }
}
