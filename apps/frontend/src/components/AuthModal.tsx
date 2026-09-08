"use client";

import { useState } from "react";
import { X, Mail, Lock, User, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isSignUp ? "Account created successfully! Welcome to Pathfinder." : "Logged in successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E2E0DB] overflow-hidden p-6 sm:p-8 text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-black hover:bg-[#EEF1FB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#A9B4E8] text-black flex items-center justify-center mx-auto mb-3 shadow-sm">
            <User className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-2xl font-extrabold text-black font-[family-name:var(--font-dm-sans)]">
            {isSignUp ? "Create Your Student Account" : "Welcome Back"}
          </h3>
          <p className="text-xs text-[#444444] mt-1 font-medium">
            {isSignUp
              ? "Save your psychometric roadmap and track your career clusters"
              : "Access your saved assessment reports and career insights"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase text-black mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E0DB] text-sm text-black bg-white focus:outline-none focus:ring-1 focus:ring-[#A9B4E8] focus:border-[#A9B4E8] font-bold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E0DB] text-sm text-black bg-white focus:outline-none focus:ring-1 focus:ring-[#A9B4E8] focus:border-[#A9B4E8] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-black mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E0DB] text-sm text-black bg-white focus:outline-none focus:ring-1 focus:ring-[#A9B4E8] focus:border-[#A9B4E8] font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#A9B4E8] text-black font-extrabold text-sm shadow-sm hover:bg-[#8E9BDD] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{isSignUp ? "Start Journey" : "Log In"}</span>
            <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#444444]">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-bold text-black hover:underline transition-colors cursor-pointer"
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-bold text-black hover:underline transition-colors cursor-pointer"
              >
                Sign Up for Free
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
