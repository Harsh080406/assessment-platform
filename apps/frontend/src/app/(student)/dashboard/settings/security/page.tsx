import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentSecurityInfoAction } from "@/app/actions/security";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import SecurityClient from "./SecurityClient";

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/settings/security");
  }

  const result = await getStudentSecurityInfoAction();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <p className="text-red-600 font-semibold">{result.message || "Failed to load security settings."}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Standard Unified Header */}
      <StudentPageHeader
        title="Account & profile settings"
        description="Update your personal details, academic background, and security preferences."
      />

      {/* Underlined Tab Navigation */}
      <div className="border-b border-[#E2E8F0]">
        <nav
          aria-label="Settings sections"
          className="flex items-center gap-6 overflow-x-auto no-scrollbar -mb-px"
        >
          <Link
            href="/dashboard/settings"
            className="pb-3 text-sm font-medium border-b-2 border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Profile & academic
          </Link>
          <Link
            href="/dashboard/settings/security"
            aria-current="page"
            className="pb-3 text-sm font-semibold border-b-2 border-[#4F46E5] text-[#0F172A] whitespace-nowrap cursor-pointer"
          >
            Security & sessions
          </Link>
        </nav>
      </div>

      <SecurityClient initialData={result.data} />
    </div>
  );
}
