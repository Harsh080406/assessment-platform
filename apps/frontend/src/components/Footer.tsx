"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Why Vantage", href: "/#why-vantage" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQs", href: "/#faq" },
  ];

  const packageLinks = [
    { label: "Packages Overview", href: "/packages" },
    { label: "Assessment Pathways", href: "/#pathways" },
    { label: "5-Year Leadership Roadmap", href: "/packages" },
  ];

  const legalLinks = [
    { label: "Privacy & Parental Consent", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
  ];

  return (
    <footer className="bg-[#F5F5F4] text-[#334155] border-t border-[#E7E5E4] pt-12 sm:pt-14 pb-10 text-sm mt-auto select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1120px] mx-auto">
        {/* Main Grid: Logo on Left + 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E7E5E4] items-start">
          {/* Column 1: Transparent Brand Logo */}
          <div className="sm:col-span-2 lg:col-span-3 flex items-start">
            <Link
              href="/"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-lg group -mt-1 sm:-mt-2"
              draggable={false}
              aria-label="Alderwood Vantage Home"
            >
              <Image
                src="/AlderwoodVANTAGE.svg"
                alt="Alderwood Vantage Logo"
                width={200}
                height={160}
                draggable={false}
                className="h-24 sm:h-28 lg:h-32 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Column 2: Company */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-[13px] font-medium text-[#64748B]">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Packages */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Packages
            </h4>
            <ul className="space-y-2.5 text-[13px] font-medium text-[#64748B]">
              {packageLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Trust */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-[13px] font-medium text-[#64748B]">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="sm:col-span-1 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-[13px] font-medium text-[#64748B]">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0F172A] shrink-0" aria-hidden="true" />
                <a
                  href="tel:+919316819331"
                  className="hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                >
                  +91 93168 19331
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0F172A] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:contact@alderwoodvantage.com"
                  className="hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] rounded-sm"
                >
                  contact@alderwoodvantage.com
                </a>
              </li>
              <li className="pt-1">
                <Link
                  href="/contact"
                  className="inline-flex items-center text-xs font-bold text-[#FF6B6B] hover:underline"
                >
                  Contact support & advisory →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION: Copyright Notice */}
        <div className="pt-8 text-center">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} Alderwood Vantage. All rights reserved. Raising leaders, not just employees.
          </p>
        </div>
      </div>
    </footer>
  );
}
