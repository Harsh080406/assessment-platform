"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  ArrowLeft,
  Home,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { saveResponseAction, submitAssessmentAction } from "@/app/actions/assessment";
import { QuestionType } from "@prisma/client";
import LikertScaleControl from "./components/LikertScaleControl";
import WorkValuesForcedRankingControl from "./components/WorkValuesForcedRankingControl";
import SJTDualSelectControl from "./components/SJTDualSelectControl";
import MCQSingleCorrectControl from "./components/MCQSingleCorrectControl";

interface QuestionOption {
  id: string;
  questionId?: string;
  optionText: string;
  displayOrder: number;
}

interface Question {
  id: string;
  sectionId: string;
  version: number;
  questionText: string;
  questionType: QuestionType;
  category?: string;
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

const cardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    rotateY: direction > 0 ? 50 : -50,
    z: -120,
    opacity: 0,
    scale: 0.94,
    transformPerspective: 1400,
  }),
  center: {
    zIndex: 1,
    x: 0,
    rotateY: 0,
    z: 0,
    opacity: 1,
    scale: 1,
    transformPerspective: 1400,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25, mass: 0.8 },
      rotateY: { type: "spring", stiffness: 280, damping: 24, mass: 0.8 },
      scale: { type: "spring", stiffness: 320, damping: 26, mass: 0.8 },
      z: { type: "spring", stiffness: 280, damping: 25 },
      opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction > 0 ? -80 : 80,
    rotateY: direction > 0 ? -50 : 50,
    z: -120,
    opacity: 0,
    scale: 0.94,
    transformPerspective: 1400,
    transition: {
      x: { type: "spring", stiffness: 340, damping: 28, mass: 0.8 },
      rotateY: { type: "spring", stiffness: 320, damping: 26, mass: 0.8 },
      scale: { duration: 0.16, ease: [0.32, 0, 0.67, 0] },
      z: { duration: 0.16 },
      opacity: { duration: 0.16, ease: "easeOut" },
    },
  }),
};

