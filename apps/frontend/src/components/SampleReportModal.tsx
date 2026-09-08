"use client";

import { X, Download, FileText, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface SampleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SampleReportModal({ isOpen, onClose }: SampleReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-brand-deepIndigo to-brand-vividViolet flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-base leading-snug">
                Pathfinder Parent Diagnostic Report
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Sample Candidate: Aarav Mehta (Class 11, CBSE)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Report Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 text-slate-700 text-sm">
          {/* Executive Summary Card */}
          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-deepIndigo">
                Executive Student Summary
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                93.4% Validity Rating
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-900">
              Archetype: The Creative Strategist (Hybrid Technical & Narrative)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Candidate exhibits exceptional divergent reasoning (95th percentile) coupled with strong systemic formulation instincts (84th percentile). Rather than rigid pure rote fields, candidate flourishes at the intersection of technological architecture and human product interaction.
            </p>
          </div>

          {/* Core Strengths & Family Conversation Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Validated Core Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• High spatial & interaction reasoning</li>
                <li>• Spontaneous problem breakdown under ambiguity</li>
                <li>• Natural cross-disciplinary synthesis</li>
                <li>• Strong internal motivation when building prototypes</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/50">
              <h5 className="font-bold text-xs uppercase tracking-wider text-brand-deepIndigo mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-deepIndigo" />
                Suggested Family Discussion Points
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li>1. “Which projects this semester felt effortless rather than forced?”</li>
                <li>2. “How do you feel about double-major or design-engineering tracks?”</li>
                <li>3. “What real-world problem would you spend a summer exploring?”</li>
              </ul>
            </div>
          </div>

          {/* Privacy & Methodology Seal */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Certified under international psychometric standards. Student assessment data is encrypted at rest and never commercialized.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Full 24-page PDF includes stream choice matrices & university shortlists.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex-1 sm:flex-none text-center"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Downloading sample parent report (PDF format)...");
                onClose();
              }}
              className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-brand-deepIndigo transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
