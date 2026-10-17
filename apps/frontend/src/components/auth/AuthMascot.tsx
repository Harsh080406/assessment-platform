"use client";

import React from "react";
import Image from "next/image";

interface AuthMascotProps {
  className?: string;
}

export default function AuthMascot({ className = "" }: AuthMascotProps) {
  return (
    <div
      className={`w-full h-full relative select-none overflow-hidden flex items-center justify-center bg-[#FDCBC7] ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Image
        src="/auth-mascot.webp"
        alt="Alderwood Vantage Leadership Potential Assessment"
        fill
        priority
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="w-full h-full object-cover object-center pointer-events-none select-none"
        style={
          {
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitUserDrag: "none",
            pointerEvents: "none",
          } as React.CSSProperties
        }
      />
      {/* Invisible protective overlay shield preventing right-click, saving, dragging, and touch callouts */}
      <div
        className="absolute inset-0 z-10 select-none cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={
          {
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
