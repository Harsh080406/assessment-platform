import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment Session | Alderwood Vantage",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
