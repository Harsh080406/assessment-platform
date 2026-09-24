"use client";

import { useState, useTransition } from "react";
import {
  Layers,
  HelpCircle,
  Sparkles,
  Plus,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
} from "lucide-react";
import { QuestionType } from "@prisma/client";
import { updateQuestionAction } from "@/app/actions/admin";

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
  const [assessments, setAssessments] = useState<AssessmentItem[]>(initialAssessments);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string>(
    initialAssessments[0]?.id || ""
  );

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Question Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionType, setEditQuestionType] = useState<QuestionType>(QuestionType.SINGLE_CHOICE);
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

        // Update state in UI to reflect new question version if created
        setAssessments((prev) =>
          prev.map((ass) => {
            const updatedSections = ass.sections.map((sec) => {
              const updatedQuestions = sec.questions.map((q) => {
                if (q.id === editingQuestion.id) {
                  if (res.data?.isNewVersion) {
                    // Return new version item
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
    <div className="space-y-6">
      {/* Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
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
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Copy-on-Write Versioning Information Banner */}
      <div className="bg-[#EEF2FF] border border-[#E0E7FE] p-4 rounded-2xl flex items-start gap-3 text-xs text-[#4F46E5]">
        <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold uppercase tracking-wider text-[11px]">
            Strict Copy-on-Write Versioning Rule Active
          </div>
          <p className="leading-relaxed">
            Editing any question that already has candidate responses stored in the database automatically creates a <strong>NEW question version (v+1)</strong>. Past response data remains cryptographically linked to the historical version so past reports are never corrupted.
          </p>
        </div>
      </div>

      {/* Assessments Accordion */}
      <div className="space-y-4">
        {assessments.map((ass) => {
          const isExpanded = expandedAssessmentId === ass.id;

          return (
            <div
              key={ass.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden"
            >
              {/* Accordion Header */}
              <div
                onClick={() => setExpandedAssessmentId(isExpanded ? "" : ass.id)}
                className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#0F172A]">{ass.title}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded border border-[#E2E8F0]">
                      Engine v{ass.version}.0
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      {ass.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">{ass.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-4 text-xs text-[#64748B] font-semibold">
                    <span>{ass.sectionsCount} Sections</span>
                    <span>{ass.questionsCount} Questions</span>
                    <span className="font-bold text-[#0F172A]">{ass.attemptsCount} Student Attempts</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#64748B]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#64748B]" />
                  )}
                </div>
              </div>

              {/* Accordion Content: Sections & Questions */}
              {isExpanded && (
                <div className="border-t border-[#E2E8F0] p-5 sm:p-6 bg-[#F8FAFC] space-y-6">
                  {ass.sections.map((sec, secIdx) => (
                    <div
                      key={sec.id}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                        <h4 className="font-bold text-sm text-[#0F172A]">
                          Module {["A", "B", "C", "D"][secIdx] || secIdx + 1}: {sec.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase text-[#94A3B8]">
                          {sec.questions.length} Dilemma Questions
                        </span>
                      </div>

                      {/* Questions List */}
                      <div className="space-y-3">
                        {sec.questions.map((q, qIdx) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-[#0F172A]">
                                  Q{qIdx + 1}. {q.questionText}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#4F46E5] border border-[#E0E7FE]">
                                  v{q.version}.0
                                </span>
                                {q.responsesCount > 0 ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    {q.responsesCount} student responses (Triggers New Version on Edit)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    0 responses (Direct Edit)
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {q.options.map((opt) => (
                                  <span
                                    key={opt.id}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#64748B]"
                                  >
                                    {opt.optionText}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => openQuestionEditor(q)}
                              className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#FF6B6B]" />
                              <span>Edit Question</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QUESTION EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Edit Question (v{editingQuestion.version}.0)
                </h3>
                <p className="text-xs text-[#64748B]">
                  {editingQuestion.responsesCount > 0
                    ? `⚠️ ${editingQuestion.responsesCount} responses exist. Saving will auto-create v${editingQuestion.version + 1}.0.`
                    : "No responses yet. Direct edit mode."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A]">Question Prompt Text</label>
              <textarea
                required
                rows={3}
                value={editQuestionText}
                onChange={(e) => setEditQuestionText(e.target.value)}
                className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Question Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A]">Question Type</label>
              <select
                value={editQuestionType}
                onChange={(e) => setEditQuestionType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A]"
              >
                <option value={QuestionType.SINGLE_CHOICE}>SINGLE_CHOICE</option>
                <option value={QuestionType.MULTI_CHOICE}>MULTI_CHOICE</option>
                <option value={QuestionType.LIKERT}>LIKERT</option>
                <option value={QuestionType.YES_NO}>YES_NO</option>
              </select>
            </div>

            {/* Question Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0F172A]">Options List</label>
                <button
                  type="button"
                  onClick={addOptionField}
                  className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              </div>

              <div className="space-y-2">
                {editOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      className="flex-1 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium"
                    />
                    {editOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOptionField(i)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-extrabold shadow-xs"
              >
                {editingQuestion.responsesCount > 0
                  ? `Save & Create v${editingQuestion.version + 1}.0`
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
