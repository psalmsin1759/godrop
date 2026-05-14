"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://godrop-backend-production.up.railway.app";

// ─── Vendor types ──────────────────────────────────────────────

const VENDOR_TYPES = [
  {
    value: "RESTAURANT",
    label: "Restaurant",
    emoji: "🍽️",
    description: "Cooked meals, fast food, cafes, bakeries",
  },
  {
    value: "GROCERY",
    label: "Grocery",
    emoji: "🛒",
    description: "Supermarkets, food stores, fresh produce",
  },
  {
    value: "RETAIL",
    label: "Retail",
    emoji: "🛍️",
    description: "Fashion, electronics, home goods, general retail",
  },
  {
    value: "PHARMACY",
    label: "Pharmacy",
    emoji: "💊",
    description: "Medications, health & beauty products",
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Zod schemas per step ──────────────────────────────────────

const step1Schema = z.object({
  type: z.enum(["RESTAURANT", "GROCERY", "RETAIL", "PHARMACY"] as const, {
    error: "Please select a business type",
  }),
});

const step2Schema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(100),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  phone: z.string().regex(/^\+234\d{10}$/, "Phone must be in format +234XXXXXXXXXX"),
  email: z.string().email("Enter a valid email address"),
  address: z.string().min(5, "Enter the full business address"),
  cuisines: z.string().optional(),
});

const step3Schema = z.object({});

const step4Schema = z
  .object({
    ownerFirstName: z.string().min(2, "First name must be at least 2 characters"),
    ownerLastName: z.string().min(2, "Last name must be at least 2 characters"),
    ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.ownerPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step4 = z.infer<typeof step4Schema>;

type DayHours = { open: string; close: string; closed: boolean };
type OpeningHours = Record<string, DayHours>;

const STEPS = [
  { label: "Business Type", description: "What kind of business?" },
  { label: "Business Details", description: "Tell us about your business" },
  { label: "Opening Hours", description: "When are you open?" },
  { label: "Your Account", description: "Create your vendor account" },
  { label: "Documents", description: "Upload required documents" },
];

// ─── Shared UI ─────────────────────────────────────────────────

function Input({
  label,
  error,
  required,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/70 text-sm font-medium block">
        {label} {required && <span className="text-[#FF6A2C]">*</span>}
      </label>
      <input
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
      />
      {hint && !error && <p className="text-white/30 text-xs">{hint}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function Textarea({
  label,
  error,
  required,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/70 text-sm font-medium block">
        {label} {required && <span className="text-[#FF6A2C]">*</span>}
      </label>
      <textarea
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors resize-none"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function StepFooter({
  onBack,
  nextLabel = "Continue",
  loading = false,
}: {
  onBack?: () => void;
  nextLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-white/20 text-white/70 text-sm font-medium hover:border-white/40 hover:text-white transition-colors"
        >
          Back
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-8 py-3 rounded-full text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#1E5FFF" }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting…
          </span>
        ) : (
          nextLabel
        )}
      </button>
    </div>
  );
}

// ─── Step 1: Business type ──────────────────────────────────────

function Step1Form({ onNext, saved }: { onNext: (d: Step1) => void; saved: Partial<Step1> }) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: saved });

  const selected = watch("type");

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        {VENDOR_TYPES.map(({ value, label, emoji, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue("type", value as Step1["type"], { shouldValidate: true })}
            className={`text-left border rounded-2xl p-5 transition-all ${
              selected === value
                ? "border-[#1E5FFF] bg-[#1E5FFF]/10"
                : "border-white/10 hover:border-white/30 bg-white/5"
            }`}
          >
            <span className="text-3xl block mb-3">{emoji}</span>
            <p className="text-white font-bold text-base mb-1">{label}</p>
            <p className="text-white/50 text-sm leading-snug">{description}</p>
          </button>
        ))}
      </div>
      {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
      <StepFooter nextLabel="Continue" />
    </form>
  );
}

// ─── Step 2: Business details ───────────────────────────────────

