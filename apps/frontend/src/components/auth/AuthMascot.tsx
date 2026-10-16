import React from "react";
import Image from "next/image";

interface AuthMascotProps {
  className?: string;
}

export default function AuthMascot({ className = "" }: AuthMascotProps) {
  return (
    <div
      className={`w-full h-full relative select-none overflow-hidden flex items-center justify-center bg-[#FDCBC7] ${className}`}
    >
      <Image
        src="/Untitled design.svg"
        alt="Alderwood Vantage Leadership Potential Assessment"
        fill
        priority
        unoptimized
        sizes="(max-width: 768px) 100vw, 50vw"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

