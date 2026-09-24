# MASTER_PROMPT.md — AuraPath Tech Stack & Build Brief (for Antigravity)

> Paste this entire file as the first message / persistent context in Antigravity. It defines the fixed architecture, tech stack, data model, and non-negotiable rules for the AuraPath platform. Drive actual work with the phase-by-phase prompts at the bottom, one at a time — don't ask Antigravity to build everything in one shot.

---

## 1. Project Context

You are building **AuraPath**, a global, security-focused, multi-role platform where students take a digital psychometric assessment, human experts manually evaluate the responses, and students receive a personalized career-guidance report through a secure portal.

**Defining architectural fact:** test-taking is automated; report generation is manual and expert-led. Your job is to make that manual workflow fast, auditable, and secure — never to replace it with a scoring algorithm.

A marketing landing page already exists (Next.js, deployed on Vercel). You are now restructuring into a proper monorepo with a separated backend. **Migrate/extend from the existing frontend code — do not discard it.**

---

## 2. Monorepo Architecture (fixed)

```
aurapath/
├── apps/
│   ├── frontend/     → Next.js 16 web app & UI
│   └── backend/      → Express.js core API server
├── packages/
│   └── shared/       → @aurapath/shared — types, constants, Zod schemas
├── docker-compose.yml
├── package.json      → npm workspaces root
└── .github/workflows/
```

- **Package manager:** npm workspaces (`apps/*`, `packages/*`).
- **Frontend and backend are separately deployable apps** that communicate over HTTP — not a single Next.js monolith with API routes. Design every feature with that seam in mind.
- **`packages/shared`** is the single source of truth for types and validation — never duplicate a Zod schema between frontend and backend; import it from `@aurapath/shared`.

---

## 3. Fixed Tech Stack

### 3.1 Frontend (`apps/frontend`)
- **Framework:** Next.js 16 (App Router, Turbopack, Server Components & Server Actions)
- **UI library:** React 19
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Interaction detail:** Canvas Confetti (assessment-completion celebration moment)
- **Typography:** Google Fonts — `DM Sans` (headings), `Inter` (body)
- **Auth:** Auth.js (NextAuth) v5 — handles sign-in UX (Google OAuth, email/password form, phone OTP form, email OTP form); see §5 for the auth seam with the backend.
- **Images:** Next.js Image Optimization + Sharp

### 3.2 Backend (`apps/backend`)
- **Runtime:** Node.js, ES Modules, TypeScript 5.7
- **Framework:** Express.js v4.21
- **Dev/build:** `tsx` for dev/watch, `tsc` for production compilation
- **Security & middleware:** Helmet, CORS, bcryptjs (password hashing), `jsonwebtoken` (stateless JWT), custom centralized request-logger + error-handler middleware
- **Modules:** Authentication (multi-method + OTP lifecycle), Assessment Engine (versioning, start/resume, debounced auto-save, submission locking), Reports (Career Constellation / diagnostic reports)

### 3.3 Shared package (`packages/shared`)
- Shared TypeScript types/interfaces for every domain entity and API request/response
- Zod schemas (strict) for: auth payloads, OTP payloads, assessment responses, profile mutations — imported and enforced on **both** client and server, never redefined per-side

### 3.4 Database & Infrastructure
- **Database:** PostgreSQL, hosted on Supabase
- **ORM:** Prisma ORM 6.19 (schema, migrations, client, seeding) — schema lives in `apps/backend` (backend owns the DB; frontend never talks to Postgres directly)
- **File storage:** Amazon S3 / S3-compatible private bucket — diagnostic PDF reports only, never public
- **Transactional email:** Resend API
- **SMS (phone OTP):** Twilio / MSG91, built behind a swappable provider interface with a console-log stub for local dev

### 3.5 Required additions not in the original list (build these in from the start)

