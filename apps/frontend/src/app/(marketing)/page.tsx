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
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: ["/alderwood-og.png"],
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
    question: "What outcomes do students and parents walk away with?",
    answer:
      "You receive the comprehensive 24-page Leadership Blueprint, pinpoint career fitment matrices, a personalized 5-Year Leadership Roadmap, and a scheduled 1-on-1 strategic counselling session with senior enterprise facilitators.",
  },
  {
    question: "Is Alderwood Vantage suitable for all students from Class 8 to college?",
    answer:
      "Yes. Our adaptive test tracks calibrate difficulty, situational dilemmas, and academic choices dynamically based on whether the student is in Class 8–10 (stream selection), Class 11–12 (undergraduate major & college targeting), or University (career launchpad & pivot strategy).",
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
