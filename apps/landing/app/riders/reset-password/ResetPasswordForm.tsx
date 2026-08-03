"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://godrop-backend-production.up.railway.app";

const INPUT_CLASS =
  "w-full rounded-2xl border border-white/10 bg-ink-soft px-5 py-4 text-[15px] text-white placeholder-white/30 transition-colors duration-200 focus:border-accent focus:outline-none";

const LABEL_CLASS = "mono-label block text-white/60";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(data: ResetPasswordFormValues) {
    setServerError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/rider/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-white/10 bg-ink-soft p-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-400/10">
          <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="display mb-3 text-3xl text-white">Invalid reset link</h2>
        <p className="text-white/60">
          This password reset link is missing or invalid. Request a new one from the Godrop Rider app&apos;s
          &quot;Forgot password&quot; screen.
        </p>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-white/10 bg-ink-soft p-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
          <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="display mb-3 text-3xl text-white">Password reset!</h2>
        <p className="text-white/60">
          Your password has been updated. You can now log in with your new password in the Godrop Rider app.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={staggerContainer(0.07)}
      {...inViewProps}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-7"
    >
      <motion.div variants={fadeUp} className="space-y-2.5">
        <label className={LABEL_CLASS}>New Password *</label>
        <input
          {...register("password")}
          type="password"
          placeholder="At least 6 characters"
          className={INPUT_CLASS}
        />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-2.5">
        <label className={LABEL_CLASS}>Confirm New Password *</label>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Re-enter your new password"
          className={INPUT_CLASS}
        />
        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
      </motion.div>

      {serverError && (
        <motion.p variants={fadeUp} className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-400">
          {serverError}
        </motion.p>
      )}

      <motion.div variants={fadeUp}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[56px] w-full cursor-pointer items-center justify-center rounded-full bg-accent px-10 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </button>
      </motion.div>

      <motion.p variants={fadeUp} className="text-sm text-white/40">
        Changed your mind?{" "}
        <Link href="/" className="text-accent hover:text-accent-light">
          Back to home
        </Link>
      </motion.p>
    </motion.form>
  );
}
