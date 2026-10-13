import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getAdminSecurityOverviewAction } from "@/app/actions/admin";
import AdminSecurityClient from "./AdminSecurityClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminSecurityPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login?callbackUrl=/console/security");
  }

  const res = await getAdminSecurityOverviewAction();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200">
        <p className="text-red-600 font-semibold">{res.message || "Failed to load security overview."}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Security Center"
        description="Oversee privileged accounts, multi-factor posture, pending staff invitations, and session invalidation."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminSecurityClient initialData={res.data} />
    </div>
  );
}
