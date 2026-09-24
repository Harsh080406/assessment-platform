"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface CityscapeLoadingScreenProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

const DEFAULT_MESSAGES = [
  "Authenticating your session...",
  "Loading your personalized dashboard...",
  "Syncing psychometric assessment modules...",
  "Preparing career constellation data...",
];

export default function CityscapeLoadingScreen({
  message,
  submessage,
}: CityscapeLoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    // Rotate status messages smoothly
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 1800);

    // Simulated progress bar advancement
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        return prev + Math.floor(Math.random() * 10 + 6);
      });
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  const activeMessage = message || DEFAULT_MESSAGES[currentMessageIndex];

  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen overflow-hidden select-none bg-slate-950">
      {/* Desktop / Laptop "Window Friendly" Full-Screen Image */}
      <div className="hidden md:block absolute inset-0 w-full h-full">
        <Image
          src="/window friendly.png"
          alt="AuraPath Desktop Background"
          fill
          priority
          unoptimized
          className="object-cover w-full h-full"
        />
      </div>

      {/* Mobile "Mobile Friendly" Full-Screen Image */}
      <div className="block md:hidden absolute inset-0 w-full h-full">
        <Image
          src="/mobile friendly.png"
          alt="AuraPath Mobile Background"
          fill
          priority
          unoptimized
          className="object-cover w-full h-full"
        />
      </div>

      {/* Overlaid UI Content (Logo, Progress Bar, Status Message) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-10 px-4 bg-black/20 backdrop-blur-[2px]">
        {/* Empty Spacer Top */}
        <div />

        {/* Center Loading Card */}
        <div className="flex flex-col items-center justify-center text-center max-w-md w-full mx-auto space-y-4 bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/60">
          {/* Sleek Brand Header */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-[family-name:var(--font-plus-jakarta-sans)] text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
              Aura<span className="text-[#FF6B6B]">Path</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-64 sm:w-80 h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden p-[2px] border border-[#E2E8F0]">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B6B] via-[#4F46E5] to-[#10B981] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Contextual Status Message */}
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-black">
              {activeMessage}
            </p>
            {submessage && (
              <p className="text-xs font-semibold text-black">
                {submessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom subtle copyright / branding tag in a high-contrast pill */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/60 text-[11px] font-bold tracking-wider text-black uppercase">
          AuraPath Assessment Platform
        </div>
      </div>
    </div>
  );
}



