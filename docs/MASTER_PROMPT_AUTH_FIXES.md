# MASTER_PROMPT_AUTH_FIXES.md — AuraPath Auth & RBAC Remediation (for Antigravity)

> Paste this entire file as context in Antigravity. It describes ten concrete defects in the **existing** authentication/RBAC implementation (as documented in `AUTHENTICATION_ARCHITECTURE.md`) and the exact fix for each. Work through fixes in the order listed — several later fixes depend on schema changes made in earlier ones. Do not refactor unrelated code while doing this; this is a remediation pass, not a rewrite.

---

## 0. Context — What You're Fixing

The current implementation is Next.js-only: NextAuth (Auth.js v5) talks directly to Prisma/Postgres, and `middleware.ts` enforces role boundaries. Four sign-in methods exist: email+password, Google OAuth, email OTP, phone OTP. This works for the happy path but has ten real gaps — mostly around **role provisioning, session revocation, and inconsistent security checks across the four methods**. Fix the logic in place; do not change the overall NextAuth/Prisma/middleware architecture as part of this task.

Read the existing `auth.ts`, `middleware.ts`, and Prisma schema before making changes. Confirm your understanding of the current `signIn` callback, OTP verify handlers, and middleware route guards before editing them.

---

## 1. Schema Changes (do this first — everything else depends on it)

Add to the Prisma schema:

```prisma
enum UserStatus {
  ACTIVE
  INACTIVE   // now also used for "invited, not yet activated" staff/admin
  SUSPENDED
}

model User {
  // ...existing fields...
  sessionVersion   Int       @default(0)   // bump to invalidate all issued JWTs for this user
  totpSecret       String?                  // encrypted at rest
  totpEnabled      Boolean   @default(false)
  invitedBy        String?                  // userId of admin who created a STAFF/ADMIN account
  invitedAt        DateTime?
}
```

Add new `AuditLog` action values (extend whatever enum/string-union currently exists): `AUTH_LOCKOUT`, `SECURITY_BLOCKED_METHOD`, `ADMIN_IMPERSONATION_VIEW`, `ACCOUNT_LINK_REJECTED`, `STAFF_ADMIN_INVITED`, `STAFF_ADMIN_ACTIVATED`.

Run and verify the migration before proceeding to fix #1.

---

## 2. Fix #1 — Staff/Admin Must Be Invite-Only, Never Self-Provisioned

**Problem:** Every auth method's "new user" branch creates `role: STUDENT` unconditionally, but nothing stops a Google/OTP sign-in from a non-pre-registered email from also silently becoming the *only* path staff/admin ever get created through in practice — there is no admin-driven creation flow at all, so this is the de facto (insecure) provisioning path.

**Fix:**
1. Build an **Admin Console "Invite Staff/Admin" flow**: admin submits email + role (STAFF or ADMIN) → creates a `User` row with that role, `status: INACTIVE`, `invitedBy`, `invitedAt` set, no `passwordHash`, no `AuthMethod` yet → sends an activation email (Resend) with a signed, expiring activation link.
2. Activation link lands on a page where the invitee either sets a password or signs in with Google — either path transitions `status: INACTIVE → ACTIVE` and creates the corresponding `AuthMethod`. This is activation, not creation.
3. In every "new user" branch of the four auth methods (`auth.ts` `signIn` callback, email-OTP verify, phone-OTP verify), **hard-restrict auto-creation to `role: STUDENT` only**. If no `User` matches and the method is being used in a context that isn't the public student sign-up/sign-in flow, do not create anything — reject with a clear error.
4. Audit-log `STAFF_ADMIN_INVITED` on invite creation and `STAFF_ADMIN_ACTIVATED` on first successful activation.

**Verify:** Confirm there is no remaining code path where a Google/OTP/password sign-in with an unrecognized email can result in `role: STAFF` or `role: ADMIN`.

---

## 3. Fix #2 — OTP Login Must Be Rejected for Staff/Admin Accounts

**Problem:** Email OTP and phone OTP verify handlers check "does a user exist for this destination" but not "is this user allowed to use this method." Staff/Admin should only use Email/Password or Google per the platform's own summary matrix, but the code doesn't enforce it — meaning an attacker who compromises a staff/admin inbox could OTP their way into a privileged session.

