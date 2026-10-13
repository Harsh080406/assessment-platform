# MASTER_PROMPT_QUESTION_BANK_INTEGRATION.md — AuraPath Question Bank Integration (for Antigravity)

> Paste this entire file as context in Antigravity. It covers integrating the real question bank (`Competency_Questionnaire.xlsx`) into the assessment engine, login-gated for students only. Read section 0 and answer the two flagged decisions before building — they change the data model shape.

---

## 0. What's in the Source File (confirmed by inspection)

The workbook (`Question_Bank` sheet, 136 rows) contains **126 real questions** across categories that use **five different question mechanics**, not one uniform multiple-choice format. This is more structurally varied than the generic `single_choice|multi_choice|likert|yes_no|ranking` enum sketched in earlier planning docs — the schema needs to be tightened to match what's actually here before import.

| Source section header | Item codes | Count | Mechanic |
|---|---|---|---|
| Big Five Personality | Q1–Q20 | 20 | 5-point Likert (1=Strongly Disagree, 5=Strongly Agree); some items flagged `Reverse-keyed (R)` |
| RIASEC Interests | I1–I12 | 12 | 5-point enjoyment scale (1=Would dislike it, 5=Would love it) |
| Work Values | V1–V10 | 10 | **Forced ranking** — all 10 cards ranked 1 (matters most) to 10 (matters least), no ties, as one interaction per section, not per-item |
| Competency Self-Report | Comp1–Comp16 | 16 | 5-point Likert |
| Situational Judgment Test | SJT1–SJT38 | 38 | 4 fixed options (A–D); respondent must pick **both** "Most Effective" and "Least Effective" from the same 4 options — a dual-select, not a single choice |
| Aptitude: Verbal Reasoning | VR1–VR10 | 10 | 4 options, one objectively correct answer |
| Aptitude: Numerical Reasoning | NR1–NR10 | 10 | 4 options, one objectively correct answer |
| Aptitude: Logical Reasoning | LR1–LR10 | 10 | 4 options, one objectively correct answer |

Every row also carries a **Category/Competency tag** (e.g., Openness, Critical Thinking, Integrity & Ethics) used for later human evaluation grouping — this is metadata for the expert, not something the system scores automatically.

---

## 1. Two Decisions to Confirm Before Building

**Decision A — Section grouping.** The user's requested category names ("Psychometric Assessment," "Competency Self-Report," "Situational Judgment Test," "Aptitude: Verbal Reasoning") map to the source file as follows — confirm this mapping is correct, especially the last one:

- **Psychometric Assessment** = Big Five Personality + RIASEC Interests + Work Values (42 items, 3 sub-groups)
- **Competency Self-Report** = 16 items
- **Situational Judgment Test** = 38 items
- **Aptitude: Verbal Reasoning** — the source file actually contains three aptitude sub-types (Verbal, Numerical, Logical Reasoning, 30 items total). Confirm: should the assessment section named "Aptitude: Verbal Reasoning" include **all 30 aptitude items** (with Verbal/Numerical/Logical as sub-groups within it), or **only the 10 Verbal Reasoning items**, with Numerical/Logical held back for a future module? The build steps below assume **all 30, grouped under one "Aptitude" section with three sub-categories** — flag to the agent if that's wrong before it seeds data.

This also means the real content is **126 questions across 4 sections**, not the "~75 questions / 3 sections" figure used as a placeholder in earlier planning docs — that number was always a placeholder pending real content (per `PROMPT.md` §9/10 "What the Client Owns"); update `estimatedDurationMins` and any UI copy that still says "75 questions" once this is seeded.

**Decision B — Visibility of scoring keys.** The file includes objective answer keys (`Correct Answer: B`), effectiveness keys (`Most Effective: B | Least Effective: A`), and reverse-keying flags. The platform's core rule is **no automated scoring or interpretation** presented to the student. Confirm this design before building:

- These keys are stored in the database as **staff-facing reference data only** — visible in the expert review workspace (`/portal/review/[attemptId]`) to speed up evaluation (e.g., showing an evaluator that a candidate scored 7/10 on Verbal Reasoning is an objective fact, not an interpretation).
- These keys are **never included in any API response served to the student** — not in the question payload while taking the assessment, not in results, not anywhere. Two separate serializers are required (see §4).
- The system may compute and display **raw objective aids to staff only** (aptitude % correct, SJT most/least-match count, Likert raw factor totals) — but the platform must never auto-generate the report or any interpretive text from these; that stays human-authored, unchanged from existing rules.

If either assumption is wrong, stop and clarify before implementing §3–§5.

---

## 2. Schema Changes

Extend the existing `Question`/`QuestionOption` models (do not create a parallel schema):

