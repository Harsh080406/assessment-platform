import type { Metadata } from "next";
import ContactClient from "@/components/marketing/ContactClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us & Institutional Enquiries | Alderwood Vantage",
  description:
    "Get in touch with Alderwood Vantage for student assessment support, school partnerships, institutional cohorts, and counseling appointments.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact Us & Institutional Enquiries | ${SITE_NAME}`,
    description:
      "Get in touch with Alderwood Vantage for student assessment support, school partnerships, institutional cohorts, and counseling appointments.",
    url: "/contact",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
        width: 1200,
        height: 630,
        alt: `Contact ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact Us | ${SITE_NAME}`,
    description:
      "Get in touch with Alderwood Vantage for student assessment support and school partnerships.",
    images: ["/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Contact Us", item: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <ContactClient />
    </>
  );
}
