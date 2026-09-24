export type UserRole = "STUDENT" | "STAFF" | "ADMIN" | "PARENT" | "COUNSELOR" | "SCHOOL_ADMIN";

export type AttemptStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REPORT_IN_PREP"
  | "PENDING_APPROVAL"
  | "PUBLISHED";

export type ReportStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED";

export interface StaffDashboardStats {
  submitted: number;
  underReview: number;
  reportInPrep: number;
  pendingApproval: number;
  published: number;
  total: number;
}

export interface StaffSubmissionSummary {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  school?: string | null;
  grade?: string | null;
  assessmentTitle: string;
  assessmentVersion: number;
  startedAt: string;
  submittedAt: string | null;
  status: AttemptStatus;
  reportsCount: number;
  latestReportStatus?: ReportStatus | null;
  latestReportId?: string | null;
}

export interface VersionedQuestionDetail {
  id: string;
  questionText: string;
  questionType: string;
  version: number;
  displayOrder: number;
  required: boolean;
  sectionTitle: string;
  sectionDisplayOrder: number;
  options: { id: string; optionText: string; displayOrder: number }[];
  studentAnswer: any;
  answeredAt?: string;
}

export interface StaffSubmissionDetail {
  attempt: {
    id: string;
    userId: string;
    assessmentId: string;
    assessmentTitle: string;
    assessmentVersion: number;
    status: AttemptStatus;
    startedAt: string;
    submittedAt: string | null;
  };
  student: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    school?: string | null;
    grade?: string | null;
    country?: string | null;
    educationLevel?: string | null;
  };
  sections: {
    id: string;
    title: string;
    description?: string | null;
    questions: VersionedQuestionDetail[];
  }[];
  reports: {
    id: string;
    version: number;
    status: ReportStatus;
    fileReference: string;
    uploadedBy: string;
    uploadedAt: string;
    approvedBy?: string | null;
    publishedAt?: string | null;
  }[];
}

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
