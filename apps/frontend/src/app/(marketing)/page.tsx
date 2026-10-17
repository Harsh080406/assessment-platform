import type { Metadata } from "next";
import HomeClient from "@/components/marketing/HomeClient";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Raising Leaders, Not Just Employees`,
      },
    ],
  },
};

const HOME_FAQS = [
  {
    question: "How is Alderwood Vantage different from standard career tests?",
    answer:
      "Most career tests are 10-minute quizzes that produce generic, robotic results. Alderwood Vantage takes students from self-discovery to leadership: a validated assessment across four dimensions (Spark, Wiring, Horsepower, Edge), expert counselling, mentorship, and a 5-year pathway that helps every student become the leader, innovator and builder they can be.",
  },
  {
    question: "Who designed and validated the assessment framework?",
    answer:
      "The framework was developed by senior corporate leadership and HR professionals who have spent entire careers hiring and developing leaders in global enterprises. It is led by DDI Master Facilitators and EPSHRM alumni from IIM Calcutta, and validated in partnership with PhD-qualified academicians.",
  },
  {
    question: "Why is parental consent taken up front?",
    answer:
      "Teenagers are still growing, and student cognitive and behavioral data is sensitive. Parental consent is taken up front because we handle student information with utmost care. Data is strictly confidential and never shared or sold to coaching centers.",
  },
  {
    question: "What is the Leadership Blueprint deliverable?",
    answer:
      "The Leadership Blueprint is a clear, jargon-free report covering the Leader's Lens (how the student shows up today as a leader and innovator), Pathway Fit (suitability across Building a Venture, Leading the Family Business, a Professional Career, or Hybrid), and the Gap-to-Ready Meter.",
  },
  {
    question: "What packages do you offer and what is the 5-Year Leadership Roadmap?",
    answer:
      "We offer three packages: Discover (Assessment + Leadership Blueprint), Decode (Assessment + Blueprint + 2 one-on-one counselling sessions), and Design (Assessment + Blueprint + Counselling + 5-Year Leadership Roadmap detailing skills to build, real-world projects, mentorship, and yearly milestones).",
  },
];

export default function HomePage() {
  return (
    <>
      <FaqJsonLd items={HOME_FAQS} />
      <HomeClient />
    </>
  );
}
