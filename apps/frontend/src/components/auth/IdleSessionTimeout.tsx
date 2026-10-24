"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { signOut } from "next-auth/react";
import { ShieldAlert, LogOut, RefreshCw } from "lucide-react";

interface IdleSessionTimeoutProps {
  /** Total minutes of inactivity before auto-logout (default: 15 minutes) */
  timeoutMinutes?: number;
  /** Seconds before logout when the warning modal appears (default: 120 seconds / 2 minutes) */
  warningSeconds?: number;
}

const STORAGE_KEY_LAST_ACTIVE = "alderwood_last_active_time";
const STORAGE_KEY_LOGOUT_BROADCAST = "alderwood_idle_logout_broadcast";

export default function IdleSessionTimeout({
  timeoutMinutes = 15,
  warningSeconds = 120,
}: IdleSessionTimeoutProps) {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningSeconds * 1000;

  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningSeconds);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const lastActiveRef = useRef<number>(Date.now());
  const lastRecordedRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  // Trigger Sign Out
  const performSignOut = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setIsLoggingOut(true);

    try {
      // Broadcast logout to all other open tabs
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_LOGOUT_BROADCAST, Date.now().toString());
        localStorage.removeItem(STORAGE_KEY_LAST_ACTIVE);
      }
    } catch {
      // Ignore localStorage write failures (e.g. private mode quotas)
    }

    await signOut({ callbackUrl: "/login?reason=inactivity" });
  }, []);

  // Record user activity
  const recordActivity = useCallback(() => {
    if (isLoggingOutRef.current) return;

    const now = Date.now();
    lastActiveRef.current = now;

    // Throttle writes to localStorage to once every 3 seconds to preserve performance
    if (now - lastRecordedRef.current > 3000) {
      lastRecordedRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString());
      } catch {
        // Fallback for strict browser restrictions
      }
    }

    if (isWarningVisible) {
      setIsWarningVisible(false);
    }
  }, [isWarningVisible]);

  // Stay signed in button handler
  const handleStaySignedIn = () => {
    recordActivity();
    setIsWarningVisible(false);
  };

  useEffect(() => {
    // Initialize last active timestamp
    const now = Date.now();
    lastActiveRef.current = now;
    lastRecordedRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString());
    } catch {}

    // 1. Activity event listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
      "wheel",
    ];

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleEvent = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          recordActivity();
        }, 1000);
      }
    };

    activityEvents.forEach((ev) => {
      window.addEventListener(ev, handleEvent, { passive: true });
    });

    // 2. Multi-tab synchronization via localStorage storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_LAST_ACTIVE && e.newValue) {
        const remoteLastActive = parseInt(e.newValue, 10);
        if (!isNaN(remoteLastActive) && remoteLastActive > lastActiveRef.current) {
          lastActiveRef.current = remoteLastActive;
          setIsWarningVisible(false);
        }
      } else if (e.key === STORAGE_KEY_LOGOUT_BROADCAST) {
        // Another tab triggered idle logout; sync logout immediately
        if (!isLoggingOutRef.current) {
          isLoggingOutRef.current = true;
          signOut({ callbackUrl: "/login?reason=inactivity" });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 3. Heartbeat ticker every second to check idle duration
    const interval = setInterval(() => {
      if (isLoggingOutRef.current) return;

      const currentTime = Date.now();
      const elapsed = currentTime - lastActiveRef.current;

      // Check if session has exceeded the total timeout
      if (elapsed >= timeoutMs) {
        performSignOut();
        return;
      }

      // Check if session has entered the warning window
      if (elapsed >= timeoutMs - warningMs) {
        const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
        setSecondsRemaining(remaining);
        setIsWarningVisible(true);
      } else {
        if (isWarningVisible) {
          setIsWarningVisible(false);
        }
      }
    }, 1000);

    return () => {
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, handleEvent);
      });
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [timeoutMs, warningMs, recordActivity, performSignOut, isWarningVisible]);

  if (!isWarningVisible) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] text-center transform animate-in zoom-in-95 duration-200">
        {/* Pulsing Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200/80 shadow-sm relative">
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3
          id="session-timeout-title"
          className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-2"
        >
          Session Inactivity Warning
        </h3>

        {/* Description */}
        <p id="session-timeout-desc" className="text-sm text-[#475569] leading-relaxed mb-6">
          You have been inactive for a while. To safeguard your candidate data and assessment records, your session will automatically expire in:
        </p>

        {/* Countdown Timer Display */}
        <div className="mb-6 py-3 px-4 rounded-2xl bg-[#FFF8F0] border border-amber-200/60 flex items-center justify-center gap-2">
          <span className="text-3xl font-black text-amber-600 tabular-nums">
            {secondsRemaining}
          </span>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            seconds remaining
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleStaySignedIn}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-5 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Signed In</span>
          </button>

          <button
            type="button"
            onClick={performSignOut}
            disabled={isLoggingOut}
            className="py-3 px-5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
