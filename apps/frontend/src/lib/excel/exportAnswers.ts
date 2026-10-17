import * as XLSX from "xlsx";
import { QuestionType, AttemptStatus } from "@prisma/client";

interface QuestionOption {
  id: string;
  optionText: string;
  displayOrder: number;
}

interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  category?: string | null;
  displayOrder: number;
  version: number;
  required: boolean;
  reverseKeyed?: boolean | null;
  correctOptionId?: string | null;
  mostEffectiveOptionId?: string | null;
  leastEffectiveOptionId?: string | null;
  options: QuestionOption[];
}

interface AssessmentSection {
  id: string;
  title: string;
  description?: string | null;
  displayOrder: number;
  questions: AssessmentQuestion[];
}

interface StudentProfileData {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  school?: string | null;
  grade?: string | null;
  educationLevel?: string | null;
  country?: string | null;
  dateOfBirth?: Date | string | null;
  bio?: string | null;
}

export interface AttemptExportData {
  attempt: {
    id: string;
    userId: string;
    assessmentTitle: string;
    assessmentVersion: number;
    status: AttemptStatus;
    startedAt: Date;
    submittedAt?: Date | null;
  };
  student: {
    email: string;
    phone?: string | null;
    profile?: StudentProfileData | null;
  };
  sections: AssessmentSection[];
  responses: Array<{
    questionId: string;
    answer: any;
    answeredAt: Date;
  }>;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

/**
 * Extracts Option A, Option B, Option C, Option D, Option E text for any question type.
 */
function extractOptions(q: AssessmentQuestion): {
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  optE: string;
} {
  // If the question has explicit options in DB (MCQ, SJT)
  if (q.options && q.options.length > 0) {
    const sorted = [...q.options].sort((a, b) => a.displayOrder - b.displayOrder);
    return {
      optA: sorted[0]?.optionText || "-",
      optB: sorted[1]?.optionText || "-",
      optC: sorted[2]?.optionText || "-",
      optD: sorted[3]?.optionText || "-",
      optE: sorted[4]?.optionText || (sorted.length > 5 ? sorted.slice(4).map((o) => o.optionText).join(" | ") : "-"),
    };
  }

  const isInterests =
    q.questionType === QuestionType.RATING_5 ||
    [
      "realistic",
      "investigative",
      "artistic",
      "social",
      "enterprising",
      "conventional",
    ].includes((q.category || "").toLowerCase());

  // RIASEC Interests (Enjoyment Scale)
  if (isInterests) {
    return {
      optA: "1 - Would dislike it",
      optB: "2 - Dislike",
      optC: "3 - Neutral",
      optD: "4 - Enjoy",
      optE: "5 - Would love it",
    };
  }

  // Likert 5 scale (Agreement Scale)
  if (q.questionType === QuestionType.LIKERT_5 || q.questionType === QuestionType.RATING_5) {
    return {
      optA: "1 - Strongly Disagree",
      optB: "2 - Disagree",
      optC: "3 - Neutral",
      optD: "4 - Agree",
      optE: "5 - Strongly Agree",
    };
  }

  // Forced ranking (Work values priority hierarchy)
  if (q.questionType === QuestionType.FORCED_RANKING) {
    return {
      optA: "Rank 1 - 2 (Top Priority Driver)",
      optB: "Rank 3 - 4 (High Priority Value)",
      optC: "Rank 5 - 6 (Core Value)",
      optD: "Rank 7 - 8 (Secondary Value)",
      optE: "Rank 9 - 10 (Peripheral Need)",
    };
  }

  return {
    optA: "-",
    optB: "-",
    optC: "-",
    optD: "-",
    optE: "-",
  };
}

/**
 * Formats the candidate's answer into a human-readable string.
 */
function formatCandidateAnswer(q: AssessmentQuestion, ans: any): string {
  if (ans === undefined || ans === null || ans === "") {
    return "Not Answered";
  }

  // 1. LIKERT_5 or RATING_5
  if (q.questionType === QuestionType.LIKERT_5 || q.questionType === QuestionType.RATING_5) {
    const val = typeof ans === "number" ? ans : ans?.value;
    const num = typeof val === "number" ? val : parseInt(String(val), 10);

    const isInterests =
      q.questionType === QuestionType.RATING_5 ||
      [
        "realistic",
        "investigative",
        "artistic",
        "social",
        "enterprising",
        "conventional",
      ].includes((q.category || "").toLowerCase());

    if (isInterests) {
      const interestLabels: Record<number, string> = {
        1: "1 - Would dislike it",
        2: "2 - Dislike",
        3: "3 - Neutral",
        4: "4 - Enjoy",
        5: "5 - Would love it",
      };
      return interestLabels[num] || `Enjoyment ${num}/5`;
    }

    const likertLabels: Record<number, string> = {
      1: "1 - Strongly Disagree",
      2: "2 - Disagree",
      3: "3 - Neutral",
      4: "4 - Agree",
      5: "5 - Strongly Agree",
    };
    return likertLabels[num] || `Rating ${num}/5`;
  }

  // 2. FORCED_RANKING
  if (q.questionType === QuestionType.FORCED_RANKING) {
    const rank = typeof ans === "number" ? ans : ans?.rank;
    const numRank = typeof rank === "number" ? rank : parseInt(String(rank), 10);
    if (numRank === 1) return "Rank 1 (Top Priority Driver)";
    if (numRank <= 3) return `Rank ${numRank} (Core Priority)`;
    if (numRank <= 7) return `Rank ${numRank} (Secondary Value)`;
    return `Rank ${numRank} of 10`;
  }

  // 3. SJT_DUAL_SELECT
  if (q.questionType === QuestionType.SJT_DUAL_SELECT) {
    const selectedId =
      typeof ans === "string"
        ? ans
        : ans?.selected || ans?.selectedOptionId || ans?.mostEffective || ans?.id;

    const optIndex = q.options.findIndex((o) => o.id === selectedId);
    const chosenOpt = optIndex !== -1 ? q.options[optIndex] : null;
    const letter = optIndex !== -1 ? OPTION_LETTERS[optIndex] || String(optIndex + 1) : "";
    if (chosenOpt) {
      return `Option ${letter}: ${chosenOpt.optionText}`;
    }
    return String(selectedId || "None");
  }

  // 4. MCQ_SINGLE_CORRECT
  if (q.questionType === QuestionType.MCQ_SINGLE_CORRECT) {
    const selectedId = typeof ans === "string" ? ans : ans?.selected || ans?.id;
    const optIndex = q.options.findIndex((o) => o.id === selectedId);
    const chosenOpt = optIndex !== -1 ? q.options[optIndex] : null;
    const letter = optIndex !== -1 ? OPTION_LETTERS[optIndex] || String(optIndex + 1) : "";
    if (chosenOpt) {
      return `Option ${letter}: ${chosenOpt.optionText}`;
    }
    return String(selectedId || "None");
  }

  return typeof ans === "object" ? JSON.stringify(ans) : String(ans);
}

function sanitizeSheetName(name: string, fallback: string): string {
  const clean = name.replace(/[\\/?*[\]:]/g, " ").replace(/\s+/g, " ").trim();
  const truncated = clean.slice(0, 31).trim();
  return truncated || fallback;
}

export interface FormattedExcelRow {
  Questionnumber: number;
  Module: string;
  "Category / Competency": string;
  "Question / Scenario Text": string;
  "Option A": string;
  "Option B": string;
  "Option C": string;
  "Option D": string;
  "Option E": string;
  "Candidates answers": string;
}

/**
 * Generates an Excel workbook with the exact format:
 * Questionnumber, Module, Category / Competency, Question / Scenario Text, Option A, Option B, Option C, Option D, Option E, Candidates answers
 * Organized module-wise across individual tabs plus a consolidated Master tab.
 */
export function generateModuleWiseAnswersWorkbook(data: AttemptExportData): Buffer {
  const wb = XLSX.utils.book_new();

  const { attempt, student, sections, responses } = data;
  const profile = student.profile;
  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Candidate";

  // Index student responses by questionId
  const responseMap = new Map<string, any>();
  for (const resp of responses) {
    responseMap.set(resp.questionId, resp.answer);
  }

  const standardColumnWidths = [
    { wch: 15 }, // Questionnumber
    { wch: 28 }, // Module
    { wch: 25 }, // Category / Competency
    { wch: 60 }, // Question / Scenario Text
    { wch: 30 }, // Option A
    { wch: 30 }, // Option B
    { wch: 30 }, // Option C
    { wch: 30 }, // Option D
    { wch: 30 }, // Option E
    { wch: 38 }, // Candidates answers
  ];

  // =========================================================================
  // Master List (All Modules combined)
  // =========================================================================
  const allRows: FormattedExcelRow[] = [];
  let globalQNum = 0;

  sections.forEach((sec, sIdx) => {
    const moduleLabel = `Module ${sIdx + 1} - ${sec.title}`;

    sec.questions.forEach((q) => {
      globalQNum++;
      const rawAns = responseMap.get(q.id);
      const { optA, optB, optC, optD, optE } = extractOptions(q);
      const candidateAnswer = formatCandidateAnswer(q, rawAns);

      allRows.push({
        Questionnumber: globalQNum,
        Module: moduleLabel,
        "Category / Competency": q.category || "General",
        "Question / Scenario Text": q.questionText,
        "Option A": optA,
        "Option B": optB,
        "Option C": optC,
        "Option D": optD,
        "Option E": optE,
        "Candidates answers": candidateAnswer,
      });
    });
  });

  // Sheet 1: Master List of All Answers
  const wsMaster = XLSX.utils.json_to_sheet(allRows);
  wsMaster["!cols"] = standardColumnWidths;
  XLSX.utils.book_append_sheet(wb, wsMaster, "All Modules Master");

  // =========================================================================
  // Individual Module-Wise Sheets (Module 1, Module 2, Module 3, Module 4...)
  // =========================================================================
  sections.forEach((sec, sIdx) => {
    const moduleNumber = sIdx + 1;
    const moduleLabel = `Module ${moduleNumber} - ${sec.title}`;
    const safeSheetTitle = sanitizeSheetName(
      `Module ${moduleNumber} - ${sec.title}`,
      `Module ${moduleNumber}`
    );

    const moduleRows: FormattedExcelRow[] = sec.questions.map((q, qIdx) => {
      const rawAns = responseMap.get(q.id);
      const { optA, optB, optC, optD, optE } = extractOptions(q);
      const candidateAnswer = formatCandidateAnswer(q, rawAns);

      return {
        Questionnumber: qIdx + 1,
        Module: moduleLabel,
        "Category / Competency": q.category || "General",
        "Question / Scenario Text": q.questionText,
        "Option A": optA,
        "Option B": optB,
        "Option C": optC,
        "Option D": optD,
        "Option E": optE,
        "Candidates answers": candidateAnswer,
      };
    });

    const wsModule = XLSX.utils.json_to_sheet(moduleRows);
    wsModule["!cols"] = standardColumnWidths;
    XLSX.utils.book_append_sheet(wb, wsModule, safeSheetTitle);
  });

  // =========================================================================
  // Candidate Profile & Attempt Summary Sheet
  // =========================================================================
  const summaryRows = [
    { Attribute: "Candidate Name", Value: fullName },
    { Attribute: "Registered Email", Value: student.email },
    { Attribute: "Phone Number", Value: profile?.phone || student.phone || "Not specified" },
    { Attribute: "Current Class / Grade", Value: profile?.grade || "Not specified" },
    { Attribute: "Education Stage", Value: profile?.educationLevel || "Not specified" },
    { Attribute: "School / Institution", Value: profile?.school || "Not specified" },
    { Attribute: "Country / Location", Value: profile?.country || "India" },
    {
      Attribute: "Date of Birth",
      Value: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : "Not specified",
    },
    { Attribute: "Target Career Aspirations", Value: profile?.bio || "Not specified" },
    { Attribute: "Assessment Title", Value: attempt.assessmentTitle },
    { Attribute: "Assessment Version", Value: `v${attempt.assessmentVersion}` },
    { Attribute: "Attempt ID", Value: attempt.id },
    { Attribute: "Attempt Status", Value: attempt.status },
    {
      Attribute: "Started At",
      Value: attempt.startedAt ? new Date(attempt.startedAt).toLocaleString("en-US") : "N/A",
    },
    {
      Attribute: "Submitted At",
      Value: attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString("en-US") : "N/A",
    },
    { Attribute: "Total Evaluation Modules", Value: sections.length },
    { Attribute: "Total Questions Count", Value: allRows.length },
    { Attribute: "Total Answered Count", Value: responseMap.size },
    {
      Attribute: "Completion Rate",
      Value:
        allRows.length > 0
          ? `${Math.round((responseMap.size / allRows.length) * 100)}%`
          : "100%",
    },
    { Attribute: "Export Generated At", Value: new Date().toISOString() },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Student Profile");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}
