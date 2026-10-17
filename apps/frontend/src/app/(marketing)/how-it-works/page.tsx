import type { Metadata } from "next";
import HowItWorksClient from "@/components/marketing/HowItWorksClient";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How It Works | 5-Step Student Leadership Pathway",
  description:
    "From 4-module cognitive assessment to 1-on-1 expert debrief and a 5-year leadership roadmap. See how Alderwood Vantage unlocks student career clarity.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: `How It Works | ${SITE_NAME}`,
    description:
      "From 4-module cognitive assessment to 1-on-1 expert debrief and a 5-year leadership roadmap. See how Alderwood Vantage unlocks student career clarity.",
    url: "/how-it-works",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `How It Works - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `How It Works | ${SITE_NAME}`,
    description:
      "From 4-module cognitive assessment to 1-on-1 expert debrief and a 5-year leadership roadmap.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "How It Works", item: "/how-it-works" },
];

const PROCESS_FAQS = [
  {
    question: "What are the 5 steps in the Alderwood Vantage journey?",
    answer:
      "The 5 steps are: (1) Registration and Profile Setup with upfront parental consent, (2) Self-paced 4-module assessment, (3) AI + Expert Synthesis of cognitive & behavioural traits, (4) In-depth 1-on-1 counselling debrief with senior practitioners, and (5) A 5-year actionable leadership roadmap.",
  },
  {
    question: "How long does the assessment take to complete?",
    answer:
      "The assessment is broken into four distinct modules and is completely self-paced. Most students finish each module in 20-30 minutes, and work is auto-saved so students can pause and resume across any device.",
  },
  {
    question: "Does the student need to prepare or study beforehand?",
    answer:
      "No preparation, formulas, or studying is required. The assessment evaluates natural problem solving, intrinsic drivers, cognitive wiring, and decision dilemmas rather than memorized academic facts.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqJsonLd items={PROCESS_FAQS} />
      <HowItWorksClient />
    </>
  );
}
