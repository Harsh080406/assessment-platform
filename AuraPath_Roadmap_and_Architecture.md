# AuraPath — Roadmap & Global Production Architecture
**Psychometric Assessment & Career Guidance Platform**

Current state: Next.js marketing site deployed on Vercel (`assessment-platform-frontend-lemon.vercel.app`) — hero, "4 Quests," "Parent vs You," Careers, footer. No auth, assessment engine, staff portal, admin portal, or backend yet.

This document turns the project spec into an execution plan: a phase-wise roadmap and a production-grade, global-scale architecture built around Next.js.

---

## 1. Guiding Principles

1. **MVP first, platform-shaped from day one.** Build one assessment end-to-end, but model data so a second assessment never requires a schema rewrite (spec §54–56, §60 "Most Important Product Decision").
2. **Manual evaluation is the product, not a limitation.** The expert workflow, SLA tracking, and audit trail deserve as much engineering care as the quiz UI.
3. **Reports are the trust surface.** Every architecture decision involving files defaults to private-by-default, signed, time-limited access.
4. **Separate UI systems per surface** (marketing / assessment / student / staff / admin) — different density, different goals (spec §64).
5. **Global from the start**: UTC storage, i18n keys instead of hard-coded strings, timezone-aware display, region-agnostic infra.

---

## 2. Phase-Wise Roadmap

### Phase 0 — Foundation & Discovery (1–2 weeks)
Goal: lock scope before writing product code.
- Finalize assessment content: 75 questions / 3 sections, question types, scoring N/A (manual).
- Confirm client-owned deliverables: logo, brand, legal text (privacy/terms), report template, evaluation SLA (3–4 days), sample report.
- Define MVP vs Phase 2 boundary explicitly (see §72 of spec) and get client sign-off in writing.
- Set up monorepo, environments (dev/staging/prod), CI/CD skeleton, ticketing.
- Decide legal/data-residency posture (GDPR/DPDP) — flag as legal review, not dev task.

**Exit criteria:** signed-off content plan, environment URLs live, empty CI pipeline green.

---

### Phase 1 — Core Platform Skeleton (2–3 weeks)
Goal: authentication + roles + database schema, nothing assessment-specific yet.
- Postgres schema v1: `users`, `student_profiles`, `roles`, `audit_logs`.
- Auth: registration, login, logout, email verification, forgot/reset password, session handling (NextAuth/Auth.js or custom JWT+refresh), RBAC middleware (student/staff/admin).
- Base Next.js App Router structure with route groups per surface: `(marketing)`, `(student)`, `(assessment)`, `(staff)`, `(admin)`.
- Transactional email service wired (verify email, password reset).
- Baseline security headers, rate limiting on auth routes, password hashing (argon2/bcrypt).

**Exit criteria:** a user can sign up, verify email, log in, and land on a role-correct empty dashboard.

---

### Phase 2 — Assessment Engine (3–4 weeks)
Goal: the reusable quiz system (spec §7–11, §54–55).
- Schema: `assessments`, `assessment_sections`, `questions`, `question_options`, `assessment_attempts`, `responses`, with **versioning** on assessments and questions from day one.
- Assessment-taking UI: distraction-free layout, section/question progress, single/multi-choice + Likert support (build the engine generic even if v1 only uses 1–2 types).
- Auto-save on every answer (debounced write to `responses`), resume-in-progress attempts.
- Review screen + submission confirmation ("74/75 answered, submit anyway?").
- Attempt locking after submission (immutable once submitted).
- Submission-confirmation email.

**Exit criteria:** a student can start, pause, resume, review, and submit a real 75-question assessment; data is versioned and durable across browser crashes.

---

### Phase 3 — Staff (Expert) Portal (2–3 weeks)
Goal: manual evaluation workflow (spec §15–18).
- Staff dashboard: queue counts (new/under evaluation/pending upload/completed).
- Submission list with filters (date, assessment, status, assigned staff) + search.
- Submission detail view: full response readout by section, expert notes field.
- Assignment (self-assign or admin-assigned), status transitions matching the state machine in §13.
- Report upload (PDF only) → validation → private object storage → status = "Pending Approval."
- SLA display (due date vs today, on-track/overdue indicator, §52).

