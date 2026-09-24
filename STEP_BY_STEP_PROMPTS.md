# STEP_BY_STEP_PROMPTS.md — AuraPath Build Sequence

Copy-paste one prompt at a time, in order, into your coding agent (Claude Code, Cursor, etc.). Wait for each phase to be reviewed and working before sending the next one. Each prompt assumes `PROMPT.md` and `AuraPath_Roadmap_and_Architecture.md` are already in the repo (or pasted earlier in the session) as shared context — reference them explicitly so the agent doesn't lose the rules.

Do not paste all of these at once. Feed them one at a time, review the diff/output, then move on.

---

## Prompt 0 — Repo Orientation & Setup

```
Read PROMPT.md and AuraPath_Roadmap_and_Architecture.md in this repo before doing anything else.

Then:
1. Inspect the existing Next.js repo structure and summarize what's already built (pages, components, deployment config).
2. Propose the folder structure for the route groups described in PROMPT.md section 5:
   (marketing) (auth) (student) (assessment) (staff) (admin), plus api/.
3. Set up Prisma with a PostgreSQL connection (use a placeholder DATABASE_URL in .env.example).
4. Add Zod, Auth.js (NextAuth), and any other core dependencies listed in PROMPT.md section 2.
5. Do NOT build any features yet. Just get the project scaffolded and confirm it builds and runs locally.

Show me the resulting folder structure and package.json diff before proceeding.
```

---

## Prompt 1a — Auth & RBAC Skeleton (Email + Password)

```
Using PROMPT.md as the source of truth (sections 3, 4, 5, 6, 8), implement the first slice of Phase 1: email+password auth and RBAC skeleton. Other sign-in methods (Google, phone OTP, email OTP) come in later prompts — build the schema to support them per section 4/5, but only wire up email+password in this prompt.

Scope for this prompt only:
1. Prisma schema for User, AuthMethod, OtpCode, StudentProfile, StaffProfile (section 5 of PROMPT.md). Include all four fields/tables even though only `password` AuthMethod is used yet — this avoids a schema migration in the next prompt.
2. Sign-up flow with email verification (use a stub/console-log email sender behind an interface I can swap for Resend later).
3. Login, logout, forgot-password, reset-password — all email+password based.
4. Auth.js session + JWT setup with role (student/staff/admin) embedded.
5. Middleware that enforces role-based access per route group — student cannot reach (staff)/(admin), etc. Enforce this in middleware, not just in page components.
6. One minimal, empty dashboard page per role, just enough to prove the redirect/access logic works.
7. Every login attempt (success/failure) writes to AuditLog with method="password".

Follow the Definition of Done checklist in PROMPT.md section 8. Do not touch the assessment engine, staff portal, admin portal, or other auth methods yet.

When done, tell me how to test: which routes to hit as which role, and what should happen if a student tries to access a staff/admin route directly.
```

---

## Prompt 1b — Add Google OAuth Sign-In

```
Extend the auth system from Prompt 1a to add Google OAuth as a second sign-in method, per PROMPT.md section 4.

Scope for this prompt only:
1. Add the Auth.js Google provider (use placeholder GOOGLE_CLIENT_ID/SECRET in .env.example).
2. On first Google sign-in with an email not already in the system, create a new User with emailVerified=true and an AuthMethod row of type="google" — no passwordHash required.
3. On Google sign-in with an email that DOES already exist (e.g., signed up via email+password earlier), link the Google AuthMethod to the existing User instead of creating a duplicate — since Google has already verified the email, this link can happen automatically, but confirm my assumption before implementing: should linking require the user to already be logged in, or is verified-email-match sufficient? Ask me if unclear, otherwise implement verified-email-match linking.
4. Add "Continue with Google" to the login and sign-up UI alongside the existing email+password form.
5. Log method="google" on every login attempt in AuditLog.

Don't touch phone OTP or email OTP yet. Tell me how to test both the new-user and account-linking paths.
```

---

## Prompt 1c — Add Phone OTP Sign-In

```
Extend the auth system to add phone-number + OTP sign-in, per PROMPT.md section 4.

Scope for this prompt only:
1. "Sign in with phone" flow: user enters phone number → system generates a 6-digit OTP stored in OtpCode (purpose=login or signup, 5-10 min expiry, single-use) → send via a swappable SMS-sender interface (stub to console.log for now, structured so a real provider like Twilio/MSG91 can be swapped in later) → user enters code → verify → create session.
2. If the phone number matches an existing User, sign them in and add/confirm the phone_otp AuthMethod. If it's a new phone number, create a new User (phone-only accounts are allowed — do not require email, per section 4/5's "at least one of email or phone" rule).
3. Rate limit OTP requests per phone number (e.g., max 5 per hour) and cap verify attempts per code (e.g., 5 tries before the code is invalidated).
4. Add "Sign in with phone" as an option on the login/sign-up UI.
5. Log method="phone_otp" on every login attempt in AuditLog, including failed OTP verifications.

Tell me how to test: request an OTP, find it in the console-log stub output, verify it, and confirm rate limiting kicks in after repeated requests.
```