| Layer | Addition | Purpose |
|---|---|---|
| Backend | `multer` | Multipart parsing for PDF report uploads before pushing to S3 |
| Backend | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | Upload + generate short-lived signed download URLs for reports |
| Backend | `express-rate-limit` (+ `rate-limit-redis` once multi-instance) | Throttle login, OTP request, password-reset endpoints |
| Backend | `otplib` + `qrcode` | TOTP-based MFA for admin accounts |
| Backend | `file-type` + an AV scan hook (e.g. `clamscan` or a cloud AV API) | Validate uploaded PDFs by magic bytes, not extension; scan before marking available |
| Backend | `pino` + `pino-http` | Structured JSON request logging (the "centralized Request Logger") |
| Backend | `bullmq` + Redis | Background jobs: SLA-breach checks, async email/SMS dispatch, report-scan jobs |
| Backend | Zod-validated env loader at boot | Fail fast on missing/malformed secrets instead of failing mid-request |
| Backend | `swagger-jsdoc` + `swagger-ui-express` (or `zod-to-openapi`) | Documented API contract — mandatory once frontend/backend are separate deployables |
| Backend | `vitest` + `supertest` | Backend owns its own test suite independent of the frontend |
| Frontend | Typed API client in `apps/frontend/lib` using `@aurapath/shared` types | Frontend now calls a separate Express API, not co-located Server Actions |
| Infra | `docker-compose.yml`: Postgres (or Supabase local), Redis, MinIO (S3 stub) | Local dev parity across the whole team |
| Infra | `Dockerfile` for `apps/backend` | Express is a long-running server — needs a persistent-process host (Render/Railway/Fly.io/ECS), not serverless |
| Infra | Cloudflare (or equivalent) in front of both frontend and backend domains | Global latency + WAF/DDoS protection on auth and report endpoints |
| Infra | `@sentry/nextjs` + `@sentry/node` | Error tracking on both apps, one Sentry project, two components |
| Infra | GitHub Actions with path filters (`apps/frontend/**`, `apps/backend/**`) | Independent build/test/deploy per app in the monorepo |
| Infra | Root ESLint + Prettier + husky/lint-staged | Consistent style across `apps/*` and `packages/shared` |

Do not substitute different libraries for the ones listed above without flagging it — these are fixed decisions, not suggestions.

---

## 4. Non-Negotiable Product Rules

1. **No automated scoring or interpretation.** Store responses and route them to a human expert. Never build a scoring algorithm.
2. **Reports are never publicly reachable by URL.** Every report fetch: authenticated session → authorization check (`report.studentId === session.user.id` or caller is staff/admin) → short-lived S3 signed URL. No static `/reports/<id>.pdf` path, ever.
3. **Assessment and question versioning is mandatory from the first migration.** Every `AssessmentAttempt` pins the exact `Assessment` version taken; every `Response` pins the exact `Question` version answered. Never mutate a question with existing responses — create a new version.
4. **Auto-save on every answer**, debounced (~500ms–1s) writes to `Response`, keyed by `(attemptId, questionId)`. A student must never lose progress to a crash or network blip.
5. **Attempts lock on submission.** Once `status = SUBMITTED`, the backend rejects further writes to that attempt's responses regardless of what the client sends.
6. **Data minimization.** Only collect fields the report or account function actually needs. Phone number may still be a required *sign-in identifier* for the phone-OTP method — that's separate from optional profile fields like school/grade.
7. **Every sensitive action is audit-logged**: all login attempts (success/failure, with method used), staff viewing a student's responses, report upload/approve/publish/view/download, admin user/staff changes. Log actor, action, resource, method, timestamp, result.
8. **Distinct UI per surface.** Assessment-taking UI has no marketing navbar — minimal chrome, progress bar, back/next only. Staff/admin UIs are dense, table/filter-oriented. Student dashboard is simple and status-oriented. Marketing stays visual/conversion-focused.
9. **OTP codes**: 6-digit numeric, 5–10 minute expiry, single-use, rate-limited per destination (e.g. max 5/hour), capped verify attempts per code (e.g. 5), never logged in plaintext outside the local dev stub.
10. **Account linking is identity-safe.** One `User` can have multiple `AuthMethod` rows (password, google, phone_otp, email_otp). Auto-link a new method to an existing account only on a verified-identity match (verified email from Google, or a successfully verified OTP) — never on unverified claims alone.

---

## 5. Auth Seam Between Frontend and Backend (fixed decision)

Frontend uses Auth.js (session/cookie-driven); backend uses stateless JWT. Resolve this as follows — **do not invent a different pattern:**

- Auth.js on the frontend drives the **sign-in UX only**: Google OAuth redirect, credentials form, phone-OTP form, email-OTP form.
- Actual verification (password check, OTP verify, user lookup, account linking) happens by the frontend calling `apps/backend` endpoints — the backend is the single source of truth for identity.
- On successful verification, the backend issues a JWT (access + refresh pair). The frontend stores the access token in an httpOnly cookie and uses it to authenticate subsequent calls to the Express API. Auth.js's own session can wrap this for frontend routing/middleware convenience, but the backend JWT is what actually authorizes API calls.
- Token refresh is handled by the backend (refresh-token rotation); the frontend never holds long-lived credentials in JS-accessible storage.

---

## 6. Data Model (Prisma schema, lives in `apps/backend`)

