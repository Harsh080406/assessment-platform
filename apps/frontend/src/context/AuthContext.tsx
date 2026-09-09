"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthModal from "@/components/AuthModal";

interface AuthContextType {
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);

  return (
    <AuthContext.Provider value={{ isAuthOpen, openAuth, closeAuth }}>
      {children}
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
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
