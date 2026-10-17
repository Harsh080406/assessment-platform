"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  User,
  School,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Eye,
  Check,
  X,
  ArrowLeftRight,
  BarChart2,
  ListOrdered,
  Layers,
  HelpCircle,
  Target,
  GraduationCap,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { AttemptStatus, ReportStatus } from "@prisma/client";
import { updateSubmissionStatusAction, uploadSubmissionReportAction } from "@/app/actions/staff";

interface VersionedQuestion {
  id: string;
  questionText: string;
  questionType: string;
  category?: string;
  version: number;
  displayOrder: number;
  required: boolean;
  sectionTitle: string;
  sectionDisplayOrder: number;
  options: { id: string; optionText: string; displayOrder: number }[];
  studentAnswer: any;
  answeredAt?: string;
  reverseKeyed?: boolean;
  correctOptionId?: string | null;
  mostEffectiveOptionId?: string | null;
  leastEffectiveOptionId?: string | null;
}

interface SectionDetail {
  id: string;
  title: string;
  description?: string | null;
  subCategory?: string | null;
  questions: VersionedQuestion[];
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function getCandidateMcqSelection(studentAnswer: any): string | null {
  if (!studentAnswer) return null;
  if (typeof studentAnswer === "string") return studentAnswer;
  if (typeof studentAnswer === "object") {
    return studentAnswer.selected || studentAnswer.selectedOptionId || studentAnswer.id || null;
  }
  return null;
}

function getCandidateSjtSelection(studentAnswer: any): string | null {
  if (!studentAnswer) return null;
  if (typeof studentAnswer === "string") return studentAnswer;
  if (typeof studentAnswer === "object") {
    return (
      studentAnswer.selected ||
      studentAnswer.selectedOptionId ||
      studentAnswer.mostEffective ||
      studentAnswer.most ||
      studentAnswer.id ||
      null
    );
  }
  return null;
}

function getCandidateLikertValue(studentAnswer: any): number | null {
  if (studentAnswer === null || studentAnswer === undefined) return null;
  if (typeof studentAnswer === "number") return studentAnswer;
  if (typeof studentAnswer === "object" && typeof studentAnswer.value === "number") {
    return studentAnswer.value;
  }
  const parsed = parseInt(String(studentAnswer), 10);
  return isNaN(parsed) ? null : parsed;
}

function getCandidateForcedRank(studentAnswer: any): number | null {
  if (studentAnswer === null || studentAnswer === undefined) return null;
  if (typeof studentAnswer === "number") return studentAnswer;
  if (typeof studentAnswer === "object" && typeof studentAnswer.rank === "number") {
    return studentAnswer.rank;
  }
  const parsed = parseInt(String(studentAnswer), 10);
  return isNaN(parsed) ? null : parsed;
}

function getOptionLabel(
  options: { id: string; optionText: string }[],
  optId: string | null | undefined
): { letter: string; text: string } {
  if (!optId) return { letter: "-", text: "None recorded" };
  const idx = options.findIndex((o) => o.id === optId);
  if (idx !== -1) {
    return {
      letter: OPTION_LETTERS[idx] || String(idx + 1),
      text: options[idx].optionText,
    };
  }
  return { letter: "?", text: optId };
}

interface ReportItem {
  id: string;
  version: number;
  status: ReportStatus;
  rejectionReason?: string | null;
  fileReference: string;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy?: string | null;
  publishedAt?: string | null;
  previewUrl: string;
}

interface SubmissionDetail {
  attempt: {
    id: string;
    userId: string;
    assessmentId: string;
    assessmentTitle: string;
    assessmentVersion: number;
    status: AttemptStatus;
    startedAt: string;
    submittedAt: string | null;
  };
  student: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    school?: string | null;
    grade?: string | null;
    country?: string | null;
    educationLevel?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null;
  };
  sections: SectionDetail[];
  reports: ReportItem[];
}

interface ExpertReviewWorkspaceClientProps {
  submission: SubmissionDetail;
}

