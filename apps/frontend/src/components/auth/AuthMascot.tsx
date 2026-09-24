import React from "react";
import Image from "next/image";

interface AuthMascotProps {
  className?: string;
}

export default function AuthMascot({ className = "" }: AuthMascotProps) {
  return (
    <div
      className={`w-full h-full min-h-[380px] relative select-none rounded-[24px] sm:rounded-[28px] overflow-hidden flex items-center justify-center bg-[#FFF5F2] ${className}`}
    >
      <Image
        src="/auth-hero.png"
        alt="AuraPath Assessment and Self-Discovery"
        fill
        priority
        unoptimized
        sizes="(max-width: 768px) 100vw, 600px"
        className="w-full h-full object-cover object-center rounded-[24px] sm:rounded-[28px]"
      />
    </div>
  );
}

