import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { Settings as SettingsIcon, Shield } from "lucide-react";

export default async function StudentSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/settings");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
    },
  });

  const profile = user?.studentProfile;

  const initialData = {
    userId,
    email: user?.email || session.user.email || "",
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    avatarUrl: profile?.avatarUrl || null,
    phone: profile?.phone || user?.phone || null,
    dateOfBirth: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : null,
    country: profile?.country || "India",
    school: profile?.school || "",
    grade: profile?.grade || "Class 12",
    educationLevel: profile?.educationLevel || "High School",
    bio: profile?.bio || "",
  };

  return (
    <main className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-[#FF6B6B] rounded-full inline-block" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            Account & Profile Settings
          </h1>
        </div>
        <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
          Update your personal details, profile photo, and academic background. These details are utilized by our psychometric evaluators to customize your career report.
        </p>
      </div>

      {/* Settings Client Form */}
      <SettingsClient initialData={initialData} />
    </main>
  );
}
