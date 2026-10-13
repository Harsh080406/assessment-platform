# PORTAL_FEATURE_GAPS.md — AuraPath Portal Enhancement Build Plan (for Antigravity)

> Paste this entire file as context in Antigravity. It lists feature gaps identified against the current build (`CURRENT_FEATURES_MATRIX.md`), grouped by portal, in priority order. Build one numbered item at a time and confirm it works before moving to the next — do not batch multiple items into one change. Items reference existing routes; extend them, don't restructure what already works.

---

## 0. Ground Rules (apply to every item below)

1. **Extend, don't rebuild.** Every item below adds to an existing route or adds a clearly-scoped new route alongside existing ones. Do not refactor unrelated portal code while implementing an item.
2. **Every new admin/staff action that changes state must write an `AuditLog` entry** (actor, action, resource, result) — consistent with the rest of the platform.
3. **Every role-affecting or session-affecting action must bump `sessionVersion`** where applicable (role changes, suspensions, forced logout) — see `MASTER_PROMPT_AUTH_FIXES.md` if that work is already in place; if not, flag the dependency rather than silently skipping it.
4. **No automated interpretation anywhere.** Student-facing surfaces (results, notifications, history) show status and human-authored content only — never an auto-generated summary, score, or teaser insight.
5. **Follow the existing UI design language per surface** — student portal stays simple/status-oriented, staff portal stays dense/workflow-oriented, admin console stays analytics/table-oriented. Match existing component patterns (KPI strips, status badges, dark slate methodology cards) rather than introducing a new visual style.

---

## Priority 1 — SLA Visibility (Staff + Admin)

This is the single highest-value gap: the platform's core promise is a 3–4 day turnaround, but nothing currently shows due dates or overdue status anywhere.

### 1a. Staff: SLA badges on every queue card (`/portal`, `/portal/under-review`)
- Add a due-date computation: `dueDate = submittedAt + SLA_DAYS` (default 3–4 days; do not hard-code — read from a configurable value, see item 8 below for the admin-side config screen it should eventually read from; a sensible constant is fine for now with a `// TODO: read from SystemConfig` comment).
- Render a badge on every candidate card in `/portal` and every workstation card in `/portal/under-review`: 🟢 "On Track" (due in >1 day), 🟡 "Due Soon" (due within 24h), 🔴 "Overdue" (past due).
- Add an "Overdue" filter tab alongside the existing status filter tabs on `/portal`.

### 1b. Staff: Unassigned vs. My Assigned split (`/portal`)
- Split the main queue into two explicit tabs: **Unassigned** (submissions with no evaluator claimed yet, anyone can self-assign) and **My Assigned** (claimed by the logged-in staff member).
- Self-assign action: a button on an unassigned card that sets the assignedStaffId to the current user and writes an audit log (`SUBMISSION_ASSIGNED`, actor=staff, resource=attemptId).
- Prevent two staff from claiming the same submission simultaneously (optimistic lock or a DB-level check on assign — if already assigned, show "Already claimed by [name]" and refresh the list).

### 1c. Admin: SLA monitoring view (`/console/analytics` or new `/console/sla`)
- Platform-wide table of all in-progress evaluations with: candidate, assigned staff (or "Unassigned"), submitted date, due date, status (on track/due soon/overdue), sorted by most overdue first.
- Reassign action: admin can move an overdue submission from one staff member to another directly from this view (writes `SUBMISSION_REASSIGNED` audit log).
- Summary counters at the top: total overdue, total due today, average turnaround time over the last 30 days.

**Verify:** Seed a test submission with `submittedAt` 5 days in the past; confirm it shows 🔴 in both `/portal` and the new admin SLA view, and that reassigning it in admin updates the staff-side queue immediately.

---

## Priority 2 — Needs Revision Queue (Staff)

Admin's reject action in `/console/reports` currently has no destination on the staff side — a rejected report needs somewhere to visibly land.

