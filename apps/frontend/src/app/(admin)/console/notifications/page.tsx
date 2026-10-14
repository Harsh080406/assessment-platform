import { getNotificationTemplatesAction } from "@/app/actions/admin";
import AdminNotificationsClient from "./AdminNotificationsClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Email Templates | Admin Console",
  description: "Manage transactional and lifecycle email notification templates.",
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const result = await getNotificationTemplatesAction();
  const initialTemplates = result.success && result.data ? result.data : [];

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Email Templates"
        description="Configure transactional email templates, merge tags, and candidate notifications."
        breadcrumbHref="/console"
        breadcrumbLabel="Back to Overview"
      />

      <AdminNotificationsClient initialTemplates={initialTemplates} />
    </div>
  );
}
