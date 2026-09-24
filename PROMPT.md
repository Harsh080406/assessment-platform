# PROMPT.md — Build Brief for AuraPath (Psychometric Assessment & Career Guidance Platform)

> Use this as the master prompt for an AI coding agent (Claude Code, Cursor, etc.) or as a brief for a dev team. Feed it one phase/section at a time rather than all at once — see "How to use this prompt" at the bottom.

---

## 1. Project Context

You are building **AuraPath**, a global, security-focused, multi-role web platform where students take a digital psychometric assessment, human experts manually evaluate the responses, and students receive a personalized career-guidance report through a secure portal.

**This is not an auto-scored quiz app.** The defining architectural fact of this product is:

> Test-taking is automated. Report generation is manual and expert-led. The system's job is to make that manual workflow fast, auditable, and secure — not to replace it with an algorithm.

An existing Next.js repo already has a marketing landing page live (hero, "how it works," trust badges, footer) at a Vercel deployment. **Extend this repo — do not start a new one** unless explicitly told otherwise.

---

## 2. Tech Stack (fixed decisions)

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Auth:** Auth.js (NextAuth) with multiple sign-in methods (see section 4a), JWT session, RBAC (`student`, `staff`, `admin`).
- **Database:** PostgreSQL, accessed via Prisma ORM.
- **File storage:** S3-compatible private bucket for report PDFs (never store PDFs in Postgres).
- **Email:** Resend (or SES/SendGrid) for transactional email.
- **Validation:** Zod for all form and API input.
- **State/data fetching:** Server Components + Server Actions by default; React Query only where genuine client-side interactivity needs it (e.g., assessment auto-save).

Do not introduce a separate backend framework (NestJS/Express) unless a specific task genuinely requires background workers outside the Next.js request lifecycle — keep the surface area minimal.

---

## 3. Non-Negotiable Product Rules

Bake these into every relevant piece of code, not just note them:

1. **No automated scoring or interpretation.** The system stores responses and routes them to a human expert. Do not build a scoring algorithm.
2. **Reports are never publicly reachable by URL.** Every report fetch must go through: authenticated session → authorization check (`report.student_id === session.user.id` or caller is staff/admin) → short-lived signed URL. No static `/reports/<id>.pdf` route.
3. **Assessment and question versioning is mandatory from the first migration.** Every `assessment_attempt` records the exact `assessment` version it was taken against; every `response` records the exact `question` version it answered. Never mutate a question that has existing responses — create a new version instead.
4. **Auto-save on every answer.** A student must never lose progress from a browser crash or network blip. Debounce writes (~500ms–1s) to the `responses` table keyed by `(attempt_id, question_id)`.
5. **Attempts lock on submission.** Once `status = SUBMITTED`, no further writes to that attempt's responses are permitted at the API layer, regardless of what the client sends.
6. **Data minimization.** Only collect fields actually required for the report or account function. Don't make phone/school mandatory on the *profile* unless the client has said the report needs them — note that phone number may still be a required *sign-in identifier* for users who choose the phone-OTP method, which is a separate concern from profile data collection.
7. **Every sensitive action is audit-logged**: login, staff viewing a student's responses, report upload/approve/publish/view/download, admin user/staff changes. Log actor, action, resource, timestamp, and result (success/failure) at minimum.
8. **Distinct UI system per surface.** The assessment-taking UI has no marketing navbar — minimal chrome, progress bar, back/next, nothing that risks an accidental exit. Staff/admin UIs are dense and table/filter-oriented. Student dashboard is simple and status-oriented. Marketing stays visual/conversion-focused. Do not reuse one layout/shell across all four.

---

## 4. Authentication Methods

Students (and optionally staff/admin for email+password/Google) must be able to sign in via **any** of the following, all resolving to the same underlying `User` record and RBAC session shape:

1. **Email + password** — standard credentials flow with email verification before first login.
2. **Google OAuth** — via Auth.js Google provider. On first Google sign-in, auto-create a `User` with `emailVerified` set true (Google already verified it) and no `passwordHash`.
3. **Phone number + OTP** — user enters phone number, receives a one-time code via SMS, enters it to sign in/register. No password involved for this path.
4. **Email + OTP** — same OTP pattern as phone, but the code is emailed instead of texted. Useful as a passwordless fallback and for password-reset-adjacent "magic code" login.

**Design rules for multi-method auth:**

- One `User` can have **multiple linked sign-in methods** (e.g., signed up with Google, later adds a password, later adds a phone number) — model this as a separate `AuthMethod` table rather than cramming every provider's fields onto `User`, so account-linking doesn't require schema changes later.
- **Account linking must be identity-safe.** If someone signs up with `jane@x.com` via Google and later tries email+password with the same email, link to the existing account (after verifying ownership) rather than silently creating a duplicate `User`. Never auto-link on phone number alone without verifying the OTP first.
- **OTP codes**: 6-digit numeric, short expiry (5–10 minutes), single-use, rate-limited per phone/email (e.g., max 5 requests per hour), and never logged in plaintext outside of the (stubbed, swappable) SMS/email sender used in development.
- **Phone-only accounts** may not have an email at all — do not make email a hard NOT NULL on `User`; make the schema support "at least one of email or phone is present," not "email always present."
- Every successful and failed login attempt — regardless of method — is written to `AuditLog` with the method used (`google`, `password`, `phone_otp`, `email_otp`).
- Rate limiting and lockout rules (section 3 rule 7, and section on hardening) apply uniformly across all four methods, not just password.
- The SMS sender (for phone OTP) should be built behind a swappable interface (like the email sender) so a stub/console-log implementation can be used in development and swapped for a real provider (e.g., Twilio, MSG91) at deployment time — do not hard-code a specific SMS vendor into business logic.

