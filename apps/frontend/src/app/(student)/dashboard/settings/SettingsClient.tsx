"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  updateStudentProfileAction,
  uploadAvatarAction,
} from "@/app/actions/profile";

interface SettingsClientProps {
  initialData: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
    dateOfBirth: string | null;
    country: string | null;
    school: string | null;
    grade: string | null;
    educationLevel: string | null;
    bio: string | null;
  };
}

const COUNTRY_LIST = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
];

const PRESET_AVATARS = [
  { id: "hero", label: "Learner", url: "/smiling-student.png" },
  {
    id: "tech",
    label: "Analyst",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "creative",
    label: "Thinker",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "strategist",
    label: "Strategist",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
];

export const GRADE_OPTIONS = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Undergraduate Year 1 (UG 1)",
  "Undergraduate Year 2 (UG 2)",
  "Undergraduate Year 3 (UG 3)",
  "Undergraduate Year 4 (UG 4)",
];

export const STREAM_OPTIONS = [
  "Science (PCM - Physics, Chemistry, Maths)",
  "Science (PCB - Physics, Chemistry, Biology)",
  "Science (PCMB - Physics, Chemistry, Maths, Biology)",
  "Commerce with Mathematics",
  "Commerce without Mathematics",
  "Humanities / Arts",
  "Vocational / Applied Studies",
  "Other",
];

export const COMMON_UG_COURSES = [
  "B.Tech / B.E.",
  "B.Com / B.Com (Hons)",
  "BBA / BMS",
  "BCA / B.Sc Computer Science",
  "B.Sc (Sciences)",
  "BA (Humanities / Economics)",
  "LLB / Law",
  "B.Des / Architecture",
  "MBBS / Healthcare",
];

export function parseGradeDetails(rawGrade: string | null | undefined) {
  if (!rawGrade) {
    return {
      baseGrade: "",
      selectedStream: "",
      customStream: "",
      course: "",
    };
  }

  const parts = rawGrade.split(/[•\-]/).map((s) => s.trim());
  const firstPart = parts[0] || "";
  const remainder = parts.slice(1).join(" • ").trim();

  let baseGrade = firstPart;
  if (/^undergraduate\s*(year\s*)?1(\s*\(ug\s*1\))?$/i.test(firstPart) || /^ug\s*1$/i.test(firstPart)) {
    baseGrade = "Undergraduate Year 1 (UG 1)";
  } else if (/^undergraduate\s*(year\s*)?2(\s*\(ug\s*2\))?$/i.test(firstPart) || /^ug\s*2$/i.test(firstPart)) {
    baseGrade = "Undergraduate Year 2 (UG 2)";
  } else if (/^undergraduate\s*(year\s*)?3(\s*\(ug\s*3\))?$/i.test(firstPart) || /^ug\s*3$/i.test(firstPart)) {
    baseGrade = "Undergraduate Year 3 (UG 3)";
  } else if (/^undergraduate\s*(year\s*)?4(\s*\(ug\s*4\))?$/i.test(firstPart) || /^ug\s*4$/i.test(firstPart)) {
    baseGrade = "Undergraduate Year 4 (UG 4)";
  }

  const is11or12 = baseGrade === "Class 11" || baseGrade === "Class 12";
  const isUG =
    baseGrade.toLowerCase().includes("undergraduate") ||
    baseGrade.toLowerCase().startsWith("ug");

  let selectedStream = "";
  let customStream = "";
  let course = "";

  if (is11or12) {
    if (remainder) {
      const matched = STREAM_OPTIONS.find(
        (opt) => opt.toLowerCase() === remainder.toLowerCase() || opt.toLowerCase().startsWith(remainder.toLowerCase())
      );
      if (matched && matched !== "Other") {
        selectedStream = matched;
      } else {
        selectedStream = "Other";
        customStream = remainder;
      }
    }
  } else if (isUG) {
    course = remainder;
  }

  return {
    baseGrade,
    selectedStream,
    customStream,
    course,
  };
}

