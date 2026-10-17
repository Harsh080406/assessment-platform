import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://alderwoodvantage.com");

  const publicRoutes: Array<{
    path: string;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1.0 },
    { path: "/about", changeFrequency: "weekly", priority: 0.8 },
    { path: "/how-it-works", changeFrequency: "weekly", priority: 0.9 },
    { path: "/packages", changeFrequency: "weekly", priority: 0.9 },
    { path: "/quests", changeFrequency: "weekly", priority: 0.8 },
    { path: "/decoder", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/login", changeFrequency: "monthly", priority: 0.5 },
    { path: "/register", changeFrequency: "monthly", priority: 0.6 },
  ];

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
