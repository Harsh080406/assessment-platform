"use client";

import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "How is Alderwood Vantage different from standard career tests?",
    a: "Most career tests are 10-minute quizzes that produce generic, robotic results. Alderwood Vantage takes students from self-discovery to leadership: a validated assessment across four dimensions (Spark, Wiring, Horsepower, Edge), expert counselling, mentorship, and a 5-year pathway that helps every student become the leader, innovator and builder they can be.",
  },
  {
    q: "Who designed and validated the assessment framework?",
    a: "The framework was developed by senior corporate leadership and HR professionals who have spent entire careers hiring and developing leaders in global enterprises. It is led by DDI Master Facilitators and EPSHRM alumni from IIM Calcutta, and validated in partnership with PhD-qualified academicians.",
  },
  {
    q: "Why is parental consent taken up front?",
    a: "Teenagers are still growing, and student cognitive and behavioral data is sensitive. Parental consent is taken up front because we handle student information with utmost care. Data is strictly confidential and never shared or sold to coaching centers.",
  },
  {
    q: "What is the Leadership Blueprint deliverable?",
    a: "The Leadership Blueprint is a clear, jargon-free report covering the Leader's Lens (how the student shows up today as a leader and innovator), Pathway Fit (suitability across Building a Venture, Leading the Family Business, a Professional Career, or Hybrid), and the Gap-to-Ready Meter.",
  },
  {
    q: "What packages do you offer and what is the 5-Year Leadership Roadmap?",
    a: "We offer three packages: Discover (Assessment + Leadership Blueprint), Decode (Assessment + Blueprint + 2 one-on-one counselling sessions), and Design (Assessment + Blueprint + Counselling + 5-Year Leadership Roadmap detailing skills to build, real-world projects, mentorship, and yearly milestones).",
  },
];

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch("/api/content?key=faq_list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.block?.body) {
          try {
            const parsed = JSON.parse(data.block.body);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sanitized = parsed.map((item: FaqItem) => ({
                q: (item.q || "").replace(/AuraPath|aurapath|AURAPATH/gi, "Alderwood Vantage"),
                a: (item.a || "").replace(/AuraPath|aurapath|AURAPATH/gi, "Alderwood Vantage"),
              }));
              setFaqs(sanitized);
            }
          } catch {
            // fallback to default
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-[#E2E8F0]" id="faq">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Everything you need to know about our assessment framework, certified clinical turnaround, and privacy.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-[#E2E8F0] rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#CBD5E1]"
              >
                <button
                  type="button"
                  id={`faq-btn-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 bg-white text-black cursor-pointer"
                  style={{ color: "#000000" }}
                >
                  <span
                    className="font-extrabold text-black text-sm sm:text-[16px] leading-snug"
                    style={{ color: "#000000" }}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#64748B]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-btn-${index}`}
                  className={`px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] bg-[#F8FAFC]/50 ${
                    isOpen ? "block" : "hidden"
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
