"use client";

import { useState, useTransition, useRef } from "react";
import {
  Mail,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  X,
  ArrowLeft,
  Tag,
  Check,
} from "lucide-react";
import {
  NotificationTemplateItem,
  updateNotificationTemplateAction,
  resetNotificationTemplateAction,
} from "@/app/actions/admin";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";

interface AdminNotificationsClientProps {
  initialTemplates: NotificationTemplateItem[];
}

export default function AdminNotificationsClient({
  initialTemplates,
}: AdminNotificationsClientProps) {
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>(initialTemplates);
  const [selectedType, setSelectedType] = useState<string>(
    initialTemplates[0]?.type || "EMAIL_VERIFICATION"
  );
  const [activeMode, setActiveMode] = useState<"edit" | "preview">("edit");
  const [mobileView, setMobileView] = useState<"roster" | "editor">("roster");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Reset confirmation state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const currentTemplate =
    templates.find((t) => t.type === selectedType) || templates[0];

  // Local draft state
  const [draftSubject, setDraftSubject] = useState<string>(
    currentTemplate?.subject || ""
  );
  const [draftBody, setDraftBody] = useState<string>(
    currentTemplate?.body || ""
  );

  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const [lastActiveInput, setLastActiveInput] = useState<"subject" | "body">("body");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const isDirty =
    draftSubject !== (currentTemplate?.subject || "") ||
    draftBody !== (currentTemplate?.body || "");

  const handleSelectTemplate = (type: string) => {
    const next = templates.find((t) => t.type === type);
    if (next) {
      setSelectedType(type);
      setDraftSubject(next.subject);
      setDraftBody(next.body);
      setFeedback(null);
      setMobileView("editor");
    }
  };

  // Insert merge tag at cursor position
  const handleInsertMergeTag = (variable: string) => {
    const token = `{{${variable}}}`;

    if (lastActiveInput === "subject" && subjectInputRef.current) {
      const el = subjectInputRef.current;
      const start = el.selectionStart || draftSubject.length;
      const end = el.selectionEnd || draftSubject.length;
      const newSubject =
        draftSubject.substring(0, start) + token + draftSubject.substring(end);
      setDraftSubject(newSubject);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      }, 50);
    } else if (bodyInputRef.current) {
      const el = bodyInputRef.current;
      const start = el.selectionStart || draftBody.length;
      const end = el.selectionEnd || draftBody.length;
      const newBody =
        draftBody.substring(0, start) + token + draftBody.substring(end);
      setDraftBody(newBody);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      }, 50);
    }

    setCopiedTag(variable);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  // Save changes
  const handleSave = () => {
    if (!currentTemplate || !isDirty) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await updateNotificationTemplateAction(
        currentTemplate.type,
        draftSubject,
        draftBody
      );

      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setTemplates((prev) =>
          prev.map((t) =>
            t.type === currentTemplate.type
              ? {
                  ...t,
                  subject: draftSubject,
                  body: draftBody,
                  updatedBy: "Admin",
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Confirm Reset to default
  const handleConfirmReset = () => {
    if (!currentTemplate) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await resetNotificationTemplateAction(currentTemplate.type);

      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        if (res.data) {
          const updated = res.data as any;
          setDraftSubject(updated.subject);
          setDraftBody(updated.body);
          setTemplates((prev) =>
            prev.map((t) =>
              t.type === currentTemplate.type
                ? {
                    ...t,
                    subject: updated.subject,
                    body: updated.body,
                    updatedBy: "System Reset",
                    updatedAt: new Date().toISOString(),
                  }
                : t
            )
          );
        }
        setIsResetDialogOpen(false);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Render Preview Mock
  const renderMockBody = () => {
    let mock = draftBody;
    const sampleReplacements: Record<string, string> = {
      name: "Alex Morgan",
      verificationUrl: "https://alderwoodvantage.com/verify?token=sample",
      resetUrl: "https://alderwoodvantage.com/reset-password?token=sample",
      inviteUrl: "https://alderwoodvantage.com/activate?token=sample",
      assessmentTitle: "Vantage Psychological Dilemma Battery",
      reportUrl: "https://alderwoodvantage.com/dashboard/results",
      candidateName: "Alex Morgan",
      rejectionReason: "Formatting inconsistency on page 4.",
      dueDate: "Oct 24, 2026",
      hoursRemaining: "24",
      slaHours: "48",
      attemptId: "att_live_sample",
      role: "STAFF",
    };

    Object.entries(sampleReplacements).forEach(([k, v]) => {
      mock = mock.replaceAll(`{{${k}}}`, v);
    });

    return mock;
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in-0 duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Responsive Canvas: 280px Roster + Editor Workspace */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Template Roster (280px desktop, hidden on mobile when editor active) */}
        <div
          className={`w-full md:w-[280px] border-b md:border-b-0 md:border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col shrink-0 ${
            mobileView === "editor" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-3.5 border-b border-[#E2E8F0]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Template Roster ({templates.length})
            </span>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto flex-1">
            {templates.map((tmpl) => {
              const active = tmpl.type === selectedType;
              return (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.type)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs"
                      : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-transparent"
                  }`}
                >
                  <div className="font-semibold text-[#0F172A] truncate">
                    {tmpl.label}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono truncate mt-0.5">
                    {tmpl.subject}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Editor Workspace (hidden on mobile when roster active) */}
        <div
          className={`flex-1 flex flex-col justify-between ${
            mobileView === "roster" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header Row: Back button (mobile), Template Title & Mode Toggle */}
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileView("roster")}
                className="md:hidden p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A]"
                aria-label="Back to template list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0F172A] truncate">
                    {currentTemplate?.label}
                  </h3>
                  {isDirty && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Unsaved edits
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] truncate">
                  {currentTemplate?.description}
                </p>
              </div>
            </div>

            {/* Segmented Mode Control: Edit / Preview */}
            <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-lg self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setActiveMode("edit")}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === "edit"
                    ? "bg-[#0F172A] text-white"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("preview")}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeMode === "preview"
                    ? "bg-[#0F172A] text-white"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Form Body or Preview Canvas */}
          <div className="p-4 sm:p-6 flex-1 space-y-4">
            {activeMode === "edit" ? (
              <div className="space-y-4 max-w-3xl">
                {/* Subject Field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">
                    Email Subject Line
                  </label>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={draftSubject}
                    onFocus={() => setLastActiveInput("subject")}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Merge Tags Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#64748B] block">
                    Clickable Merge Tags (Inserts into active field)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentTemplate?.availableVariables?.map((v: string) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertMergeTag(v)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title={`Insert {{${v}}}`}
                      >
                        <Tag className="w-3 h-3 text-[#94A3B8]" />
                        <span>{`{{${v}}}`}</span>
                        {copiedTag === v && (
                          <Check className="w-3 h-3 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Body Field (Min 8 rows, monospace allowed) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[#0F172A]">
                      Email Body Content
                    </label>
                    <span className="text-[#94A3B8] tabular-nums">
                      {draftBody.length} characters
                    </span>
                  </div>
                  <textarea
                    ref={bodyInputRef}
                    rows={12}
                    value={draftBody}
                    onFocus={() => setLastActiveInput("body")}
                    onChange={(e) => setDraftBody(e.target.value)}
                    className="w-full p-3 rounded-lg border border-[#E2E8F0] bg-white text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              /* Render Preview Mode */
              <div className="max-w-2xl border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-1 text-xs">
                  <div>
                    <span className="text-[#64748B]">Subject: </span>
                    <span className="font-bold text-[#0F172A]">{draftSubject}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Sender: </span>
                    <span className="text-[#334155]">
                      Alderwood Vantage Notifications &lt;notifications@alderwoodvantage.com&gt;
                    </span>
                  </div>
                </div>
                <div className="p-6 text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans">
                  {renderMockBody()}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Action Bar */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3 sticky bottom-0 z-10">
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Reset to default</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPending ? "Saving..." : "Save template"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Email Template to Default"
        description="Reverting this template restores the platform default subject line and body text. Any custom modifications will be replaced."
        target={currentTemplate?.label}
        confirmLabel="Reset Template"
        isDestructive={true}
        isLoading={isPending}
      />
    </div>
  );
}
