import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getStaffSelfSettingsAction } from "@/app/actions/staff";
import StaffSettingsClient from "./StaffSettingsClient";

export default async function StaffSettingsPage() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== UserRole.STAFF && session.user.role !== UserRole.ADMIN)
  ) {
    redirect("/login?callbackUrl=/portal/settings");
  }

  const res = await getStaffSelfSettingsAction();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <p className="text-red-600 font-semibold">{res.message || "Failed to load staff settings."}</p>
      </div>
    );
  }

  return <StaffSettingsClient initialData={res.data} />;
}