### 2a. New route: `/portal/needs-revision`
- List of reports with status `REJECTED` (or equivalent), showing: candidate, original evaluator, admin's rejection reason/comment, original submission date, days since rejection.
- Each item links back into the existing `/portal/review/[attemptId]` workspace, pre-loaded with the admin's rejection comment visible at the top so the evaluator has context immediately.
- Add a badge/counter for "Needs Revision" to the main `/portal` KPI strip alongside the existing 5-stage counts.

### 2b. Admin-side: capture a rejection reason
- If `/console/reports`' reject action doesn't currently require a comment, add a required "Reason for rejection" text field before the reject action can be submitted — this is what populates 2a's context.
- Confirm the reject action transitions the attempt/report status to something staff's queries can filter on (e.g., `REJECTED`) distinct from `PENDING_APPROVAL`.

**Verify:** Reject a report as admin with a reason; confirm it appears in the originating staff member's `/portal/needs-revision` with the reason visible, and that resubmitting from the review workspace clears it from that list.

---

## Priority 3 — Content Management (Admin)

Currently any marketing/legal copy change requires a code deploy — this was an explicit spec requirement (client-editable content) that's missing entirely.

### 3a. New route: `/console/content`
- Editable entries for: landing page hero/sections copy, FAQ list (add/edit/remove Q&A pairs), About page body, Contact info, Privacy Policy body, Terms & Conditions body.
- Store as structured content records (e.g., a `ContentBlock` table: `key`, `title`, `body` (markdown or rich text), `updatedAt`, `updatedBy`) rather than hard-coded JSX strings.
- Public pages (`/`, `/decoder`, footer legal links, etc.) read from these records at render time (ISR/revalidation is fine — this doesn't need to be real-time).
- Every save writes an audit log (`CONTENT_UPDATED`, resource=contentKey).

**Verify:** Edit the FAQ list in `/console/content`, confirm the public-facing page reflects the change without a deploy, and that an audit log entry is created.

---

## Priority 4 — Student Security & Sessions

Students currently have no self-service security surface — settings only covers profile/academic data.

### 4a. New route: `/dashboard/settings/security`
- Change password (for accounts with a `password` AuthMethod).
- List linked sign-in methods (Google / Email OTP / Phone OTP / Password) with which ones are active — read-only list is fine for v1; "unlink" is a nice-to-have, not required.
- "Log out of all devices" action — bumps `sessionVersion`, invalidating all other active sessions immediately.

**Verify:** Trigger "log out of all devices" from one browser session while logged in on a second browser/device; confirm the second session is forced to re-login on its next request.

---

## Priority 5 — Student Notification Center

The existing "Recent Activity Timeline" is an activity feed, not a notification inbox — these serve different purposes and shouldn't be conflated.

### 5a. New route/dropdown: `/dashboard/notifications`
- List of `Notification` records for the logged-in student: report-ready, submission-confirmed, account/security events — with read/unread state.
- A bell icon in the dashboard header showing an unread count, opening either the dropdown or linking to the full page.
- Mark-as-read on open; a "mark all as read" action.
- A basic preferences toggle (email notifications on/off per category) if the notification-preferences data model doesn't exist yet, add a minimal `NotificationPreference` table keyed by userId + category.

**Verify:** Publish a report as admin (per existing flow); confirm the student sees an unread badge appear and the notification lists correctly, and that opening it marks it read.

---

## Priority 6 — Admin Security Center

Audit logs show history; this shows current state — a live view of security posture is missing.

### 6a. New route: `/console/security`
- List of pending staff/admin invites with status (invited/activated) and time since invite — surfaces stalled activations.
- MFA enrollment status per staff/admin account (enrolled / not enrolled) — depends on the TOTP work from `MASTER_PROMPT_AUTH_FIXES.md`; if that isn't built yet, stub the column and flag it rather than fabricating data.
- Active-sessions overview (count of active sessions per privileged account, if session tracking exists; otherwise a simple "force logout" button per user that bumps their `sessionVersion` is sufficient for v1).

**Verify:** Invite a test staff account and confirm it shows as "pending activation" in this view; force-logout a test admin session and confirm their next request is rejected.

---

## Priority 7 — Student Report & Attempt Archive

Needed before Phase 2 multi-assessment support lands, so it's not retrofitted under time pressure later.

### 7a. New route: `/dashboard/history`
- Table/list of all past `AssessmentAttempt` records for the student (even if there's only ever one today): assessment name, version, submitted date, status, report link if published.
- Link each row to the existing `/dashboard/results` detail view or its own read-only detail view.

**Verify:** With a single completed attempt seeded, confirm it appears correctly in `/dashboard/history`; the route should not error or look empty-by-design when there's only one record.

---

## Priority 8 — Staff Self-Service (Profile, Workload, Alerts)

Staff currently have zero self-management surface — everything about them is admin-managed only.

### 8a. New route: `/portal/settings`
- Specialty tags (read/edit), availability toggle (available/unavailable for new assignments — the unassigned-queue logic from 1b should respect this if set to unavailable), notification preferences.

### 8b. Workload widget on `/portal` home
- Current count of "My Assigned" + overdue-among-those, so staff can self-gauge load without visiting admin's staff directory.

### 8c. In-portal alerts
- Notification bell in the staff portal header for: new assignment landed in queue, item moved to Needs Revision (from Priority 2), SLA about to breach on an assigned item.

**Verify:** Toggle a staff member to "unavailable"; confirm they no longer appear as an assignment target (if auto-assignment exists) or are visibly flagged as unavailable in admin's staff directory.

---

## Priority 9 — System Configuration (Admin)

Small now, prevents hard-coded values (like the SLA duration) from requiring a deploy to change later.

### 9a. New route: `/console/settings`
- Global SLA duration in days (feeds Priority 1's due-date calculation).
- Basic feature flags if any exist informally in code already (surface them here rather than leaving them as env-only toggles).

**Verify:** Change the SLA duration value; confirm `/portal` and `/console/sla` due-date calculations reflect the new value on next load.

---

## Priority 10 — Report Version History (Admin)

Spec explicitly calls out report versioning (v1 → v2 corrections) but it's not represented anywhere in the current UI.

### 10a. Extend `/console/reports` detail view
- If a report has been re-uploaded (corrected) after initial upload, show a version history list: version number, uploaded by, uploaded at, status at time.
- Admin always sees full history; student-facing `/dashboard/results` continues to show only the latest published version (do not expose version history to students).

**Verify:** Upload a corrected report for an already-uploaded attempt; confirm the admin view shows both versions with correct timestamps, while the student's results page still only shows the latest.

---

## Priority 11 (Lower priority, build if time allows) — Notification/Email Template Management

- New route: `/console/notifications` — editable subject/body templates for verification, submission-confirmed, report-ready, password-reset emails. Store as records similar to Priority 3's `ContentBlock` pattern. Not required for MVP completeness; sequence last.

---

## Regression Checklist (run after each priority group, not just at the end)

- [ ] Existing portal routes and their current features still function unchanged.
- [ ] Every new state-changing action produces the correct `AuditLog` entry.
- [ ] Role/session-sensitive actions (reassignment, force-logout, role-adjacent settings) correctly interact with `sessionVersion` where relevant.
- [ ] No student-facing surface shows anything resembling auto-generated interpretation or scoring.
- [ ] New routes match the existing per-portal visual language (student=simple, staff=dense/workflow, admin=analytics/table).
- [ ] Mobile layout checked at 375px minimum for any new page.

---

## How to drive this in Antigravity

Work one priority item at a time, in the numeric order above — several later items assume earlier ones exist (e.g., 1c's admin SLA view is easier once 1a's due-date logic exists; 9a's config screen is what 1a's constant should eventually read from). Prompt like:

> "Using PORTAL_FEATURE_GAPS.md as context, implement Priority 1a only (staff SLA badges on /portal and /portal/under-review). Don't touch the admin SLA view or the assignment split yet — those are 1c and 1b. Show me the due-date calculation logic and the badge component, then tell me how to verify it per the doc."

Confirm each item's "Verify" step passes before moving to the next numbered item.
