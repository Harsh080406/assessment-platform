"use client";

import { useState } from "react";
import {
  FileEdit,
  Save,
  HelpCircle,
  Shield,
  FileText,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { updateContentBlockAction } from "@/app/actions/content";
import AdminStatusPill from "@/components/admin/AdminStatusPill";

interface ContentBlockItem {
  key: string;
  title: string;
  body: string;
}

interface AdminContentClientProps {
  initialBlocks: ContentBlockItem[];
}

export default function AdminContentClient({ initialBlocks }: AdminContentClientProps) {
  const [blocks, setBlocks] = useState<Record<string, ContentBlockItem>>(() => {
    const map: Record<string, ContentBlockItem> = {};
    initialBlocks.forEach((b) => {
      map[b.key] = b;
    });
    return map;
  });

  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, ContentBlockItem>>(() => {
    const map: Record<string, ContentBlockItem> = {};
    initialBlocks.forEach((b) => {
      map[b.key] = { ...b };
    });
    return map;
  });

  const [activeTab, setActiveTab] = useState<string>("hero");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // FAQ parsed state
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>(() => {
    try {
      const raw = blocks["faq_list"]?.body;
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  });

  const [initialFaqsJson] = useState<string>(() => {
    try {
      return blocks["faq_list"]?.body || "[]";
    } catch {
      return "[]";
    }
  });

  const handleBlockChange = (key: string, field: "title" | "body", value: string) => {
    setBlocks((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { key, title: key, body: "" }),
        [field]: value,
      },
    }));
  };

  // Check dirty state for active tab
  const isTabDirty = () => {
    if (activeTab === "hero") {
      return (
        blocks["hero_headline"]?.body !== savedSnapshot["hero_headline"]?.body ||
        blocks["hero_subheadline"]?.body !== savedSnapshot["hero_subheadline"]?.body
      );
    }
    if (activeTab === "faq") {
      return JSON.stringify(faqs) !== initialFaqsJson;
    }
    if (activeTab === "about") {
      return blocks["about_body"]?.body !== savedSnapshot["about_body"]?.body;
    }
    if (activeTab === "contact") {
      return blocks["contact_info"]?.body !== savedSnapshot["contact_info"]?.body;
    }
    if (activeTab === "privacy") {
      return blocks["privacy_policy"]?.body !== savedSnapshot["privacy_policy"]?.body;
    }
    if (activeTab === "terms") {
      return blocks["terms_conditions"]?.body !== savedSnapshot["terms_conditions"]?.body;
    }
    return false;
  };

  const handleSaveActiveTab = async () => {
    setSaving(true);
    setFeedback(null);

    try {
      if (activeTab === "hero") {
        await Promise.all([
          updateContentBlockAction(
            "hero_headline",
            "Hero Headline",
            blocks["hero_headline"]?.body || ""
          ),
          updateContentBlockAction(
            "hero_subheadline",
            "Hero Sub-headline",
            blocks["hero_subheadline"]?.body || ""
          ),
        ]);
        setSavedSnapshot((prev) => ({
          ...prev,
          hero_headline: { ...blocks["hero_headline"] },
          hero_subheadline: { ...blocks["hero_subheadline"] },
        }));
        setFeedback({ type: "success", text: "Hero landing copy saved successfully." });
      } else if (activeTab === "faq") {
        const serialized = JSON.stringify(faqs, null, 2);
        handleBlockChange("faq_list", "body", serialized);
        await updateContentBlockAction(
          "faq_list",
          "Frequently Asked Questions",
          serialized
        );
        setFeedback({ type: "success", text: "FAQ directory saved successfully." });
      } else if (activeTab === "about") {
        await updateContentBlockAction(
          "about_body",
          "About Alderwood Vantage",
          blocks["about_body"]?.body || ""
        );
        setSavedSnapshot((prev) => ({
          ...prev,
          about_body: { ...blocks["about_body"] },
        }));
        setFeedback({ type: "success", text: "About section saved successfully." });
      } else if (activeTab === "contact") {
        await updateContentBlockAction(
          "contact_info",
          "Contact & Operating Info",
          blocks["contact_info"]?.body || ""
        );
        setSavedSnapshot((prev) => ({
          ...prev,
          contact_info: { ...blocks["contact_info"] },
        }));
        setFeedback({ type: "success", text: "Contact details saved successfully." });
      } else if (activeTab === "privacy") {
        await updateContentBlockAction(
          "privacy_policy",
          "Privacy Policy",
          blocks["privacy_policy"]?.body || ""
        );
        setSavedSnapshot((prev) => ({
          ...prev,
          privacy_policy: { ...blocks["privacy_policy"] },
        }));
        setFeedback({ type: "success", text: "Privacy Policy saved successfully." });
      } else if (activeTab === "terms") {
        await updateContentBlockAction(
          "terms_conditions",
          "Terms & Conditions",
          blocks["terms_conditions"]?.body || ""
        );
        setSavedSnapshot((prev) => ({
          ...prev,
          terms_conditions: { ...blocks["terms_conditions"] },
        }));
        setFeedback({ type: "success", text: "Terms & Conditions saved successfully." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save content." });
    } finally {
      setSaving(false);
    }
  };

  const addFaqItem = () => {
    setFaqs((prev) => [...prev, { q: "New Question Title", a: "Answer text goes here..." }]);
  };

  const updateFaqItem = (index: number, field: "q" | "a", value: string) => {
    setFaqs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const deleteFaqItem = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: "hero", label: "Hero & Landing Copy", icon: FileEdit },
    { id: "faq", label: "FAQ Directory", icon: HelpCircle },
    { id: "about", label: "About Section", icon: FileText },
    { id: "contact", label: "Contact & Operating Info", icon: Mail },
    { id: "privacy", label: "Privacy Policy", icon: Shield },
    { id: "terms", label: "Terms & Conditions", icon: FileText },
  ];

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
            <span>{feedback.text}</span>
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

      {/* Workspace Container with Mobile Select / Desktop Horizontal Tabs */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {/* Navigation Bar */}
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mobile Select */}
          <div className="sm:hidden w-full">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Horizontal Scrollable Tabs */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Unsaved Changes Indicator */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {isTabDirty() ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#94A3B8]">
                All changes saved
              </span>
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: HERO */}
          {activeTab === "hero" && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Landing Page Hero Copy</h3>
                <p className="text-xs text-[#64748B]">Primary headline and supporting copy displayed above the fold on the homepage.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[#0F172A]">Hero Headline</label>
                    <span className="text-[#94A3B8] tabular-nums">
                      {(blocks["hero_headline"]?.body || "").length} characters
                    </span>
                  </div>
                  <input
                    type="text"
                    value={blocks["hero_headline"]?.body || ""}
                    onChange={(e) => handleBlockChange("hero_headline", "body", e.target.value)}
                    className="w-full p-2.5 bg-white text-xs font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[#0F172A]">Hero Supporting Subheadline</label>
                    <span className="text-[#94A3B8] tabular-nums">
                      {(blocks["hero_subheadline"]?.body || "").length} characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={blocks["hero_subheadline"]?.body || ""}
                    onChange={(e) => handleBlockChange("hero_subheadline", "body", e.target.value)}
                    className="w-full p-3 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAQ */}
          {activeTab === "faq" && (
            <div className="space-y-5 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Frequently Asked Questions</h3>
                  <p className="text-xs text-[#64748B]">Directory of questions and answers presented to candidates and parents.</p>
                </div>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#64748B]">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => deleteFaqItem(index)}
                        className="text-[#94A3B8] hover:text-red-600 p-1 rounded"
                        aria-label="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#0F172A]">Question</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => updateFaqItem(index, "q", e.target.value)}
                        className="w-full p-2 bg-white text-xs font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#0F172A]">Answer</label>
                      <textarea
                        rows={3}
                        value={faq.a}
                        onChange={(e) => updateFaqItem(index, "a", e.target.value)}
                        className="w-full p-2.5 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">About Section Copy</h3>
                <p className="text-xs text-[#64748B]">Organizational background, methodology mission, and editorial credentials.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#0F172A]">About Body Content</label>
                  <span className="text-[#94A3B8] tabular-nums">
                    {(blocks["about_body"]?.body || "").length} characters
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={blocks["about_body"]?.body || ""}
                  onChange={(e) => handleBlockChange("about_body", "body", e.target.value)}
                  className="w-full p-3 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT */}
          {activeTab === "contact" && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Contact & Operating Details</h3>
                <p className="text-xs text-[#64748B]">Customer support email addresses, support hotlines, and office operating hours.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#0F172A]">Operating Info Content</label>
                  <span className="text-[#94A3B8] tabular-nums">
                    {(blocks["contact_info"]?.body || "").length} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={blocks["contact_info"]?.body || ""}
                  onChange={(e) => handleBlockChange("contact_info", "body", e.target.value)}
                  className="w-full p-3 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Privacy Policy</h3>
                <p className="text-xs text-[#64748B]">Data protection, candidate psychometric response governance, and retention terms.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#0F172A]">Policy Document Body</label>
                  <span className="text-[#94A3B8] tabular-nums">
                    {(blocks["privacy_policy"]?.body || "").length} characters
                  </span>
                </div>
                <textarea
                  rows={12}
                  value={blocks["privacy_policy"]?.body || ""}
                  onChange={(e) => handleBlockChange("privacy_policy", "body", e.target.value)}
                  className="w-full p-3 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 6: TERMS & CONDITIONS */}
          {activeTab === "terms" && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Terms & Conditions</h3>
                <p className="text-xs text-[#64748B]">Platform assessment license, scoring validity boundaries, and candidate obligations.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#0F172A]">Terms Document Body</label>
                  <span className="text-[#94A3B8] tabular-nums">
                    {(blocks["terms_conditions"]?.body || "").length} characters
                  </span>
                </div>
                <textarea
                  rows={12}
                  value={blocks["terms_conditions"]?.body || ""}
                  onChange={(e) => handleBlockChange("terms_conditions", "body", e.target.value)}
                  className="w-full p-3 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white sm:bg-[#F8FAFC] flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-[#64748B] hidden sm:block">
            {isTabDirty() ? "You have unsaved changes in this module." : "Module content is synced."}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveActiveTab}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving Changes..." : "Save Content Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
