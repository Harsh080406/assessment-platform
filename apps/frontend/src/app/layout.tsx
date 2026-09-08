import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Pathfinder — What Are You Actually Built For? | AuraPath",
  description:
    "One assessment. A clearer picture of your innate strengths, deep interests, and real-world career directions before committing years of your life.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="bg-mesh-glow text-brand-charcoal font-sans antialiased overflow-x-hidden selection:bg-brand-vividViolet selection:text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
