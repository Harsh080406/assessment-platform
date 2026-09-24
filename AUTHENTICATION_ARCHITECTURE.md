# AuraPath Matrix — Authentication & Authorization Architecture

## Executive Summary

The **AuraPath Matrix Platform** implements an enterprise-grade, multi-tenant authentication and Role-Based Access Control (RBAC) architecture. Built upon **NextAuth.js (Auth.js v5)**, **Prisma ORM**, and **Next.js Middleware**, the system provides seamless authentication for three primary user roles: **Student**, **Staff**, and **Admin**.

This document details the architectural design, data schemas, authentication providers, role routing policies, security safeguards, and audit logging workflows.

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  [ UnifiedAuthCard.tsx ]  /  [ GoogleSignInButton.tsx ]  /  [ PhoneSignInForm.tsx ]   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                            NEXT.JS MIDDLEWARE LAYER                               |
|                     ( middleware.ts / JWT Verification )                          |
|                                                                                   |
|  Checks: Token Validity  |  User Status (ACTIVE)  |  Role Route Boundaries         |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                            NEXTAUTH (AUTH.JS V5) ENGINE                           |
|                               ( auth.ts )                                         |
|                                                                                   |
|  +------------------+  +------------------+  +-----------------+  +------------+  |
|  | Email + Password |  |   Google OAuth   |  |    Email OTP    |  | Phone OTP  |  |
|  +------------------+  +------------------+  +-----------------+  +------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                                    |
|                      ( PostgreSQL + Prisma ORM )                                  |
|                                                                                   |
|   [ User ] <---> [ AuthMethod ] <---> [ StudentProfile / StaffProfile ]           |
|      |                                                                            |
|      +---------> [ OtpCode ]  |  [ AuditLog ]                                     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Database Schema Architecture

Authentication and identity management are structured across decoupled entity tables to support multi-provider login methods per user:

```prisma
enum UserRole {
  STUDENT
  STAFF
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum AuthType {
  PASSWORD
  GOOGLE
  PHONE_OTP
  EMAIL_OTP
}

model User {
  id            String          @id @default(cuid())
  email         String?         @unique
  phone         String?         @unique
  passwordHash  String?
  role          UserRole        @default(STUDENT)
  status        UserStatus      @default(ACTIVE)
  emailVerified DateTime?
  phoneVerified DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  lastLoginAt   DateTime?

  authMethods    AuthMethod[]
  studentProfile StudentProfile?
  staffProfile   StaffProfile?
  attempts       AssessmentAttempt[]
  notifications  Notification[]
  auditLogs      AuditLog[]

  @@index([role])
  @@index([status])
}

model AuthMethod {
  id                String    @id @default(cuid())
  userId            String
  type              AuthType
  providerAccountId String?
  createdAt         DateTime  @default(now())

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@unique([userId, type, providerAccountId])
}

model OtpCode {
  id          String      @id @default(cuid())
  userId      String?
  destination String
  code        String
  purpose     OtpPurpose
  expiresAt   DateTime
  consumedAt  DateTime?
  attempts    Int         @default(0)
  createdAt   DateTime    @default(now())

  @@index([destination, purpose])
}
```

---

## 3. Supported Authentication Workflows

AuraPath supports four unified authentication workflows rendered inside the `UnifiedAuthCard` component:

### 3.1. Email & Password Authentication
- **Flow**: User inputs email and password -> validated against `LoginSchema`.
- **Security Check**:
  - `bcrypt.compare(password, user.passwordHash)`.
  - Verifies `user.status === UserStatus.ACTIVE`.
  - Verifies `user.emailVerified !== null`.
- **Outcome**: Returns user object with `id`, `role`, `status`, and `emailVerified`.

### 3.2. Google OAuth Integration (OpenID Connect)
- **Flow**: User clicks "Continue with Google" -> NextAuth redirects to Google OAuth consent screen.
- **Account Linking & Provisioning (`signIn` callback in `auth.ts`)**:
  - If existing user matches Google email:
    - Verifies `existingUser.status === ACTIVE`.
    - Automatically links `AuthType.GOOGLE` method if not present.
    - Updates `lastLoginAt` and `emailVerified`.
  - If new user:
    - Atomically creates `User` (`role = STUDENT`, `status = ACTIVE`, `emailVerified = now()`).
    - Creates `StudentProfile` with Google display name.
    - Links `AuthType.GOOGLE` with `providerAccountId`.
- **Audit Logging**: Emits `AUTH_REGISTER` and `AUTH_LOGIN` audit logs upon success.

### 3.3. Passwordless Email OTP Login / Registration
- **Flow**: User requests 6-digit login OTP -> system generates `OtpCode` with 10-minute expiration.
- **Verification**:
  - Validates code against unconsumed `OtpCode` record.
  - **Brute-Force Guard**: Increments `attempts`. If `attempts >= 5`, invalidates code immediately (`consumedAt = now()`) and throws `OTP_MAX_ATTEMPTS`.
- **Provisioning**: Auto-provisions `STUDENT` user if email does not exist.

