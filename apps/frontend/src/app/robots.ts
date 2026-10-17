import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/how-it-works",
          "/packages",
          "/quests",
          "/decoder",
          "/contact",
          "/login",
          "/register",
        ],
        disallow: [
          "/dashboard/",
          "/portal/",
          "/console/",
          "/take/",
          "/api/",
          "/reset-password",
          "/verify-otp",
          "/verify-email",
          "/activate",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
