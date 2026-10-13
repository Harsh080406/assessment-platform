-- Migration: 20260928_question_bank_integration
-- Purpose: Extend Question/QuestionOption/AssessmentSection models for the 126-question bank integration

-- 1. Create new QuestionType enum with the 5 real assessment mechanics
CREATE TYPE "QuestionType_new" AS ENUM (
  'LIKERT_5',
  'RATING_5',
  'FORCED_RANKING',
  'SJT_DUAL_SELECT',
  'MCQ_SINGLE_CORRECT'
);

-- 2. Migrate existing Question.questionType column to use the new enum type
ALTER TABLE "Question"
  ALTER COLUMN "questionType" TYPE "QuestionType_new"
  USING (
    CASE "questionType"::text
      WHEN 'LIKERT' THEN 'LIKERT_5'::"QuestionType_new"
      WHEN 'SINGLE_CHOICE' THEN 'MCQ_SINGLE_CORRECT'::"QuestionType_new"
      WHEN 'MULTI_CHOICE' THEN 'MCQ_SINGLE_CORRECT'::"QuestionType_new"
      WHEN 'RANKING' THEN 'FORCED_RANKING'::"QuestionType_new"
      ELSE 'MCQ_SINGLE_CORRECT'::"QuestionType_new"
    END
  );

-- 3. Drop legacy enum and rename new enum to QuestionType
DROP TYPE "QuestionType";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";

-- 4. Add metadata and staff-reference scoring keys to Question
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'General';
ALTER TABLE "Question" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "reverseKeyed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "correctOptionId" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "mostEffectiveOptionId" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "leastEffectiveOptionId" TEXT;

-- 5. Add subCategory to AssessmentSection
ALTER TABLE "AssessmentSection" ADD COLUMN IF NOT EXISTS "subCategory" TEXT;
