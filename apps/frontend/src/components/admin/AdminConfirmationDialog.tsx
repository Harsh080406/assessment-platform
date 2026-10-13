"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

interface AdminConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  target?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function AdminConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  target,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
}: AdminConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Focus trap focus on open
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-5 sm:p-6 space-y-4 focus:outline-none"
      >
        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDestructive
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-indigo-50 text-indigo-600 border border-indigo-200"
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h2
              id="confirmation-dialog-title"
              className="text-base font-bold text-[#0F172A] tracking-tight"
            >
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
              {description}
            </p>

            {target && (
              <div className="mt-2.5 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] break-all">
                {target}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#0F172A] hover:bg-[#1E293B]"
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