export default function ExpertReviewWorkspaceClient({ submission }: ExpertReviewWorkspaceClientProps) {
  const [currentStatus, setCurrentStatus] = useState<AttemptStatus>(submission.attempt.status);
  const [reportsList, setReportsList] = useState<ReportItem[]>(submission.reports);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    submission.sections[0]?.id || ""
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const studentFullName = submission.student.firstName
    ? `${submission.student.firstName} ${submission.student.lastName || ""}`.trim()
    : submission.student.email || "Candidate";

  const handleStatusTransition = async (nextStatus: AttemptStatus) => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const res = await updateSubmissionStatusAction(submission.attempt.id, nextStatus);
      if (res.success && res.data) {
        setCurrentStatus(res.data.status);
        setStatusMessage({ text: res.message, type: "success" });
      } else {
        setStatusMessage({ text: res.message || "Failed to update status", type: "error" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Status transition error", type: "error" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select a valid PDF report file.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF documents (.pdf) are permitted.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("attemptId", submission.attempt.id);
      formData.append("reportPdf", selectedFile);

      const res = await uploadSubmissionReportAction(formData);

      if (res.success && res.data) {
        setCurrentStatus(AttemptStatus.PENDING_APPROVAL);
        setReportsList((prev) => [
          {
            id: res.data!.reportId,
            version: res.data!.version,
            status: ReportStatus.PENDING_APPROVAL,
            fileReference: selectedFile.name,
            uploadedBy: "Current Expert",
            uploadedAt: new Date().toISOString(),
            previewUrl: res.data!.previewUrl,
          },
          ...prev,
        ]);
        setSelectedFile(null);
        setStatusMessage({
          text: "Report PDF uploaded successfully. Submission moved to Pending Approval queue.",
          type: "success",
        });
      } else {
        setUploadError(res.message || "Upload failed.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload exception occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const activeSection = submission.sections.find((s) => s.id === activeSectionId) || submission.sections[0];

  // Section-Level Objective Reference Calculations (Human Expert Evaluation Aids)
  const aptitudeQuestions = useMemo(() => {
    return activeSection?.questions.filter((q) => q.questionType === "MCQ_SINGLE_CORRECT") || [];
  }, [activeSection]);

  const aptitudeStats = useMemo(() => {
    if (aptitudeQuestions.length === 0) return null;
    let answered = 0;
    let correct = 0;
    const byCategory: Record<string, { total: number; correct: number }> = {};

    aptitudeQuestions.forEach((q) => {
      const selectedId = getCandidateMcqSelection(q.studentAnswer);
      const isAnswered = Boolean(selectedId);
      const isCorrect = isAnswered && Boolean(q.correctOptionId && selectedId === q.correctOptionId);

      if (isAnswered) answered++;
      if (isCorrect) correct++;

      const cat = q.category || "General Aptitude";
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, correct: 0 };
      }
      byCategory[cat].total++;
      if (isCorrect) byCategory[cat].correct++;
    });

    return {
      total: aptitudeQuestions.length,
      answered,
      correct,
      percentage: Math.round((correct / aptitudeQuestions.length) * 100),
      byCategory,
    };
  }, [aptitudeQuestions]);

  const sjtQuestions = useMemo(() => {
    return activeSection?.questions.filter((q) => q.questionType === "SJT_DUAL_SELECT") || [];
  }, [activeSection]);

  const sjtStats = useMemo(() => {
    if (sjtQuestions.length === 0) return null;
    let answered = 0;

    sjtQuestions.forEach((q) => {
      const selected = getCandidateSjtSelection(q.studentAnswer);
      if (selected) answered++;
    });

    return {
      total: sjtQuestions.length,
      answered,
    };
  }, [sjtQuestions]);

  const forcedQuestions = useMemo(() => {
    return activeSection?.questions.filter((q) => q.questionType === "FORCED_RANKING") || [];
  }, [activeSection]);

  const rankedValuesHierarchy = useMemo(() => {
    if (forcedQuestions.length === 0) return null;
    return [...forcedQuestions].sort((a, b) => {
      const rankA = getCandidateForcedRank(a.studentAnswer) ?? 999;
      const rankB = getCandidateForcedRank(b.studentAnswer) ?? 999;
      return rankA - rankB;
    });
  }, [forcedQuestions]);

  const totalAnswered = submission.sections.reduce((acc, sec) => {
    return acc + sec.questions.filter((q) => q.studentAnswer !== null && q.studentAnswer !== undefined).length;
  }, 0);

  const totalQuestions = submission.sections.reduce((acc, sec) => acc + sec.questions.length, 0);

  const latestRejectedReport = submission.reports?.find(
    (r) => r.status === ReportStatus.REJECTED && r.rejectionReason
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Revision Feedback Callout (Priority 2a) */}
      {latestRejectedReport && (
        <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-extrabold text-red-950">
                Action Required: Administrator Revision Requested
              </h3>
              <span className="text-[11px] font-bold text-red-700 font-mono bg-red-100/70 px-2 py-0.5 rounded-md border border-red-200">
                v{latestRejectedReport.version} Rejected
              </span>
            </div>
            <div className="p-3.5 bg-white/90 rounded-xl border border-red-200 text-xs text-red-950 font-medium leading-relaxed">
              &quot;{latestRejectedReport.rejectionReason}&quot;
            </div>
            <p className="text-[11px] text-red-800 font-medium">
              Please review the feedback above, revise the evaluation diagnosis, and upload an updated certified PDF below.
            </p>
          </div>
        </div>
      )}

      {/* Candidate Overview & Verified Academic Profile */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#F1F5F9] pb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-xs">
              {studentFullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {studentFullName}
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Candidate
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  ID: {submission.student.id.slice(-6)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] mt-1.5 font-medium">
                {submission.student.email && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#94A3B8]" /> {submission.student.email}
                  </span>
                )}
                {submission.student.phone && (
                  <span>• {submission.student.phone}</span>
                )}
                {submission.student.country && (
                  <span>• Country: {submission.student.country}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-[#F8FAFC] p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Assessment</span>
              <span className="font-extrabold text-[#0F172A]">{submission.attempt.assessmentTitle}</span>
              <span className="text-[10px] text-[#64748B] font-mono ml-1">v{submission.attempt.assessmentVersion}</span>
            </div>
            <div className="h-8 w-[1px] bg-[#E2E8F0] hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Submitted Date</span>
              <span className="font-extrabold text-[#0F172A] font-mono">
                {submission.attempt.submittedAt
                  ? new Date(submission.attempt.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "In Progress"}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#E2E8F0] hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Responses</span>
              <span className="font-extrabold text-[#4F46E5] font-mono">
                {totalAnswered} / {totalQuestions} answered
              </span>
            </div>
          </div>
        </div>

        {/* Academic Profile Details Grid */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
              <span>Student Academic Profile</span>
            </span>
            <span className="text-[11px] font-medium text-[#64748B]">
              Normative Benchmark Calibration
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* School / Institution */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                School or Institution Name
              </span>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                {submission.student.school || "Not specified"}
              </div>
            </div>

            {/* Current Class / Grade */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Current Class / Grade
              </span>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A]">
                {submission.student.grade || "Not specified"}
              </div>
            </div>

            {/* Education Stage */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Education Stage
              </span>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A]">
                {submission.student.educationLevel || "Not specified"}
              </div>
            </div>
          </div>

          {/* Target Career Aspirations & Interests */}
          <div className="p-4 rounded-xl bg-[#EEF2FF]/60 border border-[#C7D2FE] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3730A3]">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              <span>Target Career Aspirations & Passions</span>
            </div>
            <p className="text-xs sm:text-sm text-[#1E1B4B] leading-relaxed">
              {submission.student.bio ? (
                submission.student.bio
              ) : (
                <span className="text-slate-400 italic">No specific career aspirations provided.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* State Machine Action Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Evaluation Workflow State</h2>
            <p className="text-xs text-[#64748B]">
              Controlled state transitions for expert psychometric evaluation and report publishing.
            </p>
          </div>

          {/* Transition Action Buttons & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`/api/staff/export-answers/${submission.attempt.id}`}
              download
              className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer min-h-[38px]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Answers (Excel)</span>
            </a>

            {currentStatus === AttemptStatus.SUBMITTED && (
              <button
                onClick={() => handleStatusTransition(AttemptStatus.UNDER_REVIEW)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 text-xs font-bold bg-[#0F172A] text-white px-4 py-2.5 rounded-xl hover:bg-black disabled:opacity-50 transition-all cursor-pointer shadow-xs min-h-[38px]"
              >
                <User className="w-3.5 h-3.5" />
                {isUpdatingStatus ? "Updating..." : "Start Evaluation (Move to Under Review)"}
              </button>
            )}

            {currentStatus === AttemptStatus.UNDER_REVIEW && (
              <button
                onClick={() => handleStatusTransition(AttemptStatus.REPORT_IN_PREP)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 text-xs font-bold bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl hover:bg-[#4338CA] disabled:opacity-50 transition-all cursor-pointer shadow-xs min-h-[38px]"
              >
                <FileText className="w-3.5 h-3.5" />
                {isUpdatingStatus ? "Updating..." : "Move to Report Preparation"}
              </button>
            )}

            {currentStatus === AttemptStatus.REPORT_IN_PREP && (
              <span className="text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-3.5 py-2 rounded-xl border border-[#E0E7FE]">
                Ready for PDF Report Upload below
              </span>
            )}

            {currentStatus === AttemptStatus.PENDING_APPROVAL && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Awaiting Admin Signoff & Publishing
              </span>
            )}

            {currentStatus === AttemptStatus.PUBLISHED && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Published to Candidate Dashboard
              </span>
            )}
          </div>
        </div>

        {/* Status Stepper Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px] font-bold">
          {[
            { label: "Submitted", status: AttemptStatus.SUBMITTED },
            { label: "Under Review", status: AttemptStatus.UNDER_REVIEW },
            { label: "Report in Prep", status: AttemptStatus.REPORT_IN_PREP },
            { label: "Pending Signoff", status: AttemptStatus.PENDING_APPROVAL },
            { label: "Published", status: AttemptStatus.PUBLISHED },
          ].map((step, idx) => {
            const isCompleted =
              (currentStatus === AttemptStatus.UNDER_REVIEW && idx === 0) ||
              (currentStatus === AttemptStatus.REPORT_IN_PREP && idx <= 1) ||
              (currentStatus === AttemptStatus.PENDING_APPROVAL && idx <= 2) ||
              (currentStatus === AttemptStatus.PUBLISHED && idx <= 4);

            const isCurrent = currentStatus === step.status;

            return (
              <div
                key={step.label}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]"
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Candidate Response Trajectory Inspector */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Student Answers (Module-Wise)</h2>
                <p className="text-xs text-[#64748B]">Inspect the candidate&apos;s submitted responses for each evaluation module.</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/api/staff/export-answers/${submission.attempt.id}`}
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </a>

                <span className="text-xs font-bold px-3 py-1 bg-[#F8FAFC] text-[#0F172A] rounded-lg border border-[#E2E8F0]">
                  {submission.sections.length} Modules Total
                </span>
              </div>
            </div>

            {/* Section Tab Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {submission.sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                    activeSection?.id === sec.id
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                  }`}
                >
                  Module {["A", "B", "C", "D"][idx] || idx + 1}: {sec.title}
                </button>
              ))}
            </div>

            {/* Active Quest Questions List */}
            {activeSection ? (
              <div className="space-y-6 pt-2">
                {/* 1. Aptitude Objective Reference Summary (if section contains MCQ) */}
                {aptitudeStats && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-[#0F172A]">
                            Aptitude Objective Reference Data
                          </h3>
                          <p className="text-[11px] text-[#64748B]">
                            Mathematical accuracy tally against benchmark answer keys. Evaluation aid for expert review.
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right bg-white sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl border sm:border-0 border-indigo-200">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Overall Accuracy</span>
                        <span className="text-base font-black text-indigo-700 font-mono">
                          {aptitudeStats.correct} / {aptitudeStats.total} Correct ({aptitudeStats.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Subcategory Accuracy Breakdown Pills */}
                    <div className="pt-2 border-t border-indigo-200/60 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Subcategory Breakdown:</span>
                      {Object.entries(aptitudeStats.byCategory).map(([cat, stats]) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-indigo-200 shadow-2xs font-mono"
                        >
                          <span className="font-semibold text-slate-600 font-sans">{cat}:</span>
                          <span className="text-indigo-600">{stats.correct}/{stats.total}</span>
                          <span className="text-[10px] text-slate-400">({Math.round((stats.correct / stats.total) * 100)}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SJT Summary (if section contains SJT) */}
                {sjtStats && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A]">
                          Situational Judgment Responses
                        </h3>
                        <p className="text-[11px] text-[#64748B]">
                          Candidate decisions recorded across situational workplace dilemmas.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#0F172A] bg-white px-3 py-1.5 rounded-xl border border-[#CBD5E1] font-mono shrink-0">
                      {sjtStats.answered} / {sjtStats.total} Scenarios Answered
                    </span>
                  </div>
                )}

                {/* 3. Work Values Hierarchy Overview (if section contains FORCED_RANKING) */}
                {rankedValuesHierarchy && rankedValuesHierarchy.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold shrink-0">
                        <ListOrdered className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                          Candidate Work Values Hierarchy (Ranks 1 to 10)
                        </h3>
                        <p className="text-[11px] text-[#64748B]">
                          Objective ranking order assigned by candidate. Evaluator reference view.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {rankedValuesHierarchy.map((q) => {
                        const rank = getCandidateForcedRank(q.studentAnswer);
                        const isTop = typeof rank === "number" && rank <= 3;
                        const isMid = typeof rank === "number" && rank > 3 && rank <= 7;
                        return (
                          <div
                            key={q.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                              isTop
                                ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold"
                                : isMid
                                ? "bg-indigo-50/40 border-indigo-200 text-slate-800 font-medium"
                                : "bg-white border-slate-200 text-slate-600 font-normal"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                                  isTop
                                    ? "bg-emerald-600 text-white"
                                    : isMid
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                #{rank ?? "?"}
                              </span>
                              <span className="truncate">{q.questionText}</span>
                            </div>

                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${
                                isTop
                                  ? "bg-emerald-200/80 text-emerald-900"
                                  : isMid
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isTop ? "Top Priority" : isMid ? "Mid Priority" : "Lower Priority"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Per-Question Detailed Cards */}
                <div className="space-y-4">
                  {activeSection.questions.map((q, qIdx) => {
                    // Question Type 1: MCQ_SINGLE_CORRECT (Aptitude)
                    if (q.questionType === "MCQ_SINGLE_CORRECT") {
                      const selectedId = getCandidateMcqSelection(q.studentAnswer);
                      const isAnswered = Boolean(selectedId);
                      const isCorrect = isAnswered && Boolean(q.correctOptionId && selectedId === q.correctOptionId);
                      const selectedOptionInfo = getOptionLabel(q.options, selectedId);
                      const correctOptionInfo = getOptionLabel(q.options, q.correctOptionId);

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#4F46E5] font-mono">
                                  Q{qIdx + 1}.
                                </span>
                                {q.category && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {q.category}
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {q.questionType}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#0F172A] leading-snug pt-1">
                                {q.questionText}
                              </h4>
                            </div>

                            {/* Status Indicator Pill */}
                            <div>
                              {!isAnswered ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  ○ Unanswered
                                </span>
                              ) : isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-3.5 h-3.5" /> Correct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                  <X className="w-3.5 h-3.5" /> Incorrect
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options List */}
                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
                              const isCandidateChoice = selectedId === opt.id;
                              const isBenchmarkKey = q.correctOptionId === opt.id;

                              let cardStyle = "bg-white border-[#E2E8F0] text-[#64748B]";
                              if (isCandidateChoice && isBenchmarkKey) {
                                cardStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                              } else if (isCandidateChoice && !isBenchmarkKey) {
                                cardStyle = "bg-rose-50 border-rose-300 text-rose-950 font-medium";
                              } else if (!isCandidateChoice && isBenchmarkKey) {
                                cardStyle = "bg-emerald-50/40 border-emerald-300 border-dashed text-emerald-900";
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl text-xs border transition-all flex items-center justify-between gap-3 ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                                        isCandidateChoice
                                          ? isBenchmarkKey
                                            ? "bg-emerald-600 text-white"
                                            : "bg-rose-600 text-white"
                                          : isBenchmarkKey
                                          ? "bg-emerald-200 text-emerald-900"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span>{opt.optionText}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isCandidateChoice && (
                                      <span
                                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                          isBenchmarkKey
                                            ? "bg-emerald-600 text-white"
                                            : "bg-rose-600 text-white"
                                        }`}
                                      >
                                        Candidate Choice
                                      </span>
                                    )}
                                    {isBenchmarkKey && (
                                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                                        ✓ Correct Key
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Objective Readout Summary Box */}
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Candidate Answer</span>
                              <span className="font-bold text-[#0F172A]">
                                {isAnswered ? (
                                  <>Option {selectedOptionInfo.letter}: <span className="font-medium text-slate-700">{selectedOptionInfo.text}</span></>
                                ) : (
                                  <span className="text-slate-400 italic">No answer recorded</span>
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Benchmark Answer Key</span>
                              <span className="font-bold text-emerald-800">
                                Option {correctOptionInfo.letter}: <span className="font-medium text-emerald-700">{correctOptionInfo.text}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Question Type 2: SJT (Situational Judgment Test - Single Selected Option)
                    if (q.questionType === "SJT_DUAL_SELECT") {
                      const selectedId = getCandidateSjtSelection(q.studentAnswer);
                      const isAnswered = Boolean(selectedId);
                      const selectedOptionInfo = getOptionLabel(q.options, selectedId);

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#4F46E5] font-mono">
                                  Q{qIdx + 1}.
                                </span>
                                {q.category && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {q.category}
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                                  Situational Judgment
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#0F172A] leading-snug pt-1">
                                {q.questionText}
                              </h4>
                            </div>

                            {/* Status Pill */}
                            <div>
                              {isAnswered ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3.5 h-3.5" /> Answer Recorded
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  Unanswered
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Scenario Options List */}
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
                              const isSelected = selectedId === opt.id;

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3.5 rounded-xl text-xs border transition-all flex items-center justify-between gap-3 ${
                                    isSelected
                                      ? "bg-[#EEF2FF] border-[#4F46E5] text-[#0F172A] font-semibold ring-1 ring-[#4F46E5]/30 shadow-2xs"
                                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                                        isSelected
                                          ? "bg-[#4F46E5] text-white"
                                          : "bg-white border border-[#CBD5E1] text-slate-700"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span className={isSelected ? "text-[#0F172A] font-medium" : "text-[#475569]"}>
                                      {opt.optionText}
                                    </span>
                                  </div>

                                  {isSelected && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#4F46E5] text-white shrink-0 shadow-2xs">
                                      Selected Option
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Selected Option Summary Readout */}
                          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
                            <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                              Student&apos;s Selected Response
                            </span>
                            <div className="font-bold text-[#0F172A] text-sm mt-0.5">
                              {isAnswered ? (
                                <>
                                  Option {selectedOptionInfo.letter}:{" "}
                                  <span className="font-normal text-[#334155]">{selectedOptionInfo.text}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic font-normal text-xs">No option selected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Question Type 3: LIKERT_5 / RATING_5 (Psychometric / Competency / RIASEC Interests)
                    if (q.questionType === "LIKERT_5" || q.questionType === "RATING_5") {
                      const rawScore = getCandidateLikertValue(q.studentAnswer);
                      const isAnswered = typeof rawScore === "number";
                      const directionalScore =
                        q.reverseKeyed && isAnswered ? 6 - rawScore : rawScore;

                      // Distinguish between RIASEC Vocational Interests (enjoyment scale) and Big Five / Competency (agreement scale)
                      const isInterests =
                        q.questionType === "RATING_5" ||
                        (activeSection?.title || "").toLowerCase().includes("interest") ||
                        (q.sectionTitle || "").toLowerCase().includes("interest") ||
                        [
                          "realistic",
                          "investigative",
                          "artistic",
                          "social",
                          "enterprising",
                          "conventional",
                        ].includes((q.category || "").toLowerCase());

                      const scaleItems = isInterests
                        ? [
                            { point: 1, label: "Would dislike it", subtext: "Strongly dislike" },
                            { point: 2, label: "Dislike", subtext: "Prefer to avoid" },
                            { point: 3, label: "Neutral", subtext: "Indifferent" },
                            { point: 4, label: "Enjoy", subtext: "Would like it" },
                            { point: 5, label: "Would love it", subtext: "Strongly enjoy" },
                          ]
                        : [
                            { point: 1, label: "Strongly Disagree", subtext: "Not at all me" },
                            { point: 2, label: "Disagree", subtext: "Rarely true" },
                            { point: 3, label: "Neutral", subtext: "Sometimes true" },
                            { point: 4, label: "Agree", subtext: "Usually true" },
                            { point: 5, label: "Strongly Agree", subtext: "Very accurately me" },
                          ];

                      const selectedScaleItem = isAnswered
                        ? scaleItems.find((item) => item.point === rawScore)
                        : null;

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#4F46E5] font-mono">
                                  Q{qIdx + 1}.
                                </span>
                                {q.category && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {q.category}
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  {isInterests ? "RIASEC 5-PT ENJOYMENT SCALE" : "5-PT LIKERT SCALE"}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#0F172A] leading-snug pt-1">
                                {q.questionText}
                              </h4>
                            </div>

                            {/* Reverse Keying Indicator Badge */}
                            <div>
                              {q.reverseKeyed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  <ArrowLeftRight className="w-3.5 h-3.5" /> Reverse-Keyed Item
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  Standard Direction
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 5-Point Scale Visual Steps */}
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                              {scaleItems.map((item) => {
                                const isSelected = isAnswered && rawScore === item.point;
                                return (
                                  <div
                                    key={item.point}
                                    className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                                      isSelected
                                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs font-bold ring-2 ring-[#0F172A]/20"
                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    <div className="text-sm sm:text-base font-black font-mono">{item.point}</div>
                                    <div
                                      className={`text-[10px] font-bold truncate mt-0.5 ${
                                        isSelected ? "text-white" : "text-[#0F172A]"
                                      }`}
                                      title={item.label}
                                    >
                                      {item.label}
                                    </div>
                                    <div
                                      className={`text-[9px] truncate ${
                                        isSelected ? "text-slate-300" : "text-slate-400"
                                      }`}
                                      title={item.subtext}
                                    >
                                      {item.subtext}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Objective Evaluator Reference Card */}
                          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                                  Candidate Raw Response
                                </span>
                                <span className="font-extrabold text-[#0F172A] text-sm">
                                  {isAnswered ? (
                                    <>
                                      <span className="font-mono">{rawScore} / 5</span>{" "}
                                      <span className="text-xs font-semibold text-slate-700">
                                        ({selectedScaleItem?.label})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 italic font-sans font-normal text-xs">Unanswered</span>
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                                  Directional Construct Index (Reference)
                                </span>
                                <span className="font-extrabold text-indigo-700 text-sm font-mono">
                                  {isAnswered ? (
                                    q.reverseKeyed ? (
                                      <>Index {directionalScore} <span className="text-xs font-normal text-slate-500 font-sans">(6 - {rawScore})</span></>
                                    ) : (
                                      `Index ${directionalScore} (Standard)`
                                    )
                                  ) : (
                                    <span className="text-slate-400 italic font-sans font-normal text-xs">-</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {q.reverseKeyed && (
                              <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200/80">
                                <strong>Evaluator Reference Note:</strong> Stored candidate response is unmodified ({rawScore}). Inversion index ({directionalScore}) is calculated exclusively as an objective evaluator aid.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Question Type 4: FORCED_RANKING (Work Values)
                    if (q.questionType === "FORCED_RANKING") {
                      const rank = getCandidateForcedRank(q.studentAnswer);
                      const isRanked = typeof rank === "number";
                      const isTop = isRanked && rank <= 3;
                      const isMid = isRanked && rank > 3 && rank <= 7;

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#4F46E5] font-mono">
                                  Q{qIdx + 1}.
                                </span>
                                {q.category && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {q.category}
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {q.questionType}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#0F172A] leading-snug pt-1">
                                {q.questionText}
                              </h4>
                            </div>

                            {/* Assigned Rank Badge */}
                            <div>
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black font-mono border ${
                                  isTop
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                                    : isMid
                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                                    : "bg-slate-100 text-slate-700 border-slate-300"
                                }`}
                              >
                                Assigned Rank: #{rank ?? "Unranked"} of 10
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs flex items-center justify-between">
                            <span className="text-slate-500">Value Hierarchy Tier:</span>
                            <span className="font-bold text-[#0F172A]">
                              {isTop ? "Top Priority (Ranks 1–3)" : isMid ? "Mid Priority (Ranks 4–7)" : "Lower Priority (Ranks 8–10)"}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Fallback for any other type
                    return (
                      <div
                        key={q.id}
                        className="p-4 sm:p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug">
                            <span className="text-[#4F46E5] mr-1.5 font-mono">Q{qIdx + 1}.</span>
                            {q.questionText}
                          </h4>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#64748B] border border-[#E2E8F0] shrink-0">
                            {q.questionType}
                          </span>
                        </div>

                        {/* Options Grid */}
                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt) => {
                            const isSelected =
                              q.studentAnswer === opt.id ||
                              q.studentAnswer?.selectedOptionId === opt.id ||
                              q.studentAnswer === opt.optionText;

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                                  isSelected
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                    : "bg-white border-[#E2E8F0] text-[#64748B]"
                                }`}
                              >
                                <span>{opt.optionText}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                                    Selected Option
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT COLUMN: PDF Report Publisher & History */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* PDF Upload Box */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
              <Upload className="w-4 h-4 text-[#FF6B6B]" />
              <h3>Upload Certified Report PDF</h3>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Upload the finalized candidate psychometric report (.pdf). Uploading automatically triggers state transition to <strong>Pending Admin Signoff</strong>.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-4 pt-2">
              <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#4F46E5] transition-colors rounded-xl p-6 text-center bg-[#F8FAFC]">
                <FileText className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload-input"
                />
                <label
                  htmlFor="pdf-upload-input"
                  className="text-xs font-bold text-[#4F46E5] hover:underline cursor-pointer block"
                >
                  {selectedFile ? selectedFile.name : "Choose PDF Document"}
                </label>
                <p className="text-[10px] text-[#94A3B8] mt-1">Maximum size 10MB (.pdf only)</p>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                  {uploadError}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-[#0F172A] hover:bg-black disabled:opacity-50 text-white shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-[#FF6B6B]" />
                <span>{isUploading ? "Uploading PDF..." : "Upload & Request Approval"}</span>
              </button>
            </form>
          </div>

          {/* Generated Reports List */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Certified Report Versions ({reportsList.length})
            </h3>

            {reportsList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#94A3B8]">
                No reports uploaded yet for this attempt.
              </div>
            ) : (
              <div className="space-y-3">
                {reportsList.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A]">
                        Version {rep.version}.0 PDF
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#64748B] font-mono truncate">
                      {rep.fileReference}
                    </div>

                    <a
                      href={rep.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline pt-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview PDF Document
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
