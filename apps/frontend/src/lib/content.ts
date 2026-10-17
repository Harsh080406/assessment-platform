import { prisma } from "@/lib/prisma";

export interface DefaultContentItem {
  key: string;
  title: string;
  body: string;
}

export const DEFAULT_CONTENT_BLOCKS: Record<string, DefaultContentItem> = {
  hero_headline: {
    key: "hero_headline",
    title: "Hero Headline",
    body: "NOT ANOTHER TEST. A CLARITY ENGINE.",
  },
  hero_subheadline: {
    key: "hero_subheadline",
    title: "Hero Sub-headline",
    body: "Legacy tests ask if you like math or office desks. Alderwood Vantage calibrates your natural problem-solving instinct against 2026+ career frontiers.",
  },
  faq_list: {
    key: "faq_list",
    title: "Frequently Asked Questions",
    body: JSON.stringify(
      [
        {
          q: "How is Alderwood Vantage different from standard career tests?",
          a: "Most career tests are 10-minute quizzes that produce generic, robotic results. Alderwood Vantage takes students from self-discovery to leadership: a validated assessment across four dimensions (Spark, Wiring, Horsepower, Edge), expert counselling, mentorship, and a 5-year pathway that helps every student become the leader, innovator and builder they can be.",
        },
        {
          q: "Who designed and validated the assessment framework?",
          a: "The framework was developed by senior corporate leadership and HR professionals who have spent entire careers hiring and developing leaders in global enterprises. It is led by DDI Master Facilitators and EPSHRM alumni from IIM Calcutta, and validated in partnership with PhD-qualified academicians.",
        },
        {
          q: "Why is parental consent taken up front?",
          a: "Teenagers are still growing, and student cognitive and behavioral data is sensitive. Parental consent is taken up front because we handle student information with utmost care. Data is strictly confidential and never shared or sold to coaching centers.",
        },
        {
          q: "What is the Leadership Blueprint deliverable?",
          a: "The Leadership Blueprint is a clear, jargon-free report covering the Leader's Lens (how the student shows up today as a leader and innovator), Pathway Fit (suitability across Building a Venture, Leading the Family Business, a Professional Career, or Hybrid), and the Gap-to-Ready Meter.",
        },
        {
          q: "What packages do you offer and what is the 5-Year Leadership Roadmap?",
          a: "We offer three packages: Discover (Assessment + Leadership Blueprint), Decode (Assessment + Blueprint + 2 one-on-one counselling sessions), and Design (Assessment + Blueprint + Counselling + 5-Year Leadership Roadmap detailing skills to build, real-world projects, mentorship, and yearly milestones).",
        },
      ],
      null,
      2
    ),
  },
  about_body: {
    key: "about_body",
    title: "About Alderwood Vantage Body",
    body: "From self-discovery to leadership: a validated assessment, expert counselling, mentorship and a 5-year pathway that helps every student become the leader, innovator and builder they can be. Alderwood Vantage gives students and families a clear, evidence-based view of leadership potential years before the stakes get high.",
  },
  contact_info: {
    key: "contact_info",
    title: "Official Contact Information",
    body: JSON.stringify(
      {
        email: "support@alderwoodvantage.com",
        phone: "+91 93168 19331",
        office: "100 Innovation Way, Suite 400, San Francisco, CA 94105",
        hours: "Monday - Friday, 9:00 AM - 6:00 PM PST",
      },
      null,
      2
    ),
  },
  privacy_policy: {
    key: "privacy_policy",
    title: "Privacy Policy",
    body: "Alderwood Vantage is committed to protecting student and candidate data. Response trajectories and personal information are stored in encrypted environments and are accessible only to licensed evaluators and authorized institution governors. We never sell student data or train external AI models on student responses.",
  },
  terms_conditions: {
    key: "terms_conditions",
    title: "Terms & Conditions",
    body: "By taking the Alderwood Vantage assessment, candidates and guardians agree that certified reports provide advisory guidance based on psychometric observation and do not constitute medical or psychological diagnosis. All evaluation materials are protected by intellectual property laws.",
  },
};

function sanitizeContent(text: string): string {
  return text.replace(/AuraPath|aurapath|AURAPATH/gi, "Alderwood Vantage");
}

export async function getContentBlock(key: string): Promise<DefaultContentItem> {
  try {
    const record = await prisma.contentBlock.findUnique({
      where: { key },
    });
    if (record) {
      return {
        key: record.key,
        title: sanitizeContent(record.title),
        body: sanitizeContent(record.body),
      };
    }
  } catch {
    // Return fallback during build or disconnected DB
  }
  return DEFAULT_CONTENT_BLOCKS[key] || { key, title: key, body: "" };
}

export async function getAllContentBlocks(): Promise<DefaultContentItem[]> {
  try {
    const records = await prisma.contentBlock.findMany();
    const map = new Map(
      records.map((r) => [
        r.key,
        { key: r.key, title: sanitizeContent(r.title), body: sanitizeContent(r.body) },
      ])
    );

    return Object.keys(DEFAULT_CONTENT_BLOCKS).map((k) => {
      return map.get(k) || DEFAULT_CONTENT_BLOCKS[k];
    });
  } catch {
    return Object.values(DEFAULT_CONTENT_BLOCKS);
  }
}
