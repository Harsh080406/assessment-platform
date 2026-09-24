import { Suspense } from "react";
import ActivateAccountClient from "@/components/auth/ActivateAccountClient";
import CityscapeLoadingScreen from "@/components/loading/CityscapeLoadingScreen";
import { verifyActivationToken } from "@/lib/activationToken";

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>;
}

async function ActivateContent({ searchParams }: ActivatePageProps) {
  const params = await searchParams;
  const token = params.token || "";

  const payload = token ? verifyActivationToken(token) : null;

  return (
    <ActivateAccountClient
      token={token}
      email={payload?.email || null}
      role={payload?.role || null}
    />
  );
}

export default function ActivatePage({ searchParams }: ActivatePageProps) {
  return (
    <div className="min-h-screen py-16 px-4 bg-[#F8FAFC] flex items-center justify-center">
      <Suspense fallback={<CityscapeLoadingScreen message="Verifying activation token..." />}>
        <ActivateContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
