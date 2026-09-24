import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/console");
  }

  // Ensure user has ADMIN role
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: true,
    },
  });

  const adminName = user?.studentProfile
    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`.trim()
    : session.user.name || "System Governor";

  const adminEmail = user?.email || session.user.email || "admin@aurapath.com";

  const adminInitials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AG";

  return (
    <AdminLayoutShell
      adminName={adminName}
      adminEmail={adminEmail}
      adminInitials={adminInitials}
      avatarUrl={user?.studentProfile?.avatarUrl}
    >
      {children}
    </AdminLayoutShell>
  );
}
