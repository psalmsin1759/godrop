"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import AppStoreButtons from "@/components/ui/AppStoreButtons";

const SLIDE_DURATION = 8000;
const CROSSFADE_DURATION = 0.7;
const NAV_H = 58; // matches Navbar h-[58px]
const spring = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Glass card treatment shared with the rest of the site (ink-soft + white/10)
const GLASS = {
  background: "rgba(18,18,20,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
} as const;

// ─── Shared motion variants ───────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const up: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: spring } },
};

const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9 } },
};

// ─── Shared data ──────────────────────────────────────────────

const STARS = Array.from({ length: 60 }, (_, i) => ({
  cx: (i * 211) % 1440,
  cy: (i * 97) % 900,
  r: 0.8 + (i % 3) * 0.5,
  opacity: 0.15 + (i % 5) * 0.08,
}));

const AVATAR_COLORS = ["#FF6A2C", "#1E5FFF", "#FFB020", "#5B8EFF", "#FF8A52"];
const AVATAR_LABELS = ["AO", "TB", "KE", "NA", "+"];
const PARTNER_LOGOS = ["SHOPRITE", "GTBank", "Chicken Republic", "Ebeano", "Paystack", "Domino's"];
const SERVICE_TILES = [
  { c: "rgba(30,95,255,0.3)", label: "Parcel" },
  { c: "rgba(255,106,44,0.3)", label: "Truck" },
  { c: "rgba(255,106,44,0.3)", label: "Food" },
  { c: "rgba(30,95,255,0.3)", label: "Grocery" },
  { c: "rgba(91,142,255,0.3)", label: "Retail" },
  { c: "rgba(255,106,44,0.3)", label: "Pharmacy" },
];

const SKYLINE_FAR: [number, number, number, number][] = [
  [0, 430, 120, 470], [120, 360, 90, 540], [210, 400, 140, 500],
  [350, 300, 80, 600], [430, 380, 110, 520], [540, 260, 70, 640],
  [610, 340, 120, 560], [730, 290, 90, 610], [820, 390, 120, 510],
  [940, 310, 100, 590], [1040, 370, 140, 530], [1180, 280, 90, 620],
  [1270, 330, 120, 570], [1390, 400, 110, 500],
];

const SKYLINE_MID: [number, number, number, number][] = [
  [80, 520, 140, 380], [220, 460, 120, 440], [340, 540, 180, 360],
  [520, 430, 110, 470], [630, 510, 160, 390], [790, 450, 130, 450],
  [920, 530, 190, 370], [1110, 440, 120, 460], [1230, 500, 170, 400],
];

const WINDOWS = Array.from({ length: 200 }, (_, i) => {
  const cols = [110, 250, 400, 560, 680, 830, 970, 1130, 1280, 1450];
  return {
    x: cols[i % cols.length] + ((i * 13) % 70),
    y: 480 + ((i * 27) % 360),
    fill: i % 7 === 0 ? "#FFB020" : i % 5 === 0 ? "#FF6A2C" : "#5B8EFF",
  };
});

// ─── Reusable pieces ──────────────────────────────────────────

function PrimaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex h-[56px] items-center gap-2.5 rounded-full bg-accent px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        className="transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function GhostCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-[56px] items-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white/60"
    >
      {children}
    </a>
  );
}

// ─── Hero 1 — Asymmetric split ────────────────────────────────

