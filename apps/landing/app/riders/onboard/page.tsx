"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PageShell from "@/components/PageShell";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://godrop-backend-production.up.railway.app";

// ─── Step schemas ──────────────────────────────────────────────

const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(/^\+234\d{10}$/, "Phone must be in format +234XXXXXXXXXX"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
});

const step2Schema = z.object({
  streetAddress: z.string().min(5, "Enter your full street address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
});

const step3Schema = z.object({
  vehicleType: z.enum(["BICYCLE", "MOTORCYCLE", "CAR", "VAN"] as const, { error: "Select a vehicle type" }),
  vehiclePlate: z.string().optional().or(z.literal("")),
  vehicleColor: z.string().optional().or(z.literal("")),
  vehicleModel: z.string().optional().or(z.literal("")),
  vehicleYear: z.string().optional().or(z.literal("")),
});

const step4Schema = z.object({
  bvn: z.string().length(11, "BVN must be exactly 11 digits").optional().or(z.literal("")),
  nin: z.string().length(11, "NIN must be exactly 11 digits").optional().or(z.literal("")),
  driverLicenseNumber: z.string().optional().or(z.literal("")),
});

const step5Schema = z.object({
  guarantorName: z.string().optional().or(z.literal("")),
  guarantorPhone: z.string().optional().or(z.literal("")),
  guarantorAddress: z.string().optional().or(z.literal("")),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;
type Step4 = z.infer<typeof step4Schema>;
type Step5 = z.infer<typeof step5Schema>;

const STEPS = [
  { label: "Personal Info", description: "Your basic details" },
  { label: "Address", description: "Where you live" },
  { label: "Vehicle", description: "Your ride details" },
  { label: "Documents", description: "ID & verification" },
  { label: "Guarantor", description: "Reference info" },
];

function Input({ label, error, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/70 text-sm font-medium block">
        {label} {required && <span className="text-[#FF6A2C]">*</span>}
      </label>
      <input
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function Select({ label, error, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/70 text-sm font-medium block">
        {label} {required && <span className="text-[#FF6A2C]">*</span>}
      </label>
      <select
        {...props}
        className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1E5FFF] transition-colors"
      >
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── Step components ───────────────────────────────────────────

function Step1Form({ onNext, saved }: { onNext: (d: Step1) => void; saved: Partial<Step1> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: saved,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="First Name" required placeholder="Emeka" error={errors.firstName?.message} {...register("firstName")} />
        <Input label="Last Name" required placeholder="Okafor" error={errors.lastName?.message} {...register("lastName")} />
      </div>
      <Input label="Phone Number" required placeholder="+234XXXXXXXXXX" error={errors.phone?.message} {...register("phone")} />
      <Input label="Email Address" placeholder="emeka@example.com" type="email" error={errors.email?.message} {...register("email")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />
        <Select label="Gender" error={errors.gender?.message} {...register("gender")}>
          <option value="">Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>
      <StepFooter />
    </form>
  );
}

function Step2Form({ onNext, onBack, saved }: { onNext: (d: Step2) => void; onBack: () => void; saved: Partial<Step2> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: saved,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <Input label="Street Address" required placeholder="14 Adeola Odeku Street" error={errors.streetAddress?.message} {...register("streetAddress")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="City" required placeholder="Lagos Island" error={errors.city?.message} {...register("city")} />
        <Select label="State" required error={errors.state?.message} {...register("state")}>
          <option value="">Select state</option>
          {["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Anambra", "Edo", "Delta", "Enugu", "Kaduna"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>
      <StepFooter onBack={onBack} />
    </form>
  );
}

const VEHICLE_TYPES = [
  { value: "BICYCLE", label: "Bicycle", icon: "🚲" },
  { value: "MOTORCYCLE", label: "Motorcycle", icon: "🏍️" },
  { value: "CAR", label: "Car", icon: "🚗" },
  { value: "VAN", label: "Van", icon: "🚐" },
] as const;

function Step3Form({ onNext, onBack, saved }: { onNext: (d: Step3) => void; onBack: () => void; saved: Partial<Step3> }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step3>({
    resolver: zodResolver(step3Schema),
    defaultValues: saved,
  });

  const vehicleType = watch("vehicleType");
  const isBicycle = vehicleType === "BICYCLE";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-white/70 text-sm font-medium block">Vehicle Type <span className="text-[#FF6A2C]">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VEHICLE_TYPES.map(({ value, label, icon }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" value={value} {...register("vehicleType")} className="sr-only peer" />
              <div className="border border-white/10 rounded-xl p-4 text-center transition-all peer-checked:border-[#1E5FFF] peer-checked:bg-[#1E5FFF]/10 hover:border-white/30">
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-white/80 text-sm font-medium">{label}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.vehicleType && <p className="text-red-400 text-xs">{errors.vehicleType.message}</p>}
      </div>

      {isBicycle ? (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 text-sm">
          No registration details required for bicycles.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Plate Number" placeholder="LND 456 AB" error={errors.vehiclePlate?.message} {...register("vehiclePlate")} />
          <Input label="Vehicle Color" placeholder="Red" error={errors.vehicleColor?.message} {...register("vehicleColor")} />
          <Input label="Vehicle Model" placeholder="Honda CB150" error={errors.vehicleModel?.message} {...register("vehicleModel")} />
          <Input label="Vehicle Year" placeholder="2020" type="number" error={errors.vehicleYear?.message} {...register("vehicleYear")} />
        </div>
      )}

      <StepFooter onBack={onBack} />
    </form>
  );
}

function Step4Form({
  onNext,
  onBack,
  saved,
  avatar,
  setAvatar,
  governmentId,
  setGovernmentId,
}: {
  onNext: (d: Step4) => void;
  onBack: () => void;
  saved: Partial<Step4>;
  avatar: File | null;
  setAvatar: (f: File | null) => void;
  governmentId: File | null;
  setGovernmentId: (f: File | null) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const govIdInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<Step4>({
    resolver: zodResolver(step4Schema),
    defaultValues: saved,
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarError("");
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onValid(data: Step4) {
    if (!avatar) {
      setAvatarError("A profile photo is required");
      return;
    }
    onNext(data);
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      {/* Avatar upload */}
      <div className="space-y-2">
        <label className="text-white/70 text-sm font-medium block">
          Profile Photo <span className="text-[#FF6A2C]">*</span>
        </label>
        <div className="flex items-center gap-5">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#1E5FFF] flex items-center justify-center cursor-pointer overflow-hidden transition-colors relative"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
            ) : (
              <div className="text-center p-2">
                <svg className="w-6 h-6 text-white/30 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-white/30 text-xs">Upload photo</span>
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm hover:border-white/40 hover:text-white transition-colors"
            >
              {avatar ? "Change photo" : "Choose file"}
            </button>
            <p className="text-white/30 text-xs mt-2">JPG or PNG, max 10MB</p>
          </div>
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        {avatarError && <p className="text-red-400 text-xs">{avatarError}</p>}
      </div>

      {/* Government ID */}
      <div className="space-y-1.5">
        <label className="text-white/70 text-sm font-medium block">Government ID <span className="text-white/30 text-xs">(NIN slip, Driver&apos;s License, Voter&apos;s Card)</span></label>
        <div
          onClick={() => govIdInputRef.current?.click()}
          className="border border-dashed border-white/20 hover:border-[#1E5FFF] rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors"
        >
          <svg className="w-8 h-8 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="text-white/70 text-sm">{governmentId ? governmentId.name : "Click to upload government ID"}</p>
            <p className="text-white/30 text-xs">Image or PDF, max 10MB</p>
          </div>
        </div>
        <input ref={govIdInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setGovernmentId(e.target.files?.[0] ?? null)} />
      </div>

      {/* BVN / NIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="BVN" placeholder="12345678901" maxLength={11} error={errors.bvn?.message} {...register("bvn")} />
        <Input label="NIN" placeholder="12345678901" maxLength={11} error={errors.nin?.message} {...register("nin")} />
      </div>
      <Input label="Driver's License Number" placeholder="ABC000000001" error={errors.driverLicenseNumber?.message} {...register("driverLicenseNumber")} />

      <StepFooter onBack={onBack} />
    </form>
  );
}

function Step5Form({
  onNext,
  onBack,
  saved,
}: {
  onNext: (d: Step5) => void;
  onBack: () => void;
  saved: Partial<Step5>;
}) {
  const { register, handleSubmit } = useForm<Step5>({ defaultValues: saved });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-2">
        <p className="text-white/60 text-sm leading-relaxed">
          A guarantor is someone who vouches for your identity and good character. This is optional but speeds up your verification.
        </p>
      </div>
      <Input label="Guarantor Full Name" placeholder="Funmi Adeyemi" {...register("guarantorName")} />
      <Input label="Guarantor Phone" placeholder="+234XXXXXXXXXX" {...register("guarantorPhone")} />
      <Input label="Guarantor Address" placeholder="12 Allen Avenue, Ikeja" {...register("guarantorAddress")} />
      <StepFooter onBack={onBack} nextLabel="Review & Submit" />
    </form>
  );
}

function StepFooter({ onBack, nextLabel = "Continue" }: { onBack?: () => void; nextLabel?: string }) {
  return (
    <div className="flex gap-4 pt-2">
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
        className="px-8 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#1E5FFF" }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────

export default function RiderOnboardPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  // Persisted form data per step
  const [s1, setS1] = useState<Partial<Step1>>({});
  const [s2, setS2] = useState<Partial<Step2>>({});
  const [s3, setS3] = useState<Partial<Step3>>({});
  const [s4, setS4] = useState<Partial<Step4>>({});
  const [s5, setS5] = useState<Partial<Step5>>({});

  // File uploads
  const [avatar, setAvatar] = useState<File | null>(null);
  const [governmentId, setGovernmentId] = useState<File | null>(null);

  async function submitApplication(s5Data: Step5) {
    setS5(s5Data);
    setSubmitting(true);
    setServerError("");

    try {
      const fd = new FormData();

      // Step 1
      fd.append("firstName", s1.firstName ?? "");
      fd.append("lastName", s1.lastName ?? "");
      fd.append("phone", s1.phone ?? "");
      if (s1.email) fd.append("email", s1.email);
      if (s1.dateOfBirth) fd.append("dateOfBirth", s1.dateOfBirth);
      if (s1.gender) fd.append("gender", s1.gender);

      // Step 2
      if (s2.streetAddress) fd.append("streetAddress", s2.streetAddress);
      if (s2.city) fd.append("city", s2.city);
      if (s2.state) fd.append("state", s2.state);

      // Step 3 — vehicle registration details not applicable for bicycles
      if (s3.vehicleType) fd.append("vehicleType", s3.vehicleType);
      if (s3.vehicleType !== "BICYCLE") {
        if (s3.vehiclePlate) fd.append("vehiclePlate", s3.vehiclePlate);
        if (s3.vehicleColor) fd.append("vehicleColor", s3.vehicleColor);
        if (s3.vehicleModel) fd.append("vehicleModel", s3.vehicleModel);
        if (s3.vehicleYear) fd.append("vehicleYear", s3.vehicleYear);
      }

      // Step 4
      if (s4.bvn) fd.append("bvn", s4.bvn);
      if (s4.nin) fd.append("nin", s4.nin);
      if (s4.driverLicenseNumber) fd.append("driverLicenseNumber", s4.driverLicenseNumber);

      // Step 5 — guarantor
      if (s5Data.guarantorName && s5Data.guarantorPhone) {
        fd.append("guarantors", JSON.stringify([{
          name: s5Data.guarantorName,
          phone: s5Data.guarantorPhone,
          address: s5Data.guarantorAddress ?? "",
        }]));
      }

      // Files
      if (avatar) fd.append("avatar", avatar);
      if (governmentId) fd.append("governmentId", governmentId);

      const res = await fetch(`${BACKEND_URL}/api/v1/rider/onboard`, {
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
              Welcome aboard, <strong className="text-white">{s1.firstName}</strong>! Your rider application has been received.
            </p>
            <p className="text-white/60 leading-relaxed mb-8">
              Our team will review your details and reach out to <strong className="text-white">{s1.phone}</strong> within 24–48 hours to complete your onboarding.
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
          <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-3">Rider Application</p>
          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-2">
            Join the Godrop rider network
          </h1>
          <p className="text-white/50 text-base">Step {step + 1} of {STEPS.length} — {STEPS[step].description}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: i <= step ? "#1E5FFF" : "transparent" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="hidden md:flex justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className={`text-xs font-medium ${i <= step ? "text-[#1E5FFF]" : "text-white/30"}`}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[400px]">
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
                <Step1Form saved={s1} onNext={(d) => { setS1(d); setStep(1); }} />
              )}
              {step === 1 && (
                <Step2Form saved={s2} onNext={(d) => { setS2(d); setStep(2); }} onBack={() => setStep(0)} />
              )}
              {step === 2 && (
                <Step3Form saved={s3} onNext={(d) => { setS3(d); setStep(3); }} onBack={() => setStep(1)} />
              )}
              {step === 3 && (
                <Step4Form
                  saved={s4}
                  onNext={(d) => { setS4(d); setStep(4); }}
                  onBack={() => setStep(2)}
                  avatar={avatar}
                  setAvatar={setAvatar}
                  governmentId={governmentId}
                  setGovernmentId={setGovernmentId}
                />
              )}
              {step === 4 && (
                <>
                  <Step5Form
                    saved={s5}
                    onNext={async (d) => {
                      await submitApplication(d);
                    }}
                    onBack={() => setStep(3)}
                  />
                  {submitting && (
                    <div className="mt-4 flex items-center gap-3 text-white/60 text-sm">
                      <div className="w-4 h-4 border-2 border-[#1E5FFF] border-t-transparent rounded-full animate-spin" />
                      Submitting your application…
                    </div>
                  )}
                  {serverError && (
                    <p className="mt-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                      {serverError}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageShell>
  );
}
