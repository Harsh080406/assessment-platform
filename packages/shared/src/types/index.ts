export type UserRole = "STUDENT" | "PARENT" | "COUNSELOR" | "SCHOOL_ADMIN";

export type EducationStage = "CLASS_8_10" | "CLASS_11_12" | "COLLEGE_UNDERGRAD" | "EARLY_GRAD";

export interface CognitiveDimensions {
  creative: number;   // Divergent Thinking & Aesthetic Intuition
  systems: number;    // Algorithmic & Structural Logic
  empathy: number;    // Interpersonal Resonance & Emotional Diagnosis
  venture: number;    // Commercial Scale & Strategic Momentum
}

export interface StudentArchetype {
  id: string;
  code: string;       // e.g. "#04", "#07"
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  radarPoints: string;
  dominantTraits: string[];
  recommendedCareers: string[];
  secondaryArchetype?: string;
  compatibilityScore: number;
}

export interface QuestionChoice {
  key: "A" | "B" | "C" | "D";
  emoji: string;
  text: string;
  detail: string;
  dimensionWeights: CognitiveDimensions;
}

export interface AssessmentQuestion {
  id: number;
  stage: EducationStage;
  section: string;
  scenario: string;
  context: string;
  choices: QuestionChoice[];
}

export interface CareerPath {
  id: string;
  title: string;
  stream: "Technology" | "Design" | "Healthcare" | "Venture" | "CleanTech" | "Law" | "Media";
  growthRate: string;
  salaryHorizon: {
    entry: number;
    median: number;
    senior: number;
    currency: string;
  };
  degreePrograms: string[];
  prerequisiteSkills: string[];
  cognitiveFitProfile: CognitiveDimensions;
  readinessRoadmap: string[];
}

export interface AssessmentSubmission {
  userId?: string;
  stage: EducationStage;
  responses: Record<number, "A" | "B" | "C" | "D">;
  timeSpentSeconds: number;
}

export interface AssessmentResult {
  submissionId: string;
  timestamp: string;
  stage: EducationStage;
  scores: CognitiveDimensions;
  primaryArchetype: StudentArchetype;
  recommendedCareers: CareerPath[];
  parentReportEligible: boolean;
}

export interface ParentReport {
  reportId: string;
  candidateName: string;
  stage: EducationStage;
  primaryArchetype: StudentArchetype;
  scores: CognitiveDimensions;
  validityScore: number;
  familyDiscussionPrompts: string[];
  recommendedDegreePathways: string[];
  counselorNotes: string;
}
