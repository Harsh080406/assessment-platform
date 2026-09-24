import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentLayoutShell from "@/components/student/StudentLayoutShell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: true,
    },
  });

  const studentName = user?.studentProfile
    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`.trim()
    : session.user.name || "Alex Student";

  const studentEmail = user?.email || session.user.email || "student@aurapath.com";

  const studentInitials =
    studentName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AS";

  return (
    <StudentLayoutShell
      studentName={studentName}
      studentEmail={studentEmail}
      studentInitials={studentInitials}
      avatarUrl={user?.studentProfile?.avatarUrl}
    >
      {children}
    </StudentLayoutShell>
  );
}
