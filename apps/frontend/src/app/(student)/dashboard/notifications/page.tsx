import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getStudentNotificationsAction,
  getNotificationPreferencesAction,
} from "@/app/actions/notifications";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/notifications");
  }

  const [notificationsRes, preferencesRes] = await Promise.all([
    getStudentNotificationsAction(),
    getNotificationPreferencesAction(),
  ]);

  return (
    <NotificationsClient
      initialNotifications={notificationsRes.notifications || []}
      initialUnreadCount={notificationsRes.unreadCount || 0}
      initialPreferences={preferencesRes.preferences || []}
    />
  );
}
