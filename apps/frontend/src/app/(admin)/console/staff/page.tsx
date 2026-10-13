import { auth } from "@/auth";
import { getAdminStaffWorkloadAction } from "@/app/actions/admin";
import AdminStaffClient from "./AdminStaffClient";

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
