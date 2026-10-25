import type { Metadata } from "next";
import ContactClient from "@/components/marketing/ContactClient";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Contact & Partnerships | ${SITE_NAME}`,
  description:
    "Connect with Alderwood Vantage for admissions queries, student guidance, and school or institutional campus partnerships.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact & Partnerships | ${SITE_NAME}`,
    description:
      "Connect with Alderwood Vantage for admissions queries, student guidance, and school or institutional campus partnerships.",
    url: "/contact",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
        width: 1200,
        height: 630,
        alt: `Contact & Partnerships - ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact & Partnerships | ${SITE_NAME}`,
    description:
      "Connect with Alderwood Vantage for admissions queries, student guidance, and school or institutional campus partnerships.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Contact & Partnerships", item: "/contact" },
];

const CONTACT_FAQS = [
  {
    question: "How soon can I expect a response to my enquiry?",
    answer:
      "We respond to all student and parent queries within 4 business hours. Institutional cohort and campus pilot requests receive a dedicated enterprise response within 1 business day.",
  },
  {
    question: "Can I speak directly with a certified counsellor before booking?",
    answer:
      "Yes. Our admissions desk can arrange a preliminary 15-minute alignment call with a senior practitioner to address any questions about the evaluation format or package fitment.",
  },
  {
    question: "Do you offer institutional assessments for schools and colleges?",
    answer:
      "Yes. Alderwood Vantage partners with premier high schools, IB World Schools, and undergraduate universities to administer campus-wide cohorts, providing aggregate institutional analytics alongside individual student blueprints.",
  },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqJsonLd items={CONTACT_FAQS} />
      <ContactClient />
    </>
  );
}
