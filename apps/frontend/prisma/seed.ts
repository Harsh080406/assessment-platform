import { PrismaClient, UserRole, UserStatus, AuthType, AssessmentStatus, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * PHASE 2 SEED SCRIPT
 * Creates:
 * 1. Test users for student, staff, and admin roles.
 * 2. One sample Assessment (3 sections, 10 placeholder questions mixing SINGLE_CHOICE and LIKERT).
 *
 * NOTE: This sample assessment contains placeholder questions for development.
 * Final 75 psychometric assessment questions are client-provided per PROMPT.md §9.
 */
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

  // 4. Seed Sample Assessment (with Versioning)
  const assessmentTitle = "AuraPath Pathfinder Psychometric Assessment";
  const assessmentVersion = 1;

  let assessment = await prisma.assessment.findUnique({
    where: {
      title_version: {
        title: assessmentTitle,
        version: assessmentVersion,
      },
    },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        title: assessmentTitle,
        description:
          "A comprehensive 3-part diagnostic evaluating cognitive problem-solving styles, workplace interaction preferences, and intrinsic career motivators.",
        version: assessmentVersion,
        status: AssessmentStatus.ACTIVE,
        estimatedDurationMins: 20,
        sections: {
          create: [
            // SECTION 1: Cognitive Styles & Problem Solving
            {
              title: "Section 1: Cognitive Styles & Problem Solving",
              description:
                "Explores how you process complex information, decompose ambiguous problems, and synthesize solutions.",
              displayOrder: 1,
              questions: {
                create: [
                  {
                    version: 1,
                    questionText:
                      "I prefer breaking complex challenges into structured, step-by-step logic before taking concrete action.",
                    questionType: QuestionType.LIKERT,
                    displayOrder: 1,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Strongly Disagree", displayOrder: 1 },
                        { optionText: "Disagree", displayOrder: 2 },
                        { optionText: "Neutral", displayOrder: 3 },
                        { optionText: "Agree", displayOrder: 4 },
                        { optionText: "Strongly Agree", displayOrder: 5 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "When facing an unfamiliar problem with missing data, what is your default approach?",
                    questionType: QuestionType.SINGLE_CHOICE,
                    displayOrder: 2,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Methodical research and historical data gathering", displayOrder: 1 },
                        { optionText: "Intuitive experimentation and rapid trial-and-error", displayOrder: 2 },
                        { optionText: "Collaborative brainstorming with peers or domain experts", displayOrder: 3 },
                        { optionText: "Abstract conceptual modeling and theoretical deduction", displayOrder: 4 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "I enjoy analyzing abstract patterns and theoretical frameworks more than executing repetitive tasks.",
                    questionType: QuestionType.LIKERT,
                    displayOrder: 3,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Strongly Disagree", displayOrder: 1 },
                        { optionText: "Disagree", displayOrder: 2 },
                        { optionText: "Neutral", displayOrder: 3 },
                        { optionText: "Agree", displayOrder: 4 },
                        { optionText: "Strongly Agree", displayOrder: 5 },
                      ],
                    },
                  },
                ],
              },
            },
            // SECTION 2: Work Environment & Team Dynamics
            {
              title: "Section 2: Work Environment & Interpersonal Dynamics",
              description:
                "Evaluates your optimal team configuration, communication rhythm, and conflict-resolution style.",
              displayOrder: 2,
              questions: {
                create: [
                  {
                    version: 1,
                    questionText:
                      "Which work environment consistently produces your highest creative and analytical output?",
                    questionType: QuestionType.SINGLE_CHOICE,
                    displayOrder: 1,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Quiet, solitary deep-work focus time", displayOrder: 1 },
                        { optionText: "High-energy cross-functional team sprints", displayOrder: 2 },
                        { optionText: "Structured mentorship with continuous feedback loops", displayOrder: 3 },
                        { optionText: "Fast-paced, autonomous environment with high ownership", displayOrder: 4 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "I feel energized when presenting ideas or negotiating with external stakeholders.",
                    questionType: QuestionType.LIKERT,
                    displayOrder: 2,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Strongly Disagree", displayOrder: 1 },
                        { optionText: "Disagree", displayOrder: 2 },
                        { optionText: "Neutral", displayOrder: 3 },
                        { optionText: "Agree", displayOrder: 4 },
                        { optionText: "Strongly Agree", displayOrder: 5 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "I find it easy to adapt when project requirements pivot unexpectedly mid-stream.",
                    questionType: QuestionType.LIKERT,
                    displayOrder: 3,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Strongly Disagree", displayOrder: 1 },
                        { optionText: "Disagree", displayOrder: 2 },
                        { optionText: "Neutral", displayOrder: 3 },
                        { optionText: "Agree", displayOrder: 4 },
                        { optionText: "Strongly Agree", displayOrder: 5 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "When resolving a disagreement between team members, what is your primary focus?",
                    questionType: QuestionType.SINGLE_CHOICE,
                    displayOrder: 4,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Objective facts and empirical evidence", displayOrder: 1 },
                        { optionText: "Interpersonal harmony and empathetic alignment", displayOrder: 2 },
                        { optionText: "Pragmatic compromise to maintain forward momentum", displayOrder: 3 },
                        { optionText: "Adherence to established principles and standards", displayOrder: 4 },
                      ],
                    },
                  },
                ],
              },
            },
            // SECTION 3: Career Motivators & Value Alignment
            {
              title: "Section 3: Career Motivators & Value Alignment",
              description:
                "Identifies your core intrinsic motivators and long-term career aspirations.",
              displayOrder: 3,
              questions: {
                create: [
                  {
                    version: 1,
                    questionText:
                      "Making a measurable societal or ethical impact is more important to me than prestige or maximum compensation.",
                    questionType: QuestionType.LIKERT,
                    displayOrder: 1,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Strongly Disagree", displayOrder: 1 },
                        { optionText: "Disagree", displayOrder: 2 },
                        { optionText: "Neutral", displayOrder: 3 },
                        { optionText: "Agree", displayOrder: 4 },
                        { optionText: "Strongly Agree", displayOrder: 5 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "Which outcome provides you with the deepest sense of professional fulfillment?",
                    questionType: QuestionType.SINGLE_CHOICE,
                    displayOrder: 2,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Inventing an innovative zero-to-one product or theory", displayOrder: 1 },
                        { optionText: "Mastering deep technical craft and precision", displayOrder: 2 },
                        { optionText: "Leading, inspiring, and empowering a high-performing team", displayOrder: 3 },
                        { optionText: "Driving commercial scale, growth, and global footprint", displayOrder: 4 },
                      ],
                    },
                  },
                  {
                    version: 1,
                    questionText:
                      "I thrive in environments where I have high autonomy and minimal direct oversight.",
                    questionType: QuestionType.LIKERT,
                    displayOrder: 3,
                    required: true,
                    options: {
                      create: [
                        { optionText: "Strongly Disagree", displayOrder: 1 },
                        { optionText: "Disagree", displayOrder: 2 },
                        { optionText: "Neutral", displayOrder: 3 },
                        { optionText: "Agree", displayOrder: 4 },
                        { optionText: "Strongly Agree", displayOrder: 5 },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
    console.log("✓ Created Sample Assessment (v1) with 3 sections and 10 questions.");
  } else {
    console.log("✓ Sample Assessment already exists.");
  }

  return {
    student,
    staff,
    admin,
    assessment,
  };
}

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

