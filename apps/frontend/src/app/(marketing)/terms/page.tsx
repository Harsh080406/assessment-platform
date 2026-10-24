import type { Metadata } from "next";
import TermsClient from "@/components/marketing/TermsClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service & Assessment Governance | Alderwood Vantage",
  description:
    "Read the terms and conditions governing Alderwood Vantage assessment services, user responsibilities, psychometric advisory boundaries, intellectual property, and service deliverables.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `Terms of Service & Assessment Governance | ${SITE_NAME}`,
    description:
      "Review the Terms of Service governing Alderwood Vantage psychometric evaluations, Leadership Blueprints, and 1-on-1 strategic counselling.",
    url: "/terms",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `Terms of Service - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms of Service & Assessment Governance | ${SITE_NAME}`,
    description:
      "Review the Terms of Service governing Alderwood Vantage psychometric evaluations, Leadership Blueprints, and strategic counselling.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Terms of Service", item: "/terms" },
];

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <TermsClient />
    </>
  );
}
