import type { Metadata } from "next";
import DecoderClient from "@/components/marketing/DecoderClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Student-Parent Decoder | Career Myths vs Scientific Evidence",
  description:
    "Bridge the conversation gap between parental expectations and student aspirations. Discover scientific data versus popular career myths regarding streams, careers, and leadership paths.",
  alternates: {
    canonical: "/decoder",
  },
  openGraph: {
    title: `Student-Parent Decoder | ${SITE_NAME}`,
    description:
      "Bridge the conversation gap between parental expectations and student aspirations with objective cognitive data and scientific evidence.",
    url: "/decoder",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
        width: 1200,
        height: 630,
        alt: `Student-Parent Decoder - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Student-Parent Decoder | ${SITE_NAME}`,
    description:
      "Bridge the conversation gap between parental expectations and student aspirations with objective cognitive data.",
    images: ["/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Student-Parent Decoder", item: "/decoder" },
];

export default function DecoderPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <DecoderClient />
    </>
  );
}
