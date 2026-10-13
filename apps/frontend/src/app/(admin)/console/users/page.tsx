import { auth } from "@/auth";
import { getAdminUsersAction } from "@/app/actions/admin";
import AdminUsersClient from "./AdminUsersClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminUsersPage() {
  await auth();
  const res = await getAdminUsersAction();
  const users = res.success && res.data ? res.data.users : [];

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="User Governance"
        description="Manage candidate accounts, role assignments, security statuses, and access credentials."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
