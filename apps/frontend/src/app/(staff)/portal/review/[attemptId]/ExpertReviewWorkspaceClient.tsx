"use client";

import { useState } from "react";
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
} from "lucide-react";
import { AttemptStatus, ReportStatus } from "@prisma/client";
import { updateSubmissionStatusAction, uploadSubmissionReportAction } from "@/app/actions/staff";

interface VersionedQuestion {
  id: string;
  questionText: string;
  questionType: string;
  version: number;
  displayOrder: number;
  required: boolean;
  sectionTitle: string;
  sectionDisplayOrder: number;
  options: { id: string; optionText: string; displayOrder: number }[];
  studentAnswer: any;
  answeredAt?: string;
}

interface SectionDetail {
  id: string;
  title: string;
  description?: string | null;
  questions: VersionedQuestion[];
}

interface ReportItem {
  id: string;
  version: number;
  status: ReportStatus;
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

  const totalAnswered = submission.sections.reduce((acc, sec) => {
    return acc + sec.questions.filter((q) => q.studentAnswer !== null && q.studentAnswer !== undefined).length;
  }, 0);

  const totalQuestions = submission.sections.reduce((acc, sec) => acc + sec.questions.length, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Candidate Overview Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-xs">
              {studentFullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {studentFullName}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  ID: {submission.student.id.slice(-6)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] mt-1.5 font-medium">
                {submission.student.email && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#94A3B8]" /> {submission.student.email}
                  </span>
                )}
                {submission.student.school && (
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-[#94A3B8]" /> {submission.student.school} {submission.student.grade ? `(Grade ${submission.student.grade})` : ""}
                  </span>
                )}
                {submission.student.country && (
                  <span>Country: {submission.student.country}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs">
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

          {/* Transition Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStatus === AttemptStatus.SUBMITTED && (
              <button
                onClick={() => handleStatusTransition(AttemptStatus.UNDER_REVIEW)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 text-xs font-bold bg-[#0F172A] text-white px-4 py-2.5 rounded-xl hover:bg-black disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                {isUpdatingStatus ? "Updating..." : "Start Evaluation (Move to Under Review)"}
              </button>
            )}

            {currentStatus === AttemptStatus.UNDER_REVIEW && (
              <button
                onClick={() => handleStatusTransition(AttemptStatus.REPORT_IN_PREP)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 text-xs font-bold bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl hover:bg-[#4338CA] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
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
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Candidate Trajectory Reader</h2>
                <p className="text-xs text-[#64748B]">Inspect response selections across dilemma quests.</p>
              </div>

              <span className="text-xs font-bold px-3 py-1 bg-[#F8FAFC] text-[#0F172A] rounded-lg border border-[#E2E8F0]">
                {submission.sections.length} Quests Total
              </span>
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
              <div className="space-y-4 pt-2">
                {activeSection.questions.map((q, qIdx) => (
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
                ))}
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