---

## 5. Data Model (implement as Prisma schema)

```
User            (id, email?, phone?, passwordHash?, role[student|staff|admin], status, emailVerified, phoneVerified, createdAt, lastLoginAt)
AuthMethod      (id, userId, type[password|google|phone_otp|email_otp], providerAccountId?, createdAt)
OtpCode         (id, userId?, destination /* email or phone, for pre-signup flow */, code, purpose[login|signup|reset], expiresAt, consumedAt?, attempts, createdAt)
StudentProfile  (id, userId, firstName, lastName, dateOfBirth, country, phone?, school?, grade?, educationLevel?)
StaffProfile    (id, userId, specialty?, active)

Assessment          (id, title, description, version, status, estimatedDurationMins, createdAt)
AssessmentSection   (id, assessmentId, title, description, displayOrder)
Question            (id, sectionId, version, questionText, questionType[single_choice|multi_choice|likert|yes_no|ranking], displayOrder, required)
QuestionOption      (id, questionId, optionText, displayOrder)

AssessmentAttempt   (id, userId, assessmentId, assessmentVersion, startedAt, submittedAt?, status[not_started|in_progress|submitted|under_review|report_in_prep|pending_approval|published])
Response            (id, attemptId, questionId, questionVersion, answer /* jsonb */, answeredAt)

Report              (id, attemptId, studentId, fileReference, version, status[pending_approval|approved|published|rejected], uploadedBy, approvedBy?, uploadedAt, publishedAt?)

Notification        (id, userId, type, message, readAt?, createdAt)
AuditLog            (id, userId?, action, resource, resourceId?, ipAddress?, metadata /* jsonb */, result, createdAt)
```

Add appropriate indexes on `(userId)`, `(assessmentId, status)`, `(attemptId)`, and a unique constraint preventing more than one in-progress attempt per (user, assessment).

---

## 6. Route / Surface Structure

Use Next.js route groups to keep surfaces visually and logically separate while sharing one deployment:

```
app/
  (marketing)/            → existing landing page + About/FAQ/Contact/Legal
  (auth)/                 → sign-up, login, verify-email, forgot/reset password
  (student)/dashboard/    → student portal (protected: role=student)
  (assessment)/take/[attemptId]/  → distraction-free quiz UI (protected: role=student, owns attempt)
  (staff)/portal/         → staff dashboard, submission queue, evaluation workspace (protected: role=staff|admin)
  (admin)/console/        → admin dashboard, user/staff/assessment/report/content management (protected: role=admin)
  api/                    → route handlers for anything Server Actions can't cleanly cover (webhooks, signed-URL issuance)
```

Enforce role checks in **middleware** keyed on route group, not just in page components, so a missing per-page check can't leak access.

---

## 7. Build Order (feed to the agent phase by phase)

Work through phases in this order; each phase should ship functional and be reviewable before starting the next. Full detail for each phase is in `AuraPath_Roadmap_and_Architecture.md` — summarized here as build targets:

1. **Auth & RBAC skeleton** — email+password, Google OAuth, phone OTP, and email OTP sign-in, account linking, role-aware middleware, empty role-correct dashboards.
2. **Assessment engine** — schema + versioning, quiz-taking UI, auto-save, resume, review, submit, lock-on-submit.
3. **Staff portal** — queue, filters/search, submission detail with full response readout, notes, assign, PDF upload → private storage, status transitions.
4. **Admin portal** — dashboards, report approval/publish, user/staff/assessment CRUD, content management, audit log viewer.
5. **Student report access + notifications** — secure signed-URL view/download, report history, email + in-app notifications.
6. **Security hardening pass** — rate limiting, MFA for admin, file-upload validation/scanning, security headers, full audit coverage review.
7. **Accessibility, responsive, performance QA** — WCAG 2.2 AA on the assessment flow specifically, full breakpoint matrix, Lighthouse pass on marketing pages.
8. **Deployment** — production DB with backups/PITR, private object storage with versioning, monitoring/alerting, env/secrets setup.

Do not skip ahead to admin/reporting features before the assessment engine's versioning model is solid — everything downstream depends on it.

---

## 8. Definition of Done (per feature)

Before marking any feature complete, confirm:
- [ ] Input validated with Zod on both client and server.
- [ ] Authorization checked server-side (never trust client role claims).
- [ ] Relevant action written to `AuditLog`.
- [ ] Mobile layout checked at 375px width minimum.
- [ ] No secrets, API keys, or connection strings hard-coded — pulled from environment/secrets manager.
- [ ] Error states handled gracefully (no raw stack traces to the client).
- [ ] If it touches reports or PII: access is behind auth + authorization + (for files) a signed URL.

---

## 9. What the Client Owns (do not fabricate)

Do not invent or hard-code: the actual 75 assessment questions, evaluation methodology, report template/design, legal text (privacy policy, terms), or final branding assets. Where these are needed for development, use clearly-labeled placeholder content and flag it for client replacement rather than presenting invented content as final.

---

## How to use this prompt

Paste this whole file as system/context for the coding agent once, then drive work turn by turn with prompts like:

> "Using PROMPT.md as context, implement Phase 1 (Auth & RBAC skeleton) in the existing repo. Start with the Prisma schema for User/AuthMethod/OtpCode/StudentProfile/StaffProfile, then email+password sign-up with verification, then add Google OAuth, then phone OTP and email OTP."

Keep each request scoped to one phase/feature so the agent can produce reviewable, testable increments rather than one enormous diff.
