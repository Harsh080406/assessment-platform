import type { Metadata } from "next";
import PackagesClient from "@/components/marketing/PackagesClient";
import { BreadcrumbJsonLd, CourseProgramJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Assessment Packages & Modules | Spark, Wiring, Horsepower, Edge",
  description:
    "Discover the 4 Alderwood Vantage assessment modules (Spark, Wiring, Horsepower, Edge) and choose between Discover, Decode, and Design leadership packages.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: `Assessment Packages & Modules | ${SITE_NAME}`,
    description:
      "Discover the 4 Alderwood Vantage assessment modules (Spark, Wiring, Horsepower, Edge) and choose between Discover, Decode, and Design leadership packages.",
    url: "/packages",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
        width: 1200,
        height: 630,
        alt: `Packages & Modules - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Assessment Packages & Modules | ${SITE_NAME}`,
    description:
      "Discover the 4 Alderwood Vantage assessment modules (Spark, Wiring, Horsepower, Edge) and select your pathway package.",
    images: ["/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png"],
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