---

## Prompt 1d — Add Email OTP (Passwordless) Sign-In

```
Extend the auth system to add email + OTP as a fourth sign-in method, per PROMPT.md section 4 — this reuses most of the phone-OTP plumbing from Prompt 1c but sends the code by email instead of SMS.

Scope for this prompt only:
1. "Sign in with email code" flow: user enters email → OtpCode generated (purpose=login) → sent via the existing swappable email-sender interface from Prompt 1a → user enters code → verify → session created.
2. If the email matches an existing User (regardless of which method they originally signed up with), sign them in via this path and add an email_otp AuthMethod record if not already present.
3. Same rate-limiting and attempt-cap rules as phone OTP (section 4 of PROMPT.md).
4. Add "Email me a code" as an option alongside password/Google/phone on the login/sign-up UI — at this point the login screen should show all four methods.
5. Log method="email_otp" in AuditLog.

After this prompt, do a quick end-to-end review: confirm all four methods (password, Google, phone OTP, email OTP) correctly resolve to role-aware sessions, and that a single email or phone can't end up attached to two different User records by accident. Tell me how to test each method plus one cross-method linking scenario (e.g., sign up via Google, then later log in via email OTP with the same address).
```

---

## Prompt 2 — Assessment Engine (Core)

```
Using PROMPT.md (sections 3 rule 3–5, 4, 6) and AuraPath_Roadmap_and_Architecture.md section 4.3, implement Phase 2: the Assessment Engine.

Scope for this prompt only:
1. Prisma models for Assessment, AssessmentSection, Question, QuestionOption, AssessmentAttempt, Response — with assessment/question VERSIONING as described. Every attempt pins assessmentVersion; every response pins questionVersion.
2. A seed script that creates one sample assessment: 3 sections, ~10 placeholder questions total (not the real 75 — clearly comment that real content is client-provided), mixing single_choice and likert question types.
3. The assessment-taking UI at (assessment)/take/[attemptId]/ — minimal chrome, no marketing navbar, progress bar, section/question indicator, Next/Previous.
4. Auto-save: debounced write to Response on every answer change (~500-1000ms debounce).
5. Resume: if a student has an in-progress attempt for an assessment, "Start Assessment" should resume it, not create a new one.
6. Review screen showing answered/unanswered count before final submit, with a confirmation step.
7. On submit: set attempt status to SUBMITTED, lock the attempt server-side so no further response writes are accepted for it even if the client tries.

Do not build scoring or interpretation logic — responses just get stored for manual review.

Tell me how to manually test: create an attempt, answer some questions, refresh the browser mid-quiz to confirm auto-save/resume works, then submit and confirm further writes are rejected.
```

---

## Prompt 3 — Staff (Expert) Portal

```
Using PROMPT.md (sections 3 rules 2, 7, 4, 6) implement Phase 3: the Staff Portal.

Scope for this prompt only:
1. Staff dashboard at (staff)/portal/ showing queue counts: new submissions, under evaluation, pending report upload, completed — pulled from real AssessmentAttempt/Report status counts.
2. Submission list with filters (date, assessment, status, assigned staff) and search by student name.
3. Submission detail view: full response readout grouped by section (respecting question versioning — show the exact question text/version that was answered), an expert notes textarea, and an assign-to-self action.
4. Status transitions matching this state machine: SUBMITTED → UNDER_REVIEW → REPORT_IN_PREP → PENDING_APPROVAL.
5. Report upload: PDF-only file input, validate file type and a reasonable size cap server-side, store in the private object storage bucket (use a local-disk or MinIO stub for now behind an interface I can swap for S3 later), create a Report record with status PENDING_APPROVAL.
6. Every view of a student's responses and every report upload must write to AuditLog (actor, action, resource, result).

This portal is role-gated to staff and admin only — reuse the middleware from Phase 1.

Tell me how to test the full loop: log in as staff, see a real submitted attempt in the queue, open it, read responses, upload a placeholder PDF, and confirm it lands as PENDING_APPROVAL with an audit log entry.
```

---

## Prompt 4 — Admin Portal & Report Publishing

```
Using PROMPT.md (sections 3, 4, 7) implement Phase 4: the Admin Portal and report approval/publish loop.

Scope for this prompt only:
1. Admin dashboard at (admin)/console/ with platform-wide counts: total students, total attempts, pending reviews, reports pending approval, reports published.
2. Report approval queue: preview the uploaded PDF, and Approve / Reject-with-comment / Publish actions. Publishing sets Report.status = PUBLISHED and Report.publishedAt, and should trigger whatever notification hook Phase 5 will use (stub it as a TODO/console log for now if Phase 5 isn't built yet).
3. User management: list/search/filter users, disable/re-enable accounts, reset access (force password reset).
4. Staff management: list staff, assign roles, view current workload (open assignments count).
5. Assessment management: CRUD for assessments/sections/questions — enforce that editing a question that already has responses creates a NEW version rather than mutating the existing one.
6. A basic audit log viewer: filterable table of AuditLog entries.

Admin-only routes — reuse Phase 1 middleware, and note that MFA for admin accounts is a Phase 6 hardening item, not required in this prompt.

Tell me how to test: log in as admin, approve/publish a report uploaded in Phase 3, confirm status flows correctly, and confirm editing a question with existing responses produces a new version instead of overwriting.
```

