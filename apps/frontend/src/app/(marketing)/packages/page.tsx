import type { Metadata } from "next";
import PackagesClient from "@/components/marketing/PackagesClient";
import { BreadcrumbJsonLd, CourseProgramJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Packages & Modules | Spark, Wiring, Horsepower, Edge",
  description:
    "Explore our 4 assessment dimensions and choose the Discover, Decode, or Design leadership package tailored for high school and university students.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: `Packages & Modules | ${SITE_NAME}`,
    description:
      "Explore our 4 assessment dimensions and choose the Discover, Decode, or Design leadership package tailored for high school and university students.",
    url: "/packages",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `Packages & Modules - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Packages & Modules | ${SITE_NAME}`,
    description:
      "Explore our 4 assessment dimensions and choose the Discover, Decode, or Design leadership package.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Packages & Modules", item: "/packages" },
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