function Step2Form({
  onNext,
  onBack,
  saved,
  vendorType,
  coords,
  setCoords,
}: {
  onNext: (d: Step2) => void;
  onBack: () => void;
  saved: Partial<Step2>;
  vendorType: string;
  coords: { lat: number; lng: number } | null;
  setCoords: (c: { lat: number; lng: number }) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: saved });

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError("Could not get your location. Your address will be verified by our team.");
        setLocating(false);
        // Default to Lagos centre so the form still passes validation
        setCoords({ lat: 6.5244, lng: 3.3792 });
      }
    );
  }

  function onValid(data: Step2) {
    if (!coords) {
      // Default to Lagos if user never tried geolocation
      setCoords({ lat: 6.5244, lng: 3.3792 });
    }
    onNext(data);
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5">
      <Input
        label="Business Name"
        required
        placeholder="Mama Cass Kitchen"
        error={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        label="Description"
        placeholder="Tell customers what makes your business special (max 500 characters)"
        rows={3}
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Business Phone"
          required
          placeholder="+234XXXXXXXXXX"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Business Email"
          required
          type="email"
          placeholder="orders@mamacass.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
      <div className="space-y-2">
        <Input
          label="Business Address"
          required
          placeholder="12 Allen Avenue, Ikeja, Lagos"
          error={errors.address?.message}
          {...register("address")}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="flex items-center gap-2 text-xs text-[#1E5FFF] hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locating ? "Detecting…" : coords ? "Location detected ✓" : "Use my current location"}
          </button>
          {coords && (
            <span className="text-white/30 text-xs">
              ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
            </span>
          )}
        </div>
        {locError && <p className="text-amber-400 text-xs">{locError}</p>}
      </div>
      {vendorType === "RESTAURANT" && (
        <Input
          label="Cuisine Types"
          placeholder="e.g. Nigerian, Grills, Seafood (comma-separated)"
          hint="Separate multiple cuisines with commas"
          {...register("cuisines")}
        />
      )}
      <StepFooter onBack={onBack} />
    </form>
  );
}

// ─── Step 3: Opening hours ──────────────────────────────────────

