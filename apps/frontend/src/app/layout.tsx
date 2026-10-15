import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
};

export const metadata: Metadata = {
  title: "ALDERWOOD VANTAGE — Find Your Vantage | Raising Leaders, Not Just Employees",
  description:
    "From self-discovery to leadership: a validated assessment, expert counselling, mentorship and a 5-year pathway that helps every student become the leader, innovator and builder they can be.",
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
