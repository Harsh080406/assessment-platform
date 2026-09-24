import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessmentAttemptData } from "@/app/actions/assessment";
import AssessmentRunner from "./AssessmentRunner";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface TakeAssessmentProps {
  params: Promise<{ attemptId: string }>;
}

export default async function TakeAssessmentPage({ params }: TakeAssessmentProps) {
  const session = await auth();
  if (!session?.user?.id) {
    const { attemptId } = await params;
    redirect(`/login?callbackUrl=/take/${attemptId}`);
  }

  const { attemptId } = await params;
  const result = await getAssessmentAttemptData(attemptId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-[#191F2D]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-md p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Assessment Not Found</h2>
          <p className="text-xs text-[#718096] leading-relaxed">
            {result.message || "We could not load the specified assessment attempt."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6B6B] text-white font-bold text-xs shadow-sm hover:bg-[#F95858] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <AssessmentRunner initialData={result.data} />;
}
