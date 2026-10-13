import {
  PrismaClient,
  UserRole,
  UserStatus,
  AuthType,
  AssessmentStatus,
  QuestionType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface ParsedOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

interface ParsedQuestionItem {
  itemCode: string;
  sectionTitle: string;
  subCategory: string | null;
  category: string;
  questionText: string;
  questionType: "LIKERT_5" | "RATING_5" | "FORCED_RANKING" | "SJT_DUAL_SELECT" | "MCQ_SINGLE_CORRECT";
  reverseKeyed: boolean;
  options: ParsedOption[];
  correctKey: "A" | "B" | "C" | "D" | null;
  mostEffectiveKey: "A" | "B" | "C" | "D" | null;
  leastEffectiveKey: "A" | "B" | "C" | "D" | null;
}

interface QuestionBankData {
  version: number;
  title: string;
  description: string;
  totalQuestions: number;
  estimatedDurationMins: number;
  sections: {
    title: string;
    description: string;
    subCategory: string | null;
    displayOrder: number;
    expectedCount: number;
  }[];
  questions: ParsedQuestionItem[];
}

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // 1. Seed Student User
  const student = await prisma.user.upsert({
    where: { email: "student@aurapath.com" },
    update: { passwordHash, role: UserRole.STUDENT, status: UserStatus.ACTIVE, emailVerified: new Date() },
    create: {
      email: "student@aurapath.com",
      passwordHash,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      studentProfile: {
        create: {
          firstName: "Alex",
          lastName: "Student",
          grade: "Class 12",
          school: "Global Academy",
          educationLevel: "High School",
        },
      },
      authMethods: {
        create: { type: AuthType.PASSWORD },
      },
    },
  });
  console.log("✓ Seeded Student user: student@aurapath.com");

  // 2. Seed Staff User
  const staff = await prisma.user.upsert({
    where: { email: "staff@aurapath.com" },
    update: { passwordHash, role: UserRole.STAFF, status: UserStatus.ACTIVE, emailVerified: new Date() },
    create: {
      email: "staff@aurapath.com",
      passwordHash,
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      staffProfile: {
        create: {
          specialty: "Cognitive Psychometrics & STEM Careers",
          active: true,
        },
      },
      authMethods: {
        create: { type: AuthType.PASSWORD },
      },
    },
  });
  console.log("✓ Seeded Staff user: staff@aurapath.com");

  // 3. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@aurapath.com" },
    update: { passwordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE, emailVerified: new Date() },
    create: {
      email: "admin@aurapath.com",
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      authMethods: {
        create: { type: AuthType.PASSWORD },
      },
    },
  });
  console.log("✓ Seeded Admin user: admin@aurapath.com");

  // 4. Load Real Question Bank JSON from packages/shared/seed-data
  const jsonPath = path.resolve(__dirname, "../../../packages/shared/seed-data/question-bank-v1.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Question bank seed data not found at: ${jsonPath}`);
  }

  const bankData: QuestionBankData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`📖 Loaded ${bankData.questions.length} questions from: ${jsonPath}`);

  // Archive any old placeholder assessment
  await prisma.assessment.updateMany({
    where: {
      title: { not: bankData.title },
      status: AssessmentStatus.ACTIVE,
    },
    data: { status: AssessmentStatus.ARCHIVED },
  });

  // 5. Upsert Real Assessment
  const assessment = await prisma.assessment.upsert({
    where: {
      title_version: {
        title: bankData.title,
        version: bankData.version,
      },
    },
    update: {
      description: bankData.description,
      status: AssessmentStatus.ACTIVE,
      estimatedDurationMins: bankData.estimatedDurationMins,
    },
    create: {
      title: bankData.title,
      description: bankData.description,
      version: bankData.version,
      status: AssessmentStatus.ACTIVE,
      estimatedDurationMins: bankData.estimatedDurationMins,
    },
  });

  console.log(`✓ Active Assessment: "${assessment.title}" (v${assessment.version}, id: ${assessment.id})`);

  // 6. Seed Sections and Questions
  for (const secMeta of bankData.sections) {
    const section = await prisma.assessmentSection.upsert({
      where: {
        id: `${assessment.id}-sec-${secMeta.displayOrder}`,
      },
      update: {
        title: secMeta.title,
        description: secMeta.description,
        subCategory: secMeta.subCategory,
        displayOrder: secMeta.displayOrder,
      },
      create: {
        id: `${assessment.id}-sec-${secMeta.displayOrder}`,
        assessmentId: assessment.id,
        title: secMeta.title,
        description: secMeta.description,
        subCategory: secMeta.subCategory,
        displayOrder: secMeta.displayOrder,
      },
    });

    const secQuestions = bankData.questions.filter((q) => q.sectionTitle === secMeta.title);
    console.log(`Seeding ${secQuestions.length} questions for "${secMeta.title}"...`);

    // Clean existing questions for this section if re-running
    const existingQuestions = await prisma.question.findMany({
      where: { sectionId: section.id },
      select: { id: true },
    });
    if (existingQuestions.length > 0) {
      const qIds = existingQuestions.map((q) => q.id);
      await prisma.questionOption.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.question.deleteMany({ where: { id: { in: qIds } } });
    }

    for (let qIdx = 0; qIdx < secQuestions.length; qIdx++) {
      const qData = secQuestions[qIdx];

      // 1. Create Question
      const question = await prisma.question.create({
        data: {
          sectionId: section.id,
          version: 1,
          questionText: qData.questionText,
          questionType: qData.questionType as QuestionType,
          category: qData.category,
          reverseKeyed: qData.reverseKeyed,
          displayOrder: qIdx + 1,
          required: true,
        },
      });

      // 2. Create Options if present
      if (qData.options && qData.options.length > 0) {
        const createdOptions = [];
        for (let optIdx = 0; optIdx < qData.options.length; optIdx++) {
          const opt = qData.options[optIdx];
          const createdOpt = await prisma.questionOption.create({
            data: {
              questionId: question.id,
              optionText: opt.text,
              displayOrder: optIdx + 1, // 1=A, 2=B, 3=C, 4=D
            },
          });
          createdOptions.push({ label: opt.label, id: createdOpt.id });
        }

        // 3. Link staff-reference scoring keys
        if (qData.questionType === "MCQ_SINGLE_CORRECT" && qData.correctKey) {
          const correctOpt = createdOptions.find((o) => o.label === qData.correctKey);
          if (correctOpt) {
            await prisma.question.update({
              where: { id: question.id },
              data: { correctOptionId: correctOpt.id },
            });
          }
        } else if (qData.questionType === "SJT_DUAL_SELECT") {
          const mostOpt = createdOptions.find((o) => o.label === qData.mostEffectiveKey);
          const leastOpt = createdOptions.find((o) => o.label === qData.leastEffectiveKey);
          await prisma.question.update({
            where: { id: question.id },
            data: {
              mostEffectiveOptionId: mostOpt?.id || null,
              leastEffectiveOptionId: leastOpt?.id || null,
            },
          });
        }
      }
    }
  }

  // 7. Verify Counts
  console.log("\n==================== VERIFICATION SUMMARY ====================");
  const allSections = await prisma.assessmentSection.findMany({
    where: { assessmentId: assessment.id },
    orderBy: { displayOrder: "asc" },
    include: {
      questions: {
        select: {
          id: true,
          questionType: true,
          category: true,
          reverseKeyed: true,
          correctOptionId: true,
          mostEffectiveOptionId: true,
          leastEffectiveOptionId: true,
        },
      },
    },
  });

  let totalQuestionsCount = 0;
  for (const s of allSections) {
    console.log(`\nSection ${s.displayOrder}: "${s.title}" — Total: ${s.questions.length}`);
    totalQuestionsCount += s.questions.length;

    // Breakdown for Psychometric
    if (s.title === "Psychometric Assessment") {
      const likert5 = s.questions.filter((q) => q.questionType === "LIKERT_5");
      const rating5 = s.questions.filter((q) => q.questionType === "RATING_5");
      const forced = s.questions.filter((q) => q.questionType === "FORCED_RANKING");
      const reverseKeyed = s.questions.filter((q) => q.reverseKeyed);
      console.log(`  • Big Five Personality (LIKERT_5): ${likert5.length} (Reverse-keyed: ${reverseKeyed.length})`);
      console.log(`  • RIASEC Interests (RATING_5): ${rating5.length}`);
      console.log(`  • Work Values (FORCED_RANKING): ${forced.length}`);
    }

    // Breakdown for Competency
    if (s.title === "Competency Self-Report") {
      console.log(`  • Competency Items (LIKERT_5): ${s.questions.length}`);
    }

    // Breakdown for SJT
    if (s.title === "Situational Judgment Test") {
      const withBothKeys = s.questions.filter((q) => q.mostEffectiveOptionId && q.leastEffectiveOptionId);
      console.log(`  • SJT Dual-Select Items: ${s.questions.length} (Keyed correctly: ${withBothKeys.length})`);
    }

    // Breakdown for Aptitude
    if (s.title === "Aptitude") {
      const withCorrectKey = s.questions.filter((q) => q.correctOptionId);
      console.log(`  • Aptitude Items (MCQ_SINGLE_CORRECT): ${s.questions.length} (Keyed correctly: ${withCorrectKey.length})`);
    }
  }

  console.log(`\nTOTAL QUESTIONS SEEDED: ${totalQuestionsCount} (Target: 126)`);
  console.log("==============================================================\n");

  return {
    student,
    staff,
    admin,
    assessment,
    totalQuestionsCount,
  };
}

// Only auto-run when directly executed from CLI
if (typeof require !== "undefined" && require.main === module) {
  seedDatabase()
    .then(async () => {
      console.log("Seeding complete.");
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error("Seeding failed:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