### 3.4. Phone Number + SMS OTP Login / Registration
- **Flow**: User inputs phone number -> normalized using `normalizePhone()` (E.164 format e.g. `+919876543210`).
- **Verification**: 6-digit OTP code validation with 5-attempt rate limiting.
- **Phone-Only Accounts**: Auto-provisions phone-based student account (`lastName = #<last4>`) for friction-free onboarding.

---

## 4. Role Isolation & Portal Treatment

AuraPath enforces strict separation between **Student**, **Staff**, and **Admin** portals:

| User Role | Primary Portal | Allowed Routes | Forbidden Routes | Unauthenticated Redirect |
| :--- | :--- | :--- | :--- | :--- |
| **`STUDENT`** | Student Dashboard (`/dashboard`) | `/dashboard/*`, `/take/*`, `/quests`, `/careers` | `/portal/*` (Staff), `/console/*` (Admin) | Redirects to `/login?callbackUrl=...` |
| **`STAFF`** | Staff Portal (`/portal`) | `/portal/*`, `/portal/review/*` | `/dashboard/*` (Student), `/console/*` (Admin) | Redirects to `/login?callbackUrl=...` |
| **`ADMIN`** | Admin Console (`/console`) | `/console/*`, `/portal/*`, `/dashboard/*` (Super-User) | None | Redirects to `/login?callbackUrl=...` |

### Detailed Role Behavior:

#### 1. Student User Treatment (`role: STUDENT`)
- **Landing Redirect**: Upon login, students are immediately routed to `/dashboard`.
- **Environment**: Access to diagnostic modules (Module A, B, C, D), career fit reports, and personal account settings.
- **Boundary Enforcement**: Attempting to access `/portal` or `/console` redirects the student to `/unauthorized` or back to `/dashboard`.

#### 2. Staff User Treatment (`role: STAFF`)
- **Landing Redirect**: Upon login, staff users are routed directly to `/portal`.
- **Environment**: Access to candidate assessment review queues, response evaluation HUD, psychologist notes input, and report sign-off tools.
- **Boundary Enforcement**: Attempting to access `/dashboard` redirects staff to `/portal`. Attempting to access `/console` redirects to `/unauthorized`.

#### 3. Admin User Treatment (`role: ADMIN`)
- **Landing Redirect**: Upon login, administrators are routed directly to `/console`.
- **Environment**: Access to full platform telemetry, user management, staff assignments, system audit logs, and diagnostic engine controls.
- **Super-User Privilege**: Admins can inspect staff review portals (`/portal`) and preview student assessment flows (`/dashboard`).

---

## 5. Middleware Route Protection (`middleware.ts`)

Next.js Middleware intercepts every incoming HTTP request and enforces session and role boundaries before rendering pages:

```typescript
// 1. Session Token Extraction
const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
const isAuthenticated = !!token;
const userRole = token?.role;

// 2. Auth & Marketing Route Handling for Authenticated Users
if (isAuthenticated && (isAuthRoute || isMarketingRoute)) {
  if (userRole === "ADMIN") return NextResponse.redirect(new URL("/console", request.url));
  if (userRole === "STAFF") return NextResponse.redirect(new URL("/portal", request.url));
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

// 3. Student Route Guard (/dashboard/*, /take/*)
if (isStudentRoute) {
  if (!isAuthenticated) return redirectToLogin(request);
  if (userRole === "STAFF") return NextResponse.redirect(new URL("/portal", request.url));
  if (userRole !== "STUDENT" && userRole !== "ADMIN") return NextResponse.redirect(new URL("/unauthorized", request.url));
}

// 4. Staff Route Guard (/portal/*)
if (isStaffRoute) {
  if (!isAuthenticated) return redirectToLogin(request);
  if (userRole !== "STAFF" && userRole !== "ADMIN") return NextResponse.redirect(new URL("/unauthorized", request.url));
}

// 5. Admin Route Guard (/console/*)
if (isAdminRoute) {
  if (!isAuthenticated) return redirectToLogin(request);
  if (userRole !== "ADMIN") return NextResponse.redirect(new URL("/unauthorized", request.url));
}
```

---

## 6. Audit Logging & Security Trail

Every authentication event (successful logins, registrations, failed attempts, account linking, OTP rate limiting) generates an immutable `AuditLog` entry:

```typescript
await createAuditLog({
  userId: user.id,
  action: "AUTH_LOGIN",
  resource: "User",
  resourceId: user.id,
  metadata: {
    email: user.email,
    method: "google", // "password" | "google" | "email_otp" | "phone_otp"
    role: user.role,
    accountLinked: true,
  },
  result: AuditResult.SUCCESS,
});
```

These logs are viewable in real-time by administrators inside the **Admin Audit Console (`/console/audit-logs`)**.

---

## 7. Summary Matrix

| Metric / Aspect | Student | Staff | Admin |
| :--- | :--- | :--- | :--- |
| **Auth Methods** | Email/Password, Google OAuth, Email OTP, Phone OTP | Email/Password, Google OAuth | Email/Password, Google OAuth |
| **Default Entry Route** | `/dashboard` | `/portal` | `/console` |
| **Profile Schema** | `StudentProfile` | `StaffProfile` | User Account |
| **Session Strategy** | JWT (30 days sliding) | JWT (30 days sliding) | JWT (30 days sliding) |
| **Audit Logged** | Yes | Yes | Yes |
