"use client";

import UnifiedAuthCard, { AuthMode } from "@/components/auth/UnifiedAuthCard";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <UnifiedAuthCard
        initialMode={initialMode}
        onClose={onClose}
        isModal={true}
        callbackUrl="/dashboard"
      />
    </div>
  );
}