```prisma
enum QuestionType {
  LIKERT_5          // Big Five, Competency Self-Report — 1-5 scale, no listed options
  RATING_5          // RIASEC Interests — 1-5 enjoyment scale, no listed options
  FORCED_RANKING    // Work Values — rank all items in the section 1..N, no ties
  SJT_DUAL_SELECT   // Situational Judgment — pick Most Effective AND Least Effective from 4 options
  MCQ_SINGLE_CORRECT // Aptitude — 4 options, one correct answer
}

model Question {
  // ...existing fields (id, sectionId, version, questionText, displayOrder, required)...
  questionType     QuestionType
  category         String            // e.g. "Openness", "Critical Thinking", "Verbal Reasoning"
  reverseKeyed     Boolean  @default(false)   // LIKERT_5 only
  correctOptionId  String?           // MCQ_SINGLE_CORRECT only — staff-reference only, never serialized to student
  mostEffectiveOptionId  String?     // SJT_DUAL_SELECT only — staff-reference only
  leastEffectiveOptionId String?     // SJT_DUAL_SELECT only — staff-reference only
}

model QuestionOption {
  // ...existing fields (id, questionId, optionText, displayOrder)...
}

model AssessmentSection {
  // ...existing fields (id, assessmentId, title, description, displayOrder)...
  subCategory      String?           // e.g. "Personality" | "Interests" | "Values" | "Verbal" | "Numerical" | "Logical", null if section has no sub-grouping
}
```

`LIKERT_5`/`RATING_5` questions have **no** `QuestionOption` rows — the 1–5 scale with its anchor labels (e.g., "Strongly Disagree" → "Strongly Agree") is rendered by the frontend based on `questionType`, not fetched as options. `FORCED_RANKING` questions belong to one section and are rendered/submitted as a single ranked-list interaction across all of that section's questions, not answered one at a time.

Update the `Response.answer` (jsonb) shape per type:
- `LIKERT_5`/`RATING_5`: `{ value: 1-5 }`
- `FORCED_RANKING`: one `Response` per question storing `{ rank: 1-10 }`, or a single section-level response storing the full ordering — pick whichever fits the existing `Response` table shape with the least structural change, and note the choice.
- `SJT_DUAL_SELECT`: `{ mostEffective: optionId, leastEffective: optionId }`
- `MCQ_SINGLE_CORRECT`: `{ selected: optionId }`

Run and verify the migration before proceeding.

---

## 3. Import Pipeline

1. Add a one-time conversion script (`apps/backend/scripts/convert-question-bank.ts`) that reads `Competency_Questionnaire.xlsx` (place the file in a `seed-data/` folder, not committed to a public path) using a library like `exceljs` or `xlsx`, and emits a structured JSON file: `packages/shared/seed-data/question-bank-v1.json`. Commit the JSON, not the raw spreadsheet, as the actual seed source — it's diffable and reviewable in PRs.
2. The JSON should preserve: item code, module/section, sub-category, question text, options (where present), question type (inferred from the "Response Format / Scoring Key" column per the mapping in §0), reverse-keyed flag, correct/most-effective/least-effective keys.
3. Add a Prisma seed script (or extend the existing one) that reads `question-bank-v1.json` and creates:
   - One `Assessment` record, `version: 1`, `status: ACTIVE`, `estimatedDurationMins` recalculated for 126 items (not the old 75-item placeholder).
   - Four `AssessmentSection` records per Decision A's mapping, each with correct `displayOrder`.
   - All `Question` + `QuestionOption` rows, correctly typed per §2, with `version: 1`.
4. Do not hand-type the 126 questions into a seed file directly — parse them from the source so the item text stays byte-accurate to what the client provided, and so re-running the conversion script is how future corrections get applied.

**Verify:** After seeding, count records per section match §0's table exactly (20/12/10 under Psychometric; 16 under Competency; 38 under SJT; 10/10/10 under Aptitude) before moving on.

---

## 4. API Layer — Two Serializers

Because scoring keys must never reach the student:

1. **Student-facing question DTO** (`toStudentQuestionDTO`): returns `id, questionText, questionType, category, options[] (id + text only), displayOrder` — explicitly omits `reverseKeyed` (irrelevant to the student), `correctOptionId`, `mostEffectiveOptionId`, `leastEffectiveOptionId` entirely; these fields must not even be present as `null` in the payload shape if avoidable, to prevent accidental leakage via a client-side inspector.
2. **Staff-facing question DTO** (`toStaffQuestionDTO`): includes everything, plus the student's actual `Response` for that question, for the review workspace.
3. Add a test (or at minimum a manual check) confirming the student-facing assessment-taking endpoint (`GET /api/v1/attempts/:id/questions` or equivalent) never returns a scoring-key field under any circumstance, including for `MCQ_SINGLE_CORRECT` and `SJT_DUAL_SELECT` types.

