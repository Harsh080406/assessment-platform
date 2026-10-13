import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSystemSettingsAction } from "@/app/actions/settings";
import AdminSettingsClient from "./AdminSettingsClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login?callbackUrl=/console/settings");
  }

  const res = await getSystemSettingsAction();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200">
        <p className="text-red-600 font-semibold">{res.message || "Failed to load system settings."}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="System Settings"
        description="Configure global SLA turnaround windows, operational feature flags, and system runtime rules."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminSettingsClient initialData={res.data} />
    </div>
  );
}