**Exit criteria:** an expert can pick up a real submitted attempt, read responses, attach notes, and upload a report file that lands in "pending approval," fully audit-logged.

---

### Phase 4 — Admin Portal + Report Publishing (2–3 weeks)
Goal: approval loop + platform administration (spec §19–20, §18).
- Admin dashboard: platform-wide counts (users, assessments, pending reviews, published reports).
- Report approval queue: preview PDF, approve/reject/request-revision, publish.
- User management (search/filter/disable/reset access), staff management (roles, workload view), assessment management (CRUD on assessments/sections/questions with versioning-safe edits).
- Content management for static pages (FAQ, About, legal) so client can edit without a deploy.
- Full audit log viewer.

**Exit criteria:** the full loop closes — student submits → expert evaluates & uploads → admin approves & publishes → student is notified and can securely view/download.

---

### Phase 5 — Student-Facing Report Access & Notifications (1–2 weeks)
Goal: make the payoff moment excellent and secure (spec §14, §31, §40–41).
- Student dashboard: current assessment status, report status, history of past assessments/reports.
- Secure report view/download: authenticated, authorized, short-lived signed URL — never a static public path.
- Email notifications: report-ready, plus in-app notification center (bell icon, unread state).
- "My Reports" archive across multiple past assessments.

**Exit criteria:** a student who logs in days later can find, view, and download exactly their own report, and only their own.

---

### Phase 6 — Hardening, Security & Compliance Pass (2 weeks, overlaps Phases 3–5)
Goal: treat security as a release gate, not a bolt-on (spec §28–35).
- OWASP pass: input validation, output encoding, CSRF, XSS, SQLi checks (ORM parameterization), file-upload validation (type/size/malware scan), security headers (CSP, HSTS).
- MFA for admin accounts (mandatory), optional for staff.
- Rate limiting + account lockout on auth endpoints.
- Encryption at rest (DB + object storage), TLS everywhere, private networking for DB (no public ingress).
- Full audit logging of sensitive actions (who viewed/downloaded what, when, from where).
- Data minimization review of every form field against the spec's §46 principle.
- Penetration test / external security review before go-live if budget allows.

**Exit criteria:** independent security checklist signed off; no admin/report/API route reachable without correct auth+authorization.

---

