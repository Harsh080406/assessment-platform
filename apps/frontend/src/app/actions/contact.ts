"use server";

export interface StudentQueryInput {
  name: string;
  email: string;
  phone?: string;
  stage: string;
  subject: string;
  message: string;
}

export interface InstitutionalQueryInput {
  institutionName: string;
  representativeName: string;
  designation: string;
  workEmail: string;
  phone: string;
  institutionType: string;
  cohortSize: string;
  partnershipObjective: string;
  message: string;
}

export async function submitStudentQueryAction(input: StudentQueryInput) {
  try {
    if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) {
      return { success: false, error: "Please fill in all required fields (Name, Email, and Message)." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const referenceId = `STU-${Date.now().toString(36).toUpperCase()}`;

    console.log(`[CONTACT QUERY: STUDENT] Reference: ${referenceId}`, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      stage: input.stage,
      subject: input.subject,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      referenceId,
      message: "Your inquiry has been received! Our academic guidance desk will respond within 4 business hours.",
    };
  } catch (error) {
    console.error("Failed to submit student query:", error);
    return { success: false, error: "An unexpected error occurred. Please try again or email us directly at support@alderwoodvantage.com." };
  }
}

export async function submitInstitutionalQueryAction(input: InstitutionalQueryInput) {
  try {
    if (
      !input.institutionName?.trim() ||
      !input.representativeName?.trim() ||
      !input.workEmail?.trim() ||
      !input.phone?.trim()
    ) {
      return {
        success: false,
        error: "Please fill in all required fields (Institution Name, Representative, Official Email, and Phone).",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.workEmail)) {
      return { success: false, error: "Please provide a valid official work email address." };
    }

    const referenceId = `INST-${Date.now().toString(36).toUpperCase()}`;

    console.log(`[CONTACT QUERY: INSTITUTIONAL] Reference: ${referenceId}`, {
      institution: input.institutionName,
      representative: input.representativeName,
      designation: input.designation,
      workEmail: input.workEmail,
      phone: input.phone,
      cohortSize: input.cohortSize,
      partnershipObjective: input.partnershipObjective,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      referenceId,
      message: "Institutional inquiry registered! Our Institutional Partnerships Director will connect with you with a customized partnership docket.",
    };
  } catch (error) {
    console.error("Failed to submit institutional query:", error);
    return { success: false, error: "An unexpected error occurred. Please try again or email us directly at partnerships@alderwoodvantage.com." };
  }
}
