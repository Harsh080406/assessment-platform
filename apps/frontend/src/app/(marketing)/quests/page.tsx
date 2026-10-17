import type { Metadata } from "next";
import QuestsClient from "@/components/marketing/QuestsClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Interactive Quests | Real-World Student Challenges",
  description:
    "Engage in scenario-based leadership quests and decision dilemmas designed to reveal innate problem-solving and cognitive instincts without test stress.",
  alternates: {
    canonical: "/quests",
  },
  openGraph: {
    title: `Interactive Quests | ${SITE_NAME}`,
    description:
      "Engage in scenario-based leadership quests and decision dilemmas designed to reveal innate problem-solving and cognitive instincts without test stress.",
    url: "/quests",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `Quests & Challenges - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Interactive Quests | ${SITE_NAME}`,
    description:
      "Engage in scenario-based quests designed to uncover natural problem solving and leadership instincts.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Quests", item: "/quests" },
];

export default function QuestsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <QuestsClient />
    </>
  );
}
