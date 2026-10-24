"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileText,
  Scale,
  ShieldAlert,
  HelpCircle,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function TermsClient() {
  const lastUpdated = "October 24, 2026";

  const tableOfContents = [
    { id: "acceptance-eligibility", title: "1. Acceptance of Terms & Eligibility" },
    { id: "platform-scope", title: "2. Platform Description & Service Packages" },
    { id: "advisory-disclaimer", title: "3. Educational Advisory & Clinical Disclaimer" },
    { id: "account-security", title: "4. Account Registration & Credential Security" },
    { id: "assessment-integrity", title: "5. Assessment Integrity & Candidate Conduct" },
    { id: "intellectual-property", title: "6. Intellectual Property Rights" },
    { id: "counselling-protocol", title: "7. Counselling Scheduling & Protocol" },
    { id: "fees-refunds", title: "8. Fees, Payments & Cancellation Policy" },
    { id: "liability-warranties", title: "9. Limitation of Liability & Disclaimers" },
    { id: "governing-law", title: "10. Governing Law & Dispute Resolution" },
    { id: "legal-contact", title: "11. Contact for Legal Notices" },
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
              <Scale className="w-4 h-4 text-[#FF6B6B]" />
              <span>Assessment Platform Governance</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-[-0.02em] leading-[1.15]">
              Terms of Service &amp; Assessment Governance
            </h1>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
              These terms govern the use of Alderwood Vantage websites, assessment diagnostics, Leadership Blueprint deliverables, and advisory counselling sessions. Please review them carefully before taking an evaluation or enrolling a student.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#64748B] font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF6B6B]" />
                Effective Date: {lastUpdated}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Validated Educational &amp; Career Diagnostic Standard
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            KEY PRINCIPLES CALLOUT CARDS
        ========================================================= */}
        <section className="px-4 sm:px-6 max-w-[1120px] mx-auto pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FED7CC]/40 flex items-center justify-center text-[#FF6B6B] mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Developmental Guidance</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Blueprints and archetypes offer structured career fitment and leadership direction, not psychiatric or medical certifications.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Assessment Integrity</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Candidates must answer honestly and independently without generative AI proxies to maintain diagnostic validity.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">Ethical Guardianship</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Parents are empowered as active stakeholders with full visibility into packages, session schedules, and reports.
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
                  Terms Index
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
                    Looking for our Student Privacy Charter?
                  </p>
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B] hover:underline"
                  >
                    <span>View Privacy &amp; Parental Consent</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content Clauses */}
            <article className="lg:col-span-8 space-y-12 text-[#334155] leading-relaxed">
              {/* Section 1 */}
              <div id="acceptance-eligibility" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  1. Acceptance of Terms &amp; Eligibility
                </h2>
                <p className="mb-4">
                  By accessing, browsing, registering for, or using the Alderwood Vantage platform, you agree to be bound by these Terms of Service, our Privacy Policy &amp; Parental Consent Charter, and any supplementary guidelines provided.
                </p>
                <p className="text-sm mb-3">
                  <strong>Candidates Under 18:</strong> If you are under 18 years of age, you must have the explicit authorization and consent of your parent or lawful guardian to create an account, take assessments, or book counselling sessions. In such cases, &ldquo;you&rdquo; and &ldquo;your&rdquo; also refers to the parent or guardian acting on the minor&apos;s behalf.
                </p>
                <p className="text-sm">
                  If you do not agree with any provision of these terms, you must discontinue platform use immediately.
                </p>
              </div>

              {/* Section 2 */}
              <div id="platform-scope" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  2. Platform Description &amp; Service Packages
                </h2>
                <p className="mb-3">
                  Alderwood Vantage offers multi-dimensional student assessments and strategic leadership formulation designed to transition candidates from general self-discovery into real-world leadership capability:
                </p>
                <div className="space-y-3 text-sm my-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <span className="font-bold text-[#0F172A]">Discover Package:</span> Comprehensive 4-module evaluation (Spark, Wiring, Horsepower, Edge) resulting in a personalized Leadership Blueprint diagnostic deliverable.
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <span className="font-bold text-[#0F172A]">Decode Package:</span> Assessment + Leadership Blueprint + two 1-on-1 strategic debrief sessions with certified senior practitioners.
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                    <span className="font-bold text-[#0F172A]">Design Package:</span> Assessment + Blueprint + Debrief + a comprehensive 5-Year Leadership Roadmap specifying skill pathways, project portfolios, and milestone tracking.
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div id="advisory-disclaimer" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  3. Educational Advisory &amp; Clinical Disclaimer
                </h2>
                <div className="bg-[#FFF8F0] border-l-4 border-amber-500 p-4 rounded-r-xl my-4 text-sm">
                  <p className="font-bold text-[#0F172A] mb-1">Important Advisory Scope Notice:</p>
                  <p className="text-[#475569]">
                    The Leadership Blueprint, cognitive percentiles, behavioral archetype classifications, and practitioner debriefs are formulated solely for career navigation, pedagogical reflection, and leadership development. They do NOT constitute, and must not be used as, medical diagnoses, psychiatric assessments, clinical psychological evaluations, or legal determinations of aptitude.
                  </p>
                </div>
                <p className="text-sm">
                  Alderwood Vantage does not guarantee admission to any university, employment by any specific company, or precise career compensation levels. Career trajectories are multifaceted and dependent upon the student&apos;s sustained personal effort, academic credentials, and external economic circumstances.
                </p>
              </div>

              {/* Section 4 */}
              <div id="account-security" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  4. Account Registration &amp; Credential Security
                </h2>
                <p className="text-sm mb-3">
                  When creating an account, you must provide truthful, accurate, and current information. Each candidate is permitted one active assessment account.
                </p>
                <p className="text-sm">
                  You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify our support desk immediately at <a href="mailto:contact@alderwoodvantage.com" className="text-[#FF6B6B] underline font-medium">contact@alderwoodvantage.com</a> if you suspect unauthorized access.
                </p>
              </div>

              {/* Section 5 */}
              <div id="assessment-integrity" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  5. Assessment Integrity &amp; Candidate Conduct
                </h2>
                <p className="mb-3 text-sm">
                  The validity of our diagnostic models depends on honest, unassisted responses. Candidates agree to adhere to the following testing standards:
                </p>
                <ul className="space-y-2 text-sm text-[#475569] pl-5 list-disc">
                  <li>Complete all cognitive reasoning, personality preference, and situational judgment questions independently without the assistance of tutors, parents, or external advisors during the test.</li>
                  <li>Refrain from using automated bots, generative AI tools (such as ChatGPT), or browser scripts to answer questions.</li>
                  <li>Do not copy, screenshot, record, publish, or disseminate assessment questions, scenarios, or scoring rubrics.</li>
                </ul>
                <p className="text-sm mt-3">
                  We reserve the right to invalidate assessment attempts or withhold report issuance if anomalous answering patterns (e.g. inhuman response speeds or automated script signatures) are detected.
                </p>
              </div>

              {/* Section 6 */}
              <div id="intellectual-property" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  6. Intellectual Property Rights
                </h2>
                <p className="text-sm mb-3">
                  All intellectual property rights in the Alderwood Vantage platform, including but not limited to the 4-module methodology (Spark, Wiring, Horsepower, Edge), question taxonomies, situational dilemmas, proprietary scoring algorithms, graphic interfaces, website copy, and report templates, are the exclusive property of Alderwood Vantage.
                </p>
                <p className="text-sm">
                  Upon purchase and report generation, candidates and guardians are granted a personal, non-exclusive, non-transferable license to download and retain their individual Leadership Blueprint for personal career planning purposes. Commercial reproduction, resale, or white-labeling of reports without written consent is strictly prohibited.
                </p>
              </div>

              {/* Section 7 */}
              <div id="counselling-protocol" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  7. Counselling Scheduling &amp; Protocol
                </h2>
                <p className="text-sm mb-3">
                  For packages including 1-on-1 strategic counselling (Decode and Design):
                </p>
                <ul className="space-y-2 text-sm text-[#475569] pl-5 list-disc">
                  <li>Sessions are conducted virtually via secure video conference links.</li>
                  <li>Guardians of minor students are strongly encouraged and welcomed to participate in all debrief discussions.</li>
                  <li><strong>Rescheduling:</strong> Sessions may be rescheduled free of charge up to 24 hours prior to the scheduled slot. Cancellations or no-shows with less than 24 hours notice may forfeit the allotted session time.</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div id="fees-refunds" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  8. Fees, Payments &amp; Cancellation Policy
                </h2>
                <p className="text-sm mb-3">
                  Fees for assessment packages are payable in advance in Indian Rupees (INR) or applicable international currencies.
                </p>
                <p className="text-sm mb-3">
                  <strong>Refund Eligibility:</strong> Because assessment generation involves immediate allocation of psychometric engine tokens and evaluator review queue slots, full refunds are available only if requested prior to starting Module A. Once an assessment attempt has commenced or a report has been generated, services are deemed rendered and fees are non-refundable.
                </p>
              </div>

              {/* Section 9 */}
              <div id="liability-warranties" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  9. Limitation of Liability &amp; Disclaimers
                </h2>
                <p className="text-sm mb-3">
                  The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted by applicable law, Alderwood Vantage disclaims all warranties, express or implied, including fitness for a particular educational outcome.
                </p>
                <p className="text-sm">
                  In no event shall Alderwood Vantage, its directors, evaluators, or affiliates be liable for any indirect, consequential, punitive, or incidental damages arising out of student career decisions, college application outcomes, or reliance on advisory suggestions.
                </p>
              </div>

              {/* Section 10 */}
              <div id="governing-law" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  10. Governing Law &amp; Dispute Resolution
                </h2>
                <p className="text-sm mb-3">
                  These Terms of Service and any dispute arising from them shall be governed by and construed in accordance with the laws of India.
                </p>
                <p className="text-sm">
                  Both parties agree to submit to the exclusive jurisdiction of the competent courts situated in New Delhi, India for any legal proceedings or arbitration arising from platform services.
                </p>
              </div>

              {/* Section 11 */}
              <div id="legal-contact" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">
                  11. Contact for Legal Notices
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3 text-sm">
                  <div className="font-bold text-[#0F172A]">Alderwood Vantage Legal &amp; Governance Desk</div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF6B6B]" />
                    <span>Legal Email:</span>
                    <a href="mailto:contact@alderwoodvantage.com" className="text-[#FF6B6B] hover:underline font-medium">
                      contact@alderwoodvantage.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FF6B6B]" />
                    <span>Phone:</span>
                    <a href="tel:+919316819331" className="text-[#0F172A] hover:text-[#FF6B6B] font-medium">
                      +91 93168 19331
                    </a>
                  </div>
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
              Transparent, Ethical Guidance for Every Student
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#475569]">
              Review our Student Privacy &amp; Parental Consent Charter to learn how we protect your family&apos;s data.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/privacy"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-bold text-sm shadow-xs transition-all"
              >
                <span>Read Privacy &amp; Parental Consent</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/packages"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-bold text-sm transition-all"
              >
                <span>Explore Packages</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
