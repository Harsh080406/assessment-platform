import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { getBaseUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBFBF9",
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: "https://www.alderwoodvantage.com" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "Alderwood Vantage",
    "career assessment",
    "student leadership pathway",
    "cognitive profiling",
    "psychometric assessment for students",
    "stream selection class 10",
    "career guidance class 11 12",
    "career clarity engine",
    "Spark Wiring Horsepower Edge",
    "undergraduate career mentorship",
    "5-year leadership roadmap",
    "student potential assessment",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Raising Leaders, Not Just Employees`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: ["/Alderwood Logo_upscayl_5x_upscayl-standard-4x.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== "undefined") {
                  var isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                  if (!isLocal || ${process.env.NODE_ENV === "production"}) {
                    var noop = function() {};
                    var methods = ["log", "debug", "info", "warn", "error", "dir", "table", "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd", "assert", "count"];
                    for (var i = 0; i < methods.length; i++) {
                      try {
                        window.console[methods[i]] = noop;
                      } catch (e) {}
                    }
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="bg-[#FBFBF9] text-black font-sans antialiased overflow-x-hidden selection:bg-[#A9B4E8] selection:text-black min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
