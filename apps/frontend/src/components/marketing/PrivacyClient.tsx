"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck2,
  Calendar,
  AlertCircle,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function PrivacyClient() {
  const lastUpdated = "October 24, 2026";

  const tableOfContents = [
    { id: "parental-consent", title: "1. Mandatory Upfront Parental Consent" },
    { id: "zero-monetization", title: "2. Zero-Monetization & Privacy Guarantee" },
    { id: "data-collected", title: "3. Categories of Information Collected" },
    { id: "purpose-processing", title: "4. Purpose & Legal Basis for Processing" },
    { id: "evaluator-governance", title: "5. Evaluator Access & Strict Governance" },
    { id: "security-retention", title: "6. Encryption, Storage & Data Retention" },
    { id: "guardian-rights", title: "7. Parental & Student Rights (DPDP Act 2023)" },
    { id: "cookies-tracking", title: "8. Cookies & Analytics Policy" },
    { id: "grievance-contact", title: "9. Grievance Officer & Contact Information" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#0F172A] font-sans selection:bg-[#FED7CC] selection:text-[#0F172A]">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================
            HERO HEADER
        ========================================================= */}
        <section className="pt-14 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 max-w-[1120px] mx-auto">
          <div className="max-w-[820px]">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2E8F0] text-[#0F172A] text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4 text-[#FF6B6B]" />
              <span>Student Data Governance &amp; Ethics Charter</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-[-0.02em] leading-[1.15]">
              Privacy Policy &amp; Parental Consent Charter
            </h1>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
              At Alderwood Vantage, we believe assessing a student&apos;s cognitive wiring and leadership potential is a sacred trust. This charter details how we safeguard student responses, maintain upfront parental oversight, and guarantee zero commercialization of family data.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#64748B] font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF6B6B]" />
                Last Updated: {lastUpdated}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                DPDP Act 2023 &amp; Global Minor Safeguard Compliant
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            KEY HIGHLIGHTS CALLOUT CARDS
        ========================================================= */}
        <section className="px-4 sm:px-6 max-w-[1120px] mx-auto pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FED7CC]/40 flex items-center justify-center text-[#FF6B6B] mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Upfront Parental Consent</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Minors cannot take the assessment without verified guardian consent. Parents retain direct transparency over report deliverables.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Zero Commercial Monetization</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                We never sell, rent, or trade student scores or contact data to tuition academies, universities, coaching classes, or advertisers.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Encrypted &amp; Clinical Audit</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Encrypted with AES-256 at rest and TLS 1.3 in transit. Evaluator reviews are restricted to certified DDI &amp; IIM practitioners under NDA.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            DOCUMENT BODY & TABLE OF CONTENTS
        ========================================================= */}
        <section className="px-4 sm:px-6 max-w-[1120px] mx-auto pb-20 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
            {/* Table of Contents Sticky Sidebar */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-28 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
                <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-4">
                  Charter Navigation
                </h2>
                <nav className="space-y-1.5">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-[13px] font-medium text-[#475569] hover:text-[#FF6B6B] hover:translate-x-1 py-1.5 transition-all truncate"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B] mb-3">
                    Have questions regarding your child&apos;s data rights?
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B] hover:underline"
                  >
                    <span>Contact Privacy Desk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content Clauses */}
            <article className="lg:col-span-8 space-y-12 text-[#334155] leading-relaxed">
              {/* Section 1 */}
              <div id="parental-consent" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  1. Mandatory Upfront Parental &amp; Legal Guardian Consent
                </h2>
                <p className="mb-4">
                  Alderwood Vantage adheres strictly to Section 9 of the Digital Personal Data Protection (DPDP) Act, 2023, concerning the processing of personal data of children. As our career diagnostic and leadership frameworks serve high-school and undergraduate candidates (typically ages 14 to 22), we mandate verifiable parental or legal guardian consent prior to administering evaluations for any candidate who is a minor.
                </p>
                <div className="bg-[#F8FAFC] border-l-4 border-[#FF6B6B] p-4 rounded-r-xl my-4 text-sm">
                  <p className="font-semibold text-[#0F172A] mb-1">Parental Representation Guarantee:</p>
                  <p className="text-[#475569]">
                    By allowing a minor child to register or take the assessment, the parent or lawful legal guardian affirms that they have reviewed this policy and consent to the student participating in cognitive, situational judgment, and psychometric trait questionnaires.
                  </p>
                </div>
                <p>
                  Parents may at any time inspect the exact questions their child responded to, request a copy of the synthesized Leadership Blueprint, or request the immediate cessation of assessment evaluation.
                </p>
              </div>

              {/* Section 2 */}
              <div id="zero-monetization" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  2. Strict Zero-Monetization &amp; Anti-Spam Guarantee
                </h2>
                <p className="mb-4">
                  Alderwood Vantage operates on a direct fee-for-service professional advisory model. We do not participate in ad networks, behavioural tracking brokers, or commercial student recruitment bazaars.
                </p>
                <ul className="space-y-2.5 my-4">
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Sale of Student Data:</strong> We will never sell, lease, or monetize personal details, email addresses, phone numbers, or diagnostic scores to private coaching institutes, overseas education agents, tuition academies, or lenders.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Commercial AI Training:</strong> Student psychometric responses are used exclusively to produce the candidate&apos;s own personalized reports. They are never ingested into open-domain or commercial AI foundation models.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Zero Spam Communications:</strong> Communications sent to students or guardians are limited strictly to assessment operational links, report readiness notices, and scheduled 1-on-1 counselling logistics.</span>
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div id="data-collected" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  3. Categories of Information Collected
                </h2>
                <p className="mb-3">
                  To administer the multi-dimensional assessment and formulate calibrated 5-year leadership recommendations, we collect the following limited categories of data:
                </p>
                <div className="space-y-4 text-sm">
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <h3 className="font-bold text-[#0F172A] mb-1">A. Registration &amp; Guardian Profile Data</h3>
                    <p className="text-[#475569]">Candidate full name, school/college name, current grade/stage (e.g. Class 11, Class 12, Undergraduate Year 3/4), candidate email, phone number, and parent/guardian contact credentials.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <h3 className="font-bold text-[#0F172A] mb-1">B. Psychometric &amp; Cognitive Responses</h3>
                    <p className="text-[#475569]">Responses recorded across our four evaluation modules: Spark (RIASEC vocational interests), Wiring (Big Five personality factors &amp; work preferences), Horsepower (cognitive problem solving &amp; numerical reasoning), and Edge (workplace situational judgment scenarios).</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <h3 className="font-bold text-[#0F172A] mb-1">C. Technical &amp; Integrity Telemetry</h3>
                    <p className="text-[#475569]">IP address, browser type, device operating system, response submission timestamps, and module completion durations used solely for platform security, fraud prevention, and session continuity.</p>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div id="purpose-processing" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  4. Purpose &amp; Legal Basis for Processing
                </h2>
                <p className="mb-3">
                  We process data under lawful grounds established by the DPDP Act 2023 and global privacy best practices, strictly for legitimate educational advisory purposes:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-[#475569]">
                  <li>Generating the certified <strong>Leadership Blueprint</strong> deliverable, assessing fitment across corporate leadership, entrepreneurship, family enterprise stewardship, or specialized professions.</li>
                  <li>Facilitating scheduled 1-on-1 strategic counselling sessions between certified practitioners and the student/guardian.</li>
                  <li>Constructing the custom 5-Year Leadership Roadmap (milestone planning, skill acquisition, and real-world project portfolios).</li>
                  <li>Enabling institutional analytics for registered school partners (aggregated cohort benchmarks, where individual student reports are accessed only with institutional enrollment authorization).</li>
                </ol>
              </div>

              {/* Section 5 */}
              <div id="evaluator-governance" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  5. Evaluator Access &amp; Strict Governance
                </h2>
                <p className="mb-3">
                  Human evaluation of subjective and situational assessment responses is conducted strictly by certified practitioners:
                </p>
                <p className="text-sm mb-3">
                  Our panel comprises senior corporate leadership facilitators (DDI Master Facilitators), EPSHRM alumni from IIM Calcutta, and PhD academicians. Every evaluator is bound by binding non-disclosure agreements (NDAs) and professional codes of psychological test administration ethics.
                </p>
                <p className="text-sm">
                  Evaluator access to candidate accounts is granted strictly on a need-to-know basis via role-based access control (RBAC). Evaluators cannot download raw database dumps or export personal contact databases for personal use.
                </p>
              </div>

              {/* Section 6 */}
              <div id="security-retention" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  6. Encryption, Storage &amp; Data Retention
                </h2>
                <p className="mb-3">
                  We deploy multi-layered architectural safeguards to defend student records against unauthorized access, alteration, disclosure, or destruction:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm my-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <div className="font-bold text-[#0F172A] mb-1">Encryption at Rest &amp; Transit</div>
                    <p className="text-xs text-[#64748B]">All databases and backups are encrypted using industry-standard AES-256. Web communications are routed exclusively through TLS 1.3 cryptographic protocols.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <div className="font-bold text-[#0F172A] mb-1">Defined Retention Lifecycles</div>
                    <p className="text-xs text-[#64748B]">Assessment response data and final blueprints are retained for a period of up to 5 academic years to support longitudinal career guidance, unless deletion is requested earlier.</p>
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div id="guardian-rights" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  7. Parental &amp; Student Rights
                </h2>
                <p className="mb-3">
                  Under the DPDP Act 2023, candidates and their lawful guardians possess comprehensive rights regarding their personal data:
                </p>
                <div className="space-y-2.5 text-sm text-[#475569]">
                  <p><strong>• Right to Access:</strong> You may request a complete export of your student profile and generated assessment records at any time.</p>
                  <p><strong>• Right to Rectification:</strong> You may correct inaccurate or obsolete personal details (e.g. updated grade, contact email) through your account settings or our support desk.</p>
                  <p><strong>• Right to Erasure:</strong> Guardians may request the total deletion of the student account and all corresponding raw psychometric answers by writing to our Data Protection Officer.</p>
                  <p><strong>• Right to Revoke Consent:</strong> Guardians may withdraw previously granted evaluation consent at any stage prior to final blueprint publication.</p>
                </div>
              </div>

              {/* Section 8 */}
              <div id="cookies-tracking" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  8. Cookies &amp; Analytics Policy
                </h2>
                <p className="text-sm mb-3">
                  Alderwood Vantage uses strictly necessary functional cookies and authentication session tokens (NextAuth) to keep students securely logged in and preserve question progress as they navigate modules.
                </p>
                <p className="text-sm">
                  We do not use cross-site tracking cookies, retargeting pixels, or third-party marketing beacons that follow students across other websites on the internet.
                </p>
              </div>

              {/* Section 9 */}
              <div id="grievance-contact" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  9. Grievance Officer &amp; Contact Information
                </h2>
                <p className="text-sm mb-4">
                  In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, the details of our designated Data Protection &amp; Grievance Redressal Officer are as follows:
                </p>
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3 text-sm">
                  <div>
                    <span className="font-bold text-[#0F172A]">Designation:</span> Data Protection &amp; Student Privacy Officer
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A]">Platform:</span> Alderwood Vantage Assessment Platform
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF6B6B]" />
                    <span className="font-bold text-[#0F172A]">Direct Privacy Email:</span>
                    <a href="mailto:contact@alderwoodvantage.com" className="text-[#FF6B6B] hover:underline font-medium">
                      contact@alderwoodvantage.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FF6B6B]" />
                    <span className="font-bold text-[#0F172A]">Helpline:</span>
                    <a href="tel:+919316819331" className="text-[#0F172A] hover:text-[#FF6B6B] font-medium">
                      +91 93168 19331 (Mon – Sat, 9:00 AM – 7:00 PM IST)
                    </a>
                  </div>
                  <p className="text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                    All parental enquiries, consent revocations, and data deletion requests are formally acknowledged within 4 business hours and executed within 7 business days.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* =========================================================
            BOTTOM CALL TO ACTION
        ========================================================= */}
        <section className="bg-white border-t border-[#E2E8F0] py-14 sm:py-16 px-4 sm:px-6">
          <div className="max-w-[720px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Ready to begin your leadership journey with complete confidence?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#475569]">
              Explore our assessment packages or speak with our senior counsellors today.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/packages"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-bold text-sm shadow-xs transition-all"
              >
                <span>View Assessment Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/terms"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-bold text-sm transition-all"
              >
                <span>Read Terms of Service</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