```
User            (id, email?, phone?, passwordHash?, role[student|staff|admin], status, emailVerified, phoneVerified, createdAt, lastLoginAt)
AuthMethod      (id, userId, type[password|google|phone_otp|email_otp], providerAccountId?, createdAt)
OtpCode         (id, userId?, destination, code, purpose[login|signup|reset], expiresAt, consumedAt?, attempts, createdAt)
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
AuditLog            (id, userId?, action, resource, resourceId?, method?, ipAddress?, metadata /* jsonb */, result, createdAt)
```

Add indexes on `(userId)`, `(assessmentId, status)`, `(attemptId)`; unique constraint preventing more than one in-progress attempt per `(userId, assessmentId)`; ensure `User` allows "at least one of email or phone," not both mandatory.

---

## 7. API & Route Structure

**Backend (`apps/backend/src/routes`)** — versioned REST, documented via OpenAPI:
```
/api/v1/auth/*        → register, login (password/google/phone-otp/email-otp), otp/request, otp/verify, refresh, logout
/api/v1/assessments/*
/api/v1/attempts/*
/api/v1/reports/*      → includes signed-URL issuance endpoint
/api/v1/staff/*
/api/v1/admin/*
```

**Frontend (`apps/frontend/app`)** — Next.js route groups:
```
(marketing)/            → landing page + About/FAQ/Contact/Legal
(auth)/                 → sign-up, login (all 4 methods), verify, reset
(student)/dashboard/    → student portal
(assessment)/take/[attemptId]/  → distraction-free quiz UI
(staff)/portal/         → staff dashboard, queue, evaluation workspace
(admin)/console/        → admin dashboard, management screens
```
Enforce role checks in Next.js middleware (route-group level) **and** independently in Express middleware on every protected endpoint — never trust the frontend's gate alone since the backend is a separate, directly-callable API.

---

## 8. Build Order

1. **Monorepo scaffold** — workspaces, `packages/shared` skeleton, empty `apps/frontend` and `apps/backend`, Docker Compose for Postgres/Redis/MinIO, CI skeleton with path filters.
2. **Backend foundation** — Express app, Helmet/CORS/pino/error-handler, Prisma schema + migration, env validation at boot, OpenAPI scaffold.
3. **Auth (backend then frontend), method by method** — password → Google → phone OTP → email OTP, per §5's seam and §4 rule 10's linking rules.
4. **Assessment engine** — schema already in place; build attempt lifecycle, auto-save, resume, submit-lock, and the quiz UI.
5. **Staff portal** — queue, evaluation workspace, PDF upload → S3 → scan hook → pending-approval.
6. **Admin portal** — approval/publish loop, user/staff/assessment management, audit log viewer.
7. **Student report access & notifications** — signed URLs, email + in-app notifications, BullMQ jobs for async dispatch.
8. **Security hardening** — rate limiting everywhere, admin MFA, full audit coverage review, security headers review.
9. **Accessibility/responsive/performance QA.**
10. **Deployment** — backend container to Render/Railway/Fly.io/ECS, frontend to Vercel, Cloudflare in front of both, Sentry wired, monitoring/alerts live.

---

## 9. Definition of Done (per feature)

- [ ] Request/response validated with the shared Zod schema from `@aurapath/shared` on both sides.
- [ ] Authorization checked server-side in Express (never trust a frontend role claim or middleware alone).
- [ ] Relevant action written to `AuditLog` with method/actor/result.
- [ ] Mobile layout checked at 375px minimum.
- [ ] No secrets hard-coded — loaded via validated env config.
- [ ] Errors handled gracefully; no raw stack traces returned to the client.
- [ ] If it touches reports or PII: auth + authorization + (for files) a signed URL.
- [ ] OpenAPI doc updated for any new/changed backend endpoint.

---

## 10. What the Client Owns (do not fabricate)

Do not invent the real 75 assessment questions, evaluation methodology, report template/design, legal text, or final branding. Use clearly-labeled placeholder content where needed and flag it for replacement — never present invented content as final.

---

## How to drive this in Antigravity

Paste this file once as persistent context, then issue one scoped prompt per build-order step, e.g.:

> "Using MASTER_PROMPT.md as context, do step 1 (Monorepo scaffold) only. Set up npm workspaces, create empty apps/frontend, apps/backend, and packages/shared with placeholder package.json files, and a docker-compose.yml with Postgres, Redis, and MinIO. Don't write any feature code yet — show me the structure and confirm `npm install` works from the root."

Wait for each step to be reviewed and working before issuing the next. If Antigravity suggests a library not listed in §3, ask it to flag that explicitly rather than silently substituting.
