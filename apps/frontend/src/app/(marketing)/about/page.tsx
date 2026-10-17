import type { Metadata } from "next";
import AboutClient from "@/components/marketing/AboutClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us | Alderwood Vantage Mission & Pedagogy",
  description:
    "Discover Alderwood Vantage: our mission to raise leaders, our scientifically validated 4-module methodology, and senior enterprise practitioners guiding students.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Discover Alderwood Vantage: our mission to raise leaders, our scientifically validated 4-module methodology, and senior enterprise practitioners guiding students.",
    url: "/about",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `About ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_NAME}`,
    description:
      "Discover Alderwood Vantage: our mission to raise leaders, our scientifically validated 4-module methodology, and senior enterprise practitioners guiding students.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "About Us", item: "/about" },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <AboutClient />
    </>
  );
}
