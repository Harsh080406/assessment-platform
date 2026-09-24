"use client";

import { Suspense } from "react";
import UnifiedAuthCard from "@/components/auth/UnifiedAuthCard";

import CityscapeLoadingScreen from "@/components/loading/CityscapeLoadingScreen";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={<CityscapeLoadingScreen message="Loading recovery portal..." />}
    >
      <UnifiedAuthCard initialMode="forgot_password" />
    </Suspense>
  );
}

