import type { Metadata } from "next";
import PackagesClient from "@/components/marketing/PackagesClient";
import { BreadcrumbJsonLd, CourseProgramJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Assessment Packages & Programs | ${SITE_NAME}`,
  description:
    "Compare our comprehensive student assessment programs, diagnostic reporting tiers, and 1-on-1 career counselling sessions.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: `Assessment Packages & Programs | ${SITE_NAME}`,
    description:
      "Compare our comprehensive student assessment programs, diagnostic reporting tiers, and 1-on-1 career counselling sessions.",
    url: "/packages",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `Packages & Programs - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Assessment Packages & Programs | ${SITE_NAME}`,
    description:
      "Compare our comprehensive student assessment programs, diagnostic reporting tiers, and 1-on-1 career counselling sessions.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Packages & Programs", item: "/packages" },
];

export default function PackagesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <CourseProgramJsonLd
        name="Alderwood Vantage Leadership & Career Pathway Program"
        description="Comprehensive 4-module cognitive and psychometric evaluation across Spark, Wiring, Horsepower, and Edge, coupled with 1-on-1 expert debrief and a 5-year developmental roadmap."
        url="/packages"
      />
      <PackagesClient />
    </>
  );
}
