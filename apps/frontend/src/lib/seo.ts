export const SITE_NAME = "Alderwood Vantage";
export const SITE_TAGLINE = "Career & Leadership Assessment for Students";
export const DEFAULT_DESCRIPTION =
  "Evidence-based psychometric evaluations, senior practitioner mentorship, and 5-year developmental roadmaps for students from Class 8 to University.";
export const DEFAULT_OG_IMAGE = "/alderwood-og.png";
export const DEFAULT_LOGO = "/alderwood-logo.png";

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  return "https://www.alderwoodvantage.com";
}

export function getCanonicalUrl(path: string = ""): string {
  const base = getBaseUrl();
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${base}${cleanPath}`;
}
