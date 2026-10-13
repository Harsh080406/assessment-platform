/**
 * Assessment Serializers
 * 
 * Enforces strict separation between student-facing payloads and staff-facing payloads.
 * Per specification §4:
 * Scoring reference keys (reverseKeyed, correctOptionId, mostEffectiveOptionId, leastEffectiveOptionId)
 * MUST NEVER reach the student in any scenario, not even as null or undefined.
 */

export interface StudentQuestionOptionDTO {
  id: string;
  optionText: string;
  displayOrder: number;
}

export interface StudentQuestionDTO {
  id: string;
  sectionId: string;
  version: number;
  questionText: string;
  questionType: any;
  category: string;
  displayOrder: number;
  required: boolean;
  options: StudentQuestionOptionDTO[];
}

export interface StudentSectionDTO {
  id: string;
  assessmentId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  subCategory?: string | null;
  questions: StudentQuestionDTO[];
}

export interface StudentResponseDetailDTO {
  answer: any;
  answeredAt?: Date | string | null;
  questionVersion?: number;
}

export interface StaffQuestionDTO {
  id: string;
  sectionId: string;
  version: number;
  questionText: string;
  questionType: string;
  category: string;
  displayOrder: number;
  required: boolean;
  reverseKeyed: boolean;
  correctOptionId: string | null;
  mostEffectiveOptionId: string | null;
  leastEffectiveOptionId: string | null;
  options: StudentQuestionOptionDTO[];
  studentResponse: StudentResponseDetailDTO | null;
  studentAnswer: any;
  answeredAt?: string;
  sectionTitle: string;
  sectionDisplayOrder: number;
}

export interface StaffSectionDTO {
  id: string;
  assessmentId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  subCategory?: string | null;
  questions: StaffQuestionDTO[];
}

/**
 * Serializes a database Question model into a StudentQuestionDTO.
 * Explicitly whitelist-constructs the return object to guarantee
 * reverseKeyed, correctOptionId, mostEffectiveOptionId, and leastEffectiveOptionId
 * are never present in the payload.
 */
export function toStudentQuestionDTO(raw: any): StudentQuestionDTO {
  if (!raw) {
    throw new Error("Cannot serialize null or undefined question to StudentQuestionDTO");
  }

  const dto: StudentQuestionDTO = {
    id: String(raw.id),
    sectionId: raw.sectionId ? String(raw.sectionId) : "",
    version: typeof raw.version === "number" ? raw.version : 1,
    questionText: String(raw.questionText ?? ""),
    questionType: raw.questionType,
    category: String(raw.category ?? ""),
    displayOrder: typeof raw.displayOrder === "number" ? raw.displayOrder : 0,
    required: raw.required !== undefined ? Boolean(raw.required) : true,
    options: Array.isArray(raw.options)
      ? raw.options.map((opt: any) => ({
          id: String(opt.id),
          optionText: String(opt.optionText ?? ""),
          displayOrder: typeof opt.displayOrder === "number" ? opt.displayOrder : 0,
        }))
      : [],
  };

  return dto;
}

/**
 * Serializes an assessment section into a StudentSectionDTO.
 */
export function toStudentSectionDTO(raw: any): StudentSectionDTO {
  if (!raw) {
    throw new Error("Cannot serialize null or undefined section to StudentSectionDTO");
  }

  const dto: StudentSectionDTO = {
    id: String(raw.id),
    assessmentId: raw.assessmentId ? String(raw.assessmentId) : "",
    title: String(raw.title ?? ""),
    description: raw.description ?? null,
    displayOrder: typeof raw.displayOrder === "number" ? raw.displayOrder : 0,
    questions: Array.isArray(raw.questions)
      ? raw.questions.map(toStudentQuestionDTO)
      : [],
  };

  if (raw.subCategory) {
    dto.subCategory = String(raw.subCategory);
  }

  return dto;
}