function Hero1() {
  return (
    <div className="grain absolute inset-0 flex flex-col overflow-hidden bg-ink">
      {/* Glows */}
      <div className="pointer-events-none absolute" style={{ top: -200, left: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,95,255,0.25) 0%, rgba(30,95,255,0) 70%)" }} />
      <div className="pointer-events-none absolute" style={{ bottom: -200, right: -120, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,106,44,0.22) 0%, rgba(255,106,44,0) 70%)" }} />
      <svg viewBox="0 0 1440 900" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {STARS.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff" opacity={s.opacity} />)}
      </svg>

      {/* Content row — paddingTop clears the fixed navbar */}
      <div className="relative z-10 flex flex-1 flex-col items-start px-6 sm:px-10 lg:flex-row lg:px-16" style={{ paddingTop: NAV_H }}>

        {/* Left — staggered text */}
        <motion.div
          className="flex max-w-[640px] flex-1 flex-col pb-10 pt-12 lg:pt-16"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow */}
          <motion.div
            variants={up}
            className="mono-label mb-7 inline-flex items-center gap-2.5 self-start rounded-full border border-white/15 py-2 pl-4 pr-2 text-white/70"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Now live in 36 states
            </span>
            <span className="rounded-full bg-accent/20 px-2.5 py-1 text-accent-light">
              New · Pharmacy
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={up} className="display mb-6 text-[clamp(2.8rem,5.2vw,5.2rem)]">
            Move anything.
            <br />
            <span className="serif-accent text-accent">Anywhere</span> in Nigeria.
          </motion.h1>

          {/* Sub */}
          <motion.p variants={up} className="mb-9 max-w-[520px] text-base leading-relaxed text-white/65 sm:text-lg">
            From a small parcel to a 10-ton truck — book riders, drivers, food,
            groceries and retail in one tap. On demand, all over the country.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={up} className="mb-11 flex flex-wrap gap-3.5">
            <PrimaryCta href="#download">Get the app — it&apos;s free</PrimaryCta>
            <GhostCta href="#how-it-works">See how it works</GhostCta>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={up} className="flex items-center gap-6">
            <div className="flex">
              {AVATAR_COLORS.map((c, i) => (
                <div
                  key={i}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink font-mono text-[11px] font-bold text-white"
                  style={{ background: c, marginLeft: i === 0 ? 0 : -10, zIndex: AVATAR_COLORS.length - i }}
                >
                  {AVATAR_LABELS[i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 text-amber">
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 3l2.8 6 6.2.6-4.7 4.3 1.4 6.3L12 17l-5.7 3.2L7.7 14 3 9.6 9.2 9 12 3z" />
                    </svg>
                  ))}
                </div>
                <span className="font-mono text-sm font-bold">4.9</span>
              </div>
              <p className="mt-1 text-xs text-white/55">
                <b className="text-white">20k+</b> Nigerians moving on Godrop
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — phone + orbit cards */}
        <div className="relative hidden flex-1 self-center lg:block" style={{ height: 680, minWidth: 460 }}>
          {/* Orbit rings — fade in */}
          <motion.svg
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.4 }}
            width="700" height="660" viewBox="0 0 700 660"
            className="pointer-events-none absolute"
            style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <circle cx="350" cy="330" r="180" fill="none" stroke="rgba(91,142,255,0.2)" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="350" cy="330" r="280" fill="none" stroke="rgba(255,106,44,0.2)" strokeWidth="1.5" strokeDasharray="4 6" />
          </motion.svg>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: spring, delay: 0.45 }}
            className="absolute"
            style={{ top: 20, left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="rounded-[44px] border border-white/10 bg-[#101014] p-2" style={{ transform: "rotate(-5deg)", width: 280, height: 570, boxShadow: "0 50px 100px rgba(0,0,0,0.6), 0 0 60px rgba(30,95,255,0.2)" }}>
              <div className="relative h-full w-full overflow-hidden rounded-[36px]" style={{ background: "linear-gradient(160deg, #1E5FFF 0%, #143FB0 100%)" }}>
                <div className="absolute left-1/2 top-2 z-10 h-6 w-[90px] -translate-x-1/2 rounded-2xl bg-black" />
                <div className="absolute left-5 top-3.5 font-mono text-[11px] font-bold text-white">9:41</div>
                <div className="px-4 pt-11 text-white">
                  <div className="mono-label !text-[8px] text-white/70">Deliver to</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold">
                    <svg width="9" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
                    </svg>
                    Lekki Phase 1
                  </div>
                  <div className="display mt-2.5 text-[16px] !leading-[1.15] !tracking-[-0.01em]">
                    Hi Adaeze, <span className="serif-accent text-[#FFB38A]">what are we</span><br />moving today?
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 rounded-[22px] bg-[#101014] p-2.5" style={{ top: 164 }}>
                  <div className="flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 text-[9px] text-white/50">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
                    </svg>
                    Search…
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {SERVICE_TILES.map(t => (
                      <div key={t.label} className="flex h-14 flex-col justify-between rounded-lg border border-white/10 bg-white/[0.04] p-1.5">
                        <div className="h-[18px] w-[18px] rounded-[5px]" style={{ background: t.c }} />
                        <div className="text-[8px] font-bold text-white">{t.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded-[10px] bg-accent p-2 text-white">
                    <div className="mono-label !text-[6px] text-white/90">Limited offer</div>
                    <div className="mt-0.5 text-[11px] font-extrabold leading-tight">₦0 delivery under 5kg</div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-accent/25 text-accent-light">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5v-9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[8px] font-bold text-white">Parcel · #A4782</div>
                      <div className="mt-px text-[6px] text-white/60">6 min · ETA 4:32 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Orbit card: Parcel — top right */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 5 }}
            transition={{ duration: 0.7, ease: spring, delay: 0.65 }}
            className="absolute rounded-3xl p-4"
            style={{ top: 60, right: 0, width: 180, ...GLASS, boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[rgba(91,142,255,0.3)] bg-[rgba(91,142,255,0.18)]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5v-9z" stroke="#5B8EFF" strokeWidth="1.8" strokeLinejoin="round" /><path d="M3 7.5l9 4.5 9-4.5M12 12v9" stroke="#5B8EFF" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              </div>
              <div className="text-[13px] font-bold">Parcel</div>
            </div>
            <div className="mono-label mb-1.5 !text-[9px] text-white/55">Bike · 12 km</div>
            <div className="font-mono text-lg font-extrabold">₦1,450</div>
          </motion.div>

          {/* Orbit card: Rider — bottom left */}
          <motion.div
            initial={{ opacity: 0, x: -40, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -4 }}
            transition={{ duration: 0.7, ease: spring, delay: 0.78 }}
            className="absolute flex items-center gap-2.5 rounded-3xl border border-white/20 bg-accent p-4 text-white"
            style={{ bottom: 90, left: 0, width: 200, boxShadow: "0 24px 50px rgba(255,106,44,0.4)" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-bold">TB</div>
            <div>
              <div className="text-xs font-bold">Emeka · 4.9★</div>
              <div className="mt-0.5 text-[10px] opacity-85">6 min away</div>
            </div>
          </motion.div>

          {/* Orbit card: Stats — right middle */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ duration: 0.7, ease: spring, delay: 0.9 }}
            className="absolute rounded-3xl p-4"
            style={{ top: 390, right: -10, width: 180, ...GLASS, boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}
          >
            <div className="mono-label !text-[9px] text-white/55">Nationwide</div>
            <div className="display mt-1 text-[28px]">36</div>
            <div className="text-[10px] text-white/60">states · 200+ cities</div>
          </motion.div>
        </div>
      </div>

      {/* Trusted by */}
      <motion.div
        variants={fade} initial="hidden" animate="show"
        className="relative z-10 flex flex-wrap items-center gap-8 px-6 pb-10 sm:px-10 lg:px-16"
      >
        <span className="mono-label text-white/40">Trusted by</span>
        <div className="flex flex-wrap items-center gap-8">
          {PARTNER_LOGOS.map(l => (
            <span key={l} className="font-mono text-[13px] font-bold tracking-wide text-white/50">{l}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Hero 2 — Cinematic night city ────────────────────────────

function Hero2() {
  return (
    <div className="grain absolute inset-0 overflow-hidden bg-ink text-white">
      {/* Aurora glows */}
      <div className="pointer-events-none absolute" style={{ top: -240, right: -120, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,106,44,0.35) 0%, rgba(255,106,44,0.12) 30%, rgba(255,106,44,0) 70%)" }} />
      <div className="pointer-events-none absolute" style={{ top: -200, left: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,95,255,0.3) 0%, rgba(30,95,255,0) 70%)" }} />

      {/* Stars */}
      <svg width="1440" height="500" viewBox="0 0 1440 500" className="pointer-events-none absolute left-0 top-0" aria-hidden="true">
        {Array.from({ length: 70 }, (_, i) => ({ x: (i * 137) % 1440, y: (i * 53) % 280, o: 0.25 + (i % 5) * 0.15, r: 0.8 + (i % 3) * 0.6 })).map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
        ))}
      </svg>

      {/* Night skyline — fades in */}
      <motion.svg
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.3 }}
        width="1440" height="900" viewBox="0 0 1440 900" className="pointer-events-none absolute inset-0" aria-hidden="true"
      >
        <g opacity="0.6">
          {SKYLINE_FAR.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#0d0d10" />)}
        </g>
        <g>
          {SKYLINE_MID.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#060608" />)}
        </g>
        <rect x="700" y="340" width="60" height="560" fill="#050507" />
        <rect x="715" y="340" width="30" height="560" fill="#FF6A2C" opacity="0.7" />
        <rect x="710" y="330" width="40" height="14" fill="#FF6A2C" />
        {WINDOWS.map((w, i) => <rect key={i} x={w.x} y={w.y} width="4" height="6" fill={w.fill} opacity="0.9" />)}
      </motion.svg>

      {/* Legibility overlay */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0.1) 40%, rgba(10,10,11,0.6) 100%)" }} />

      {/* Left text — staggered */}
      <motion.div
        className="absolute left-6 right-6 z-10 sm:left-10 sm:right-10 lg:left-16 lg:right-auto"
        style={{ top: NAV_H + 90, maxWidth: 680 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={up}
          className="mono-label mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/70 backdrop-blur-md"
        >
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #34d399" }} />
          Live tracking · Real-time across Nigeria
        </motion.div>

        <motion.h1 variants={up} className="display text-[clamp(2.4rem,6.5vw,6rem)]">
          One app for<br />
          <span className="serif-accent text-accent">everything</span><br />
          you need delivered.
        </motion.h1>

        <motion.p variants={up} className="mt-7 max-w-[520px] text-base leading-relaxed text-white/70 sm:text-lg">
          Parcels, trucks, food, groceries and shopping — booked, tracked and
          paid for in seconds. Built for Nigeria.
        </motion.p>

        <motion.div variants={up} className="mt-10">
          <AppStoreButtons />
        </motion.div>
      </motion.div>

      {/* Right — floating live cards */}
      <div className="absolute hidden lg:block" style={{ right: 70, top: NAV_H + 70, width: 360 }}>
        {/* Tracking card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 2 }}
          transition={{ duration: 0.8, ease: spring, delay: 0.5 }}
          className="rounded-3xl p-5 text-white"
          style={{ ...GLASS, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="mono-label !text-[10px] text-white/80">Live tracking · A4782</span>
            <span className="ml-auto font-mono text-xs text-white/55">4:32 PM</span>
          </div>
          <div className="mb-4 h-[130px] overflow-hidden rounded-2xl border border-white/5 bg-[#0B1226]">
            <svg width="100%" height="100%" viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <path d="M0 70 Q 60 50, 120 60 T 260 50 T 320 30 L320 130 L0 130 Z" fill="#101a36" opacity="0.7" />
              <path d="M0 40 L320 30" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <path d="M160 0 L170 130" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <path d="M40 110 Q 100 80, 170 70 T 290 30" stroke="#FF6A2C" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="2 8" />
              <circle cx="40" cy="110" r="8" fill="#FF6A2C" stroke="#fff" strokeWidth="2" />
              <circle cx="290" cy="30" r="8" fill="#5B8EFF" stroke="#fff" strokeWidth="2" />
              <g transform="translate(165 70)">
                <circle r="12" fill="#fff" />
                <path d="M-4 4 L0 -5 L4 4 Z" fill="#1E5FFF" />
              </g>
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-mono text-sm font-bold">KC</div>
            <div className="flex-1">
              <div className="text-sm font-bold">Kelvin Chigbo</div>
              <div className="mt-0.5 font-mono text-[10px] text-white/55">★ 4.9 · LAG 342 KJA</div>
            </div>
            <div className="text-right">
              <div className="mono-label !text-[9px] text-white/55">ETA</div>
              <div className="font-mono text-lg font-extrabold text-accent">6 min</div>
            </div>
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: -3 }}
          animate={{ opacity: 1, x: 0, rotate: -3 }}
          transition={{ duration: 0.75, ease: spring, delay: 0.7 }}
          className="ml-7 mt-4 flex items-center gap-5 rounded-3xl border border-white/20 bg-accent p-5 text-white"
          style={{ boxShadow: "0 30px 60px rgba(255,106,44,0.45)" }}
        >
          <div>
            <div className="mono-label !text-[9px] text-white/85">Average delivery</div>
            <div className="display mt-1 text-[32px]">27 min</div>
          </div>
          <div className="w-px self-stretch bg-white/25" />
          <div>
            <div className="mono-label !text-[9px] text-white/85">Riders online</div>
            <div className="display mt-1 text-[32px]">12k+</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Hero 3 — Centered marketing ─────────────────────────────

type ServiceCard = {
  label: string;
  desc: string;
  tint: string;
  baseY: number;
  rot: number;
  icon: string;
  featured?: boolean;
};

const SERVICE_CARDS: ServiceCard[] = [
  { label: "Parcel",  desc: "Same-day, door-to-door",   tint: "#5B8EFF", baseY: 30,  rot: -5, icon: "parcel" },
  { label: "Truck",   desc: "Relocate & move heavy",    tint: "#FF6A2C", baseY: 0,   rot: -2, icon: "truck" },
  { label: "Food",    desc: "480+ restaurants",         tint: "#FF9142", baseY: -10, rot: 0,  icon: "food",  featured: true },
  { label: "Grocery", desc: "Shoprite, Ebeano, markets",tint: "#5B8EFF", baseY: 0,   rot: 2,  icon: "grocery" },
  { label: "Retail",  desc: "Fashion, tech, home",      tint: "#FFB020", baseY: 30,  rot: 5,  icon: "retail" },
];

function SvcIcon({ icon, stroke }: { icon: string; stroke: string }) {
  if (icon === "parcel")  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5v-9z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (icon === "truck")   return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="1.5" y="6.5" width="12" height="9" rx="1.2" stroke={stroke} strokeWidth="1.8"/><path d="M13.5 9h4.3l3.2 3.2v3.3h-7.5V9z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="6.5" cy="17.5" r="2" stroke={stroke} strokeWidth="1.8"/><circle cx="17" cy="17.5" r="2" stroke={stroke} strokeWidth="1.8"/></svg>;
  if (icon === "food")    return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 11c0-4.5 4-7.5 9-7.5s9 3 9 7.5H3z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/><path d="M2 13h20M5 16.5h14l-1 3.5H6l-1-3.5z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (icon === "grocery") return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5h3l2.5 11h10l2-8H7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="20" r="1.6" stroke={stroke} strokeWidth="1.8"/><circle cx="17" cy="20" r="1.6" stroke={stroke} strokeWidth="1.8"/></svg>;
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 8h17l-1 12H4.5l-1-12z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 10V7a4 4 0 018 0v3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

function Hero3() {
  return (
    <div className="grain absolute inset-0 flex flex-col overflow-hidden bg-ink text-white">
      {/* Grid */}
      <svg width="100%" height="100%" viewBox="0 0 1440 900" className="pointer-events-none absolute inset-0 opacity-40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="h3grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
          <radialGradient id="h3fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#h3grid)" />
        <rect width="1440" height="900" fill="url(#h3fade)" opacity="0.6" />
      </svg>
      <div className="pointer-events-none absolute" style={{ top: 200, left: "50%", transform: "translateX(-50%)", width: 1000, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,95,255,0.22) 0%, rgba(30,95,255,0) 60%)" }} />
      <div className="pointer-events-none absolute" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,106,44,0.25) 0%, rgba(255,106,44,0) 70%)" }} />

      {/* Centered copy — staggered */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 pb-4 text-center sm:px-10 lg:px-16"
        style={{ paddingTop: NAV_H + 32 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={up}
          className="mono-label mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2 pr-4 text-white/85 backdrop-blur-md"
        >
          <span className="rounded-full bg-accent px-2.5 py-1 !text-[10px] text-white">New</span>
          Godrop Business is live
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>

        <motion.h1 variants={up} className="display max-w-[1000px] text-[clamp(2.8rem,7vw,6.5rem)]">
          Nigeria&apos;s everyday<br />
          <span className="serif-accent text-accent">logistics super-app.</span>
        </motion.h1>

        <motion.p variants={up} className="mt-6 max-w-[600px] text-base leading-relaxed text-white/70 sm:text-lg">
          Send a parcel, book a truck, order lunch, or run a grocery — all from
          one app, with one wallet, in under 30 minutes.
        </motion.p>

        <motion.div variants={up} className="mt-10 flex flex-wrap justify-center gap-3.5">
          <PrimaryCta href="#download">Download Godrop</PrimaryCta>
          <GhostCta href="/business">For businesses</GhostCta>
        </motion.div>

        <motion.div variants={up} className="mono-label mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-white/55">
          <span className="font-bold text-white">4.9★</span> on App Store · iOS & Android
          <span className="mx-1.5">·</span>
          <span className="font-bold text-white">20k+</span> users
          <span className="mx-1.5">·</span>
          <span className="font-bold text-white">₦0</span> sign-up fee
        </motion.div>
      </motion.div>

      {/* Service cards — staggered from below */}
      <div className="relative z-10 mt-auto hidden items-end justify-center gap-4 pb-[60px] lg:flex">
        {SERVICE_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 80 + s.baseY }}
            animate={{ opacity: 1, y: s.baseY }}
            transition={{ duration: 0.75, ease: spring, delay: 0.45 + i * 0.08 }}
            className="w-[200px] rounded-3xl p-5"
            style={{
              ...(s.featured
                ? { background: "#FF6A2C", border: "1px solid rgba(255,255,255,0.25)" }
                : GLASS),
              rotate: `${s.rot}deg`,
              boxShadow: s.featured ? "0 30px 60px rgba(255,106,44,0.45)" : "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[13px]"
              style={{
                background: s.featured ? "rgba(255,255,255,0.18)" : "rgba(91,142,255,0.15)",
                border: `1px solid ${s.featured ? "rgba(255,255,255,0.3)" : "rgba(91,142,255,0.25)"}`,
              }}
            >
              <SvcIcon icon={s.icon} stroke={s.featured ? "#fff" : s.tint} />
            </div>
            <div className="display mt-3.5 text-[19px] text-white">{s.label}</div>
            <div className="mt-1 text-[11px]" style={{ color: s.featured ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}>{s.desc}</div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: s.featured ? "#fff" : s.tint }}>
              Explore
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────

const SLIDES = [Hero1, Hero3, Hero2] as const;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [tick, setTick] = useState(0);

  const goTo = (next: number) => {
    setCurrent(next);
    setTick(t => t + 1);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [tick]);

  const Slide = SLIDES[current];

  return (
    <section className="relative w-full overflow-hidden text-white" style={{ height: "100svh" }}>

      {/*
        mode="sync" renders both the outgoing and incoming slides at the same
        time so they cross-fade. The incoming slide is later in the DOM
        (higher stacking order) and fades in while the outgoing fades out.
      */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_DURATION, ease: "easeInOut" }}
        >
          <Slide />
        </motion.div>
      </AnimatePresence>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32" style={{ background: "linear-gradient(to top, #0a0a0b, transparent)" }} />

      {/* Prev / Dots / Next row */}
      <div className="absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-1 cursor-pointer rounded-full border-none p-0"
              style={{
                width: i === current ? 28 : 8,
                background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next slide"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 h-px bg-white/10">
        <motion.div
          key={`${current}-${tick}`}
          className="h-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
        />
      </div>
    </section>
  );
}
