export class ReportsService {
  public static generateSampleParentReport() {
    return {
      reportId: `REP_${Date.now()}`,
      version: "2026.4 Enterprise Edition",
      candidate: {
        name: "Aarav Mehta",
        academicMilestone: "Class 11 CBSE",
        stream: "Science with Economics",
      },
      validityRating: "93.4% Standardized Psychometric Reliability",
      primaryArchetype: {
        name: "The Creative Strategist",
        code: "#04",
        traits: [
          "Divergent Cognitive Ideation (95th percentile)",
          "Complex Scenario Resolution (88th percentile)",
          "Cross-Disciplinary Technological Synthesis (84th percentile)",
        ],
      },
      familyDiscussionPrompts: [
        "Which projects this semester felt effortless rather than forced?",
        "How do you feel about double-major or design-engineering programs?",
        "What real-world problem would you dedicate a summer exploring?",
      ],
      recommendedDegrees: [
        "B.Des in Interaction Design & Human-Computer Interaction",
        "B.Tech in Computer Science + Minor in Visual Media",
        "B.Sc in Behavioral Economics & Data Systems",
      ],
      counselorSeal: "Certified under Global Psychometric Association Standards (ISO/IEC 17024)",
    };
  }
}
