import type { Metadata } from "next";
import IdleSessionTimeout from "@/components/auth/IdleSessionTimeout";

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
  return (
    <>
      <IdleSessionTimeout timeoutMinutes={15} warningSeconds={120} />
      {children}
    </>
  );
}
