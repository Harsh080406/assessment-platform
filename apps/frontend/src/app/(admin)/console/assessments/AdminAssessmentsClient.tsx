"use client";

import { useState, useTransition } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Info,
  Search,
} from "lucide-react";
import { QuestionType } from "@prisma/client";
import { updateQuestionAction } from "@/app/actions/admin";
import AdminStatusPill, { AdminTag } from "@/components/admin/AdminStatusPill";
import { pluralize } from "@/components/admin/AdminDataTable";

interface QuestionItem {
  id: string;
  questionText: string;
  questionType: QuestionType;
  version: number;
  displayOrder: number;
  required: boolean;
  responsesCount: number;
  options: Array<{ id: string; optionText: string; displayOrder: number }>;
}

interface SectionItem {
  id: string;
  title: string;
  displayOrder: number;
  questions: QuestionItem[];
}

interface AssessmentItem {
  id: string;
  title: string;
  description: string;
  version: number;
  status: string;
  sectionsCount: number;
  questionsCount: number;
  attemptsCount: number;
  sections: SectionItem[];
}

interface AdminAssessmentsClientProps {
  initialAssessments: AssessmentItem[];
}

export default function AdminAssessmentsClient({ initialAssessments }: AdminAssessmentsClientProps) {
  const [assessments, setAssessments] = useState<AssessmentItem[]>(() =>
    initialAssessments.filter((a) => a.status !== "ARCHIVED")
  );
  // Collapsed by default as per spec
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string>("");
  const [expandedSectionId, setExpandedSectionId] = useState<string>("");
  const [questionSearch, setQuestionSearch] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Question Edit Sheet / Drawer State
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionType, setEditQuestionType] = useState<QuestionType>(QuestionType.MCQ_SINGLE_CORRECT);
  const [editOptions, setEditOptions] = useState<string[]>([]);

  const openQuestionEditor = (q: QuestionItem) => {
    setEditingQuestion(q);
    setEditQuestionText(q.questionText);
    setEditQuestionType(q.questionType);
    setEditOptions(q.options.map((o) => o.optionText));
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...editOptions];
    updated[idx] = val;
    setEditOptions(updated);
  };

  const addOptionField = () => {
    setEditOptions([...editOptions, `Option ${editOptions.length + 1}`]);
  };

  const removeOptionField = (idx: number) => {
    setEditOptions(editOptions.filter((_, i) => i !== idx));
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setMessage(null);
    startTransition(async () => {
      const res = await updateQuestionAction({
        questionId: editingQuestion.id,
        questionText: editQuestionText,
        questionType: editQuestionType,
        displayOrder: editingQuestion.displayOrder,
        required: editingQuestion.required,
        options: editOptions,
      });

      if (res.success) {
        setMessage({ text: res.message, type: "success" });
        setEditingQuestion(null);

        // Update local state to reflect new version
        setAssessments((prev) =>
          prev.map((ass) => {
            const updatedSections = ass.sections.map((sec) => {
              const updatedQuestions = sec.questions.map((q) => {
                if (q.id === editingQuestion.id) {
                  if (res.data?.isNewVersion) {
                    return {
                      ...q,
                      id: res.data.newQuestionId,
                      version: res.data.version,
                      questionText: editQuestionText,
                      questionType: editQuestionType,
                      responsesCount: 0,
                      options: editOptions.map((optText, i) => ({
                        id: `opt-${i}`,
                        optionText: optText,
                        displayOrder: i + 1,
                      })),
                    };
                  } else {
                    return {
                      ...q,
                      questionText: editQuestionText,
                      questionType: editQuestionType,
                      options: editOptions.map((optText, i) => ({
                        id: `opt-${i}`,
                        optionText: optText,
                        displayOrder: i + 1,
                      })),
                    };
                  }
                }
                return q;
              });
              return { ...sec, questions: updatedQuestions };
            });
            return { ...ass, sections: updatedSections };
          })
        );
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {message && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Neutral Info Callout: Copy-on-Write Versioning Rule (ONCE at top) */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-start gap-3 text-xs text-[#475569]">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-[#0F172A]">
            Copy-on-Write Question Versioning Active
          </div>
          <p className="leading-relaxed">
            Editing any question with existing student responses automatically branches into a new version (v+1). Historical responses remain locked to previous versions to safeguard score audit trails.
          </p>
        </div>
      </div>

      {/* 2. Assessments List (Collapsed by Default) */}
      <div className="space-y-3">
        {assessments.map((ass) => {
          const isAssExpanded = expandedAssessmentId === ass.id;

          return (
            <div
              key={ass.id}
              className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
            >
              {/* Assessment Header Accordion Bar */}
              <button
                type="button"
                onClick={() => {
                  setExpandedAssessmentId(isAssExpanded ? "" : ass.id);
                  if (!isAssExpanded) {
                    setExpandedSectionId("");
                  }
                }}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                aria-expanded={isAssExpanded}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#0F172A] truncate">
                      {ass.title}
                    </h3>
                    <AdminTag>v{ass.version}.0</AdminTag>
                    <AdminStatusPill
                      label={ass.status}
                      variant={ass.status === "ACTIVE" ? "success" : "neutral"}
                    />
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-1">
                    {ass.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-3 text-xs text-[#64748B] font-medium">
                    <span>{pluralize(ass.sectionsCount, "section", "sections")}</span>
                    <span>•</span>
                    <span>{pluralize(ass.questionsCount, "question", "questions")}</span>
                    <span>•</span>
                    <span className="tabular-nums font-semibold text-[#0F172A]">
                      {pluralize(ass.attemptsCount, "attempt", "attempts")}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                      isAssExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Assessment Expanded Content: Modules / Sections */}
              {isAssExpanded && (
                <div className="border-t border-[#E2E8F0] p-4 sm:p-5 bg-[#F8FAFC] space-y-3">
                  {/* Module Search Bar */}
                  <div className="relative max-w-sm">
                    <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      placeholder="Search questions in this assessment..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Modules Accordion (Collapsed by Default) */}
                  <div className="space-y-2.5">
                    {ass.sections.map((sec, secIdx) => {
                      const isSecExpanded = expandedSectionId === sec.id;

                      const filteredQuestions = sec.questions.filter((q) => {
                        if (!questionSearch.trim()) return true;
                        const term = questionSearch.toLowerCase();
                        return (
                          q.questionText.toLowerCase().includes(term) ||
                          q.options.some((o) => o.optionText.toLowerCase().includes(term))
                        );
                      });

                      return (
                        <div
                          key={sec.id}
                          className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                        >
                          {/* Module Header Bar */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSectionId(isSecExpanded ? "" : sec.id)
                            }
                            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                            aria-expanded={isSecExpanded}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-[#0F172A] truncate">
                                Module {["A", "B", "C", "D"][secIdx] || secIdx + 1}: {sec.title}
                              </span>
                              <span className="text-xs text-[#64748B]">
                                ({pluralize(sec.questions.length, "question", "questions")})
                              </span>
                            </div>

                            <ChevronDown
                              className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                                isSecExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Module Questions List */}
                          {isSecExpanded && (
                            <div className="border-t border-[#F1F5F9] p-3 sm:p-4 divide-y divide-[#F1F5F9] space-y-2">
                              {filteredQuestions.length === 0 ? (
                                <p className="text-xs text-[#64748B] py-3 text-center">
                                  No questions match &quot;{questionSearch}&quot;.
                                </p>
                              ) : (
                                filteredQuestions.map((q, qIdx) => (
                                  <div
                                    key={q.id}
                                    className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                  >
                                    <div className="space-y-1 flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs text-[#0F172A]">
                                          Q{q.displayOrder || qIdx + 1}.
                                        </span>
                                        <span className="text-xs font-medium text-[#0F172A] line-clamp-2">
                                          {q.questionText}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                                        <AdminTag>v{q.version}.0</AdminTag>

                                        {/* Lock icon with tooltip: Has N responses */}
                                        {q.responsesCount > 0 ? (
                                          <span
                                            className="inline-flex items-center gap-1 text-[11px] text-[#64748B]"
                                            title={`Has ${q.responsesCount} responses — editing creates a new version`}
                                          >
                                            <Lock className="w-3 h-3 text-[#64748B]" />
                                            <span>
                                              {pluralize(q.responsesCount, "response", "responses")}
                                            </span>
                                          </span>
                                        ) : (
                                          <span
                                            className="inline-flex items-center gap-1 text-[11px] text-[#64748B]"
                                            title="0 responses — safe for direct edit"
                                          >
                                            <Unlock className="w-3 h-3 text-emerald-600" />
                                            <span>0 responses</span>
                                          </span>
                                        )}

                                        <span className="text-[11px] text-[#94A3B8]">
                                          • {pluralize(q.options.length, "option", "options")}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Outline Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => openQuestionEditor(q)}
                                      className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-center"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-[#64748B]" />
                                      <span>Edit</span>
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question Edit Slide-Over Sheet / Drawer */}
      {editingQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end animate-in fade-in-0 duration-150"
        >
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto border-l border-[#E2E8F0] shadow-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">
                    Edit Question Dilemma
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <AdminTag>v{editingQuestion.version}.0</AdminTag>
                    {editingQuestion.responsesCount > 0 ? (
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Editing will create version v{editingQuestion.version + 1}.0
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        Direct edit (0 responses)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                  aria-label="Close editor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} id="question-form" className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editQuestionText}
                    onChange={(e) => setEditQuestionText(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Question Type
                  </label>
                  <select
                    value={editQuestionType}
                    onChange={(e) => setEditQuestionType(e.target.value as QuestionType)}
                    className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={QuestionType.MCQ_SINGLE_CORRECT}>Single Choice MCQ</option>
                    <option value={QuestionType.LIKERT_5}>Likert Scale (1-5)</option>
                    <option value={QuestionType.SJT_DUAL_SELECT}>Situational Judgment (SJT)</option>
                    <option value={QuestionType.FORCED_RANKING}>Forced Ranking</option>
                    <option value={QuestionType.RATING_5}>Rating (1-5)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      Answer Options
                    </label>
                    <button
                      type="button"
                      onClick={addOptionField}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editOptions.map((optText, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#94A3B8] w-5">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          required
                          value={optText}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className="flex-1 p-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {editOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionField(i)}
                            className="p-1.5 text-[#94A3B8] hover:text-red-600 transition-colors"
                            aria-label="Remove option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="question-form"
                disabled={isPending || !editQuestionText.trim()}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {isPending ? "Saving..." : "Save Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
