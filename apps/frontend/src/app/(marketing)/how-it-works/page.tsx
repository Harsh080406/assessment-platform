import type { Metadata } from "next";
import HowItWorksClient from "@/components/marketing/HowItWorksClient";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `How It Works | The ${SITE_NAME} Assessment Methodology`,
  description:
    "Learn how our 4-module evaluation, practitioner debrief, and customized 5-year leadership roadmap provide definitive career clarity.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: `How It Works | The ${SITE_NAME} Assessment Methodology`,
    description:
      "Learn how our 4-module evaluation, practitioner debrief, and customized 5-year leadership roadmap provide definitive career clarity.",
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
    title: `How It Works | The ${SITE_NAME} Assessment Methodology`,
    description:
      "Learn how our 4-module evaluation, practitioner debrief, and customized 5-year leadership roadmap provide definitive career clarity.",
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
      "The assessment is divided into 4 bite-sized modules and takes approximately 45–60 minutes in total. Students can complete it in one sitting or pause between modules at their own pace.",
  },
  {
    question: "Who conducts the 1-on-1 counselling session?",
    answer:
      "All counselling sessions are conducted by certified corporate leadership practitioners (DDI Master Facilitators and EPSHRM alumni from IIM Calcutta). Parents are strongly encouraged to attend alongside the student.",
  },
  {
    question: "What makes the 5-Year Leadership Roadmap actionable?",
    answer:
      "Rather than abstract suggestions, the roadmap outlines year-by-year recommended milestones, extracurricular portfolio builds, skill acquisitions, target degree pathways, and internship frontiers aligned with the student's unique archetype.",
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