export function computeFinalGrade(
  base: string,
  stream: string,
  customStream: string,
  course: string
): string {
  if (!base) return "";
  const is11or12 = base === "Class 11" || base === "Class 12";
  const isUG =
    base.toLowerCase().includes("undergraduate") ||
    base.toLowerCase().startsWith("ug");

  if (is11or12) {
    const streamVal = stream === "Other" ? customStream.trim() : stream.trim();
    return streamVal ? `${base} • ${streamVal}` : base;
  }
  if (isUG) {
    const courseVal = course.trim();
    return courseVal ? `${base} • ${courseVal}` : base;
  }
  return base;
}

export default function SettingsClient({ initialData }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to parse phone
  const parseInitialPhone = (phoneStr: string | null) => {
    if (!phoneStr) return { code: "+91", number: "" };
    const trimmed = phoneStr.trim();
    const found = COUNTRY_LIST.find((c) => trimmed.startsWith(c.code));
    if (found) {
      const number = trimmed.slice(found.code.length).trim();
      return { code: found.code, number };
    }
    return { code: "+91", number: trimmed };
  };

  const initialPhoneParsed = parseInitialPhone(initialData.phone);
  const [selectedCountryCode, setSelectedCountryCode] = useState(initialPhoneParsed.code);
  const [localPhoneNumber, setLocalPhoneNumber] = useState(initialPhoneParsed.number);

  // Parsed initial grade state
  const parsedInitialGrade = parseGradeDetails(initialData.grade);
  const [baseGrade, setBaseGrade] = useState(parsedInitialGrade.baseGrade);
  const [selectedStream, setSelectedStream] = useState(parsedInitialGrade.selectedStream);
  const [customStream, setCustomStream] = useState(parsedInitialGrade.customStream);
  const [undergradCourse, setUndergradCourse] = useState(parsedInitialGrade.course);

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    avatarUrl: initialData.avatarUrl || "",
    phone: initialData.phone || "",
    dateOfBirth: initialData.dateOfBirth || "",
    country: initialData.country || "India",
    school: initialData.school || "",
    educationLevel: initialData.educationLevel || "",
    bio: initialData.bio || "",
  });

  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Computed current grade string
  const currentGradeString = computeFinalGrade(
    baseGrade,
    selectedStream,
    customStream,
    undergradCourse
  );
  const initialGradeString = initialData.grade || "";

  // Check if dirty
  const isDirty =
    formData.firstName !== (initialData.firstName || "") ||
    formData.lastName !== (initialData.lastName || "") ||
    formData.avatarUrl !== (initialData.avatarUrl || "") ||
    formData.phone !== (initialData.phone || "") ||
    formData.dateOfBirth !== (initialData.dateOfBirth || "") ||
    formData.country !== (initialData.country || "India") ||
    formData.school !== (initialData.school || "") ||
    currentGradeString !== initialGradeString ||
    formData.educationLevel !== (initialData.educationLevel || "") ||
    formData.bio !== (initialData.bio || "");

  const handleBaseGradeChange = (newBaseGrade: string) => {
    setBaseGrade(newBaseGrade);
    // Auto-sync educationLevel if not already explicitly chosen or if switching tiers
    if (newBaseGrade === "Class 8") {
      setFormData((prev) => ({ ...prev, educationLevel: "Middle School" }));
    } else if (newBaseGrade === "Class 9" || newBaseGrade === "Class 10") {
      setFormData((prev) => ({ ...prev, educationLevel: "Secondary School" }));
    } else if (newBaseGrade === "Class 11" || newBaseGrade === "Class 12") {
      setFormData((prev) => ({ ...prev, educationLevel: "Senior Secondary" }));
    } else if (
      newBaseGrade.toLowerCase().includes("undergraduate") ||
      newBaseGrade.toLowerCase().startsWith("ug")
    ) {
      setFormData((prev) => ({ ...prev, educationLevel: "Undergraduate" }));
    }
  };

  const handleCountryCodeChange = (newCode: string) => {
    setSelectedCountryCode(newCode);
    const fullPhone = localPhoneNumber ? `${newCode} ${localPhoneNumber}`.trim() : "";
    setFormData((prev) => ({ ...prev, phone: fullPhone }));
  };

  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNum = e.target.value;
    setLocalPhoneNumber(rawNum);
    const fullPhone = rawNum ? `${selectedCountryCode} ${rawNum}`.trim() : "";
    setFormData((prev) => ({ ...prev, phone: fullPhone }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage({ type: "error", text: "Image file size must be under 5MB." });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadAvatarAction(fd);
      if (res.success && res.avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: res.avatarUrl! }));
        setToastMessage({ type: "success", text: "Profile photo uploaded to Cloudflare R2!" });
      } else {
        setToastMessage({ type: "error", text: res.message || "Failed to upload photo." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Network error uploading photo." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      avatarUrl: initialData.avatarUrl || "",
      phone: initialData.phone || "",
      dateOfBirth: initialData.dateOfBirth || "",
      country: initialData.country || "India",
      school: initialData.school || "",
      educationLevel: initialData.educationLevel || "",
      bio: initialData.bio || "",
    });
    setBaseGrade(parsedInitialGrade.baseGrade);
    setSelectedStream(parsedInitialGrade.selectedStream);
    setCustomStream(parsedInitialGrade.customStream);
    setUndergradCourse(parsedInitialGrade.course);
    setLocalPhoneNumber(initialPhoneParsed.number);
    setSelectedCountryCode(initialPhoneParsed.code);
    setToastMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);

    if (!formData.firstName.trim()) {
      setToastMessage({ type: "error", text: "First name is required." });
      return;
    }
    if (!formData.lastName.trim()) {
      setToastMessage({ type: "error", text: "Last name is required." });
      return;
    }
    if (!formData.country?.trim()) {
      setToastMessage({ type: "error", text: "Country is required." });
      return;
    }
    if (!formData.dateOfBirth?.trim()) {
      setToastMessage({ type: "error", text: "Date of birth is required." });
      return;
    }
    const parsedDob = new Date(formData.dateOfBirth);
    if (isNaN(parsedDob.getTime()) || parsedDob > new Date()) {
      setToastMessage({ type: "error", text: "Please select a valid date of birth in the past." });
      return;
    }
    if (!formData.school.trim()) {
      setToastMessage({ type: "error", text: "School or institution name is required." });
      return;
    }
    if (!baseGrade.trim()) {
      setToastMessage({ type: "error", text: "Current class / grade is required." });
      return;
    }

    const is11or12 = baseGrade === "Class 11" || baseGrade === "Class 12";
    const isUG =
      baseGrade.toLowerCase().includes("undergraduate") ||
      baseGrade.toLowerCase().startsWith("ug");

    if (is11or12) {
      const streamVal = selectedStream === "Other" ? customStream.trim() : selectedStream.trim();
      if (!streamVal) {
        setToastMessage({
          type: "error",
          text: `Please select or specify your academic stream for ${baseGrade}.`,
        });
        return;
      }
    }

    if (isUG) {
      if (!undergradCourse.trim()) {
        setToastMessage({
          type: "error",
          text: "Please enter your undergraduate degree or course program (e.g. B.Tech Computer Science, B.Com, BBA).",
        });
        return;
      }
    }

    if (!formData.educationLevel.trim()) {
      setToastMessage({ type: "error", text: "Education stage is required." });
      return;
    }
    if (!formData.bio.trim()) {
      setToastMessage({ type: "error", text: "Target career aspirations & interests are required." });
      return;
    }

    const finalGrade = computeFinalGrade(
      baseGrade,
      selectedStream,
      customStream,
      undergradCourse
    );

    startTransition(async () => {
      const res = await updateStudentProfileAction({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        avatarUrl: formData.avatarUrl || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth.trim(),
        country: formData.country.trim(),
        school: formData.school.trim(),
        grade: finalGrade,
        educationLevel: formData.educationLevel.trim(),
        bio: formData.bio.trim(),
      });

      if (res.success) {
        setToastMessage({ type: "success", text: "Profile saved successfully." });
      } else {
        setToastMessage({ type: "error", text: res.message || "Failed to update profile." });
      }
    });
  };

  const studentInitials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "AS";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in-0 duration-150 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-red-50 border-red-200 text-red-950"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Desktop Grid / 1-Column Mobile Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Photo (Card 1) + Personal Details (Card 2)                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6 min-w-0">
          {/* Card 1: Profile Photo & Avatar */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Profile photo
              </h2>
              <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                Upload a portrait or select one of the student persona presets.
              </p>
            </div>

            {/* Avatar 96px + Upload / Remove controls */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              <div className="relative w-24 h-24 rounded-full bg-[#0F172A] text-white text-xl font-bold flex items-center justify-center overflow-hidden shrink-0 border-2 border-[#E2E8F0] shadow-2xs">
                {formData.avatarUrl ? (
                  <Image
                    src={formData.avatarUrl}
                    alt="Student profile"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{studentInitials}</span>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                <input
                  id="settings-avatar-file-upload"
                  name="avatarFile"
                  type="file"
                  aria-label="Upload profile photo"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer min-h-[44px] disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                        <span>Uploading to R2...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Upload photo</span>
                      </>
                    )}
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer min-h-[44px]"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#94A3B8]">
                  JPG, PNG or WebP under 5MB.
                </p>
              </div>
            </div>

            {/* Preset Avatars Row (44px touch items with selected ring) */}
            <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                Choose an avatar preset:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap pb-1">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = formData.avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: preset.url }))}
                      title={preset.label}
                      className={`relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#E2E8F0] transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-[#4F46E5] ring-offset-2 scale-105"
                          : "hover:opacity-80"
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        sizes="44px"
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Card 2: Personal Details */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Personal details
              </h2>
              <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                Contact information and verified login credentials.
              </p>
            </div>

            <div className="space-y-4">
              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-xs font-semibold text-[#0F172A] block">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm font-normal rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-xs font-semibold text-[#0F172A] block">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm font-normal rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Email (Readonly with Verified Tag) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="settings-registered-email" className="text-xs font-semibold text-[#0F172A] block">
                    Registered email
                  </label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Verified account
                  </span>
                </div>
                <input
                  id="settings-registered-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  readOnly
                  disabled
                  value={initialData.email}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm font-normal rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] min-h-[44px] cursor-not-allowed"
                />
                <span className="text-[11px] text-[#94A3B8] block">
                  To update your email, contact student support.
                </span>
              </div>

              {/* Phone with Country Code Selector */}
              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-semibold text-[#0F172A] block">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <select
                    id="settings-country-code"
                    name="countryCode"
                    aria-label="Country code"
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    className="w-28 px-2.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  >
                    {COUNTRY_LIST.map((c) => (
                      <option key={`${c.name}-${c.code}`} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel-national"
                    value={localPhoneNumber}
                    onChange={handleLocalPhoneChange}
                    placeholder="98765 43210"
                    className="flex-1 px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Date of Birth & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="dateOfBirth" className="text-xs font-semibold text-[#0F172A] block">
                    Date of birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="country" className="text-xs font-semibold text-[#0F172A] block">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Academic Profile (Card 3) + Desktop Save Bar                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6 min-w-0">
          {/* Card 3: Academic Profile */}
          <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Academic profile
                </h2>
                <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                  Educational stage and school details to calibrate normative benchmark comparisons.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#C7D2FE] shrink-0">
                Required section
              </span>
            </div>

            <div className="space-y-4">
              {/* School / Institution */}
              <div className="space-y-1">
                <label htmlFor="school" className="text-xs font-semibold text-[#0F172A] block">
                  School or institution name <span className="text-red-500">*</span>
                </label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  required
                  placeholder="e.g. Modern High School, Delhi"
                  value={formData.school}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                />
              </div>

              {/* Grade / Current Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="grade" className="text-xs font-semibold text-[#0F172A] block">
                    Current class / grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    required
                    value={baseGrade}
                    onChange={(e) => handleBaseGradeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  >
                    <option value="" disabled>Select current grade</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    {baseGrade && !GRADE_OPTIONS.includes(baseGrade) && (
                      <option value={baseGrade}>{baseGrade}</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="educationLevel" className="text-xs font-semibold text-[#0F172A] block">
                    Education stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="educationLevel"
                    name="educationLevel"
                    required
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                  >
                    <option value="" disabled>Select education stage</option>
                    <option value="Middle School">Middle School (Grades 6–8)</option>
                    <option value="Secondary School">Secondary School (Grades 9–10)</option>
                    <option value="Senior Secondary">Senior Secondary / High School (Grades 11–12)</option>
                    <option value="Undergraduate">Undergraduate (College / University)</option>
                    {formData.educationLevel &&
                      !["Middle School", "Secondary School", "Senior Secondary", "Undergraduate"].includes(formData.educationLevel) && (
                        <option value={formData.educationLevel}>{formData.educationLevel}</option>
                      )}
                  </select>
                </div>
              </div>

              {/* Conditional Stream Selector for Class 11 & Class 12 */}
              {(baseGrade === "Class 11" || baseGrade === "Class 12") && (
                <div className="p-4 rounded-xl border border-[#C7D2FE] bg-[#F5F7FF] space-y-3 animate-in fade-in-0 duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <label htmlFor="academicStream" className="text-xs font-bold text-[#1E1B4B] block">
                        Academic stream ({baseGrade}) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-[#4338CA] mt-0.5">
                        Required by assessment evaluators to calibrate subject aptitude benchmarks.
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#4338CA] bg-white px-2 py-0.5 rounded-full border border-[#C7D2FE] shrink-0">
                      Required
                    </span>
                  </div>

                  <select
                    id="academicStream"
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#C7D2FE] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] min-h-[44px]"
                  >
                    <option value="" disabled>Select your academic stream</option>
                    {STREAM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {selectedStream === "Other" && (
                    <div className="space-y-1 pt-1">
                      <label htmlFor="customStream" className="text-xs font-semibold text-[#0F172A] block">
                        Specify your stream <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="customStream"
                        type="text"
                        required
                        placeholder="e.g. Fine Arts, Vocational IT, Home Science"
                        value={customStream}
                        onChange={(e) => setCustomStream(e.target.value)}
                        className="w-full px-3.5 py-2 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] min-h-[44px]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Course / Degree Selector for Undergraduate (UG 1, 2, 3, 4) */}
              {(baseGrade.toLowerCase().includes("undergraduate") || baseGrade.toLowerCase().startsWith("ug")) && (
                <div className="p-4 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] space-y-3 animate-in fade-in-0 duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <label htmlFor="undergradCourse" className="text-xs font-bold text-[#0C4A6E] block">
                        Course / Degree program ({baseGrade}) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-[#0369A1] mt-0.5">
                        Specify your major or collegiate program to align your career evaluation dossier.
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#0369A1] bg-white px-2 py-0.5 rounded-full border border-[#BAE6FD] shrink-0">
                      Required
                    </span>
                  </div>

                  <input
                    id="undergradCourse"
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science, B.Com (Hons), BBA, B.Sc Physics, BA Economics, MBBS, LLB"
                    value={undergradCourse}
                    onChange={(e) => setUndergradCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#BAE6FD] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 focus:border-[#0284C7] min-h-[44px]"
                  />

                  {/* Quick-select chips */}
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0369A1] block">
                      Quick select popular programs:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_UG_COURSES.map((courseOption) => {
                        const isSelected = undergradCourse === courseOption;
                        return (
                          <button
                            key={courseOption}
                            type="button"
                            onClick={() => setUndergradCourse(courseOption)}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#0284C7] text-white border-[#0284C7] font-semibold shadow-xs"
                                : "bg-white text-[#0F172A] border-[#BAE6FD] hover:bg-[#E0F2FE]"
                            }`}
                          >
                            {courseOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Bio / Aspirations */}
              <div className="space-y-1">
                <label htmlFor="bio" className="text-xs font-semibold text-[#0F172A] block">
                  Target career aspirations & interests <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  required
                  rows={4}
                  placeholder="Share subjects you enjoy, potential fields of interest (e.g., engineering, law, design, finance), or extracurricular passions."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
                <span className="text-[11px] text-[#64748B]">
                  Evaluators consult this context when synthesizing report recommendations.
                </span>
              </div>
            </div>
          </section>

          {/* Desktop Save Card */}
          <div className="hidden lg:flex items-center justify-between p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
            <span className="text-xs text-[#64748B]">
              {isDirty ? "You have unsaved changes." : "All changes up to date."}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isDirty || isPending}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors disabled:opacity-40 cursor-pointer min-h-[40px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isDirty || isPending}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E05353] text-white text-xs font-semibold transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Save Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={!isDirty || isPending}
          className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] disabled:opacity-40 cursor-pointer min-h-[44px]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!isDirty || isPending}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#E05353] text-white text-xs font-semibold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] flex-1 max-w-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save changes</span>
          )}
        </button>
      </div>
    </form>
  );
}
