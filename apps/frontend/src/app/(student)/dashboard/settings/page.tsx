import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import SettingsClient from "./SettingsClient";

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
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Standard Unified Header */}
      <StudentPageHeader
        title="Account & profile settings"
        description="Update your personal details, academic background, and security preferences."
      />

      {/* Underlined Tab Navigation (horizontally scrollable on mobile) */}
      <div className="border-b border-[#E2E8F0]">
        <nav
          aria-label="Settings sections"
          className="flex items-center gap-6 overflow-x-auto no-scrollbar -mb-px"
        >
          <Link
            href="/dashboard/settings"
            aria-current="page"
            className="pb-3 text-sm font-semibold border-b-2 border-[#4F46E5] text-[#0F172A] whitespace-nowrap cursor-pointer"
          >
            Profile & academic
          </Link>
          <Link
            href="/dashboard/settings/security"
            className="pb-3 text-sm font-medium border-b-2 border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Security & sessions
          </Link>
        </nav>
      </div>

      {/* Settings Client Form */}
      <SettingsClient initialData={initialData} />
    </div>
  );
}
