import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://alderwoodvantage.com");

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
