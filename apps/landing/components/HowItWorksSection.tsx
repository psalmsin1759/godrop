"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STEPS = [
  {
    n: "01",
    accent: "#1E5FFF",
    title: "Download the app",
    body: "Free on iOS and Android. Sign up in under 60 seconds — no paperwork, no waiting.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 18h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 6v6m0 0l-2.5-2.5M12 12l2.5-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    detail: (
      <div className="mt-5 rounded-xl overflow-hidden border border-white/[0.07]" style={{ background: "rgba(30,95,255,0.08)" }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(30,95,255,0.3)", color: "#fff" }}>G</div>
          <div>
            <div className="h-2 w-20 rounded bg-white/20 mb-1" />
            <div className="h-1.5 w-14 rounded bg-white/10" />
          </div>
          <div className="ml-auto text-[10px] font-semibold" style={{ color: "#1E5FFF" }}>Sign up →</div>
        </div>
        <div className="px-4 py-3 flex gap-2">
          {["📧 Email", "📱 Phone"].map(l => (
            <div key={l} className="text-[10px] text-white/40 rounded-lg px-3 py-1.5 border border-white/[0.08]">{l}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    n: "02",
    accent: "#FF6A2C",
    title: "Pick your service",
    body: "Food, groceries, parcels, retail, or a truck — everything you need lives in one tab.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    detail: (
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Parcel", bg: "rgba(91,142,255,0.18)" },
          { label: "Food", bg: "rgba(255,106,44,0.18)" },
          { label: "Truck", bg: "rgba(255,106,44,0.18)" },
          { label: "Grocery", bg: "rgba(30,95,255,0.18)" },
          { label: "Retail", bg: "rgba(255,176,32,0.18)" },
          { label: "Pharma", bg: "rgba(29,185,128,0.18)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl py-3 flex flex-col items-center justify-center gap-1.5 border border-white/[0.07]" style={{ background: s.bg }}>
            <div className="w-5 h-5 rounded-md" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="text-[9px] font-semibold text-white/60">{s.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "03",
    accent: "#5B8EFF",
    title: "Set pickup & drop-off",
    body: "Drop a pin or type an address. Get an instant quote. Pay securely with Paystack.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    detail: (
      <div className="mt-5 rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(91,142,255,0.06)" }}>
        {[
          { dot: "#5B8EFF", label: "Pickup", val: "Lekki Phase 1" },
          { dot: "#FF6A2C", label: "Drop-off", val: "Victoria Island" },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.dot }} />
            <div>
              <div className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">{r.label}</div>
              <div className="text-xs text-white/70 font-medium mt-0.5">{r.val}</div>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "rgba(91,142,255,0.12)" }}>
          <span className="text-[10px] text-white/40">Instant price</span>
          <span className="text-xs font-bold text-white">₦1,450</span>
        </div>
      </div>
    ),
  },
  {
    n: "04",
    accent: "#FFB020",
    title: "Track & receive",
    body: "Follow your rider live on the map. Get real-time ETAs. Delivered in under 30 minutes.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 11l9-9 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
    detail: (
      <div className="mt-5 rounded-xl overflow-hidden border border-white/[0.07]" style={{ background: "#0A1A3E", height: 110 }}>
        <svg width="100%" height="100%" viewBox="0 0 260 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M0 60 Q 60 45, 120 52 T 240 38 T 260 25 L260 110 L0 110 Z" fill="#0F244F" opacity="0.7" />
          <path d="M0 35 L260 25" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
          <path d="M130 0 L135 110" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
          <path d="M30 95 Q 90 70, 140 60 T 240 25" stroke="#FF6A2C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="95" r="5" fill="#FF6A2C" />
          <circle cx="240" cy="25" r="5" fill="#5B8EFF" />
          <circle cx="140" cy="60" r="10" fill="#fff" />
          <text x="140" y="64" textAnchor="middle" fontSize="11" fill="#1E5FFF">🛵</text>
        </svg>
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 pb-2">
          <span className="text-[9px] text-white/30">Lekki Phase 1</span>
          <span className="text-[9px] font-bold" style={{ color: "#FF6A2C" }}>ETA 6 min</span>
          <span className="text-[9px] text-white/30">VI</span>
        </div>
      </div>
    ),
  },
];

const connectorVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease } },
};

export default function HowItWorksSection() {
  return (
    <section className="bg-[#060606] py-24 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">

        {/* Header */}
        <motion.div
          className="mb-16"
          variants={staggerContainer(0.1)}
          {...inViewProps}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-16 h-px bg-white/20" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
              How it works
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: -1 }}
          >
            Order to doorstep —
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>four simple steps.</span>
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute left-0 right-0 pointer-events-none" style={{ top: 36 }}>
            <div className="max-w-full flex px-[12.5%] gap-0">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="flex-1 border-t border-dashed border-white/10 origin-left"
                  variants={connectorVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={staggerContainer(0.12, 0.1)}
            {...inViewProps}
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.n}
                variants={fadeUp}
                className="group relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                whileHover={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: `${step.accent}30`,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Watermark number */}
                <span
                  className="absolute top-3 right-5 font-black select-none pointer-events-none"
                  style={{ fontSize: 52, lineHeight: 1, color: `${step.accent}0D`, letterSpacing: -2 }}
                  aria-hidden="true"
                >
                  {step.n}
                </span>

                {/* Step badge + icon */}
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${step.accent}18`, color: step.accent, border: `1px solid ${step.accent}28` }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: `${step.accent}99` }}
                  >
                    Step {step.n}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-white font-bold mt-4 relative z-10"
                  style={{ fontSize: "1.05rem", letterSpacing: -0.3 }}
                >
                  {step.title}
                </h3>

                {/* Body */}
                <p className="text-white/45 text-sm leading-relaxed mt-2 relative z-10">
                  {step.body}
                </p>

                {/* Detail widget */}
                <div className="relative z-10 mt-auto">{step.detail}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer row — avg delivery stat + CTA */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-14 pt-10 border-t border-white/[0.07]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="flex items-center gap-8">
            {[
              { val: "27 min", label: "Average delivery time" },
              { val: "4.9★", label: "Customer rating" },
              { val: "₦0", label: "Sign-up fee" },
            ].map(m => (
              <div key={m.label}>
                <div className="text-white font-black text-xl" style={{ letterSpacing: -0.5 }}>{m.val}</div>
                <div className="text-white/30 text-xs mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
          <motion.a
            href="#download"
            className="inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-full text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6A2C, #E0531A)", boxShadow: "0 8px 24px rgba(255,106,44,0.35)" }}
            whileHover={{ scale: 1.04, boxShadow: "0 12px 32px rgba(255,106,44,0.45)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            Start your first delivery
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