/**
 * Serializes a database Question model into a StaffQuestionDTO for expert review.
 * Preserves all scoring reference keys and includes student response details.
 */
export function toStaffQuestionDTO(
  raw: any,
  response?: any,
  sectionTitle: string = "",
  sectionDisplayOrder: number = 0
): StaffQuestionDTO {
  if (!raw) {
    throw new Error("Cannot serialize null or undefined question to StaffQuestionDTO");
  }

  const studentResp: StudentResponseDetailDTO | null = response
    ? {
        answer: response.answer ?? null,
        answeredAt: response.answeredAt ?? null,
        questionVersion: typeof response.questionVersion === "number" ? response.questionVersion : raw.version,
      }
    : null;

  const answeredAtStr = studentResp?.answeredAt
    ? typeof studentResp.answeredAt === "string"
      ? studentResp.answeredAt
      : studentResp.answeredAt instanceof Date
      ? studentResp.answeredAt.toISOString()
      : String(studentResp.answeredAt)
    : undefined;

  return {
    id: String(raw.id),
    sectionId: raw.sectionId ? String(raw.sectionId) : "",
    version: typeof raw.version === "number" ? raw.version : 1,
    questionText: String(raw.questionText ?? ""),
    questionType: String(raw.questionType ?? ""),
    category: String(raw.category ?? ""),
    displayOrder: typeof raw.displayOrder === "number" ? raw.displayOrder : 0,
    required: raw.required !== undefined ? Boolean(raw.required) : true,
    reverseKeyed: Boolean(raw.reverseKeyed),
    correctOptionId: raw.correctOptionId ? String(raw.correctOptionId) : null,
    mostEffectiveOptionId: raw.mostEffectiveOptionId ? String(raw.mostEffectiveOptionId) : null,
    leastEffectiveOptionId: raw.leastEffectiveOptionId ? String(raw.leastEffectiveOptionId) : null,
    options: Array.isArray(raw.options)
      ? raw.options.map((opt: any) => ({
          id: String(opt.id),
          optionText: String(opt.optionText ?? ""),
          displayOrder: typeof opt.displayOrder === "number" ? opt.displayOrder : 0,
        }))
      : [],
    studentResponse: studentResp,
    studentAnswer: studentResp ? studentResp.answer : null,
    answeredAt: answeredAtStr,
    sectionTitle: sectionTitle || String(raw.sectionTitle ?? ""),
    sectionDisplayOrder: sectionDisplayOrder || (typeof raw.sectionDisplayOrder === "number" ? raw.sectionDisplayOrder : 0),
  };
}

/**
 * Serializes an assessment section into a StaffSectionDTO for expert review.
 */
export function toStaffSectionDTO(
  raw: any,
  responsesMap?: Map<string, any> | Record<string, any>
): StaffSectionDTO {
  if (!raw) {
    throw new Error("Cannot serialize null or undefined section to StaffSectionDTO");
  }

  const sectionTitle = String(raw.title ?? "");
  const sectionDisplayOrder = typeof raw.displayOrder === "number" ? raw.displayOrder : 0;

  const questions: StaffQuestionDTO[] = Array.isArray(raw.questions)
    ? raw.questions.map((q: any) => {
        let resp: any = null;
        if (responsesMap instanceof Map) {
          resp = responsesMap.get(q.id);
        } else if (responsesMap && typeof responsesMap === "object") {
          resp = responsesMap[q.id];
        }
        return toStaffQuestionDTO(q, resp, sectionTitle, sectionDisplayOrder);
      })
    : [];

  const dto: StaffSectionDTO = {
    id: String(raw.id),
    assessmentId: raw.assessmentId ? String(raw.assessmentId) : "",
    title: sectionTitle,
    description: raw.description ?? null,
    displayOrder: sectionDisplayOrder,
    questions,
  };

  if (raw.subCategory) {
    dto.subCategory = String(raw.subCategory);
  }

  return dto;
}
