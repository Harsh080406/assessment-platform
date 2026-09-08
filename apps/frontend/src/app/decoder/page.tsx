"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentParentDecoder from "@/components/StudentParentDecoder";
import ParentsSection from "@/components/ParentsSection";
import FloatingQuickAction from "@/components/FloatingQuickAction";

export default function ParentDecoderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-pop-paper text-pop-ink font-sans selection:bg-pop-lime selection:text-pop-ink">
      <Navbar />

      <main className="flex-1">
        {/* 1. Unified Myth vs Science Interactive Decoder */}
        <StudentParentDecoder />

        {/* 2. Guide for Parents & Mentors */}
        <ParentsSection />
      </main>

      <Footer />
      <FloatingQuickAction />
    </div>
  );
}
