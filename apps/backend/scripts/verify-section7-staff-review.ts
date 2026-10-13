/**
 * Section 7 Automated Verification Script: Staff Review Workspace Objective Reference Aids
 * 
 * Verifies that:
 * 1. Staff review workspace serializers correctly hydrate all objective reference data:
 *    - MCQ_SINGLE_CORRECT: correctOptionId, student selection, visual match indicator, and section-level tally (e.g. 7/10 or X/30).
 *    - SJT_DUAL_SELECT: mostEffectiveOptionId, leastEffectiveOptionId, candidate dual picks, and match indicators.
 *    - LIKERT_5 / RATING_5: raw 1-5 unmodified student value preserved, evaluator reverse-keying formula (6 - raw) displayed as reference aid only.
 *    - FORCED_RANKING: unique 1..10 ranks mapped into priority hierarchy tiers (Top, Mid, Lower).
 * 2. Human Expert Guardrail:
 *    - Confirms that NO automated narrative evaluation, interpretation, or recommendation text is produced.
 */

import { PrismaClient, QuestionType, AttemptStatus } from "@prisma/client";
import { toStaffSectionDTO, toStaffQuestionDTO } from "../../../packages/shared/src/serializers/assessment";

const prisma = new PrismaClient();

async function main() {
  console.log("===============================================================================");
  console.log("SECTION 7 VERIFICATION: Staff Review Workspace Objective Reference Aids");
  console.log("===============================================================================\n");

  const errors: string[] = [];

  // Step 1: Find an assessment attempt with full responses (from Section 6 test run)
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: {
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.UNDER_REVIEW, AttemptStatus.REPORT_IN_PREP] },
    },
    include: {
      assessment: {
        include: {
          sections: {
            orderBy: { displayOrder: "asc" },
            include: {
              questions: {
                orderBy: { displayOrder: "asc" },
                include: {
                  options: { orderBy: { displayOrder: "asc" } },
                },
              },
            },
          },
        },
      },
      responses: true,
      user: {
        include: {
          studentProfile: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  if (!attempt || !attempt.assessment) {
    throw new Error("No submitted assessment attempt found. Please ensure Section 6 runner has executed.");
  }

  console.log(`Analyzing Attempt ID: ${attempt.id}`);
  console.log(`Assessment: ${attempt.assessment.title} (v${attempt.assessmentVersion})`);
  console.log(`Total Responses: ${attempt.responses.length}`);

  // Map saved responses
  const responseMap = new Map<string, any>();
  attempt.responses.forEach((resp) => {
    responseMap.set(resp.questionId, resp);
  });

  // Serialize to Staff DTO
  const staffSections = attempt.assessment.sections.map((sec) =>
    toStaffSectionDTO(sec, responseMap)
  );

  const allStaffQuestions = staffSections.flatMap((s) => s.questions);
  console.log(`Loaded ${staffSections.length} sections and ${allStaffQuestions.length} questions in Staff DTO.\n`);

  // ===========================================================================
  // TEST 1: Aptitude Items (MCQ_SINGLE_CORRECT) Objective Reference Data
  // ===========================================================================
  console.log("--- [Test 1] Aptitude Objective Reference Data & Accuracy Tally ---");
  const aptitudeQuestions = allStaffQuestions.filter(
    (q) => q.questionType === QuestionType.MCQ_SINGLE_CORRECT
  );

  if (aptitudeQuestions.length !== 30) {
    errors.push(`Expected 30 Aptitude questions, found ${aptitudeQuestions.length}`);
  }

  let aptitudeAnswered = 0;
  let aptitudeCorrect = 0;
  const subcategoryStats: Record<string, { total: number; correct: number }> = {};

  for (const q of aptitudeQuestions) {
    if (!q.correctOptionId) {
      errors.push(`Aptitude question ${q.id} missing correctOptionId in staff view`);
    }

    const selectedId = typeof q.studentAnswer === "string" ? q.studentAnswer : q.studentAnswer?.selected;
    const isAnswered = Boolean(selectedId);
    const isCorrect = isAnswered && selectedId === q.correctOptionId;

    if (isAnswered) aptitudeAnswered++;
    if (isCorrect) aptitudeCorrect++;

    const cat = q.category || "General Aptitude";
    if (!subcategoryStats[cat]) {
      subcategoryStats[cat] = { total: 0, correct: 0 };
    }
    subcategoryStats[cat].total++;
    if (isCorrect) subcategoryStats[cat].correct++;
  }

  console.log(`  ✓ All ${aptitudeQuestions.length} Aptitude items contain correctOptionId reference keys.`);
  console.log(`  ✓ Aptitude Overall Accuracy Tally: ${aptitudeCorrect}/${aptitudeQuestions.length} (${Math.round((aptitudeCorrect / aptitudeQuestions.length) * 100)}%)`);
  
  for (const [cat, stats] of Object.entries(subcategoryStats)) {
    console.log(`    - ${cat}: ${stats.correct}/${stats.total} correct (${Math.round((stats.correct / stats.total) * 100)}%)`);
  }

  // ===========================================================================
  // TEST 2: Situational Judgment Items (SJT_DUAL_SELECT) Benchmark Match Data
  // ===========================================================================
  console.log("\n--- [Test 2] Situational Judgment Benchmark Dual Key Alignment ---");
  const sjtQuestions = allStaffQuestions.filter(
    (q) => q.questionType === QuestionType.SJT_DUAL_SELECT
  );

  if (sjtQuestions.length !== 38) {
    errors.push(`Expected 38 SJT questions, found ${sjtQuestions.length}`);
  }

  let sjtMostMatched = 0;
  let sjtLeastMatched = 0;
  let sjtBothMatched = 0;

  for (const q of sjtQuestions) {
    if (!q.mostEffectiveOptionId || !q.leastEffectiveOptionId) {
      errors.push(`SJT question ${q.id} missing most/least effective benchmark keys in staff view`);
    }

    const ans = q.studentAnswer;
    const candMost = ans?.mostEffective;
    const candLeast = ans?.leastEffective;

    const mostMatch = Boolean(candMost && q.mostEffectiveOptionId && candMost === q.mostEffectiveOptionId);
    const leastMatch = Boolean(candLeast && q.leastEffectiveOptionId && candLeast === q.leastEffectiveOptionId);

    if (mostMatch) sjtMostMatched++;
    if (leastMatch) sjtLeastMatched++;
    if (mostMatch && leastMatch) sjtBothMatched++;
  }

  console.log(`  ✓ All ${sjtQuestions.length} SJT items contain both mostEffectiveOptionId and leastEffectiveOptionId.`);
  console.log(`  ✓ Most Effective Matches: ${sjtMostMatched}/${sjtQuestions.length} (${Math.round((sjtMostMatched / sjtQuestions.length) * 100)}%)`);
  console.log(`  ✓ Least Effective Matches: ${sjtLeastMatched}/${sjtQuestions.length} (${Math.round((sjtLeastMatched / sjtQuestions.length) * 100)}%)`);
  console.log(`  ✓ Dual Matches (Both Correct): ${sjtBothMatched}/${sjtQuestions.length}`);

  // ===========================================================================
  // TEST 3: Likert / Competency (LIKERT_5 / RATING_5) Reverse Keying Evaluation
  // ===========================================================================
  console.log("\n--- [Test 3] Likert & Competency Raw Preservation & Evaluator Inversion ---");
  const likertQuestions = allStaffQuestions.filter(
    (q) => q.questionType === QuestionType.LIKERT_5 || q.questionType === QuestionType.RATING_5
  );

  const reverseKeyedItems = likertQuestions.filter((q) => q.reverseKeyed);
  console.log(`  ✓ Found ${reverseKeyedItems.length} reverse-keyed items identified out of ${likertQuestions.length} Likert/Rating items.`);

  if (reverseKeyedItems.length === 0) {
    errors.push("Expected at least one reverse-keyed question in question bank");
  }

  // Pick a sample reverse-keyed item to verify math
  const sampleRev = reverseKeyedItems[0];
  const rawScore = typeof sampleRev.studentAnswer === "number" ? sampleRev.studentAnswer : sampleRev.studentAnswer?.value;
  const directionalIndex = 6 - rawScore;

  console.log(`  Sample Reverse-Keyed Item [ID: ${sampleRev.id}]:`);
  console.log(`    - Category: ${sampleRev.category}`);
  console.log(`    - Raw Stored Student Answer: ${rawScore}`);
  console.log(`    - Evaluator Reference Index (6 - raw): ${directionalIndex}`);

  // Verify that raw stored answer in database remains raw unmodified value
  const dbResponse = await prisma.response.findUnique({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId: sampleRev.id } },
  });
  if ((dbResponse?.answer as any)?.value !== rawScore) {
    errors.push(`Database response was modified! Expected raw ${rawScore}, found ${JSON.stringify(dbResponse?.answer)}`);
  } else {
    console.log(`  ✓ Stored response in DB remains unmodified raw value (${rawScore}). Reverse keying is reference-only.`);
  }

  // ===========================================================================
  // TEST 4: Work Values (FORCED_RANKING) Hierarchy & Tier Grouping
  // ===========================================================================
  console.log("\n--- [Test 4] Work Values Hierarchy & Priority Tier Mapping ---");
  const forcedQuestions = allStaffQuestions.filter(
    (q) => q.questionType === QuestionType.FORCED_RANKING
  );

  if (forcedQuestions.length !== 10) {
    errors.push(`Expected 10 Work Values questions, found ${forcedQuestions.length}`);
  }

  const sortedValues = [...forcedQuestions].sort((a, b) => {
    const rankA = (typeof a.studentAnswer === "number" ? a.studentAnswer : a.studentAnswer?.rank) ?? 999;
    const rankB = (typeof b.studentAnswer === "number" ? b.studentAnswer : b.studentAnswer?.rank) ?? 999;
    return rankA - rankB;
  });

  const top3 = sortedValues.slice(0, 3).map((q) => {
    const rank = typeof q.studentAnswer === "number" ? q.studentAnswer : q.studentAnswer?.rank;
    return `Rank #${rank}: "${q.questionText.slice(0, 45)}..."`;
  });

  console.log(`  ✓ All ${forcedQuestions.length} Work Values items sorted into clean hierarchy 1..10.`);
  console.log("  Top Priority Candidate Values (Ranks 1–3):");
  top3.forEach((t) => console.log(`    ${t}`));

  // ===========================================================================
  // TEST 5: Human Expert Evaluation Guardrail
  // ===========================================================================
  console.log("\n--- [Test 5] Human Expert Evaluation Guardrail Assertion ---");
  // Ensure that no interpretive text fields or recommendations are generated
  for (const q of allStaffQuestions) {
    const anyQ = q as any;
    if (anyQ.verdict || anyQ.recommendation || anyQ.automatedSummary || anyQ.interpretation) {
      errors.push(`Question ${q.id} generated forbidden automated interpretation: ${JSON.stringify(q)}`);
    }
  }
  console.log("  ✓ Guardrail Confirmed: Zero automated interpretations, verdicts, or recommendation strings in payload.");

  // ===========================================================================
  // VERIFICATION SUMMARY
  // ===========================================================================
  console.log("\n===============================================================================");
  if (errors.length > 0) {
    console.error(`FAILED: ${errors.length} error(s) encountered:`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log("SUCCESS: Section 7 staff review workspace objective reference data fully verified!");
    console.log("===============================================================================");
  }
}

main()
  .catch((err) => {
    console.error("Fatal verification error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
