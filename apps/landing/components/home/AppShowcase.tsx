"use client";

import { motion } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";
import AppStoreButtons from "@/components/ui/AppStoreButtons";
import { fadeUp, scaleIn, staggerContainer, inViewProps } from "@/lib/animations";

const FEATURES = [
  {
    n: "01",
    title: "Live tracking, street by street",
    body: "Every order has a pulse. Watch your rider weave through traffic in real time and share the link with whoever's waiting at the door.",
  },
  {
    n: "02",
    title: "One wallet for everything",
    body: "Top up once, pay everywhere — food, trucks, market runs. Cards, transfers and USSD via Paystack. Refunds land back in seconds.",
  },
  {
    n: "03",
    title: "Schedule it, batch it",
    body: "Set deliveries for later, send to multiple addresses in one go, and save your regular routes. Built for busy weeks and small businesses.",
  },
  {
    n: "04",
    title: "Vetted, rated, insured",
    body: "Every rider and driver is identity-verified and community-rated. Parcels are covered, and support is a tap away — humans, not bots.",
  },
];

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[290px] sm:w-[320px]">
      {/* Glow */}
      <div
        className="absolute -inset-16 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(30,95,255,0.28) 0%, transparent 65%)" }}
      />
      <div className="relative rounded-[3rem] border border-white/10 bg-[#101014] p-2.5 shadow-[0_60px_120px_rgba(0,0,0,0.6)]">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2.4rem] bg-[#0B1226]">
          {/* Status bar + notch */}
          <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute left-5 top-3.5 z-10 font-mono text-[11px] font-bold text-white">9:41</div>

          {/* Map */}
          <svg viewBox="0 0 320 480" className="absolute inset-0 h-[72%] w-full" aria-hidden="true">
            <rect width="320" height="480" fill="#0B1226" />
            <path d="M0 120 H320 M0 240 H320 M0 360 H320 M80 0 V480 M160 0 V480 M240 0 V480" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <path d="M-20 300 Q 90 280, 140 220 T 300 120" stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M30 400 Q 110 350, 165 255 T 295 105" stroke="#FF6A2C" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 8" />
            <circle cx="30" cy="400" r="9" fill="#FF6A2C" stroke="#fff" strokeWidth="2.5" />
            <circle cx="295" cy="105" r="9" fill="#1E5FFF" stroke="#fff" strokeWidth="2.5" />
            <g transform="translate(165 255)">
              <circle r="16" fill="#fff" />
              <path d="M-5 4 L0 -6 L5 4 Z" fill="#1E5FFF" />
            </g>
          </svg>

          {/* Tracking sheet */}
          <div className="absolute inset-x-2.5 bottom-2.5 rounded-3xl border border-white/10 bg-[#15151A]/95 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-white/70">
                LIVE · ORDER A4782
              </span>
              <span className="ml-auto font-mono text-[10px] text-white/50">4:32 PM</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white">
                EM
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">Emeka O. · 4.9★</p>
                <p className="font-mono text-[10px] text-white/50">LAG 342 KJA · Bike</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/50">ETA</p>
                <p className="font-mono text-lg font-bold text-accent">6 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShowcase() {
  return (
    <section className="grain relative bg-ink py-32 text-white sm:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="05" title="The app" className="mb-10" />

        <motion.h2
          variants={fadeUp}
          {...inViewProps}
          className="display mb-24 max-w-4xl text-[clamp(2.8rem,6.5vw,6.5rem)]"
        >
          The whole city, <span className="serif-accent text-accent">in your pocket.</span>
        </motion.h2>

        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:gap-12">
          {/* Sticky phone */}
          <div className="order-last lg:order-first">
            <motion.div variants={scaleIn} {...inViewProps} className="lg:sticky lg:top-28">
              <PhoneMock />
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            variants={staggerContainer(0.1)}
            {...inViewProps}
            className="flex flex-col justify-center gap-14 lg:gap-20"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.n} variants={fadeUp} className="border-t border-white/10 pt-8">
                <span className="font-mono text-sm font-bold text-accent">({f.n})</span>
                <h3 className="display mt-5 text-2xl !tracking-[-0.02em] sm:text-3xl">{f.title}</h3>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">{f.body}</p>
              </motion.div>
            ))}
            <motion.div variants={fadeUp}>
              <AppStoreButtons />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
