"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface SignOutButtonProps {
  className?: string;
  showLabel?: boolean;
  title?: string;
}

export default function SignOutButton({
  className = "",
  showLabel = true,
  title = "Sign Out",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${className}`}
    >
      <LogOut className="w-4 h-4 shrink-0" />
      {showLabel && <span>{isLoading ? "Signing out..." : "Sign Out"}</span>}
    </button>
  );
}
