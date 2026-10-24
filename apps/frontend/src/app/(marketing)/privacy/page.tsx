import type { Metadata } from "next";
import PrivacyClient from "@/components/marketing/PrivacyClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy & Parental Consent Charter | Alderwood Vantage",
  description:
    "Review Alderwood Vantage's Privacy Policy, upfront parental consent protocols for minors, student data confidentiality charter, and DPDP / GDPR compliance frameworks.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `Privacy Policy & Parental Consent Charter | ${SITE_NAME}`,
    description:
      "Review Alderwood Vantage's Privacy Policy, upfront parental consent protocols for minors, and strict zero-monetization student data confidentiality charter.",
    url: "/privacy",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `Privacy Policy & Parental Consent Charter - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy & Parental Consent Charter | ${SITE_NAME}`,
    description:
      "Review Alderwood Vantage's Privacy Policy, upfront parental consent protocols for minors, and strict student data confidentiality charter.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Privacy & Parental Consent", item: "/privacy" },
];

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <PrivacyClient />
    </>
  );
}
