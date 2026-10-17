import type { Metadata } from "next";
import ContactClient from "@/components/marketing/ContactClient";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us | Admissions & School Partnerships",
  description:
    "Connect with Alderwood Vantage for student guidance, counsellor helpline (+91 93168 19331), assessment support, and institutional campus cohorts.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact Us | ${SITE_NAME}`,
    description:
      "Connect with Alderwood Vantage for student guidance, counsellor helpline (+91 93168 19331), assessment support, and institutional campus cohorts.",
    url: "/contact",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/alderwood-og.png",
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
      "Connect with Alderwood Vantage for student guidance, counsellor helpline (+91 93168 19331), and school partnerships.",
    images: ["/alderwood-og.png"],
  },
};

const BREADCRUMBS = [
  { name: "Home", item: "/" },
  { name: "Contact Us", item: "/contact" },
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
      "Yes. Our senior counselling desk is reachable via phone (+91 93168 19331) or email from Monday to Saturday, 9:00 AM – 7:00 PM IST.",
  },
  {
    question: "How is candidate cognitive data kept private and secure?",
    answer:
      "We adhere to rigorous student data protection standards. Assessment data is encrypted at rest and in transit, and is strictly never shared or sold to test prep academies, advertisers, or third-party recruiters.",
  },
  {
    question: "Do you offer in-person campus workshops and school cohorts?",
    answer:
      "Yes. We partner with K-12 senior secondary schools and universities to conduct on-campus orientation sessions, diagnostic cohorts, and institutional leadership workshops.",
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
