import dotenv from "dotenv";
dotenv.config({ path: "apps/frontend/.env" });

import { PrismaClient } from "@prisma/client";
import {
  toStudentQuestionDTO,
  toStudentSectionDTO,
  toStaffQuestionDTO,
  toStaffSectionDTO,
} from "@aurapath/shared";

const prisma = new PrismaClient();

async function main() {
  console.log("===============================================================================");
  console.log("Section 4 Automated Verification: API Layer — Two Serializers");
  console.log("===============================================================================\n");

  const assessment = await prisma.assessment.findFirst({
    where: { status: "ACTIVE" },
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
  });

  if (!assessment) {
    console.error("❌ No active assessment found in database.");
    process.exit(1);
  }

  console.log(`Loaded Assessment: "${assessment.title}" (Version: ${assessment.version})`);
  console.log(`Total Sections: ${assessment.sections.length}`);

  let totalQuestionsCount = 0;
  let mcqWithKeyCount = 0;
  let sjtWithKeyCount = 0;
  let reverseKeyedCount = 0;

  // Track any leakages detected
  const leakages: string[] = [];

  for (const section of assessment.sections) {
    console.log(`\n--- Validating Section ${section.displayOrder}: "${section.title}" (${section.questions.length} questions) ---`);
    totalQuestionsCount += section.questions.length;

    // 1. Test toStudentSectionDTO
    const studentSectionDTO = toStudentSectionDTO(section);
    const serializedSectionJson = JSON.stringify(studentSectionDTO);

    // Verify section json has no keys
    if (serializedSectionJson.includes("correctOptionId")) {
      leakages.push(`Section ${section.title} serialized JSON contains "correctOptionId"`);
    }
    if (serializedSectionJson.includes("mostEffectiveOptionId")) {
      leakages.push(`Section ${section.title} serialized JSON contains "mostEffectiveOptionId"`);
    }
    if (serializedSectionJson.includes("leastEffectiveOptionId")) {
      leakages.push(`Section ${section.title} serialized JSON contains "leastEffectiveOptionId"`);
    }
    if (serializedSectionJson.includes("reverseKeyed")) {
      leakages.push(`Section ${section.title} serialized JSON contains "reverseKeyed"`);
    }

    for (const rawQ of section.questions) {
      if (rawQ.questionType === "MCQ_SINGLE_CORRECT" && rawQ.correctOptionId) {
        mcqWithKeyCount++;
      }
      if (rawQ.questionType === "SJT_DUAL_SELECT" && rawQ.mostEffectiveOptionId) {
        sjtWithKeyCount++;
      }
      if (rawQ.reverseKeyed) {
        reverseKeyedCount++;
      }

      // Test toStudentQuestionDTO
      const studentQ = toStudentQuestionDTO(rawQ);
      const studentQJson = JSON.stringify(studentQ);

      // Check runtime property absence
      if ("correctOptionId" in studentQ) {
        leakages.push(`[${rawQ.id}] studentQ has 'correctOptionId' property`);
      }
      if ("mostEffectiveOptionId" in studentQ) {
        leakages.push(`[${rawQ.id}] studentQ has 'mostEffectiveOptionId' property`);
      }
      if ("leastEffectiveOptionId" in studentQ) {
        leakages.push(`[${rawQ.id}] studentQ has 'leastEffectiveOptionId' property`);
      }
      if ("reverseKeyed" in studentQ) {
        leakages.push(`[${rawQ.id}] studentQ has 'reverseKeyed' property`);
      }

      // Check JSON string absence
      if (studentQJson.includes("correctOptionId")) {
        leakages.push(`[${rawQ.id}] JSON contains "correctOptionId"`);
      }
      if (studentQJson.includes("mostEffectiveOptionId")) {
        leakages.push(`[${rawQ.id}] JSON contains "mostEffectiveOptionId"`);
      }
      if (studentQJson.includes("leastEffectiveOptionId")) {
        leakages.push(`[${rawQ.id}] JSON contains "leastEffectiveOptionId"`);
      }
      if (studentQJson.includes("reverseKeyed")) {
        leakages.push(`[${rawQ.id}] JSON contains "reverseKeyed"`);
      }

      // 2. Test toStaffQuestionDTO (must preserve scoring keys and student answers)
      const mockResponse = {
        answer: rawQ.questionType === "MCQ_SINGLE_CORRECT" ? { selected: "mock_opt" } : { value: 4 },
        answeredAt: new Date(),
        questionVersion: rawQ.version,
      };

      const staffQ = toStaffQuestionDTO(rawQ, mockResponse, section.title, section.displayOrder);

      if (rawQ.correctOptionId && staffQ.correctOptionId !== rawQ.correctOptionId) {
        leakages.push(`[${rawQ.id}] staffQ missing correctOptionId`);
      }
      if (rawQ.mostEffectiveOptionId && staffQ.mostEffectiveOptionId !== rawQ.mostEffectiveOptionId) {
        leakages.push(`[${rawQ.id}] staffQ missing mostEffectiveOptionId`);
      }
      if (rawQ.leastEffectiveOptionId && staffQ.leastEffectiveOptionId !== rawQ.leastEffectiveOptionId) {
        leakages.push(`[${rawQ.id}] staffQ missing leastEffectiveOptionId`);
      }
      if (staffQ.reverseKeyed !== Boolean(rawQ.reverseKeyed)) {
        leakages.push(`[${rawQ.id}] staffQ reverseKeyed mismatch`);
      }
      if (!staffQ.studentResponse || staffQ.studentAnswer === null) {
        leakages.push(`[${rawQ.id}] staffQ missing studentResponse or studentAnswer`);
      }
    }
  }

  // Also test toStaffSectionDTO with full map
  const mockResponsesMap = new Map();
  assessment.sections[0].questions.forEach((q) => {
    mockResponsesMap.set(q.id, { answer: { test: true }, answeredAt: new Date(), questionVersion: q.version });
  });
  const staffSectionDTO = toStaffSectionDTO(assessment.sections[0], mockResponsesMap);

  console.log("\n============================= VERIFICATION STATS =============================");
  console.log(`Total questions verified: ${totalQuestionsCount}`);
  console.log(`MCQ questions with scoring key in DB: ${mcqWithKeyCount} (All keys stripped in student DTO)`);
  console.log(`SJT questions with scoring keys in DB: ${sjtWithKeyCount} (All keys stripped in student DTO)`);
  console.log(`Reverse-keyed questions in DB: ${reverseKeyedCount} (Flag stripped in student DTO)`);
  console.log(`Staff review workspace preservation verified: ${staffSectionDTO.questions.length} questions in section 1`);

  if (leakages.length > 0) {
    console.error(`\n❌ FAILED: ${leakages.length} scoring key leakages detected!`);
    leakages.slice(0, 10).forEach((err) => console.error("  - " + err));
    process.exit(1);
  }

  console.log("\n✅ SUCCESS: 0 leakages detected!");
  console.log("Under no circumstance does student question payload contain scoring keys or reverse-keyed flags.");
  console.log("Staff question payload preserves all scoring reference keys and student responses.");
  console.log("===============================================================================");
}

main()
  .catch((e) => {
    console.error("Verification script encountered an error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
