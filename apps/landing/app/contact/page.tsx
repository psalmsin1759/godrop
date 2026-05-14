"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import PageShell from "@/components/PageShell";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+234\d{10}$/, "Phone must be in format +234XXXXXXXXXX")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://godrop-backend-production.up.railway.app";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactForm) {
    setServerError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setSubmitted(true);
    } catch (err: any) {
      setServerError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="max-w-3xl mx-auto px-6 py-24">
        <motion.div variants={staggerContainer(0.1)} {...inViewProps} className="space-y-4 mb-16">
          <motion.p variants={fadeUp} className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase">
            Get in Touch
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-white text-4xl md:text-5xl font-black leading-tight">
            We&apos;d love to hear from you
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-xl">
            Whether you have a question, partnership inquiry, or feedback — send us a message and we&apos;ll respond within 24 hours.
          </motion.p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#1E5FFF]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Message sent!</h2>
            <p className="text-white/60">We&apos;ve received your message and will get back to you within 24 hours.</p>
          </motion.div>
        ) : (
          <motion.form
            variants={staggerContainer(0.07)}
            {...inViewProps}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Full Name *</label>
                <input
                  {...register("name")}
                  placeholder="Amaka Johnson"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Email Address *</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="amaka@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Phone Number <span className="text-white/30">(optional)</span></label>
                <input
                  {...register("phone")}
                  placeholder="+234XXXXXXXXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
                />
                {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-white/70 text-sm font-medium">Subject *</label>
                <input
                  {...register("subject")}
                  placeholder="Partnership inquiry"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors"
                />
                {errors.subject && <p className="text-red-400 text-xs">{errors.subject.message}</p>}
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Message *</label>
              <textarea
                {...register("message")}
                rows={6}
                placeholder="Tell us how we can help..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#1E5FFF] transition-colors resize-none"
              />
              {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
            </motion.div>

            {serverError && (
              <motion.p variants={fadeUp} className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {serverError}
              </motion.p>
            )}

            <motion.div variants={fadeUp}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-full text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#1E5FFF" }}
                whileHover={{ backgroundColor: "#FF6A2C", scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {isSubmitting ? "Sending…" : "Send Message"}
              </motion.button>
            </motion.div>
          </motion.form>
        )}

        {/* Contact info */}
        <motion.div
          variants={staggerContainer(0.1)}
          {...inViewProps}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Email", value: "hello@godrop.ng" },
            { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: "Phone", value: "+234 800 GODROP" },
            { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", label: "Location", value: "Lagos, Nigeria" },
          ].map(({ icon, label, value }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1E5FFF]/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
              </div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</p>
              <p className="text-white text-sm font-medium">{value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </PageShell>
  );
}
