import { auth } from "@/auth";
import { getAdminUsersAction } from "@/app/actions/admin";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await auth();
  const res = await getAdminUsersAction();
  const users = res.success && res.data ? res.data.users : [];

  return (
    <div className="w-full space-y-6">
      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
