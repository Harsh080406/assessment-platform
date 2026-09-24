"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthModal from "@/components/AuthModal";

export type AuthModalMode = "login" | "signup" | "forgot_password" | "phone";

interface AuthContextType {
  isAuthOpen: boolean;
  authMode: AuthModalMode;
  openAuth: (mode?: AuthModalMode) => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthModalMode>("login");

  const openAuth = (mode: AuthModalMode = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthOpen, authMode, openAuth, closeAuth }}>
      {children}
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} initialMode={authMode} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