function Step3Form({
  onNext,
  onBack,
  hours,
  setHours,
}: {
  onNext: () => void;
  onBack: () => void;
  hours: OpeningHours;
  setHours: (h: OpeningHours) => void;
}) {
  function toggle(day: string) {
    setHours({
      ...hours,
      [day]: { ...hours[day], closed: !hours[day].closed },
    });
  }

  function updateTime(day: string, field: "open" | "close", value: string) {
    setHours({ ...hours, [day]: { ...hours[day], [field]: value } });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="space-y-3"
    >
      <p className="text-white/50 text-sm mb-4">Set your operating hours. You can update these anytime from your vendor dashboard.</p>
      {DAYS.map((day) => {
        const h = hours[day];
        return (
          <div
            key={day}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${
              h.closed ? "border-white/5 bg-white/[0.02]" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3 sm:w-36 shrink-0">
              <button
                type="button"
                onClick={() => toggle(day)}
                className={`w-9 h-5 rounded-full transition-colors relative ${h.closed ? "bg-white/10" : "bg-[#1E5FFF]"}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    h.closed ? "left-0.5" : "left-[18px]"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${h.closed ? "text-white/30" : "text-white"}`}>{day}</span>
            </div>
            {h.closed ? (
              <span className="text-white/30 text-sm">Closed</span>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={h.open}
                  onChange={(e) => updateTime(day, "open", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#1E5FFF]"
                />
                <span className="text-white/30 text-sm">to</span>
                <input
                  type="time"
                  value={h.close}
                  onChange={(e) => updateTime(day, "close", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#1E5FFF]"
                />
              </div>
            )}
          </div>
        );
      })}
      <StepFooter onBack={onBack} />
    </form>
  );
}

// ─── Step 4: Owner account ──────────────────────────────────────

function Step4Form({
  onNext,
  onBack,
  saved,
}: {
  onNext: (d: Step4) => void;
  onBack: () => void;
  saved: Partial<Step4>;
}) {
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4>({ resolver: zodResolver(step4Schema), defaultValues: saved });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="bg-[#1E5FFF]/10 border border-[#1E5FFF]/20 rounded-xl p-4">
        <p className="text-white/70 text-sm leading-relaxed">
          This creates your vendor dashboard account. Use it to manage orders, update your menu, and track earnings.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="First Name"
          required
          placeholder="Chioma"
          error={errors.ownerFirstName?.message}
          {...register("ownerFirstName")}
        />
        <Input
          label="Last Name"
          required
          placeholder="Eze"
          error={errors.ownerLastName?.message}
          {...register("ownerLastName")}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-white/70 text-sm font-medium block">
          Password <span className="text-[#FF6A2C]">*</span>
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            placeholder="Minimum 8 characters"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
            {...register("ownerPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {showPw ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.ownerPassword && <p className="text-red-400 text-xs">{errors.ownerPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-white/70 text-sm font-medium block">
          Confirm Password <span className="text-[#FF6A2C]">*</span>
        </label>
        <input
          type={showPw ? "text" : "password"}
          placeholder="Re-enter your password"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
      </div>
      <StepFooter onBack={onBack} />
    </form>
  );
}

// ─── Step 5: Documents ──────────────────────────────────────────

interface DocField {
  key: "businessRegistration" | "governmentId" | "utilityBill";
  label: string;
  description: string;
  examples: string;
}

const DOC_FIELDS: DocField[] = [
  {
    key: "businessRegistration",
    label: "Business Registration",
    description: "CAC certificate or proof of business registration",
    examples: "CAC certificate, Business Name Registration",
  },
  {
    key: "governmentId",
    label: "Owner's Government ID",
    description: "A valid government-issued ID of the business owner",
    examples: "NIN slip, Driver's License, International Passport, Voter's Card",
  },
  {
    key: "utilityBill",
    label: "Utility Bill",
    description: "Recent utility bill for the business address (within 3 months)",
    examples: "NEPA/EKEDC bill, Water bill, Tenancy agreement",
  },
];

function Step5Form({
  onSubmit,
  onBack,
  submitting,
  serverError,
}: {
  onSubmit: (docs: Record<string, File>) => void;
  onBack: () => void;
  submitting: boolean;
  serverError: string;
}) {
  const [files, setFiles] = useState<Record<string, File | null>>({
    businessRegistration: null,
    governmentId: null,
    utilityBill: null,
  });
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const inputRefs = {
    businessRegistration: useRef<HTMLInputElement>(null),
    governmentId: useRef<HTMLInputElement>(null),
    utilityBill: useRef<HTMLInputElement>(null),
  };

  function handleFile(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }));
    if (file) setFileErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    DOC_FIELDS.forEach(({ key }) => {
      if (!files[key]) newErrors[key] = "This document is required";
    });
    if (Object.keys(newErrors).length > 0) {
      setFileErrors(newErrors);
      return;
    }
    onSubmit(files as Record<string, File>);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-amber-300 text-sm leading-relaxed">
          <strong>All 3 documents are required.</strong> Your application will be reviewed within 48 hours of submission.
          Documents are encrypted and stored securely.
        </p>
      </div>
      {DOC_FIELDS.map(({ key, label, description, examples }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-white/70 text-sm font-medium block">
            {label} <span className="text-[#FF6A2C]">*</span>
          </label>
          <div
            onClick={() => inputRefs[key].current?.click()}
            className={`border border-dashed rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors ${
              files[key]
                ? "border-[#1E5FFF]/60 bg-[#1E5FFF]/5"
                : "border-white/20 hover:border-white/40 bg-white/[0.03]"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${files[key] ? "bg-[#1E5FFF]/20" : "bg-white/5"}`}>
              {files[key] ? (
                <svg className="w-5 h-5 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${files[key] ? "text-white" : "text-white/60"}`}>
                {files[key] ? files[key]!.name : description}
              </p>
              <p className="text-white/30 text-xs mt-0.5">{examples}</p>
            </div>
            {files[key] && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFile(key, null);
                  if (inputRefs[key as keyof typeof inputRefs].current) {
                    inputRefs[key as keyof typeof inputRefs].current!.value = "";
                  }
                }}
                className="ml-auto text-white/30 hover:text-white/70 shrink-0 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <input
            ref={inputRefs[key]}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFile(key, e.target.files?.[0] ?? null)}
          />
          {fileErrors[key] && <p className="text-red-400 text-xs">{fileErrors[key]}</p>}
        </div>
      ))}
      <p className="text-white/30 text-xs">Accepted formats: JPG, PNG, PDF. Max 10MB per file.</p>
      {serverError && (
        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}
      <StepFooter onBack={onBack} nextLabel="Submit Application" loading={submitting} />
    </form>
  );
}

// ─── Main page ──────────────────────────────────────────────────

const DEFAULT_HOURS: OpeningHours = Object.fromEntries(
  DAYS.map((day) => [day, { open: "08:00", close: "22:00", closed: day === "Sunday" }])
);

export default function VendorOnboardPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Per-step saved data
  const [s1, setS1] = useState<Partial<Step1>>({});
  const [s2, setS2] = useState<Partial<Step2>>({});
  const [s4, setS4] = useState<Partial<Step4>>({});
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_HOURS);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const resolvedCoords = coords ?? { lat: 6.5244, lng: 3.3792 };

  async function submitApplication(docs: Record<string, File>) {
    setSubmitting(true);
    setServerError("");

    try {
      const fd = new FormData();

      // Step 1
      fd.append("type", s1.type ?? "");

      // Step 2
      fd.append("name", s2.name ?? "");
      if (s2.description) fd.append("description", s2.description);
      fd.append("phone", s2.phone ?? "");
      fd.append("email", s2.email ?? "");
      fd.append("address", s2.address ?? "");
      fd.append("lat", String(resolvedCoords.lat));
      fd.append("lng", String(resolvedCoords.lng));

      // Cuisines — only for restaurants, parsed from comma-separated string
      if (s1.type === "RESTAURANT" && s2.cuisines) {
        const cuisineArr = s2.cuisines.split(",").map((c) => c.trim()).filter(Boolean);
        fd.append("cuisines", JSON.stringify(cuisineArr));
      } else {
        fd.append("cuisines", JSON.stringify([]));
      }

      // Opening hours (only non-closed days)
      const openingHoursPayload: Record<string, { open: string; close: string }> = {};
      DAYS.forEach((day) => {
        if (!hours[day].closed) {
          openingHoursPayload[day] = { open: hours[day].open, close: hours[day].close };
        }
      });
      fd.append("openingHours", JSON.stringify(openingHoursPayload));

      // Step 4 — owner
      fd.append("ownerFirstName", s4.ownerFirstName ?? "");
      fd.append("ownerLastName", s4.ownerLastName ?? "");
      fd.append("ownerPassword", s4.ownerPassword ?? "");

      // Documents
      fd.append("businessRegistration", docs.businessRegistration);
      fd.append("governmentId", docs.governmentId);
      fd.append("utilityBill", docs.utilityBill);

      const res = await fetch(`${BACKEND_URL}/api/v1/vendor`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed. Please try again.");

      setSubmitted(true);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  if (submitted) {
    return (
      <PageShell>
        <section className="max-w-lg mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-12"
          >
            <div className="w-20 h-20 rounded-full bg-[#1E5FFF]/20 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-white text-3xl font-black mb-4">Application Submitted!</h1>
            <p className="text-white/60 leading-relaxed mb-2">
              Thank you, <strong className="text-white">{s4.ownerFirstName}</strong>! Your vendor application for{" "}
              <strong className="text-white">{s2.name}</strong> has been received.
            </p>
            <p className="text-white/60 leading-relaxed mb-8">
              Our team will review your documents and reach out to{" "}
              <strong className="text-white">{s2.email}</strong> within 24–48 hours.
              Once approved, you can log in to your vendor dashboard to start accepting orders.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: "#1E5FFF" }}
            >
              Back to Home
            </a>
          </motion.div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-3">Vendor Application</p>
          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-2">
            Partner with Godrop
          </h1>
          <p className="text-white/50 text-base">
            Step {step + 1} of {STEPS.length} — {STEPS[step].description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "#1E5FFF" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="hidden md:flex justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className={`text-xs font-medium truncate ${i <= step ? "text-[#1E5FFF]" : "text-white/30"}`}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-white text-xl font-bold mb-6">{STEPS[step].label}</h2>

              {step === 0 && (
                <Step1Form
                  saved={s1}
                  onNext={(d) => {
                    setS1(d);
                    setStep(1);
                  }}
                />
              )}
              {step === 1 && (
                <Step2Form
                  saved={s2}
                  vendorType={s1.type ?? ""}
                  coords={coords}
                  setCoords={setCoords}
                  onNext={(d) => {
                    setS2(d);
                    setStep(2);
                  }}
                  onBack={() => setStep(0)}
                />
              )}
              {step === 2 && (
                <Step3Form
                  hours={hours}
                  setHours={setHours}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step4Form
                  saved={s4}
                  onNext={(d) => {
                    setS4(d);
                    setStep(4);
                  }}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <Step5Form
                  onSubmit={submitApplication}
                  onBack={() => setStep(3)}
                  submitting={submitting}
                  serverError={serverError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageShell>
  );
}
