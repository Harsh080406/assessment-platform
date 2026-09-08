"use client";

import { X, Download, FileText, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface SampleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SampleReportModal({ isOpen, onClose }: SampleReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E2E0DB] overflow-hidden flex flex-col max-h-[90vh] text-black">
        {/* Modal Header */}
        <div className="bg-[#1A1A1D] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 border-b border-[#2E2E32]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#A9B4E8] border border-[#A9B4E8]/30 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-base leading-snug text-white font-[family-name:var(--font-dm-sans)]">
                Pathfinder Parent Diagnostic Report
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#A9B4E8]">Sample Candidate: Aarav Mehta (Class 11, CBSE)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:text-white hover:bg-[#2E2E32] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Report Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 text-black text-sm">
          {/* Executive Summary Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#E2E0DB] shadow-sm text-black">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                Executive Student Summary
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A9D8C6] text-black text-xs font-black shadow-sm">
                93.4% Validity Rating
              </span>
            </div>
            <h4 className="text-lg font-extrabold text-black">
              Archetype: The Creative Strategist (Hybrid Technical & Narrative)
            </h4>
            <p className="text-xs sm:text-sm text-[#333333] mt-2 leading-relaxed">
              Candidate exhibits exceptional divergent reasoning (95th percentile) coupled with strong systemic formulation instincts (84th percentile). Rather than rigid pure rote fields, candidate flourishes at the intersection of technological architecture and human product interaction.
            </p>
          </div>

          {/* Core Strengths & Family Conversation Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E2E0DB] bg-white shadow-sm text-black">
              <h5 className="font-black text-xs uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                Validated Core Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-[#333333] font-bold">
                <li>• High spatial & interaction reasoning</li>
                <li>• Spontaneous problem breakdown under ambiguity</li>
                <li>• Natural cross-disciplinary synthesis</li>
                <li>• Strong internal motivation when building prototypes</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E0DB] bg-[#EEF1FB] shadow-sm text-black">
              <h5 className="font-black text-xs uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-black" />
                Suggested Family Discussion Points
              </h5>
              <ul className="space-y-1.5 text-xs text-[#333333] font-bold">
                <li>1. “Which projects this semester felt effortless rather than forced?”</li>
                <li>2. “How do you feel about double-major or design-engineering tracks?”</li>
                <li>3. “What real-world problem would you spend a summer exploring?”</li>
              </ul>
            </div>
          </div>

          {/* Privacy & Methodology Seal */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#EAF6F0] border border-[#E2E0DB] text-xs text-black font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5 text-black shrink-0" />
            <span>
              Certified under international psychometric standards. Student assessment data is encrypted at rest and never commercialized.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EEF1FB]/60 border-t border-[#E2E0DB] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#333333] font-bold">
            Full 24-page PDF includes stream choice matrices & university shortlists.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2E0DB] bg-white text-xs font-black text-black hover:bg-[#EEF1FB] flex-1 sm:flex-none text-center cursor-pointer transition-colors shadow-sm"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Downloading sample parent report (PDF format)...");
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#A9B4E8] text-black border border-[#A9B4E8] text-xs font-extrabold hover:bg-[#8E9BDD] shadow-sm transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              Download Sample PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
