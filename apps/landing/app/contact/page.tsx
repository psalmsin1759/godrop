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

const INPUT_CLASS =
  "w-full rounded-2xl border border-white/10 bg-ink-soft px-5 py-4 text-[15px] text-white placeholder-white/30 transition-colors duration-200 focus:border-accent focus:outline-none";

const LABEL_CLASS = "mono-label block text-white/60";

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
      <section className="grain relative overflow-hidden bg-ink">
        <div
          className="pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,106,44,0.14) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto w-full max-w-3xl px-6 py-24 sm:px-10">
          <motion.div variants={staggerContainer(0.1)} {...inViewProps} className="mb-16">
            <motion.p variants={fadeUp} className="mono-label mb-8 text-accent">
              Get in touch
            </motion.p>
            <motion.h1 variants={fadeUp} className="display text-[clamp(2.6rem,6vw,4.5rem)] text-white">
              We&apos;d love to <span className="serif-accent text-accent">hear from you.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-lg leading-relaxed text-white/60">
              Whether you have a question, partnership inquiry, or feedback — send
              us a message and we&apos;ll respond within 24 hours.
            </motion.p>
          </motion.div>

          {submitted ? (
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
              <h2 className="display mb-3 text-3xl text-white">Message sent!</h2>
              <p className="text-white/60">
                We&apos;ve received your message and will get back to you within 24
                hours.
              </p>
            </motion.div>
          ) : (
            <motion.form
              variants={staggerContainer(0.07)}
              {...inViewProps}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-7"
            >
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label className={LABEL_CLASS}>Full Name *</label>
                  <input {...register("name")} placeholder="Amaka Johnson" className={INPUT_CLASS} />
                  {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label className={LABEL_CLASS}>Email Address *</label>
                  <input {...register("email")} type="email" placeholder="amaka@example.com" className={INPUT_CLASS} />
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label className={LABEL_CLASS}>
                    Phone Number <span className="text-white/30">(optional)</span>
                  </label>
                  <input {...register("phone")} placeholder="+234XXXXXXXXXX" className={INPUT_CLASS} />
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label className={LABEL_CLASS}>Subject *</label>
                  <input {...register("subject")} placeholder="Partnership inquiry" className={INPUT_CLASS} />
                  {errors.subject && <p className="text-xs text-red-400">{errors.subject.message}</p>}
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="space-y-2.5">
                <label className={LABEL_CLASS}>Message *</label>
                <textarea
                  {...register("message")}
                  rows={6}
                  placeholder="Tell us how we can help..."
                  className={`${INPUT_CLASS} resize-none`}
                />
                {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
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
                  className="inline-flex h-[56px] cursor-pointer items-center justify-center rounded-full bg-accent px-10 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Sending…" : "Send Message"}
                </button>
              </motion.div>
            </motion.form>
          )}

          {/* Contact info */}
          <motion.div
            variants={staggerContainer(0.1)}
            {...inViewProps}
            className="mt-20 grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {[
              { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Email", value: "harrydynastylogistics@gmail.com" },
              { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: "Phone", value: "+234 703 452 9789" },
              { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", label: "Location", value: "No.3 Ada George Road, Port Harcourt" },
            ].map(({ icon, label, value }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-ink-soft p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <p className="mono-label text-white/45">{label}</p>
                <p className="break-words text-sm font-medium text-white">{value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