### Phase 7 — Performance, Accessibility, Responsive QA (1–2 weeks)
- WCAG 2.2 AA pass: keyboard nav, labels, contrast, focus states, screen-reader test on the assessment flow specifically.
- Responsive test matrix: desktop (1920/1440/1366), tablet (1024/768), mobile (390/375/360) — assessment UI gets special attention (one question per screen, no giant scroll).
- Load testing on submission + report endpoints (simulate concurrent exam-day traffic spikes).
- Lighthouse/Core Web Vitals pass on marketing site (SEO matters here — it's the acquisition funnel).

---

### Phase 8 — Deployment & Launch (1 week)
- Domain, DNS, SSL, CDN/WAF configuration under client ownership (spec §74).
- Production database provisioning with automated backups + PITR.
- Object storage bucket (private) + lifecycle/versioning policy for reports.
- Monitoring/alerting (uptime, error rate, failed logins, email failures, upload failures).
- Runbooks + admin/staff documentation + basic client training (spec §74).
- Soft launch → monitor → full launch.

---

### Phase 9 — Post-Launch / Phase 2 Features (ongoing)
Per spec §72, explicitly deferred to avoid MVP scope creep:
- Payments (multi-currency, invoices, refunds) for self-serve assessment purchase.
- Multiple concurrent assessment types in the catalog/marketplace.
- Institution/School B2B portal (bulk student invites, aggregated dashboards).
- Parent portal (consent-gated report access).
- Multi-language UI (i18n keys should already exist from Phase 1 — this phase is translation + locale QA).
- Advanced analytics (completion rate, turnaround-time trends, staff workload dashboards, cohort insights).
- Report versioning UI for corrections (v1 → v2 with history).

---

## 3. Suggested Team Shape & Sequencing

| Phase | Primary owners | Can run in parallel with |
|---|---|---|
| 0 Foundation | PM + Tech Lead | — |
| 1 Auth/Skeleton | Backend + Frontend | UI/UX design for Phase 2 |
| 2 Assessment Engine | Full-stack | Staff portal design |
| 3 Staff Portal | Full-stack | Admin portal design |
| 4 Admin Portal | Full-stack | Report/email templates |
| 5 Reports/Notifications | Full-stack | Security pass begins |
| 6 Security | Security-focused dev / external reviewer | Phase 7 in parallel |
| 7 Perf/A11y/QA | QA + Frontend | Deployment prep |
| 8 Deployment | DevOps | Documentation |

Realistic MVP timeline (Phases 0–8): **~14–20 weeks** for a small team (2–4 engineers), assuming client delivers content/questions/branding on schedule — the spec repeatedly flags that client-provided assets (questions, evaluation criteria, legal text) are the critical-path dependency, not the code.

---

## 4. Global Production Architecture

### 4.1 High-level topology

```
                         ┌────────────────────────┐
                         │   DNS (Route53/Cloudflare)│
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   CDN + WAF + Edge       │
                         │ (Cloudflare / CloudFront)│
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │   Next.js (App Router) — Vercel or │
                    │   containerized on Fly.io/AWS ECS  │
                    │   • SSR/ISR marketing pages         │
                    │   • Route-group UIs per role         │
                    │   • BFF API routes / Server Actions │
                    └─────────────────┬─────────────────┘
                                      │  (internal, authenticated)
                    ┌─────────────────▼─────────────────┐
                    │        Backend API layer            │
                    │  Node/NestJS (or Next API routes    │
                    │  for MVP, extract to service later) │
                    └───────┬───────────────┬────────────┘
                            │               │
                ┌───────────▼───┐   ┌───────▼────────────┐
                │ PostgreSQL     │   │ Object Storage      │
                │ (managed, e.g. │   │ (S3/GCS/Azure Blob) │
                │ RDS/Neon/Supabase)│  private, versioned  │
                └───────┬───────┘   └───────┬────────────┘
                        │                   │
                ┌───────▼───────┐   ┌───────▼────────────┐
                │ Automated       │   │ Signed-URL / access │
                │ backups + PITR  │   │ control layer       │
                └────────────────┘   └────────────────────┘

        Cross-cutting: Auth (NextAuth/Auth.js + RBAC), Email (Resend/SES/SendGrid),
        Queue/Jobs (for notifications, PDF validation) — e.g. Upstash/QStash or SQS,
        Observability (Sentry + logs + uptime), Secrets manager (Vault/SSM/Doppler).
```

### 4.2 Why this shape

- **Next.js stays the single frontend surface** for all four systems (public site, student portal, assessment engine, staff/admin portals) using **route groups** and **middleware-enforced RBAC**, rather than four separate apps — reduces operational overhead while still allowing each surface its own layout/design system (spec §64).
- **Next.js API routes / Server Actions are sufficient for MVP.** Extract a dedicated NestJS/Express service only when you need workers outside the request/response cycle (e.g., malware scanning, PDF processing, scheduled SLA-breach checks) or when staff/admin traffic patterns diverge enough to warrant independent scaling.
- **PostgreSQL** is the system of record for everything structured (users, attempts, responses, report metadata) — relational integrity matters here (a response must belong to exactly one attempt/question/version).
- **Object storage, never the database, holds PDFs.** The DB stores only a `file_reference` + metadata; access is always mediated through an authorization check + short-lived signed URL (spec §14, §31).
- **CDN/WAF in front of everything** — needed both for global latency (students anywhere in the world) and for basic DDoS/bot mitigation on public-facing marketing + auth endpoints.
- **Job queue** decouples slow/async work (sending emails, scanning uploads, computing SLA status) from the request path so the assessment-submission and report-upload flows stay fast and don't fail if email/scanning is briefly down.

### 4.3 Data model (core, versioning-aware)

```
users ─┬─ student_profiles
       ├─ staff_profiles (role, specialty)
       └─ audit_logs (actor, action, resource, ip, timestamp, result)

assessments (id, version, status) ─┬─ assessment_sections ─── questions ─── question_options
                                    └─ assessment_attempts (user_id, assessment_id+version, status)
                                              └─ responses (attempt_id, question_id+version, answer, answered_at)

reports (attempt_id, student_id, file_reference, version, status,
         uploaded_by, approved_by, uploaded_at, published_at)
```

Key rule: **an attempt always pins the exact assessment version and each response pins the exact question version** it was answered against — this is what keeps old reports reproducible and auditable even after the question bank evolves (spec §54–56).

### 4.4 Security architecture (non-negotiables for this domain)

- Password hashing with argon2id; login rate-limiting + progressive lockout.
- Mandatory MFA for admin, optional (encouraged) for staff.
- All report access: **auth → authorization (does this report belong to this user?) → short-lived signed URL** — never a guessable static path.
- Encryption at rest for DB and object storage; TLS 1.2+ everywhere; DB has no public ingress (VPC/private networking only).
- Full audit trail on: login, submission, staff-view-of-responses, report upload/approve/publish/view/download.
- File upload validation: PDF-only, size cap, malware scan before it's marked available to staff/admin, filename sanitization, private bucket with no directory listing.
- Least-privilege DB roles per service; secrets in a manager (never in env files committed to git).

### 4.5 Global/i18n considerations

- All timestamps stored in UTC; rendered client-side per user locale/timezone.
- All user-facing strings routed through translation keys from Phase 1, even though only English ships at MVP — retrofitting i18n later is far more expensive than building the key structure now.
- Country/timezone/preferred-language captured at signup (optional fields, data-minimized).
- CDN edge caching for the marketing site to keep load times consistent across regions; DB/API region chosen based on primary user base, with read-replica expansion as a Phase-2 lever if latency becomes an issue in far regions.

### 4.6 Recommended stack summary

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind | Already in use — keep it, add route groups + RBAC middleware |
| Auth | Auth.js (NextAuth) or custom JWT+refresh | RBAC: student / staff / admin |
| Backend | Next.js Server Actions/API routes → extract to NestJS when needed | Keep MVP simple; don't over-engineer early |
| Database | PostgreSQL (managed: Neon, Supabase, or RDS) | Encrypted at rest, private networking |
| ORM | Prisma or Drizzle | Type-safe, migration-friendly, supports versioning pattern above |
| File storage | S3 / GCS / Azure Blob (private) | Signed URLs, versioning enabled |
| Email | Resend / SES / SendGrid | Templates for verify/submit/report-ready/reset |
| Jobs/Queue | Upstash QStash / SQS / BullMQ+Redis | Async email, scans, SLA checks |
| Monitoring | Sentry (errors) + platform metrics + uptime checker | Alert on failed logins, upload failures, SLA breaches |
| Hosting | Vercel (fastest path, matches current setup) or containerized on Fly.io/AWS for more backend control | Vercel is fine through Phase 5; revisit if you extract a separate backend service |

---

## 5. Immediate Next Steps (from current state)

1. Finalize Phase 0 content deliverables with the client — this is the actual critical path, not engineering capacity.
2. Stand up Postgres + Prisma/Drizzle schema for `users`/`roles` and get auth (Phase 1) working behind the existing marketing site.
3. Add route groups (`(student)`, `(assessment)`, `(staff)`, `(admin)`) to the existing Next.js app rather than starting a new repo.
4. Design the assessment-taking UI as its own minimal chrome (no navbar) per spec §65, distinct from the current marketing design system.
