export type ProfileCheckResult = {
  isComplete: boolean;
  missingFields: string[];
  completedCount: number;
  totalRequired: number;
  percentage: number;
};

export interface StudentProfileLike {
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | string | null;
  country?: string | null;
  school?: string | null;
  grade?: string | null;
  educationLevel?: string | null;
  bio?: string | null;
  phone?: string | null;
}

/**
 * Validates whether a candidate's student profile has all mandatory attributes
 * required by certified psychologists to conduct evaluation and publish career dossiers.
 * 
 * Enforces:
 * - Basic demographic and school details.
 * - If Class 11 or 12 is chosen, academic stream must be provided.
 * - If Undergraduate (UG 1/2/3/4) is chosen, degree/course must be provided.
 */
export function checkStudentProfileCompletion(
  profile: StudentProfileLike | null | undefined,
  userPhone?: string | null
): ProfileCheckResult {
  const missingFields: string[] = [];

  const gradeStr = profile?.grade?.trim() || "";
  const is11or12 = gradeStr.startsWith("Class 11") || gradeStr.startsWith("Class 12");
  const isUG =
    gradeStr.toLowerCase().includes("undergraduate") ||
    gradeStr.toLowerCase().startsWith("ug");

  let isGradeValid = Boolean(gradeStr);
  let gradeLabel = "Class / Grade";

  if (is11or12) {
    const parts = gradeStr.split(/[•\-]/);
    const hasStream = parts.length > 1 && Boolean(parts[1]?.trim());
    if (!hasStream) {
      isGradeValid = false;
      gradeLabel = "Class 11/12 Academic Stream";
    }
  } else if (isUG) {
    const parts = gradeStr.split(/[•\-]/);
    const hasCourse = parts.length > 1 && Boolean(parts[1]?.trim());
    if (!hasCourse) {
      isGradeValid = false;
      gradeLabel = "Undergraduate Degree / Course";
    }
  }

  const required = [
    { key: "firstName", label: "First Name", valid: Boolean(profile?.firstName?.trim()) },
    { key: "lastName", label: "Last Name", valid: Boolean(profile?.lastName?.trim()) },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      valid: Boolean(profile?.dateOfBirth && !isNaN(new Date(profile.dateOfBirth).getTime())),
    },
    { key: "country", label: "Country / Location", valid: Boolean(profile?.country?.trim()) },
    { key: "school", label: "School / Institution", valid: Boolean(profile?.school?.trim()) },
    { key: "grade", label: gradeLabel, valid: isGradeValid },
    { key: "educationLevel", label: "Education Level", valid: Boolean(profile?.educationLevel?.trim()) },
    { key: "bio", label: "Target Career Aspirations", valid: Boolean(profile?.bio?.trim()) },
    { key: "phone", label: "Phone Number", valid: Boolean(profile?.phone?.trim() || userPhone?.trim()) },
  ];

  let completedCount = 0;
  for (const item of required) {
    if (item.valid) {
      completedCount++;
    } else {
      missingFields.push(item.label);
    }
  }

  const totalRequired = required.length;
  const percentage = Math.round((completedCount / totalRequired) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completedCount,
    totalRequired,
    percentage,
  };
}
