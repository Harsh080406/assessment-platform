"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import UnifiedAuthCard from "@/components/auth/UnifiedAuthCard";

import CityscapeLoadingScreen from "@/components/loading/CityscapeLoadingScreen";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return <UnifiedAuthCard initialMode="login" callbackUrl={callbackUrl} />;
}


export default function LoginPage() {
  return (
    <Suspense
      fallback={<CityscapeLoadingScreen message="Loading login space..." />}
    >
      <LoginContent />
    </Suspense>
  );
}

