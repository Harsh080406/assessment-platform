import type { Metadata } from "next";
import DecoderClient from "@/components/marketing/DecoderClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Student-Parent Decoder | Career Myths vs Science",
  description:
    "Bridge the communication gap between parental aspirations and student passions with data-driven insights and objective cognitive assessment results.",
  alternates: {
    canonical: "/decoder",
  },
  openGraph: {
    title: `Student-Parent Decoder | ${SITE_NAME}`,
    description:
      "Bridge the communication gap between parental aspirations and student passions with data-driven insights and objective cognitive assessment results.",
    url: "/decoder",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
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
      "Bridge the communication gap between parental aspirations and student passions with data-driven insights.",
    images: ["/alderwood-og.png"],
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
