import path from "path";
import fs from "fs";
import * as xlsx from "xlsx";

export interface ParsedOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface ParsedQuestionItem {
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

export interface QuestionBankSchema {
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

export function convertQuestionBank(excelPath: string, outputPath: string): QuestionBankSchema {
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Source Excel file not found at: ${excelPath}`);
  }

  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const questions: ParsedQuestionItem[] = [];

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const col0 = (row[0] || "").toString().trim();
    if (!col0 || col0.startsWith("MODULE") || col0.startsWith("FULL QUESTION")) {
      continue;
    }

    const itemCode = col0;
    const category = (row[2] || "").toString().trim();
    const questionText = (row[3] || "").toString().trim();
    const optA = (row[4] || "").toString().trim();
    const optB = (row[5] || "").toString().trim();
    const optC = (row[6] || "").toString().trim();
    const optD = (row[7] || "").toString().trim();
    const formatRaw = (row[8] || "").toString().trim();

    let sectionTitle = "";
    let subCategory: string | null = null;
    let questionType: ParsedQuestionItem["questionType"] = "LIKERT_5";
    let reverseKeyed = false;
    let correctKey: ParsedQuestionItem["correctKey"] = null;
    let mostEffectiveKey: ParsedQuestionItem["mostEffectiveKey"] = null;
    let leastEffectiveKey: ParsedQuestionItem["leastEffectiveKey"] = null;

    if (itemCode.startsWith("Q")) {
      sectionTitle = "Psychometric Assessment";
      subCategory = "Personality";
      questionType = "LIKERT_5";
      reverseKeyed = formatRaw.toLowerCase().includes("reverse-keyed");
    } else if (itemCode.startsWith("I")) {
      sectionTitle = "Psychometric Assessment";
      subCategory = "Interests";
      questionType = "RATING_5";
    } else if (itemCode.startsWith("V") && !itemCode.startsWith("VR")) {
      sectionTitle = "Psychometric Assessment";
      subCategory = "Values";
      questionType = "FORCED_RANKING";
    } else if (itemCode.startsWith("Comp")) {
      sectionTitle = "Competency Self-Report";
      subCategory = null;
      questionType = "LIKERT_5";
    } else if (itemCode.startsWith("SJT")) {
      sectionTitle = "Situational Judgment Test";
      subCategory = null;
      questionType = "SJT_DUAL_SELECT";
      const mMatch = formatRaw.match(/Most Effective:\s*([A-D])/i);
      const lMatch = formatRaw.match(/Least Effective:\s*([A-D])/i);
      mostEffectiveKey = mMatch ? (mMatch[1].toUpperCase() as "A" | "B" | "C" | "D") : null;
      leastEffectiveKey = lMatch ? (lMatch[1].toUpperCase() as "A" | "B" | "C" | "D") : null;
    } else if (itemCode.startsWith("VR")) {
      sectionTitle = "Aptitude";
      subCategory = "Verbal";
      questionType = "MCQ_SINGLE_CORRECT";
      const cMatch = formatRaw.match(/Correct Answer:\s*([A-D])/i);
      correctKey = cMatch ? (cMatch[1].toUpperCase() as "A" | "B" | "C" | "D") : null;
    } else if (itemCode.startsWith("NR")) {
      sectionTitle = "Aptitude";
      subCategory = "Numerical";
      questionType = "MCQ_SINGLE_CORRECT";
      const cMatch = formatRaw.match(/Correct Answer:\s*([A-D])/i);
      correctKey = cMatch ? (cMatch[1].toUpperCase() as "A" | "B" | "C" | "D") : null;
    } else if (itemCode.startsWith("LR")) {
      sectionTitle = "Aptitude";
      subCategory = "Logical";
      questionType = "MCQ_SINGLE_CORRECT";
      const cMatch = formatRaw.match(/Correct Answer:\s*([A-D])/i);
      correctKey = cMatch ? (cMatch[1].toUpperCase() as "A" | "B" | "C" | "D") : null;
    }

    const options: ParsedOption[] = [];
    if (optA) options.push({ label: "A", text: optA });
    if (optB) options.push({ label: "B", text: optB });
    if (optC) options.push({ label: "C", text: optC });
    if (optD) options.push({ label: "D", text: optD });

    questions.push({
      itemCode,
      sectionTitle,
      subCategory,
      category,
      questionText,
      questionType,
      reverseKeyed,
      options,
      correctKey,
      mostEffectiveKey,
      leastEffectiveKey,
    });
  }

  const sections = [
    {
      title: "Psychometric Assessment",
      description: "Evaluates Big Five personality traits, Holland RIASEC vocational interests, and core work values.",
      subCategory: null,
      displayOrder: 1,
      expectedCount: 42,
    },
    {
      title: "Competency Self-Report",
      description: "Self-report evaluation across 16 foundational professional and cognitive competencies.",
      subCategory: null,
      displayOrder: 2,
      expectedCount: 16,
    },
    {
      title: "Situational Judgment Test",
      description: "Real-world dilemma scenarios measuring judgment, decision quality, and collaborative instincts.",
      subCategory: null,
      displayOrder: 3,
      expectedCount: 38,
    },
    {
      title: "Aptitude",
      description: "Objective evaluation of Verbal Reasoning, Numerical Reasoning, and Logical Reasoning.",
      subCategory: null,
      displayOrder: 4,
      expectedCount: 30,
    },
  ];

  const questionBank: QuestionBankSchema = {
    version: 1,
    title: "AuraPath Comprehensive Cognitive & Competency Assessment",
    description: "Multi-dimensional psychometric, competency, situational judgment, and aptitude diagnostic battery.",
    totalQuestions: questions.length,
    estimatedDurationMins: 45, // Recalculated for 126 items (~20s per Likert, ~45s per SJT/Aptitude)
    sections,
    questions,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(questionBank, null, 2), "utf-8");

  console.log(`✅ Successfully converted ${questions.length} questions.`);
  console.log(`📁 Emitted to: ${outputPath}`);

  return questionBank;
}

// Direct CLI execution
if (require.main === module) {
  const rootDir = path.resolve(__dirname, "../../..");
  const defaultExcel = path.join(rootDir, "apps/backend/seed-data/Competency_Questionnaire.xlsx");
  const fallbackExcel = path.join(rootDir, "docs/Competency Questionnaire.xlsx");
  const excelFile = fs.existsSync(defaultExcel) ? defaultExcel : fallbackExcel;
  const jsonOutput = path.join(rootDir, "packages/shared/seed-data/question-bank-v1.json");

  console.log(`Reading question bank from: ${excelFile}`);
  convertQuestionBank(excelFile, jsonOutput);
}
