import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StaffLayoutShell from "@/components/staff/StaffLayoutShell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/portal");
  }

  // Ensure user has STAFF or ADMIN permissions
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: true,
    },
  });

  const staffName = user?.studentProfile
    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`.trim()
    : session.user.name || "Staff Evaluator";

  const staffEmail = user?.email || session.user.email || "staff@aurapath.com";

  const staffInitials =
    staffName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SE";

  return (
    <StaffLayoutShell
      staffName={staffName}
      staffEmail={staffEmail}
      staffInitials={staffInitials}
      role={session.user.role}
      avatarUrl={user?.studentProfile?.avatarUrl}
    >
      {children}
    </StaffLayoutShell>
  );
}
