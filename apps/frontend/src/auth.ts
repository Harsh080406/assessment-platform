import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { LoginSchema, PhoneVerifyOtpSchema, EmailVerifyOtpSchema } from "@/lib/validations/auth";
import { normalizePhone } from "@/lib/utils/phone";
import { AuthType, AuditResult, OtpPurpose, UserRole, UserStatus } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        type: { label: "Type", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        // Path A: Email + OTP (Passwordless Login / Registration)
        if (credentials?.type === "email_otp") {
          const parsed = EmailVerifyOtpSchema.safeParse({
            email: credentials.email,
            code: credentials.code,
          });

          if (!parsed.success) {
            return null;
          }

          const email = parsed.data.email.toLowerCase();
          const { code } = parsed.data;

          const otp = await prisma.otpCode.findFirst({
            where: {
              destination: email,
              purpose: OtpPurpose.LOGIN,
              consumedAt: null,
            },
            orderBy: { createdAt: "desc" },
          });

          if (!otp) {
            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: email,
                method: "email_otp",
                reason: "No active OTP found",
              },
              result: AuditResult.FAILURE,
            });
            throw new Error("OTP_NOT_FOUND");
          }

          if (new Date() > otp.expiresAt) {
            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: email,
                method: "email_otp",
                reason: "OTP code expired",
              },
              result: AuditResult.FAILURE,
            });
            throw new Error("OTP_EXPIRED");
          }

          if (otp.attempts >= 5) {
            await prisma.otpCode.update({
              where: { id: otp.id },
              data: { consumedAt: new Date() },
            });
            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: email,
                method: "email_otp",
                reason: "Max verification attempts exceeded (invalidated)",
              },
              result: AuditResult.FAILURE,
            });
            throw new Error("OTP_MAX_ATTEMPTS");
          }

          if (otp.code !== code) {
            const nextAttempts = otp.attempts + 1;
            const isNowExceeded = nextAttempts >= 5;

            await prisma.otpCode.update({
              where: { id: otp.id },
              data: {
                attempts: nextAttempts,
                consumedAt: isNowExceeded ? new Date() : null,
              },
            });

            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: email,
                method: "email_otp",
                reason: "Incorrect OTP code",
                attempts: nextAttempts,
                remainingAttempts: Math.max(0, 5 - nextAttempts),
              },
              result: AuditResult.FAILURE,
            });

            if (isNowExceeded) {
              throw new Error("OTP_MAX_ATTEMPTS");
            }

            throw new Error(`OTP_INCORRECT:${Math.max(0, 5 - nextAttempts)}`);
          }

          // OTP valid - consume
          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { consumedAt: new Date() },
          });

          // Check if User exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { authMethods: true, studentProfile: true },
          });

          if (existingUser) {
            // Fix #2: Reject OTP login for Staff/Admin accounts
            if (existingUser.role !== UserRole.STUDENT) {
              await createAuditLog({
                userId: existingUser.id,
                action: "SECURITY_BLOCKED_METHOD",
                resource: "User",
                resourceId: existingUser.id,
                metadata: {
                  attemptedMethod: "email_otp",
                  accountRole: existingUser.role,
                  reason: "OTP sign-in is prohibited for privileged roles (STAFF/ADMIN)",
                },
                result: AuditResult.FAILURE,
              });
              throw new Error("SECURITY_BLOCKED_METHOD: This sign-in method isn't available for this account type.");
            }

            // Fix #5: Consolidated status check assertion
            const { assertUserLoginAllowed } = await import("@/lib/auth-helpers");
            await assertUserLoginAllowed(existingUser, "email_otp");

            const hasEmailOtpMethod = existingUser.authMethods.some(
              (m) => m.type === AuthType.EMAIL_OTP
            );

            if (!hasEmailOtpMethod) {
              await prisma.authMethod.create({
                data: {
                  userId: existingUser.id,
                  type: AuthType.EMAIL_OTP,
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
                method: "email_otp",
                role: existingUser.role,
                accountLinked: !hasEmailOtpMethod,
              },
              result: AuditResult.SUCCESS,
            });

            const displayName = existingUser.studentProfile
              ? `${existingUser.studentProfile.firstName} ${existingUser.studentProfile.lastName}`
              : existingUser.email;

            return {
              id: existingUser.id,
              email: existingUser.email,
              name: displayName,
              role: existingUser.role,
              status: existingUser.status,
              emailVerified: existingUser.emailVerified,
            };
          }

          // New User via Email OTP
          const localPart = email.split("@")[0] || "student";
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
                    firstName: "Student",
                    lastName: localPart,
                  },
                },
                authMethods: {
                  create: {
                    type: AuthType.EMAIL_OTP,
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
            metadata: {
              email,
              method: "email_otp",
              role: UserRole.STUDENT,
            },
            result: AuditResult.SUCCESS,
          });

          await createAuditLog({
            userId: newUser.id,
            action: "AUTH_LOGIN",
            resource: "User",
            resourceId: newUser.id,
            metadata: {
              email,
              method: "email_otp",
              role: UserRole.STUDENT,
            },
            result: AuditResult.SUCCESS,
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: `Student (${localPart})`,
            role: newUser.role,
            status: newUser.status,
            emailVerified: newUser.emailVerified,
          };
        }

        // Path B: Phone Number + OTP Login / Registration
        if (credentials?.type === "phone_otp") {
          const parsed = PhoneVerifyOtpSchema.safeParse({
            phone: credentials.phone,
            code: credentials.code,
          });

          if (!parsed.success) {
            return null;
          }

          const normalizedPhone = normalizePhone(parsed.data.phone);
          const { code } = parsed.data;

          const otp = await prisma.otpCode.findFirst({
            where: {
              destination: normalizedPhone,
              purpose: OtpPurpose.LOGIN,
              consumedAt: null,
            },
            orderBy: { createdAt: "desc" },
          });

          if (!otp) {
            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: normalizedPhone,
                method: "phone_otp",
                reason: "No active OTP found",
              },
              result: AuditResult.FAILURE,
            });
            throw new Error("OTP_NOT_FOUND");
          }

          if (new Date() > otp.expiresAt) {
            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: normalizedPhone,
                method: "phone_otp",
                reason: "OTP code expired",
              },
              result: AuditResult.FAILURE,
            });
            throw new Error("OTP_EXPIRED");
          }

          if (otp.attempts >= 5) {
            await prisma.otpCode.update({
              where: { id: otp.id },
              data: { consumedAt: new Date() },
            });
            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: normalizedPhone,
                method: "phone_otp",
                reason: "Max verification attempts exceeded (invalidated)",
              },
              result: AuditResult.FAILURE,
            });
            throw new Error("OTP_MAX_ATTEMPTS");
          }

          if (otp.code !== code) {
            const nextAttempts = otp.attempts + 1;
            const isNowExceeded = nextAttempts >= 5;

            await prisma.otpCode.update({
              where: { id: otp.id },
              data: {
                attempts: nextAttempts,
                consumedAt: isNowExceeded ? new Date() : null,
              },
            });

            await createAuditLog({
              action: "AUTH_LOGIN",
              resource: "User",
              metadata: {
                destination: normalizedPhone,
                method: "phone_otp",
                reason: "Incorrect OTP code",
                attempts: nextAttempts,
                remainingAttempts: Math.max(0, 5 - nextAttempts),
              },
              result: AuditResult.FAILURE,
            });

            if (isNowExceeded) {
              throw new Error("OTP_MAX_ATTEMPTS");
            }

            throw new Error(`OTP_INCORRECT:${Math.max(0, 5 - nextAttempts)}`);
          }

          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { consumedAt: new Date() },
          });

          const existingUser = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
            include: { authMethods: true, studentProfile: true },
          });

          if (existingUser) {
            // Fix #2: Reject OTP login for Staff/Admin accounts
            if (existingUser.role !== UserRole.STUDENT) {
              await createAuditLog({
                userId: existingUser.id,
                action: "SECURITY_BLOCKED_METHOD",
                resource: "User",
                resourceId: existingUser.id,
                metadata: {
                  attemptedMethod: "phone_otp",
                  accountRole: existingUser.role,
                  reason: "OTP sign-in is prohibited for privileged roles (STAFF/ADMIN)",
                },
                result: AuditResult.FAILURE,
              });
              throw new Error("SECURITY_BLOCKED_METHOD: This sign-in method isn't available for this account type.");
            }

            // Fix #5: Consolidated status check assertion
            const { assertUserLoginAllowed } = await import("@/lib/auth-helpers");
            await assertUserLoginAllowed(existingUser, "phone_otp");

            const hasPhoneMethod = existingUser.authMethods.some(
              (m) => m.type === AuthType.PHONE_OTP
            );

            if (!hasPhoneMethod) {
              await prisma.authMethod.create({
                data: {
                  userId: existingUser.id,
                  type: AuthType.PHONE_OTP,
                },
              });
            }

            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                phoneVerified: existingUser.phoneVerified ?? new Date(),
                lastLoginAt: new Date(),
              },
            });

            await createAuditLog({
              userId: existingUser.id,
              action: "AUTH_LOGIN",
              resource: "User",
              resourceId: existingUser.id,
              metadata: {
                phone: normalizedPhone,
                method: "phone_otp",
                role: existingUser.role,
                accountLinked: !hasPhoneMethod,
              },
              result: AuditResult.SUCCESS,
            });

            const displayName = existingUser.studentProfile
              ? `${existingUser.studentProfile.firstName} ${existingUser.studentProfile.lastName}`
              : existingUser.phone;

            return {
              id: existingUser.id,
              email: existingUser.email,
              name: displayName,
              role: existingUser.role,
              status: existingUser.status,
              emailVerified: existingUser.emailVerified,
            };
          }

          // New User via Phone OTP (Phone-Only Account)
          const last4 = normalizedPhone.slice(-4);
          const newUser = await prisma.$transaction(async (tx) => {
            return await tx.user.create({
              data: {
                phone: normalizedPhone,
                role: UserRole.STUDENT,
                status: UserStatus.ACTIVE,
                phoneVerified: new Date(),
                lastLoginAt: new Date(),
                studentProfile: {
                  create: {
                    firstName: "Student",
                    lastName: `#${last4}`,
                    phone: normalizedPhone,
                  },
                },
                authMethods: {
                  create: {
                    type: AuthType.PHONE_OTP,
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
            metadata: {
              phone: normalizedPhone,
              method: "phone_otp",
              role: UserRole.STUDENT,
            },
            result: AuditResult.SUCCESS,
          });

          await createAuditLog({
            userId: newUser.id,
            action: "AUTH_LOGIN",
            resource: "User",
            resourceId: newUser.id,
            metadata: {
              phone: normalizedPhone,
              method: "phone_otp",
              role: UserRole.STUDENT,
            },
            result: AuditResult.SUCCESS,
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: `Student #${last4}`,
            role: newUser.role,
            status: newUser.status,
            emailVerified: newUser.emailVerified,
          };
        }

        // Path C: Email + Password Login
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
          include: { studentProfile: true, staffProfile: true },
        });

        const { assertUserLoginAllowed, handleFailedPasswordAttempt, resetFailedPasswordAttempts } =
          await import("@/lib/auth-helpers");

        if (!user || !user.passwordHash) {
          await createAuditLog({
            action: "AUTH_LOGIN",
            resource: "User",
            metadata: { email, method: "password", reason: "User not found or no password set" },
            result: AuditResult.FAILURE,
          });
          return null;
        }

        // Fix #5 & Fix #6: Lockout and status assertion before password verification
        await assertUserLoginAllowed(user, "password");

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          // Fix #6: Increment failed attempts & trigger lockout after 5 failures
          await handleFailedPasswordAttempt(user.id, user.email || email, user.failedLoginAttempts || 0);
          await createAuditLog({
            userId: user.id,
            action: "AUTH_LOGIN",
            resource: "User",
            resourceId: user.id,
            metadata: { email, method: "password", reason: "Invalid credentials" },
            result: AuditResult.FAILURE,
          });
          return null;
        }

        // Reset failed password attempts on successful login
        await resetFailedPasswordAttempts(user.id);

        if (!user.emailVerified) {
          await createAuditLog({
            userId: user.id,
            action: "AUTH_LOGIN",
            resource: "User",
            resourceId: user.id,
            metadata: { email, method: "password", reason: "Email not verified" },
            result: AuditResult.FAILURE,
          });
          throw new Error("EMAIL_NOT_VERIFIED");
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
          metadata: { email, method: "password", role: user.role },
          result: AuditResult.SUCCESS,
        });

        const name = user.studentProfile
          ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
          : user.email;

        return {
          id: user.id,
          email: user.email,
          name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) {
          await createAuditLog({
            action: "AUTH_LOGIN",
            resource: "User",
            metadata: { method: "google", reason: "Missing email in Google OAuth payload" },
            result: AuditResult.FAILURE,
          });
          return false;
        }

        const providerAccountId = account.providerAccountId || (profile?.sub as string) || "";

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { authMethods: true, studentProfile: true },
          });

          if (existingUser) {
            // Fix #1: Handle activation for invited INACTIVE Staff/Admin accounts via Google OAuth
            const isPendingActivation =
              existingUser.status === UserStatus.INACTIVE &&
              (existingUser.role === UserRole.STAFF || existingUser.role === UserRole.ADMIN);

            if (existingUser.status !== UserStatus.ACTIVE && !isPendingActivation) {
              await createAuditLog({
                userId: existingUser.id,
                action: "AUTH_LOGIN",
                resource: "User",
                resourceId: existingUser.id,
                metadata: { email, method: "google", reason: "Account inactive or suspended" },
                result: AuditResult.FAILURE,
              });
              return false;
            }

            const existingGoogleMethod = existingUser.authMethods.find(
              (m) => m.type === AuthType.GOOGLE
            );

            // Fix #9: Reject Conflicting Google Account Links if providerAccountId differs
            if (
              existingGoogleMethod &&
              existingGoogleMethod.providerAccountId &&
              providerAccountId &&
              existingGoogleMethod.providerAccountId !== providerAccountId
            ) {
              await createAuditLog({
                userId: existingUser.id,
                action: "ACCOUNT_LINK_REJECTED",
                resource: "User",
                resourceId: existingUser.id,
                metadata: {
                  email,
                  existingProviderAccountId: existingGoogleMethod.providerAccountId,
                  incomingProviderAccountId: providerAccountId,
                  reason: "Conflicting Google providerAccountId attempted on existing account",
                },
                result: AuditResult.FAILURE,
              });
              return false;
            }

            if (!existingGoogleMethod) {
              await prisma.authMethod.create({
                data: {
                  userId: existingUser.id,
                  type: AuthType.GOOGLE,
                  providerAccountId: providerAccountId || null,
                },
              });
            }

            const nextStatus = isPendingActivation ? UserStatus.ACTIVE : existingUser.status;

            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                status: nextStatus,
                emailVerified: existingUser.emailVerified ?? new Date(),
                lastLoginAt: new Date(),
              },
            });

            if (isPendingActivation) {
              await createAuditLog({
                userId: existingUser.id,
                action: "STAFF_ADMIN_ACTIVATED",
                resource: "User",
                resourceId: existingUser.id,
                metadata: {
                  email,
                  role: existingUser.role,
                  method: "google",
                },
                result: AuditResult.SUCCESS,
              });
            }

            await createAuditLog({
              userId: existingUser.id,
              action: "AUTH_LOGIN",
              resource: "User",
              resourceId: existingUser.id,
              metadata: {
                email,
                method: "google",
                accountLinked: !existingGoogleMethod,
                role: existingUser.role,
                activated: isPendingActivation,
              },
              result: AuditResult.SUCCESS,
            });

            user.id = existingUser.id;
            (user as { role?: UserRole }).role = existingUser.role;
            (user as { status?: UserStatus }).status = nextStatus;

            return true;
          }

          const rawName = user.name || (profile?.name as string) || "";
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
                    providerAccountId: providerAccountId || null,
                  },
                },
              },
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

          user.id = newUser.id;
          (user as { role?: UserRole }).role = newUser.role;
          (user as { status?: UserStatus }).status = newUser.status;

          return true;
        } catch (error) {
          console.error("[Google OAuth signIn callback error]:", error);
          await createAuditLog({
            action: "AUTH_LOGIN",
            resource: "User",
            metadata: { email, method: "google", error: String(error) },
            result: AuditResult.FAILURE,
          });
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
          });

          if (dbUser) {
            // Fix #4: Check if sessionVersion stored in JWT matches current sessionVersion in DB
            if (
              token.sessionVersion !== undefined &&
              token.sessionVersion !== null &&
              token.sessionVersion !== dbUser.sessionVersion
            ) {
              console.warn(
                `[JWT Revoked]: sessionVersion mismatch for user ${dbUser.id} (Token: ${token.sessionVersion}, DB: ${dbUser.sessionVersion})`
              );
              return {} as any; // Revokes token immediately on next request
            }

            token.id = dbUser.id;
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.emailVerified = dbUser.emailVerified;
            token.sessionVersion = dbUser.sessionVersion;
            token.totpEnabled = dbUser.totpEnabled;
            return token;
          }
        } catch {
          // fallback
        }
      }

      if (user) {
        token.id = (user.id as string) || token.sub || "";
        token.role = (user as { role?: UserRole }).role || UserRole.STUDENT;
        token.status = (user as { status?: UserStatus }).status || UserStatus.ACTIVE;
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified ?? null;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
        token.totpEnabled = (user as { totpEnabled?: boolean }).totpEnabled ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.emailVerified = token.emailVerified as Date | null;
        (session.user as any).sessionVersion = token.sessionVersion;
        (session.user as any).totpEnabled = token.totpEnabled;
      }
      return session;
    },
  },
});