---

## Prompt 5 — Student Report Access & Notifications

```
Using PROMPT.md (sections 3 rule 2, 4, 6) implement Phase 5: secure report access and notifications for students.

Scope for this prompt only:
1. Student dashboard update: show current assessment status, report status (mirroring the state machine), and a history list of past assessments/reports.
2. Secure report view/download: implement a signed-URL (or equivalent short-lived, authorization-checked) mechanism so a report is only reachable by (a) an authenticated session, (b) belonging to that student or being staff/admin, (c) via a URL that expires. No static /reports/<id>.pdf path.
3. Wire the report-published event from Phase 4 to: an in-app Notification record, and an email send through the same swappable email-sender interface from Phase 1 (stub is fine, but the interface must be real).
4. A simple notification bell/list UI showing unread/read notifications.

Tell me how to test: publish a report as admin, confirm the student sees an in-app notification and (stubbed) email, and confirm the download link works only for that student and expires/fails for a different logged-in student.
```

---

## Prompt 6 — Security Hardening Pass

```
Using PROMPT.md (section 3 rules 2, 6, 7) and AuraPath_Roadmap_and_Architecture.md section 4.4, do a security hardening pass across everything built in Phases 1-5. Do not add new features — only harden existing ones.

Go through and fix/add:
1. Rate limiting + progressive lockout on login, forgot-password, and sign-up endpoints.
2. Mandatory MFA (TOTP) for admin accounts; optional MFA toggle for staff.
3. Re-verify every report/response access path against: auth check present? authorization check present (ownership/role)? audit log written?
4. File upload validation review: type allowlist, size cap, filename sanitization, and a hook point for malware scanning even if the actual scanner is stubbed.
5. Security headers (CSP, HSTS, X-Frame-Options, etc.) at the Next.js config/middleware level.
6. Confirm password hashing uses argon2id (or bcrypt with adequate cost factor) and secrets are read from environment variables, never hard-coded.
7. Produce a short SECURITY_CHECKLIST.md summarizing what was checked/fixed and anything flagged as needing a real (non-stub) service before production (e.g., real malware scanning API, real KMS/secrets manager).

List every file you changed and why, grouped by the rule it addresses.
```

---

## Prompt 7 — Accessibility, Responsive & Performance QA

```
Do an accessibility and responsive QA pass on the full app built so far, per AuraPath_Roadmap_and_Architecture.md section "Phase 7".

1. Audit the assessment-taking flow specifically for WCAG 2.2 AA: keyboard-only navigation through a full question set, visible focus states, proper labels on all inputs, sufficient color contrast, and screen-reader-sensible markup (aria-live on auto-save status, etc.).
2. Check responsive behavior at 1920/1440/1366 (desktop), 1024/768 (tablet), and 390/375/360 (mobile) widths for: marketing pages, student dashboard, assessment UI, staff portal, admin portal. Flag and fix any layout that breaks or requires horizontal scroll on mobile, especially the assessment UI (one question per screen, no giant blocks of text).
3. Run a Lighthouse/Core Web Vitals pass on the marketing pages and report scores plus any quick wins.

Report findings as a checklist with fixed vs flagged-for-later items, don't just say "looks fine."
```

---

## Prompt 8 — Deployment Readiness

```
Prepare this app for production deployment per AuraPath_Roadmap_and_Architecture.md section 4 and "Phase 8".

1. Produce a production .env.example covering: DATABASE_URL, NEXTAUTH secrets, object storage credentials, email provider API key, and any others introduced in prior phases — with comments on what each is for.
2. Write a DEPLOYMENT.md covering: how to provision the Postgres database with automated backups/PITR, how to provision the private object storage bucket with versioning enabled, how to wire the CDN/WAF in front of the app, and what monitoring/alerts should exist at minimum (uptime, error rate, failed logins, upload failures, email failures).
3. Confirm there is no code path that can run with default/placeholder secrets in a production NODE_ENV — fail loudly instead.
4. Produce a short RUNBOOK.md: how to roll back a bad deploy, how to check if the report-approval loop is stuck, how to check SLA breaches (submissions past the 3-4 day evaluation window).

Do not perform the actual cloud provisioning — just produce the documentation and any config/code needed so a human can do it following your instructions.
```

---

## How to keep the agent on track between prompts

- If the agent starts building something out of order (e.g., payments, multi-language, institution portals before Phase 8 is done), remind it: "That's Phase 9 / Post-Launch per the roadmap — stay in scope for the current phase."
- If it invents assessment questions, report templates, or legal text as if final, remind it: per PROMPT.md section 8, those are client-owned and must stay clearly-labeled placeholders.
- After each phase, ask it to summarize what changed and how to test before you move to the next prompt — don't chain phases in one message.
