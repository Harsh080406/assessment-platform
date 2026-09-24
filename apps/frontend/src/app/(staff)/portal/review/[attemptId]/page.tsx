import { auth } from "@/auth";
import { getStaffSubmissionDetailAction } from "@/app/actions/staff";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import ExpertReviewWorkspaceClient from "./ExpertReviewWorkspaceClient";

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function StaffSubmissionReviewPage({ params }: PageProps) {
  const session = await auth();
  const { attemptId } = await params;

  const detailRes = await getStaffSubmissionDetailAction(attemptId);

  if (!detailRes.success || !detailRes.data) {
    return (
      <div className="w-full py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center shadow-xs space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#0F172A]">Submission Not Found</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {detailRes.message || "The requested assessment attempt could not be found or you do not have permission to view it."}
          </p>
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-xs font-bold bg-[#0F172A] text-white px-4 py-2.5 rounded-xl hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Staff Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0F172A] hover:text-[#4F46E5] bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-xs hover:bg-[#F8FAFC] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Live Queue</span>
        </Link>

        <div className="text-xs font-bold text-[#64748B] flex items-center gap-1.5">
          <span>Attempt ID:</span>
          <span className="font-mono text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
            {attemptId.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Main Review Workspace Component */}
      <ExpertReviewWorkspaceClient submission={detailRes.data} />
    </div>
  );
}
