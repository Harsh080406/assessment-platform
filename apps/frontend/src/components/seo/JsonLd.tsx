import React from "react";
import { getBaseUrl, getCanonicalUrl } from "@/lib/seo";

export function OrganizationJsonLd() {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${baseUrl}/#organization`,
    name: "Alderwood Vantage",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/alderwood-logo.png`,
      caption: "Alderwood Vantage Logo",
    },
    description:
      "Alderwood Vantage provides scientifically validated career and cognitive assessments, expert counselling, and 5-year developmental roadmaps for high school and university students.",
    email: "admissions@alderwoodvantage.com",
    telephone: "+91 93168 19331",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91 93168 19331",
        contactType: "admissions & student counselling",
        email: "admissions@alderwoodvantage.com",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Alderwood Vantage",
    alternateName: ["Alderwood", "Vantage Assessment", "Alderwood Vantage Platform"],
    description:
      "Validated cognitive assessments, expert counselling, and 5-year leadership roadmaps.",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * SiteNavigationElement schema:
 * Directly signals Googlebot our key site sections for expanded Sitelinks representation.
 */
export function SiteNavigationJsonLd() {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SiteNavigationElement",
        "@id": `${baseUrl}/#nav-how-it-works`,
        name: "How It Works",
        description: "Explore the 4-module assessment process: Spark, Wiring, Horsepower, and Edge.",
        url: `${baseUrl}/how-it-works`,
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${baseUrl}/#nav-packages`,
        name: "Assessment Packages",
        description: "Compare Vantage Foundation, Decode, and Design mentorship & report tiers.",
        url: `${baseUrl}/packages`,
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${baseUrl}/#nav-about`,
        name: "About Us",
        description: "Meet our leadership practitioners, academic advisers, and our founding purpose.",
        url: `${baseUrl}/about`,
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${baseUrl}/#nav-quests`,
        name: "The 4 Quests",
        description: "Discover the 4 psychometric dimensions measured in our evaluation suite.",
        url: `${baseUrl}/quests`,
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${baseUrl}/#nav-contact`,
        name: "Contact & Partnerships",
        description: "Connect with Alderwood Vantage for admissions queries, student guidance, and school partnerships.",
        url: `${baseUrl}/contact`,
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${baseUrl}/#nav-privacy`,
        name: "Privacy & Parental Consent",
        description: "Review our strict student data confidentiality charter and guardian consent protocols.",
        url: `${baseUrl}/privacy`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith("http") ? crumb.item : getCanonicalUrl(crumb.item),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CourseProgramJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const baseUrl = getBaseUrl();
  const canonicalUrl = url.startsWith("http") ? url : getCanonicalUrl(url);

  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name,
    description,
    url: canonicalUrl,
    provider: {
      "@type": "EducationalOrganization",
      name: "Alderwood Vantage",
      url: baseUrl,
    },
    educationalCredentialAwarded: "Comprehensive Vantage Assessment Report & 5-Year Leadership Blueprint",
    occupationalCategory: "Student Career & Leadership Development",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
