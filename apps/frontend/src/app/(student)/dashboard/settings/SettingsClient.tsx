"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  School,
  GraduationCap,
  Sparkles,
  Camera,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { updateStudentProfileAction } from "@/app/actions/profile";

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
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
];

const PRESET_AVATARS = [
  { id: "hero", label: "Student Learner", url: "/auth-hero.png" },
  {
    id: "tech",
    label: "Neural Pioneer",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "creative",
    label: "Creative Thinker",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "strategist",
    label: "Future Strategist",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
];

export default function SettingsClient({ initialData }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to parse initial phone number into country code & local number
  const parseInitialPhone = (phoneStr: string | null) => {
    if (!phoneStr) return { code: "+91", number: "" };
    const trimmed = phoneStr.trim();
    const found = COUNTRY_LIST.find((c) => trimmed.startsWith(c.code));
    if (found) {
      const number = trimmed.slice(found.code.length).trim();
      return { code: found.code, number };
    }
    if (trimmed.startsWith("+")) {
      const parts = trimmed.split(" ");
      return { code: parts[0] || "+91", number: parts.slice(1).join(" ") || "" };
    }
    return { code: "+91", number: trimmed };
  };

  const initialPhoneParsed = parseInitialPhone(initialData.phone);
  const [selectedCountryCode, setSelectedCountryCode] = useState(initialPhoneParsed.code);
  const [localPhoneNumber, setLocalPhoneNumber] = useState(initialPhoneParsed.number);

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    avatarUrl: initialData.avatarUrl || "",
    phone: initialData.phone || `${initialPhoneParsed.code} ${initialPhoneParsed.number}`.trim(),
    dateOfBirth: initialData.dateOfBirth || "",
    country: initialData.country || "India",
    school: initialData.school || "",
    grade: initialData.grade || "Class 12",
    educationLevel: initialData.educationLevel || "High School",
    bio: initialData.bio || "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCountryCodeChange = (newCode: string) => {
    setSelectedCountryCode(newCode);
    const fullPhone = localPhoneNumber ? `${newCode} ${localPhoneNumber}`.trim() : "";
    setFormData((prev) => ({ ...prev, phone: fullPhone }));

    // Auto-suggest country if country matches dial code
    const matchingCountry = COUNTRY_LIST.find((c) => c.code === newCode);
    if (matchingCountry && matchingCountry.name) {
      setFormData((prev) => ({ ...prev, country: matchingCountry.name }));
    }
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

  const handleAvatarSelect = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image file size must be under 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setFormData((prev) => ({ ...prev, avatarUrl: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await updateStudentProfileAction({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: formData.avatarUrl || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        country: formData.country || null,
        school: formData.school || null,
        grade: formData.grade || null,
        educationLevel: formData.educationLevel || null,
        bio: formData.bio || null,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Your profile details and photo have been updated successfully!" });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update profile." });
      }
    });
  };

  const studentInitials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "AS";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* 2-COLUMN EXPANSIVE FULL-WIDTH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Photo & Personal Details */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          {/* 1. PHOTO & AVATAR SECTION */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FF6B6B]" />
                <h2 className="text-base font-extrabold text-black">Profile Photo & Avatar</h2>
              </div>
              <span className="text-xs font-medium text-[#64748B]">Public Avatar</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-xl font-bold shadow-xs overflow-hidden shrink-0">
                {formData.avatarUrl ? (
                  <Image
                    src={formData.avatarUrl}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{studentInitials}</span>
                )}
              </div>

              {/* Action Buttons & Presets */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Photo</span>
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Presets */}
                <div>
                  <span className="text-[11px] font-bold text-[#94A3B8] block mb-2 uppercase tracking-wider">
                    Or choose an avatar:
                  </span>
                  <div className="flex items-center gap-2.5">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleAvatarSelect(preset.url)}
                        className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          formData.avatarUrl === preset.url
                            ? "border-[#FF6B6B] ring-2 ring-[#FF6B6B]/20 scale-105"
                            : "border-[#E2E8F0] hover:border-gray-400 opacity-80 hover:opacity-100"
                        }`}
                        title={preset.label}
                      >
                        <Image
                          src={preset.url}
                          alt={preset.label}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BASIC PERSONAL DETAILS */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF6B6B]" />
              <h2 className="text-base font-extrabold text-black">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Alex"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                />
              </div>

              {/* Email (Read only) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-black flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    Verified Account
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={initialData.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-gray-100/80 text-xs sm:text-sm font-medium text-[#64748B] cursor-not-allowed pl-9"
                  />
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                </div>
              </div>

              {/* Mobile Phone Number with Country Code Dropdown */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-black flex items-center justify-between">
                  <span>Mobile Phone Number</span>
                  <span className="text-[11px] text-[#64748B] font-normal">Select country dial code & enter number</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Country Selector Dropdown */}
                  <div className="relative w-full sm:w-52 shrink-0">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => handleCountryCodeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] appearance-none cursor-pointer pr-8"
                    >
                      {COUNTRY_LIST.map((c, idx) => (
                        <option key={c.name + idx} value={c.code}>
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                  </div>

                  {/* Mobile Phone Input Field */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={localPhoneNumber}
                      onChange={handleLocalPhoneChange}
                      placeholder="e.g. 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] pl-9"
                    />
                    <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                  <span>
                    Full International Number:{" "}
                    <span className="font-bold text-black">
                      {localPhoneNumber ? `${selectedCountryCode} ${localPhoneNumber}` : "Not provided"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-black">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] pl-9"
                  />
                  <Calendar className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                </div>
              </div>

              {/* Country / Location */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-black">Country / Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. India, United States"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] pl-9"
                  />
                  <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Academic Profile & Goals */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          {/* 3. ACADEMIC & INSTITUTIONAL PROFILE */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#FF6B6B]" />
              <h2 className="text-base font-extrabold text-black">Academic Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* School / College */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-black">School / Institution Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    placeholder="e.g. National Public School / Delhi Public School"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] pl-9"
                  />
                  <School className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                </div>
              </div>

              {/* Grade / Class */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black">Grade / Standard</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                >
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Undergraduate Year 1">Undergraduate Year 1</option>
                  <option value="Undergraduate Year 2">Undergraduate Year 2</option>
                  <option value="Undergraduate Year 3">Undergraduate Year 3</option>
                  <option value="Undergraduate Year 4">Undergraduate Year 4</option>
                  <option value="Graduate / Working">Graduate / Working Professional</option>
                </select>
              </div>

              {/* Education Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black">Education Stage</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                >
                  <option value="High School">High School (Grades 8-10)</option>
                  <option value="Senior Secondary">Senior Secondary (Grades 11-12)</option>
                  <option value="College / University">College / University</option>
                  <option value="Early Career">Early Career / Professional</option>
                </select>
              </div>

              {/* Bio / Aspirations */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-black">
                  Personal Aspirations & Target Career Goals
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell our psychologist evaluators about your passions, subjects you love, or dream career trajectories (e.g. AI research, aerospace engineering, venture strategy)..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] resize-none"
                />
              </div>
            </div>
          </div>

          {/* 4. METHODOLOGY & SAVE ACTION CARD */}
          <div className="bg-[#FFF8F5] border border-[#FED7CC] rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B6B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-black">Psychometric Profile Calibration</h3>
                <p className="text-xs text-[#64748B]">
                  Your details directly enhance the depth and precision of your personalized psychologist guidance report.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#FF6B6B] hover:bg-[#F95858] text-white font-semibold text-xs sm:text-sm shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