export default function AssessmentRunner({
  initialData,
  initialSectionParam,
}: {
  initialData: AssessmentData;
  initialSectionParam?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const sections = initialData.assessment.sections;
  const MODULE_LETTERS = ["A", "B", "C", "D", "E"];

  // Resolve initial active section from URL query or default to first section
  const resolveInitialSectionId = (): string => {
    if (!initialSectionParam) return sections[0]?.id || "";
    const param = initialSectionParam.trim();

    // 1. Numeric index e.g. "0", "1", "2", "3"
    const numericIdx = parseInt(param, 10);
    if (!isNaN(numericIdx) && numericIdx >= 0 && numericIdx < sections.length) {
      return sections[numericIdx].id;
    }

    // 2. Exact section ID match
    const byId = sections.find((s) => s.id === param);
    if (byId) return byId.id;

    // 3. Module letter match ("A", "B", "C", "D")
    const letterIdx = MODULE_LETTERS.indexOf(param.toUpperCase());
    if (letterIdx !== -1 && letterIdx < sections.length) {
      return sections[letterIdx].id;
    }

    // 4. Track slug match
    const slugMap: Record<string, number> = {
      "psychometric-diagnostic": 0,
      "personality-work-style": 1,
      "cognitive-analytical": 2,
      "career-domain-fit": 3,
    };
    if (slugMap[param] !== undefined && slugMap[param] < sections.length) {
      return sections[slugMap[param]].id;
    }

    return sections[0]?.id || "";
  };

  // Section & Question State
  const [activeSectionId, setActiveSectionId] = useState<string>(resolveInitialSectionId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  // Active section and its corresponding questions
  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const activeSectionIndex = sections.findIndex((s) => s.id === activeSection?.id);
  const currentSectionQuestions = activeSection?.questions || [];
  const totalSectionQuestions = currentSectionQuestions.length;
  const currentModuleLetter = MODULE_LETTERS[activeSectionIndex] || String(activeSectionIndex + 1);

  const currentQuestion = currentSectionQuestions[currentQuestionIndex] || currentSectionQuestions[0];
  const currentSection = activeSection;
  const isForcedRankingActive = currentQuestion?.questionType === QuestionType.FORCED_RANKING;

  // Flattened questions list for global stats & review mode
  const allQuestions = useMemo(
    () => sections.flatMap((sec) => sec.questions.map((q) => ({ question: q, section: sec }))),
    [sections]
  );
  const totalQuestions = allQuestions.length;

  // Work Values questions within the active section
  const forcedQuestions = useMemo(
    () => currentSectionQuestions.filter((item) => item.questionType === QuestionType.FORCED_RANKING),
    [currentSectionQuestions]
  );

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
  const [clientValidationError, setClientValidationError] = useState<string | null>(null);
  const [showGridDrawer, setShowGridDrawer] = useState(false);

  // Debounce ref for auto-saving
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{ questionId: string; questionVersion: number; answer: any } | null>(null);

  // Validation function: Determines whether a given question is properly answered
  const isQuestionAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null || ans === "") return false;

    if (q.questionType === QuestionType.LIKERT_5 || q.questionType === QuestionType.RATING_5) {
      const val = typeof ans === "number" ? ans : ans?.value;
      return typeof val === "number" && val >= 1 && val <= 5;
    }

    if (q.questionType === QuestionType.FORCED_RANKING) {
      const rank = typeof ans === "number" ? ans : ans?.rank;
      return typeof rank === "number" && rank >= 1 && rank <= 10;
    }

    if (q.questionType === QuestionType.SJT_DUAL_SELECT) {
      if (typeof ans === "string") return ans.length > 0;
      const selectedId = ans?.selected || ans?.selectedOptionId || ans?.mostEffective;
      return typeof selectedId === "string" && selectedId.length > 0;
    }

    if (q.questionType === QuestionType.MCQ_SINGLE_CORRECT) {
      if (typeof ans === "string") return ans.length > 0;
      return typeof ans?.selected === "string" && ans.selected.length > 0;
    }

    return true;
  };

  // Check if Work Values section has all 10 unique ranks 1..10
  const isForcedRankingComplete = useMemo(() => {
    if (forcedQuestions.length === 0) return true;
    const ranks = forcedQuestions
      .map((q) => {
        const a = answers[q.id];
        return typeof a === "number" ? a : a?.rank;
      })
      .filter((r): r is number => typeof r === "number" && r >= 1 && r <= 10);
    return ranks.length === forcedQuestions.length && new Set(ranks).size === forcedQuestions.length;
  }, [forcedQuestions, answers]);

  // Section-specific & overall counts
  const sectionAnsweredCount = currentSectionQuestions.filter((q) => isQuestionAnswered(q)).length;
  const sectionProgressPercent =
    totalSectionQuestions > 0 ? Math.round((sectionAnsweredCount / totalSectionQuestions) * 100) : 0;

  const totalAnsweredCount = allQuestions.filter((item) => isQuestionAnswered(item.question)).length;
  const answeredCount = totalAnsweredCount;
  const overallProgressPercent = totalQuestions > 0 ? Math.round((totalAnsweredCount / totalQuestions) * 100) : 0;

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

    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSaveStatus("unsaved");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    pendingSaveRef.current = { questionId, questionVersion, answer: value };

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

  // Switch to a specific module
  const switchSection = (newSectionId: string, targetQuestionIdx: number = 0) => {
    flushPendingSave();
    setClientValidationError(null);
    setIsReviewMode(false);
    setShowGridDrawer(false);
    setDirection(1);
    setActiveSectionId(newSectionId);
    setCurrentQuestionIndex(targetQuestionIdx);
  };

  // Navigation handlers within current module
  const goToNext = () => {
    flushPendingSave();
    setClientValidationError(null);
    setDirection(1);

    // 1. Validation for FORCED_RANKING
    if (isForcedRankingActive) {
      if (!isForcedRankingComplete) {
        setClientValidationError(
          "Please assign a unique rank (1–10) to each of the 10 Work Values before proceeding."
        );
        return;
      }
      const lastForced = currentSectionQuestions.findLastIndex((q) => q.questionType === QuestionType.FORCED_RANKING);
      if (lastForced !== -1 && lastForced < totalSectionQuestions - 1) {
        setCurrentQuestionIndex(lastForced + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else {
        // Reached end of module
        setIsReviewMode(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    // 2. Validation for SJT_DUAL_SELECT
    if (currentQuestion?.questionType === QuestionType.SJT_DUAL_SELECT) {
      const ans = answers[currentQuestion.id];
      const selectedId =
        typeof ans === "string"
          ? ans
          : ans?.selected || ans?.selectedOptionId || ans?.mostEffective;
      if (currentQuestion.required && (!selectedId || typeof selectedId !== "string" || selectedId.length === 0)) {
        setClientValidationError(
          "Please select an option before continuing."
        );
        return;
      }
    }

    // Advance within current module
    if (currentQuestionIndex < totalSectionQuestions - 1) {
      const nextIdx = currentQuestionIndex + 1;
      const firstForced = currentSectionQuestions.findIndex((q) => q.questionType === QuestionType.FORCED_RANKING);
      if (currentSectionQuestions[nextIdx]?.questionType === QuestionType.FORCED_RANKING && firstForced !== -1) {
        setCurrentQuestionIndex(firstForced);
      } else {
        setCurrentQuestionIndex(nextIdx);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Reached the end of this module -> Review this module only
      setIsReviewMode(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrev = () => {
    flushPendingSave();
    setClientValidationError(null);
    setDirection(-1);

    if (isReviewMode) {
      setIsReviewMode(false);
      return;
    }

    if (isForcedRankingActive) {
      const firstForced = currentSectionQuestions.findIndex((q) => q.questionType === QuestionType.FORCED_RANKING);
      if (firstForced > 0) {
        setCurrentQuestionIndex(firstForced - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      const firstForced = currentSectionQuestions.findIndex((q) => q.questionType === QuestionType.FORCED_RANKING);
      if (currentSectionQuestions[prevIdx]?.questionType === QuestionType.FORCED_RANKING && firstForced !== -1) {
        setCurrentQuestionIndex(firstForced);
      } else {
        setCurrentQuestionIndex(prevIdx);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const jumpToQuestion = (index: number) => {
    flushPendingSave();
    setClientValidationError(null);
    setIsReviewMode(false);
    setShowGridDrawer(false);
    setDirection(index >= currentQuestionIndex ? 1 : -1);
    const firstForced = currentSectionQuestions.findIndex((q) => q.questionType === QuestionType.FORCED_RANKING);
    if (currentSectionQuestions[index]?.questionType === QuestionType.FORCED_RANKING && firstForced !== -1) {
      setCurrentQuestionIndex(firstForced);
    } else {
      setCurrentQuestionIndex(index);
    }
  };

  // Final Submit Handler (Rule 5, 6, 7)
  const handleFinalSubmit = async () => {
    flushPendingSave();
    setSubmitError(null);

    // Validate Work Values Forced Ranking completeness
    if (!isForcedRankingComplete) {
      setSubmitError(
        "Cannot submit: The Work Values ranking section requires all 10 items to have a unique rank (1–10) with no duplicates or missing ranks."
      );
      setShowSubmitModal(false);
      return;
    }

    setIsSubmitting(true);
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
                Alderwood Vantage
              </span>
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-full">
                Locked Assessment
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#FF6B6B] hover:underline flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Locked Content Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-8 sm:p-10 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#191F2D]">
                Assessment Submitted
              </h1>
              <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
                Your responses have been securely locked and transmitted to our expert advisory team. No further modifications can be made.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#718096]">Status:</span>
                <span className="font-bold text-emerald-700">SUBMITTED (LOCKED)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Assessment Version:</span>
                <span className="font-medium text-[#191F2D]">v{initialData.attempt.assessmentVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Submitted At:</span>
                <span className="font-medium text-[#191F2D]">
                  {submittedAt ? submittedAt.toLocaleString() : "Just now"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Total Evaluated Items:</span>
                <span className="font-medium text-[#191F2D]">{answeredCount} of {totalQuestions} answered</span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Return to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-[#A0AEC0]">
          Alderwood Vantage Assessment Platform • Integrity Enforced
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#191F2D] selection:bg-[#FFD4CB]">
      {/* 1. TOP MINIMALIST CHROME HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-3 sm:px-6 md:px-8 lg:px-12 py-2.5 sm:py-3.5 transition-all">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo, Back Link & Module Context */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="font-black text-base sm:text-xl text-[#191F2D] tracking-tight shrink-0">
              Alderwood Vantage
            </span>
            <div className="h-4 w-[1px] bg-[#E2E8F0] shrink-0" />
            <Link
              href="/dashboard/assessments"
              onClick={flushPendingSave}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-bold text-[#475569] hover:text-[#0F172A] transition-colors shrink-0 shadow-2xs touch-manipulation"
              title="Return to modules dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B6B]" />
              <span className="hidden xs:inline">Modules</span>
            </Link>
            <div className="flex items-center gap-1.5 truncate">
              <span className="px-2 sm:px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[10px] sm:text-[11px] font-black tracking-wide shrink-0">
                Module {currentModuleLetter}
              </span>
              <span className="hidden md:inline-block text-xs font-bold text-[#191F2D] truncate">
                {activeSection.title}
              </span>
            </div>
          </div>

          {/* Center/Right Status Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Auto-save Status Pill */}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                saveStatus === "saving"
                  ? "bg-amber-50 text-amber-700"
                  : saveStatus === "saved"
                  ? "bg-emerald-50 text-emerald-700"
                  : saveStatus === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="w-3 h-3 shrink-0 text-emerald-600" />
                  <span className="hidden sm:inline">Saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle className="w-3 h-3 shrink-0 text-red-600" />
                  <span className="hidden sm:inline">Failed</span>
                </>
              )}
              {saveStatus === "unsaved" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Unsaved</span>
                </>
              )}
            </div>

            {/* Quick Grid Drawer Toggle */}
            <button
              onClick={() => setShowGridDrawer(!showGridDrawer)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-gray-50 text-[#718096] hover:text-[#191F2D] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold touch-manipulation active:bg-gray-100"
              title="View module questions overview"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Questions</span>
            </button>

            {/* Exit & Save */}
            <Link
              href="/dashboard/assessments"
              onClick={flushPendingSave}
              className="text-xs font-bold text-[#718096] hover:text-[#191F2D] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-gray-50 transition-colors shrink-0 touch-manipulation"
            >
              <span className="sm:hidden">Exit</span>
              <span className="hidden sm:inline">Save & Exit</span>
            </Link>
          </div>
        </div>

        {/* Linear Progress Bar for Active Module */}
        <div className="w-full mt-2">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#718096] mb-1">
            <span>
              {isForcedRankingActive ? (
                <>
                  <span className="sm:hidden">Q33–42 • Work Values</span>
                  <span className="hidden sm:inline">Module {currentModuleLetter} • Questions 33–42 of {totalSectionQuestions} (Work Values)</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Q{currentQuestionIndex + 1} of {totalSectionQuestions}</span>
                  <span className="hidden sm:inline">Module {currentModuleLetter} • Question {currentQuestionIndex + 1} of {totalSectionQuestions}</span>
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#FF6B6B]">
                {sectionAnsweredCount}/{totalSectionQuestions} ({sectionProgressPercent}%)
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full transition-all duration-300"
              style={{ width: `${sectionProgressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* 2. QUESTION QUICK-JUMP PALETTE MODAL/DRAWER (SCOPED ONLY TO THIS MODULE) */}
      {showGridDrawer && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#E2E8F0] space-y-3 sm:space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#191F2D] truncate">
                  Module {currentModuleLetter}: {activeSection.title}
                </h3>
                <p className="text-xs text-[#718096]">
                  {sectionAnsweredCount} of {totalSectionQuestions} questions answered
                </p>
              </div>
              <button
                onClick={() => setShowGridDrawer(false)}
                className="text-xs font-bold text-[#718096] hover:text-[#191F2D] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer shrink-0 touch-manipulation"
              >
                Close
              </button>
            </div>

            {/* Questions Grid for current module ONLY */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 py-2 overflow-y-auto flex-1 pr-1">
              {currentSectionQuestions.map((q, idx) => {
                const isAnswered = isQuestionAnswered(q);
                const isCurrent =
                  !isReviewMode &&
                  (currentQuestionIndex === idx ||
                    (isForcedRankingActive && q.questionType === QuestionType.FORCED_RANKING));

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-11 sm:h-10 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 ${
                      isCurrent
                        ? "bg-[#191F2D] text-white ring-3 ring-[#191F2D]/20 shadow-sm"
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

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11px] sm:text-xs font-semibold text-[#718096] shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered ({sectionAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                <span>Remaining ({totalSectionQuestions - sectionAnsweredCount})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 w-full px-3 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3.5 flex flex-col justify-center overflow-x-hidden">
        <div style={{ perspective: 1400 }} className="w-full">
          <AnimatePresence mode="wait" custom={direction}>
            {isReviewMode ? (
              /* ========================================================================= */
              /* REVIEW & SUBMIT SUMMARY VIEW                                              */
              /* ========================================================================= */
              <motion.div
                key={`review-${activeSectionId}`}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="w-full"
              >
                <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8F5] text-[#FF6B6B] flex items-center justify-center mx-auto font-black text-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-[#191F2D]">
                Module {currentModuleLetter} Review
              </h2>
              <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto">
                Review your responses for <strong className="text-[#191F2D]">{activeSection.title}</strong> before completing this module.
              </p>
            </div>

            {/* Answered / Unanswered Counter Card for THIS MODULE ONLY */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-2.5 sm:p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl">
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-[#191F2D]">{totalSectionQuestions}</div>
                <div className="text-[10px] sm:text-xs font-bold text-[#718096] mt-0.5">Module Qs</div>
              </div>
              <div className="p-2.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl">
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-emerald-700">{sectionAnsweredCount}</div>
                <div className="text-[10px] sm:text-xs font-bold text-emerald-800 mt-0.5">Completed</div>
              </div>
              <div className="p-2.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl">
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-amber-700">
                  {totalSectionQuestions - sectionAnsweredCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-amber-800 mt-0.5">Unanswered</div>
              </div>
            </div>

            {/* Questions Breakdown FOR THIS MODULE ONLY */}
            <div className="border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 space-y-3 bg-[#FCFDFD]">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                    {currentModuleLetter}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-base text-[#191F2D]">
                    {activeSection.title} Questions
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#718096]">
                  {sectionAnsweredCount} / {totalSectionQuestions} answered
                </span>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {currentSectionQuestions.map((q, qInSecIdx) => {
                  const isAnswered = isQuestionAnswered(q);

                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs hover:border-[#FF6B6B]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 pr-2 min-w-0">
                        <span
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 ${
                            isAnswered ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {qInSecIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium text-[#191F2D] text-xs sm:text-sm line-clamp-1">{q.questionText}</span>
                          {q.category && (
                            <span className="text-[10px] text-[#94A3B8] font-medium block">
                              {q.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => jumpToQuestion(qInSecIdx)}
                        className="px-2.5 py-1 rounded-lg bg-[#FF6B6B]/10 hover:bg-[#FF6B6B] text-[#FF6B6B] hover:text-white font-bold text-xs transition-colors shrink-0 ml-2 touch-manipulation"
                      >
                        {isAnswered ? "Edit" : "Answer"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 justify-between border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setDirection(-1);
                  setIsReviewMode(false);
                }}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-xs sm:text-sm text-[#191F2D] transition-all cursor-pointer flex items-center justify-center gap-2 touch-manipulation active:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Questions</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/dashboard/assessments"
                  onClick={flushPendingSave}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-900 bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs touch-manipulation"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Done Module {currentModuleLetter} • Return to Modules</span>
                </Link>

                {totalQuestions - totalAnsweredCount === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <span>Submit Entire Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : isForcedRankingActive ? (
        /* ========================================================================= */
        /* SECTION-LEVEL FORCED RANKING WORK VALUES WORKSPACE                        */
        /* ========================================================================= */
        <motion.div
          key={`forced-ranking-${activeSectionId}`}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="w-full"
        >
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#FFF8F5] border border-[#F4E3DC] text-[#FF6B6B] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                  Module {currentModuleLetter}: {activeSection.title} • Work Values
                </span>
                <span className="text-[11px] font-semibold text-[#8C95A6]">* All 10 Required</span>
              </div>
              {activeSection.description && (
                <p className="text-xs text-[#718096] pt-1">{activeSection.description}</p>
              )}
            </div>

            {/* Navigation: Previous (Top Left) & Save Ranks (Top Right) */}
            <div className="flex items-center justify-between gap-2 pt-1 pb-1.5 border-y border-[#F1F5F9]">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentQuestionIndex === 0}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-xs sm:text-sm text-[#191F2D] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation active:bg-gray-100 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(255,107,107,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation"
              >
                <span>Save Ranks & Review Module {currentModuleLetter}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {clientValidationError && (
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{clientValidationError}</span>
              </div>
            )}

            <WorkValuesForcedRankingControl
              questions={forcedQuestions}
              answers={answers}
              disabled={isLocked}
              onRankChange={(qId, qVersion, rank) => {
                setClientValidationError(null);
                handleAnswerSelect(qId, qVersion, { rank });
              }}
            />

            {/* Navigation Footer */}
            <div className="pt-4 sm:pt-6 flex items-center justify-between gap-2.5 sm:gap-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentQuestionIndex === 0}
                className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-xs sm:text-sm text-[#191F2D] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation active:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(255,107,107,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2 touch-manipulation"
              >
                <span>Save Ranks & Review Module {currentModuleLetter}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ========================================================================= */
        /* QUESTION DISPLAY & ANSWERING (LIKERT_5, RATING_5, SJT, MCQ)               */
        /* ========================================================================= */
        <motion.div
          key={currentQuestion.id}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="w-full"
        >
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
            {/* Section Banner */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 sm:px-3 py-0.5 bg-[#FFF8F5] border border-[#F4E3DC] text-[#FF6B6B] text-[10px] sm:text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                  Module {currentModuleLetter}: {activeSection.title}
                </span>
                {currentQuestion.category && (
                  <span className="px-2 sm:px-2.5 py-0.5 bg-[#F1F5F9] text-[#4A5568] text-[10px] font-bold rounded-md">
                    {currentQuestion.category}
                  </span>
                )}
                {currentQuestion.required && (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#8C95A6]">* Required</span>
                )}
              </div>
              {activeSection.description && (
                <p className="text-xs text-[#718096] pt-0.5 line-clamp-1">{activeSection.description}</p>
              )}
            </div>

            {/* Validation Message if blocked */}
            {clientValidationError && (
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{clientValidationError}</span>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#191F2D] text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {currentQuestionIndex + 1}
                </span>
                <h2 className="text-sm sm:text-base md:text-lg font-bold leading-snug text-[#0F172A]">
                  {currentQuestion.questionText}
                </h2>
              </div>
            </div>

            {/* Navigation: Previous (Top Left) & Next (Top Right) below question line */}
            <div className="flex items-center justify-between gap-2 pt-1 pb-1.5 border-y border-[#F1F5F9]">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentQuestionIndex === 0}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-gray-50 font-bold text-xs sm:text-sm text-[#191F2D] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation active:bg-gray-100 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(255,107,107,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation"
              >
                {currentQuestionIndex === totalSectionQuestions - 1 ? (
                  <>
                    <span>Review Module {currentModuleLetter}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Answer Control by questionType */}
            <div className="pt-0.5 sm:pt-1">
              {currentQuestion.questionType === QuestionType.LIKERT_5 ||
              currentQuestion.questionType === QuestionType.RATING_5 ? (
                <LikertScaleControl
                  questionId={currentQuestion.id}
                  category={currentQuestion.category}
                  questionType={currentQuestion.questionType}
                  sectionTitle={activeSection.title}
                  currentValue={
                    typeof answers[currentQuestion.id] === "number"
                      ? answers[currentQuestion.id]
                      : answers[currentQuestion.id]?.value
                  }
                  disabled={isLocked}
                  onChange={(val) => {
                    setClientValidationError(null);
                    handleAnswerSelect(currentQuestion.id, currentQuestion.version, val);
                  }}
                />
              ) : currentQuestion.questionType === QuestionType.SJT_DUAL_SELECT ? (
                <SJTDualSelectControl
                  questionId={currentQuestion.id}
                  questionVersion={currentQuestion.version}
                  questionText={currentQuestion.questionText}
                  options={currentQuestion.options}
                  currentAnswer={answers[currentQuestion.id]}
                  disabled={isLocked}
                  onChange={(val) => {
                    setClientValidationError(null);
                    handleAnswerSelect(currentQuestion.id, currentQuestion.version, val);
                  }}
                />
              ) : (
                <MCQSingleCorrectControl
                  questionId={currentQuestion.id}
                  questionVersion={currentQuestion.version}
                  options={currentQuestion.options}
                  selectedOptionId={
                    typeof answers[currentQuestion.id] === "string"
                      ? answers[currentQuestion.id]
                      : answers[currentQuestion.id]?.selected
                  }
                  disabled={isLocked}
                  onChange={(val) => {
                    setClientValidationError(null);
                    handleAnswerSelect(currentQuestion.id, currentQuestion.version, val);
                  }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</main>

      {/* 4. CONFIRMATION SUBMIT MODAL (Rule 6: Confirmation Step) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div className="text-center space-y-1.5 sm:space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-[#191F2D]">Submit Assessment?</h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Once submitted, your responses are permanently <span className="font-bold text-[#191F2D]">locked</span> and routed to our expert team for manual evaluation. You will not be able to modify your answers.
              </p>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  Notice: You have <strong>{totalQuestions - answeredCount} unanswered</strong> questions. You can still submit, but completing all questions is recommended for comprehensive assessment.
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-white hover:bg-gray-50 text-xs font-bold text-[#718096] transition-all cursor-pointer disabled:opacity-50 touch-manipulation active:bg-gray-100"
              >
                Keep Editing
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-1/2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FF6B6B] hover:bg-[#F95858] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Locking...</span>
                  </>
                ) : (
                  <span>Yes, Submit & Lock</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="text-center py-4 text-xs text-[#A0AEC0] border-t border-[#E2E8F0] bg-white">
        Alderwood Vantage Assessment Platform • Multi-battery Diagnostic Engine
      </footer>
    </div>
  );
}
