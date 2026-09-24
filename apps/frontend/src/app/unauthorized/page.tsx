import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] p-4 text-black font-sans">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-[#E2E0DB] shadow-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
          Access Denied (403)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-2">
          Insufficient Permissions
        </h1>
        <p className="text-sm text-[#555555] leading-relaxed mb-6">
          Your current account does not have the required role (<code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-black">STAFF</code> or <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-black">ADMIN</code>) to access this surface.
        </p>

        <div className="flex flex-col gap-2.5">
          <SignOutButton className="w-full justify-center py-3 rounded-2xl bg-[#1A1A1D] text-white hover:bg-[#333338] hover:text-white border-transparent text-sm font-extrabold" />
          
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F0F0EE] text-black font-extrabold text-xs hover:bg-[#E4E4E0] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