**Fix:**
1. In both the email-OTP and phone-OTP verify handlers, immediately after finding the matching `User` (and before minting a session), check `user.role !== 'STUDENT'`.
2. If true: reject the login, do not consume the OTP as "used for login" (invalidate it anyway so it can't be reused), and write an audit log with action `SECURITY_BLOCKED_METHOD`, metadata `{ attemptedMethod: 'email_otp' | 'phone_otp', accountRole: user.role }`, result `BLOCKED`.
3. Return a generic error to the client ("This sign-in method isn't available for this account") — do not reveal that the account exists and is staff/admin.

**Verify:** Attempt an OTP login flow against a seeded STAFF and ADMIN test account; confirm both are rejected and both produce a `SECURITY_BLOCKED_METHOD` audit entry.

---

## 4. Fix #3 — Mandatory TOTP MFA for Admin, Optional for Staff

**Problem:** No MFA exists anywhere. Admin has full platform control and is currently protected by password/Google alone.

**Fix:**
1. Add TOTP enrollment (`otplib` + `qrcode`) as a settings-page feature available to STAFF and ADMIN (not STUDENT).
2. In the NextAuth `signIn` callback (or an equivalent post-verification gate — see Fix #5), after primary-method verification succeeds: if `role === 'ADMIN'` and `totpEnabled === false`, do not issue a session — redirect to a forced MFA-enrollment flow. If `totpEnabled === true`, require a valid TOTP code before session issuance.
3. For STAFF, `totpEnabled` is optional; if enabled, enforce the same TOTP-code step at login. If not enabled, log in as before but the UI should visibly encourage enabling it.
4. Store `totpSecret` encrypted at rest (not plaintext) — use an existing encryption utility if one exists in the codebase, otherwise add a minimal AES-256-GCM helper keyed from an env secret.

**Verify:** A fresh ADMIN account with no TOTP enrolled cannot reach `/console` after password/Google verification — it must be routed to enrollment first. An enrolled ADMIN must supply a valid code every login.

---

## 5. Fix #4 — Role-Based Session TTL and Immediate Revocation via `sessionVersion`

**Problem:** All roles get the same 30-day sliding JWT, and suspending a user's `status` in the DB has no effect on tokens already issued (JWT is stateless).

**Fix:**
1. At JWT issuance (NextAuth `jwt` callback), embed `sessionVersion` (from the schema change in step 1) as a claim, and set `maxAge` per role: STUDENT 30 days sliding, STAFF 12–24 hours, ADMIN 4–8 hours.
2. Add a check — in `middleware.ts` and/or the NextAuth `session`/`jwt` callback on every request — that compares the token's embedded `sessionVersion` against the current value in the DB for that `userId`. On mismatch, treat the session as invalid: clear it and redirect to login.
3. Increment `User.sessionVersion` whenever: an admin suspends/disables that user, a user's role changes, or a "log out everywhere" action is triggered (add this action to account settings if not present).
4. For ADMIN specifically, require re-authentication (password or TOTP re-prompt) before executing sensitive actions even within a valid session: report publish/reject, user suspend/disable, staff role change. Implement this as a short-lived "step-up" flag rather than a full re-login.

**Verify:** Suspend a test STAFF user via the admin console while that user has an active session open in a second browser; confirm their very next request is rejected, not just their next login.

---

## 6. Fix #5 — Consolidate Status Checks Into One Shared Gate

**Problem:** Password and Google flows check `status === ACTIVE`; email-OTP and phone-OTP flows don't consistently check it, meaning a `SUSPENDED` user might still be able to log in via OTP.

**Fix:**
1. Create a single function, e.g. `assertUserLoginAllowed(user)`, that checks: `status === 'ACTIVE'`, and (post Fix #4) that the account isn't otherwise flagged. Throw a typed error the caller can turn into the right user-facing message.
2. Call this function from all four method handlers — password compare success, Google `signIn` callback account-match branch, email-OTP verify success, phone-OTP verify success — as the very last gate before minting a session or creating an `AuthMethod` link.
3. Remove the duplicated inline status checks currently only present in the password and Google paths; replace with calls to the shared function so there's exactly one place this logic lives.

**Verify:** Create a `SUSPENDED` test user with all four auth methods linked; confirm every single method rejects login for that user, not just password/Google.

---

## 7. Fix #6 — Brute-Force Protection on Password Login

**Problem:** OTP verify has a 5-attempt cap; password login has no rate limiting or lockout, making it the weaker path despite being the "primary" method.

**Fix:**
1. Add rate limiting on the password-login endpoint/credentials-provider handler: per-account (e.g., 5 failed attempts triggers a temporary lockout, exponential backoff on repeat offenses) and per-IP (broader threshold to catch credential-stuffing across many accounts).
2. Persist lockout state (a `failedLoginAttempts` counter + `lockedUntil` timestamp on `User`, or a separate table/Redis key if the codebase already uses Redis) rather than only in-memory, so it survives server restarts and works across instances.
3. Write an `AUTH_LOCKOUT` audit log entry when a lockout is triggered, including the account and originating IP.
4. Return a generic "too many attempts, try again later" message — don't reveal whether the account exists.

**Verify:** Five consecutive wrong passwords against a test account trigger a lockout; the sixth attempt is rejected before even checking the password, and an `AUTH_LOCKOUT` entry appears in the audit log.

---

## 8. Fix #7 — Rate-Limit OTP *Requests*, Not Just Verify Attempts

**Problem:** OTP verify attempts are capped at 5, but nothing stops someone from spamming OTP *generation* — SMS/email bombing a destination or running up SMS-provider costs.

**Fix:**
1. Add rate limiting on the OTP-request endpoint (both email and phone): cap per destination (e.g., max 5 requests/hour) and independently per source IP (e.g., max 10 requests/hour across any destination, to catch someone rotating targets).
2. When a request is throttled, do not send an SMS/email — return a clear rate-limit error to the client, and log it (reuse `AUTH_LOCKOUT` or add `OTP_RATE_LIMITED` if you want it distinguishable in audit review).

**Verify:** Requesting 6 OTPs for the same phone number within an hour triggers the limit on the 6th; confirm no SMS is actually dispatched for the blocked request.

---

## 9. Fix #8 — Distinctly Audit Admin's Cross-Portal ("Super-User") Access

**Problem:** Admins can view `/dashboard/*` and `/portal/*` for support/debugging, but this isn't distinguished in the audit trail from a real student/staff action on those routes.

**Fix:**
1. In `middleware.ts` (or a shared server-side helper called on those routes), detect when a request to a `/dashboard/*` or `/portal/*` route is being served to a token with `role: ADMIN` where that admin is not the resource owner.
2. On detection, write an `ADMIN_IMPERSONATION_VIEW` audit log entry: actor (admin id), resource (route/resourceId being viewed, e.g., the studentId or attemptId), timestamp, result `SUCCESS`.
3. Do this without adding noticeable latency to every admin request — a lightweight fire-and-forget audit write (or queued via the existing job infrastructure if present) is fine.

**Verify:** Log in as ADMIN, view a specific student's attempt detail inside `/dashboard` or a staff queue item inside `/portal`; confirm an `ADMIN_IMPERSONATION_VIEW` entry appears with the correct resource reference.

---

## 10. Fix #9 — Reject Conflicting Google Account Links

**Problem:** The Google `signIn` callback auto-links `AuthType.GOOGLE` "if not present," but doesn't handle the case where a `GOOGLE` `AuthMethod` already exists for that user with a **different** `providerAccountId` than the one just authenticated (e.g., after a Google account change) — currently undefined/unsafe behavior.

**Fix:**
1. In the Google `signIn` callback's existing-user branch: before linking, check whether a `GOOGLE` `AuthMethod` already exists for that `userId`.
2. If it exists and `providerAccountId` matches → proceed as normal (existing behavior).
3. If it exists and `providerAccountId` differs → **reject the sign-in**, do not relink, do not create a session, and write an `ACCOUNT_LINK_REJECTED` audit log with both the existing and incoming `providerAccountId` in metadata for manual admin review.
4. Surface a clear (but non-revealing) error to the user: "We couldn't sign you in with this Google account. Please contact support."

**Verify:** Manually seed a test user with a `GOOGLE` AuthMethod pointing at a fake `providerAccountId`, then attempt Google sign-in with a real account sharing that user's email; confirm rejection and the audit entry, not a silent relink.

---

## 11. Fix #10 (Optional — confirm before building) — Separate Staff/Admin Login Surface

**Problem:** `UnifiedAuthCard` serves Student, Staff, and Admin from one public `/login` entry point, which is a minor phishing/enumeration consideration.

**This one is a product decision, not a pure bug — confirm before implementing:**
1. If approved: move Staff/Admin sign-in to an unlisted route (e.g., `/console/login`), not linked from marketing nav or the public `/login` page's UI. `/login` remains Student-only (Email/Password, Google, Email OTP, Phone OTP). `/console/login` offers only Email/Password and Google (per the existing method matrix), plus the TOTP step from Fix #3.
2. Update `middleware.ts` redirect logic so unauthenticated hits on `/portal/*` or `/console/*` send the user to `/console/login`, not `/login`.
3. Optionally, gate ADMIN Google sign-in to an allow-listed email domain via an env-configured list, checked in the `signIn` callback before any account lookup.

**If not approved, skip this fix entirely** — it doesn't block or interact with fixes #1–#9.

---

## 12. Regression Checklist (run after all fixes)

- [ ] Student sign-up/sign-in still works unchanged across all 4 methods.
- [ ] Staff/Admin accounts can no longer be created by any self-service auth flow — only via admin invite.
- [ ] OTP login is rejected for STAFF/ADMIN with a `SECURITY_BLOCKED_METHOD` log, and still works normally for STUDENT.
- [ ] Fresh ADMIN account is forced through TOTP enrollment before reaching `/console`.
- [ ] Suspending a user mid-session invalidates their next request, not just their next login.
- [ ] `SUSPENDED` status blocks login uniformly across all 4 methods.
- [ ] Password brute-force triggers lockout + audit log; OTP request spam is throttled independently of verify-attempt limits.
- [ ] Admin viewing a student/staff resource produces an `ADMIN_IMPERSONATION_VIEW` log.
- [ ] Conflicting Google account relink is rejected and logged, not silently accepted.
- [ ] (If built) `/console/login` is unlisted and `/login` no longer authenticates Staff/Admin.

---

## How to drive this in Antigravity

Work fix-by-fix, in order, starting with the schema migration in §1. For each fix, prompt with something like:

> "Using MASTER_PROMPT_AUTH_FIXES.md as context, implement Fix #1 (invite-only Staff/Admin provisioning) only. Show me the admin-invite endpoint/UI, the activation flow, and the updated 'new user' branches in the four auth handlers. Then tell me how to manually verify it per the doc's Fix #1 verification step."

Confirm each fix passes its own "Verify" step before moving to the next — several fixes touch the same files (`auth.ts`, `middleware.ts`), so sequencing avoids merge conflicts within the session.
