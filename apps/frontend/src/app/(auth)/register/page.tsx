"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import UnifiedAuthCard from "@/components/auth/UnifiedAuthCard";

import CityscapeLoadingScreen from "@/components/loading/CityscapeLoadingScreen";

function RegisterContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return <UnifiedAuthCard initialMode="signup" callbackUrl={callbackUrl} />;
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<CityscapeLoadingScreen message="Loading registration space..." />}
    >
      <RegisterContent />
    </Suspense>
  );
}

