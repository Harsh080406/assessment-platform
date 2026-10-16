import { auth } from "@/auth";
import { getAdminStaffWorkloadAction } from "@/app/actions/admin";
import AdminStaffClient from "./AdminStaffClient";

export const metadata = {
  title: "Staff & Workload Governance | Admin Console",
  description: "Manage staff evaluators, assign specific roles, control evaluation authority permissions, and track review workload.",
};

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  await auth();
  const res = await getAdminStaffWorkloadAction();
  const staffList = res.success && res.data ? res.data.staffList : [];

  return (
    <div className="w-full space-y-6">
      <AdminStaffClient initialStaff={staffList} />
    </div>
  );
}
