import type { Metadata } from "next";
import AboutClient from "@/components/marketing/AboutClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us | Our Mission, Science & Leadership Pedagogy",
  description:
    "Learn about Alderwood Vantage: our mission to raise leaders, our scientifically validated 4-module methodology, and the senior enterprise leadership practitioners guiding students toward clarity.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Learn about Alderwood Vantage: our mission to raise leaders, our scientifically validated 4-module methodology, and the senior enterprise leadership practitioners guiding students toward clarity.",
    url: "/about",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
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
      "Learn about Alderwood Vantage: our mission to raise leaders, our scientifically validated 4-module methodology, and the leadership practitioners guiding students.",
    images: ["/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png"],
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
