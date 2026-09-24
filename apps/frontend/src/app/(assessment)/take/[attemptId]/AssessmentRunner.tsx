"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  HelpCircle,
  Lock,
  ArrowRight,
  Home,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { saveResponseAction, submitAssessmentAction } from "@/app/actions/assessment";

interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  displayOrder: number;
}

interface Question {
  id: string;
  sectionId: string;
  version: number;
  questionText: string;
  questionType: "SINGLE_CHOICE" | "MULTI_CHOICE" | "LIKERT" | "YES_NO" | "RANKING";
  displayOrder: number;
  required: boolean;
  options: QuestionOption[];
}

interface AssessmentSection {
  id: string;
  assessmentId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  questions: Question[];
}

interface AssessmentData {
  attempt: {
    id: string;
    status: string;
    assessmentVersion: number;
    startedAt: Date;
    submittedAt: Date | null;
    isLocked: boolean;
  };
  assessment: {
    id: string;
    title: string;
    description: string;
    version: number;
    estimatedDurationMins: number;
    sections: AssessmentSection[];
  };
  savedResponses: Record<string, { answer: any; questionVersion: number; answeredAt: Date }>;
}

export default function AssessmentRunner({ initialData }: { initialData: AssessmentData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Flatten all questions across sections for linear navigation
  const allQuestions: { question: Question; section: AssessmentSection; index: number }[] = [];
  initialData.assessment.sections.forEach((section) => {
    section.questions.forEach((q) => {
      allQuestions.push({
        question: q,
        section,
        index: allQuestions.length,
      });
    });
  });

  const totalQuestions = allQuestions.length;

  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    Object.entries(initialData.savedResponses).forEach(([qId, val]) => {
      initial[qId] = val.answer;
    });
    return initial;
  });

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(initialData.attempt.isLocked);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(
    initialData.attempt.submittedAt ? new Date(initialData.attempt.submittedAt) : null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showGridDrawer, setShowGridDrawer] = useState(false);

  // Debounce ref for auto-saving
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{ questionId: string; questionVersion: number; answer: any } | null>(null);

  const currentItem = allQuestions[currentIndex];
  const currentQuestion = currentItem?.question;
  const currentSection = currentItem?.section;

  // Calculate answered count
  const answeredCount = Object.keys(answers).filter((qId) => answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== "").length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Immediate Save Function
  const executeSave = async (questionId: string, questionVersion: number, answer: any) => {
    if (isLocked) return;

    setSaveStatus("saving");
    try {
      const res = await saveResponseAction({
        attemptId: initialData.attempt.id,
        questionId,
        questionVersion,
        answer,
      });

      if (res.success) {
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } else {
        if (res.locked) {
          setIsLocked(true);
        }
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Auto-save error:", err);
      setSaveStatus("error");
    }
  };

  // Debounced answer handler
  const handleAnswerSelect = (questionId: string, questionVersion: number, value: any) => {
    if (isLocked) return;

    // 1. Immediately update UI state
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSaveStatus("unsaved");

    // 2. Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    pendingSaveRef.current = { questionId, questionVersion, answer: value };

    // 3. Debounce save by 600ms (Rule 4: ~500-1000ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      executeSave(questionId, questionVersion, value);
      pendingSaveRef.current = null;
    }, 600);
  };

  // Flush pending save immediately on navigation
  const flushPendingSave = () => {
    if (debounceTimerRef.current && pendingSaveRef.current) {
      clearTimeout(debounceTimerRef.current);
      const { questionId, questionVersion, answer } = pendingSaveRef.current;
      executeSave(questionId, questionVersion, answer);
      pendingSaveRef.current = null;
    }
  };

  const goToNext = () => {
    flushPendingSave();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const goToPrev = () => {
    flushPendingSave();
    if (isReviewMode) {
      setIsReviewMode(false);
      setCurrentIndex(totalQuestions - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    flushPendingSave();
    setIsReviewMode(false);
    setShowGridDrawer(false);
    setCurrentIndex(index);
  };

  // Final Submit Handler (Rule 5, 6, 7)
  const handleFinalSubmit = async () => {
    flushPendingSave();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitAssessmentAction({ attemptId: initialData.attempt.id });
      if (res.success) {
        setIsLocked(true);
        setSubmittedAt(new Date());
        setShowSubmitModal(false);
      } else {
        setSubmitError(res.message);
      }
    } catch {
      setSubmitError("An error occurred while submitting your assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already locked / submitted, render the locked confirmation screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#191F2D] selection:bg-[#FFD4CB]">
        {/* Minimal Header */}
        <header className="border-b border-[#E2E8F0] bg-white px-4 sm:px-8 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-lg sm:text-xl text-[#191F2D] tracking-tight">
                AuraPath
              </span>
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-full">
                Locked Assessment
              </span>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B] hover:underline"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Main Locked Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-xl bg-white rounded-[32px] border border-[#E2E8F0] shadow-xl p-6 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#191F2D] tracking-tight">
                Assessment Locked & Submitted
              </h1>
              <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto leading-relaxed">
                Your responses for the <span className="font-bold text-[#191F2D]">{initialData.assessment.title}</span> (v{initialData.assessment.version}) have been secured.
              </p>
            </div>

            {submittedAt && (
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs text-[#718096] flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6B6B]" />
                <span>Submitted on {submittedAt.toLocaleString()}</span>
              </div>
            )}

            <div className="p-4 bg-[#FFF8F5] border border-[#F5E6E0] rounded-2xl text-xs text-left text-[#718096] space-y-2">
              <div className="flex items-center gap-2 text-[#191F2D] font-bold">
                <Lock className="w-4 h-4 text-[#FF6B6B]" />
                <span>Expert Evaluation Workflow</span>
              </div>
              <p className="leading-relaxed">
                As per AuraPath&apos;s methodology, responses are evaluated by licensed career psychologists and psychometric experts rather than automated scoring algorithms.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-sm sm:text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Return to Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-gray-400">
          AuraPath Assessment Engine • v{initialData.assessment.version}
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#191F2D] selection:bg-[#FFD4CB]">
      {/* 1. DISTRACTION-FREE HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Assessment Name */}
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-base sm:text-lg text-[#191F2D] tracking-tight">
              AuraPath
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
            <span className="text-xs font-semibold text-[#718096] truncate max-w-[180px] sm:max-w-none">
              {initialData.assessment.title}
            </span>
          </div>

          {/* Center/Right: Save Indicator & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Auto-save status badge */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#718096]">
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B6B]" />
                  <span className="hidden xs:inline">Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xs:inline text-emerald-700">Saved</span>
                </>
              ) : saveStatus === "error" ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xs:inline text-amber-700">Sync Warning</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="hidden xs:inline">Unsaved</span>
                </>
              )}
            </div>

            {/* Quick Grid Drawer Toggle */}
            <button
              onClick={() => setShowGridDrawer(!showGridDrawer)}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-gray-50 text-[#718096] hover:text-[#191F2D] transition-colors cursor-pointer"
              title="View all questions overview"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Exit & Save */}
            <Link
              href="/dashboard"
              onClick={flushPendingSave}
              className="text-xs font-bold text-[#718096] hover:text-[#191F2D] px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
            >
              Save & Exit
            </Link>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="max-w-5xl mx-auto mt-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#718096] mb-1">
            <span>
              Question {isReviewMode ? totalQuestions : currentIndex + 1} of {totalQuestions}
            </span>
            <span>{progressPercent}% Complete ({answeredCount}/{totalQuestions} Answered)</span>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* 2. QUESTION QUICK-JUMP PALETTE MODAL/DRAWER */}
      {showGridDrawer && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-extrabold text-base text-[#191F2D]">Question Overview</h3>
              <button
                onClick={() => setShowGridDrawer(false)}
                className="text-xs font-bold text-[#718096] hover:text-[#191F2D] p-1"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 py-2">
              {allQuestions.map((item, idx) => {
                const isAnswered =
                  answers[item.question.id] !== undefined &&
                  answers[item.question.id] !== null &&
                  answers[item.question.id] !== "";
                const isCurrent = !isReviewMode && currentIndex === idx;

                return (
                  <button
                    key={item.question.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#191F2D] text-white ring-4 ring-[#191F2D]/20 shadow-md"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                        : "bg-[#F8FAFC] text-[#8C95A6] border border-[#E2E8F0] hover:bg-gray-100"
                    }`}
                  >
                    {idx + 1}
                    {isAnswered && !isCurrent && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs font-semibold text-[#718096]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#E2E8F0]" />
                <span>Remaining ({totalQuestions - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {isReviewMode ? (
          /* ========================================================================= */
          /* REVIEW & SUBMISSION OVERVIEW SCREEN                                        */
          /* ========================================================================= */
          <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">
                Step 2 of 2: Final Verification
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#191F2D] tracking-tight">
                Review Your Answers
              </h2>
              <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto">
                Please verify your responses before submitting. Once submitted, your assessment will be locked for expert evaluation.
              </p>
            </div>

            {/* Answered / Unanswered Counter Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                <div className="text-2xl sm:text-3xl font-black text-[#191F2D]">{totalQuestions}</div>
                <div className="text-xs font-bold text-[#718096] mt-0.5">Total Questions</div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">{answeredCount}</div>
                <div className="text-xs font-bold text-emerald-800 mt-0.5">Completed</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="text-2xl sm:text-3xl font-black text-amber-700">
                  {totalQuestions - answeredCount}
                </div>
                <div className="text-xs font-bold text-amber-800 mt-0.5">Unanswered</div>
              </div>
            </div>

            {/* Sections & Questions Breakdown */}
            <div className="space-y-6">
              {initialData.assessment.sections.map((sec, secIdx) => (
                <div key={sec.id} className="border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 space-y-3 bg-[#FCFDFD]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#191F2D]">{sec.title}</h3>
                    <span className="text-xs font-semibold text-[#718096]">
                      {sec.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length} / {sec.questions.length} answered
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sec.questions.map((q) => {
                      const overallIdx = allQuestions.findIndex((item) => item.question.id === q.id);
                      const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "";

                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs hover:border-[#FF6B6B]/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 pr-2 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 ${
                                isAnswered ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {overallIdx + 1}
                            </span>
                            <span className="font-medium text-[#191F2D] truncate">{q.questionText}</span>
                          </div>

                          <button
                            onClick={() => jumpToQuestion(overallIdx)}
                            className="shrink-0 text-xs font-bold text-[#FF6B6B] hover:underline cursor-pointer ml-2"
                          >
                            {isAnswered ? "Edit" : "Answer"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 justify-between border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={goToPrev}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-sm text-[#191F2D] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Questions</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-base shadow-[0_10px_25px_rgba(255,107,107,0.35)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Confirm & Submit Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* QUESTION DISPLAY & ANSWERING                                              */
          /* ========================================================================= */
          <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in">
            {/* Section Banner */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#FFF8F5] border border-[#F4E3DC] text-[#FF6B6B] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                  {currentSection.title}
                </span>
                {currentQuestion.required && (
                  <span className="text-[11px] font-semibold text-[#8C95A6]">* Required</span>
                )}
              </div>
              {currentSection.description && (
                <p className="text-xs text-[#718096] pt-1">{currentSection.description}</p>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-2xl bg-[#191F2D] text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {currentIndex + 1}
                </span>
                <h2 className="text-question text-[#191F2D]">
                  {currentQuestion.questionText}
                </h2>
              </div>
            </div>

            {/* Answer Options Renderers */}
            <div className="pt-2">
              {currentQuestion.questionType === "LIKERT" ? (
                /* ----------------- LIKERT SCALE RENDERER ----------------- */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 sm:gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.displayOrder;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            handleAnswerSelect(currentQuestion.id, currentQuestion.version, option.displayOrder)
                          }
                          className={`group p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF8F5] border-[#FF6B6B] ring-4 ring-[#FF6B6B]/15 shadow-md"
                              : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-gray-50/50"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#FF6B6B] text-white shadow-sm"
                                : "bg-[#F1F5F9] text-[#718096] group-hover:bg-[#E2E8F0]"
                            }`}
                          >
                            {option.displayOrder}
                          </div>
                          <span
                            className={`text-xs font-semibold leading-snug ${
                              isSelected ? "text-[#FF6B6B]" : "text-[#718096]"
                            }`}
                          >
                            {option.optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="hidden sm:flex items-center justify-between text-xs font-medium text-[#8C95A6] px-1">
                    <span>← Strongly Disagree</span>
                    <span>Neutral</span>
                    <span>Strongly Agree →</span>
                  </div>
                </div>
              ) : (
                /* ----------------- SINGLE CHOICE RENDERER ----------------- */
                <div className="space-y-3">
                  {currentQuestion.options.map((option, optIdx) => {
                    const optionLetter = String.fromCharCode(65 + optIdx);
                    const isSelected = answers[currentQuestion.id] === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          handleAnswerSelect(currentQuestion.id, currentQuestion.version, option.id)
                        }
                        className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF8F5] border-[#FF6B6B] ring-4 ring-[#FF6B6B]/15 shadow-sm"
                            : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all shrink-0 ${
                              isSelected
                                ? "bg-[#FF6B6B] text-white shadow-sm"
                                : "bg-[#F1F5F9] text-[#718096]"
                            }`}
                          >
                            {optionLetter}
                          </span>
                          <span
                            className={`text-option font-medium ${
                              isSelected ? "text-[#191F2D] font-semibold" : "text-[#4A5568]"
                            }`}
                          >
                            {option.optionText}
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? "border-[#FF6B6B] bg-[#FF6B6B]" : "border-[#CBD5E1] bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="pt-6 flex items-center justify-between border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="px-5 py-3 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-xs sm:text-sm text-[#191F2D] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="px-7 py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(255,107,107,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{currentIndex === totalQuestions - 1 ? "Review & Submit" : "Next Question"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. CONFIRMATION SUBMIT MODAL (Rule 6: Confirmation Step) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-6">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-[#191F2D]">Submit Assessment?</h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Once submitted, your responses are permanently <span className="font-bold text-[#191F2D]">locked</span> and routed to our expert team for manual evaluation. You will not be able to modify your answers.
              </p>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Notice: You have <strong>{totalQuestions - answeredCount} unanswered</strong> questions. You can still submit, but completing all questions is recommended for comprehensive assessment.
                </span>
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="py-3.5 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-xs sm:text-sm text-[#191F2D] transition-all cursor-pointer"
              >
                Keep Editing
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="py-3.5 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(255,107,107,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Yes, Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="text-center py-3 text-[11px] text-[#A0AEC0]">
        Distraction-Free Assessment Mode • Section {currentIndex < totalQuestions ? currentItem.section.displayOrder : 3} of {initialData.assessment.sections.length}
      </footer>
    </div>
  );
}