---

## 5. Access Control — Login-Gated

This should mostly already exist per the platform's route-group middleware, but confirm explicitly for this feature:

1. Every route under `(assessment)/take/[attemptId]/*` and every backend endpoint under `/api/v1/attempts/*` and `/api/v1/assessments/*` (student-facing ones) requires an authenticated session with `role: STUDENT` (or `ADMIN` for the super-user preview case already defined in the auth architecture) — reject with a redirect to `/login?callbackUrl=...` for unauthenticated requests, consistent with existing middleware behavior.
2. A student may only start/resume/view **their own** `AssessmentAttempt` — verify `attempt.userId === session.user.id` on every request, not just on attempt creation.
3. The assessment catalog/landing (`/dashboard/assessments`) may show that the assessment exists to a logged-in student before they start it, but the actual question content (via §4's student DTO) is only returned once an `AssessmentAttempt` has been created for that user — don't expose question text to any route reachable pre-login.

**Verify:** Attempt to hit the questions endpoint directly (e.g., via curl with no session cookie) and confirm a 401/redirect, not question data.

---

## 6. Frontend Rendering Per Question Type

Extend the assessment-taking UI (`/take/[attemptId]`) to branch rendering by `questionType`, reusing the existing minimal-chrome layout, progress bar, and auto-save/resume/submit-lock behavior already built — only the per-question input control changes:

1. **`LIKERT_5` / `RATING_5`**: a 5-point scale control (radio group or segmented control) with the section-appropriate anchor labels passed from the section's config (Personality/Competency use Strongly Disagree↔Strongly Agree; Interests use Would dislike it↔Would love it) — do not hard-code one label set for all Likert-type questions.
2. **`FORCED_RANKING`**: a drag-and-drop or numbered-assignment interface presenting all 10 Work Values cards at once, requiring every item to receive a unique rank 1–10 before the section can be marked complete — this is a section-level interaction, not a per-question "Next" flow like the rest of the assessment.
3. **`SJT_DUAL_SELECT`**: render the scenario text and 4 options, with two explicit selectors — "Which response is Most Effective?" and "Which response is Least Effective?" — and validate client-side that the same option isn't selected for both before allowing "Next."
4. **`MCQ_SINGLE_CORRECT`**: standard single-select radio group, same as the existing single-choice rendering already built for the assessment engine.

Auto-save debouncing, resume-in-progress, and submission-lock logic already built for the assessment engine should apply uniformly across all five types — don't rebuild that plumbing, just extend the per-question input component and the `Response.answer` shape it writes.

**Verify:** Take a full test attempt through all 4 sections as a seeded test student account, confirming every question type renders correctly, auto-saves, survives a page refresh mid-section, and locks correctly on submission — including that the Work Values ranking section can't be submitted with duplicate or missing ranks.

---

## 7. Staff Review Workspace Update

In `/portal/review/[attemptId]`, extend the response readout (already built) to additionally show, per question, the objective reference data from §1 Decision B where applicable:
- Aptitude items: the student's selected answer next to the correct answer, with a visual correct/incorrect indicator, plus a section-level "7/10 correct" summary.
- SJT items: the student's most/least-effective picks next to the reference key.
- Likert/Competency items: raw 1–5 value as answered (apply reverse-keying only for the evaluator's reference view, not stored as a "corrected" value in `Response` itself — keep `Response.answer` as the raw, unmodified input).

This is explicitly an **evaluation aid for the human expert**, not a scored report — do not add any auto-generated summary, verdict, or recommendation text anywhere in this view or elsewhere in the student-facing product.

---

## Regression Checklist

- [ ] All 126 questions seeded, correctly grouped into the 4 confirmed sections/sub-categories, versioned as `v1`.
- [ ] Student-facing question payloads never contain scoring-key fields, verified directly against the raw API response.
- [ ] All 5 question-type UIs render, auto-save, resume, and lock-on-submit correctly.
- [ ] Assessment content is unreachable without an authenticated STUDENT (or ADMIN preview) session.
- [ ] A student can only ever access their own attempt's questions/responses.
- [ ] Staff review workspace shows objective reference data without producing any auto-generated interpretation.
- [ ] Any UI copy still stating "75 questions" or "3 sections" is updated to reflect the real 126-item, 4-section structure.

---

## How to drive this in Antigravity

Confirm Decisions A and B with me first. Then work through sections in order:

> "Using MASTER_PROMPT_QUESTION_BANK_INTEGRATION.md as context, do section 2 (schema changes) only. Show me the updated Prisma schema and migration, then stop before writing the import pipeline."

Sequence: schema (§2) → import pipeline (§3) → API serializers (§4) → access-control verification (§5) → frontend rendering (§6) → staff workspace update (§7). Confirm each section's "Verify" step before moving to the next.
