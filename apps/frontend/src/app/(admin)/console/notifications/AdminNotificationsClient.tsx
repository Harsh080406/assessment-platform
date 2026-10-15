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
  Send,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Layers,
} from "lucide-react";
import {
  NotificationTemplateItem,
  updateNotificationTemplateAction,
  resetNotificationTemplateAction,
  sendTestNotificationEmailAction,
} from "@/app/actions/admin";
import AdminConfirmationDialog from "@/components/admin/AdminConfirmationDialog";

interface AdminNotificationsClientProps {
  initialTemplates: NotificationTemplateItem[];
}

const CATEGORIES = [
  "All",
  "Account & Access",
  "Assessments & Reports",
  "Support & Inquiries",
] as const;

export default function AdminNotificationsClient({
  initialTemplates,
}: AdminNotificationsClientProps) {
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>(initialTemplates);
  const [selectedType, setSelectedType] = useState<string>(
    initialTemplates[0]?.type || "ACCOUNT_INVITATION"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMode, setActiveMode] = useState<"edit" | "preview">("edit");
  const [mobileView, setMobileView] = useState<"roster" | "editor">("roster");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Reset confirmation state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Test email modal state
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState("");
  const [testEmailResult, setTestEmailResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  // Filter templates by category and search
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.label.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.availableVariables.some((v) => v.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

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

  // Dispatch Test Email
  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientEmail || !currentTemplate) return;
    setTestEmailResult(null);

    startTransition(async () => {
      const res = await sendTestNotificationEmailAction(
        currentTemplate.type,
        testRecipientEmail.trim(),
        draftSubject,
        draftBody
      );

      if (res.success) {
        setTestEmailResult({ type: "success", message: res.message });
      } else {
        setTestEmailResult({ type: "error", message: res.message });
      }
    });
  };

  // Sample Mock Replacements
  const sampleReplacements: Record<string, string> = {
    candidateName: "Sarah Jenkins",
    staffName: "Dr. Evelyn Reed",
    role: "Candidate Assessment",
    staffRole: "Clinical Evaluator",
    otpCode: "749201",
    verificationUrl: "https://www.alderwoodvantage.com/verify-email?token=sample_demo",
    activationUrl: "https://www.alderwoodvantage.com/activate?token=sample_demo",
    resetUrl: "https://www.alderwoodvantage.com/reset-password?token=sample_demo",
    assessmentTitle: "Executive Cognitive & Dilemma Battery",
    slaDays: "3",
    dashboardUrl: "https://www.alderwoodvantage.com/dashboard",
    reportUrl: "https://www.alderwoodvantage.com/dashboard/reports/rep_sample",
    expiryMinutes: "10",
    expiryHours: "48",
    referenceId: "STU-849201",
    subject: "Assessment Report Clarification",
    responseWindowHours: "4",
    helpline: "+91 93168 19331",
    representativeName: "Dean Arthur Vance",
    institutionName: "Kingsford Academy",
    partnershipObjective: "Cohort Psychometric Profiling",
    name: "Sarah Jenkins",
    otp: "749201",
    expiresIn: "48 hours",
    ticketId: "TKT-849201",
    organization: "Kingsford Academy",
  };

  const renderMockSubject = () => {
    let mock = draftSubject;
    Object.entries(sampleReplacements).forEach(([k, v]) => {
      mock = mock.replaceAll(`{{${k}}}`, v);
    });
    return mock;
  };

  const renderMockBody = () => {
    let mock = draftBody;
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

      {/* Main Responsive Canvas: Left Roster + Right Editor/Preview Workspace */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[640px]">
        {/* Left Template Roster (300px desktop, hidden on mobile when editor active) */}
        <div
          className={`w-full md:w-[320px] border-b md:border-b-0 md:border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col shrink-0 ${
            mobileView === "editor" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Roster Header with Search */}
          <div className="p-3.5 border-b border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0F172A]" />
                Templates ({filteredTemplates.length})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                10 Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Items List */}
          <div className="p-2 space-y-1.5 overflow-y-auto flex-1 max-h-[580px]">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-[#64748B]">
                No templates match your search.
              </div>
            ) : (
              filteredTemplates.map((tmpl) => {
                const active = tmpl.type === selectedType;
                return (
                  <button
                    key={tmpl.type}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.type)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer ${
                      active
                        ? "bg-white text-[#0F172A] border-2 border-[#0F172A] shadow-xs"
                        : "bg-white/60 text-[#64748B] hover:bg-white hover:text-[#0F172A] border border-[#E2E8F0]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-[#0F172A] truncate">
                        {tmpl.label}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {tmpl.category?.split(" ")[0] || "Email"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate line-clamp-1">
                      {tmpl.subject}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Editor Workspace (hidden on mobile when roster active) */}
        <div
          className={`flex-1 min-w-0 flex flex-col justify-between ${
            mobileView === "roster" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header Row: Back button (mobile), Template Title & Action Buttons */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    {currentTemplate?.label}
                  </h3>
                  {isDirty && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5">
                  {currentTemplate?.description}
                </p>
              </div>
            </div>

            {/* Action Bar: Send Test Email + Mode Toggle */}
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTestRecipientEmail("");
                  setTestEmailResult(null);
                  setIsTestEmailOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                <span>Send Test</span>
              </button>

              {/* Segmented Mode Control: Edit / Preview */}
              <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveMode("edit")}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
          </div>

          {/* Form Body or Preview Canvas */}
          <div className="p-4 sm:p-6 flex-1 space-y-4 overflow-y-auto">
            {activeMode === "edit" ? (
              <div className="space-y-4 max-w-3xl">
                {/* Subject Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A] block">
                    Email Subject Line
                  </label>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={draftSubject}
                    onFocus={() => setLastActiveInput("subject")}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                {/* Merge Tags Chips */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-bold text-[#64748B] block">
                    Available Merge Tags (Click to insert into active field):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentTemplate?.availableVariables?.map((v: string) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertMergeTag(v)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
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

                {/* Email Body Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#0F172A]">
                      Email Body Content
                    </label>
                    <span className="text-[#94A3B8] tabular-nums font-mono text-[11px]">
                      {draftBody.length} characters
                    </span>
                  </div>
                  <textarea
                    ref={bodyInputRef}
                    rows={14}
                    value={draftBody}
                    onFocus={() => setLastActiveInput("body")}
                    onChange={(e) => setDraftBody(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-2xs"
                  />
                </div>
              </div>
            ) : (
              /* Rich Realistic HTML Email Preview */
              <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in-50 duration-150">
                {/* Email Client Simulated Header */}
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#64748B] w-16 shrink-0">Subject:</span>
                    <span className="font-bold text-[#0F172A]">{renderMockSubject()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#64748B] w-16 shrink-0">From:</span>
                    <span className="text-[#334155] font-mono text-[11px]">
                      Alderwood Vantage &lt;support@mail.alderwoodvantage.com&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#64748B] w-16 shrink-0">To:</span>
                    <span className="text-[#334155] font-mono text-[11px]">
                      sarah.jenkins@example.com
                    </span>
                  </div>
                </div>

                {/* Simulated Alderwood Vantage Transactional Email */}
                <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white shadow-md p-6 sm:p-8 space-y-6">
                  {/* Top Badge */}
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#0F172A] rounded-full text-[11px] font-bold uppercase tracking-wider">
                      {currentTemplate?.label}
                    </span>
                  </div>

                  {/* Alderwood Vantage Brand Header */}
                  <div className="text-center space-y-1 border-b border-[#F1F5F9] pb-4">
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      Alderwood Vantage
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Raising leaders, not just employees.
                    </p>
                  </div>

                  {/* Body Content with simulated formatting */}
                  <div className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                    {renderMockBody()}
                  </div>

                  {/* Interactive Button Preview (if activationUrl or verificationUrl or resetUrl is in template) */}
                  {(draftBody.includes("{{activationUrl}}") ||
                    draftBody.includes("{{verificationUrl}}") ||
                    draftBody.includes("{{resetUrl}}") ||
                    draftBody.includes("{{reportUrl}}")) && (
                    <div className="pt-2 pb-2 text-center">
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B6B] text-white text-xs font-bold shadow-sm">
                        <span>
                          {draftBody.includes("{{activationUrl}}")
                            ? "Proceed to Activate Account →"
                            : draftBody.includes("{{reportUrl}}")
                            ? "View Certified Report →"
                            : draftBody.includes("{{resetUrl}}")
                            ? "Reset Password →"
                            : "Verify Email Address →"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Highlighted OTP Code Preview (if otpCode in template) */}
                  {draftBody.includes("{{otpCode}}") && (
                    <div className="py-3">
                      <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 text-center rounded-xl max-w-xs mx-auto">
                        <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-1">
                          Single-Use Verification Code
                        </span>
                        <span className="text-2xl font-black font-mono tracking-widest text-[#0F172A]">
                          749201
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-6 border-t border-[#E2E8F0] text-center space-y-1">
                    <p className="text-[11px] text-[#94A3B8]">
                      Alderwood Vantage Assessment & Governance Portal
                    </p>
                    <p className="text-[10px] text-[#CBD5E1]">
                      You received this email because of your association with Alderwood Vantage.
                    </p>
                  </div>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Reset to default</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPending ? "Saving..." : "Save template"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Send Test Email Modal Dialog */}
      {isTestEmailOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Dispatch Test Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestEmailOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Send a live test dispatch of <strong>&quot;{currentTemplate?.label}&quot;</strong> to any email address to inspect how it looks in your email client.
            </p>

            {testEmailResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                  testEmailResult.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {testEmailResult.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{testEmailResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Recipient Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your-email@example.com"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsTestEmailOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending || !testRecipientEmail.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPending ? "Sending..." : "Dispatch Test"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
