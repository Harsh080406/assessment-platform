import type { Metadata } from "next";
import QuestsClient from "@/components/marketing/QuestsClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Interactive Quests & Experiential Challenges | Alderwood Vantage",
  description:
    "Engage in scenario-based quests and real-world leadership challenges designed to uncover natural decision-making, strategic problem solving, and innate aptitude.",
  alternates: {
    canonical: "/quests",
  },
  openGraph: {
    title: `Interactive Quests & Experiential Challenges | ${SITE_NAME}`,
    description:
      "Engage in scenario-based quests and real-world leadership challenges designed to uncover natural decision-making, strategic problem solving, and innate aptitude.",
    url: "/quests",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
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
    images: ["/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png"],
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
