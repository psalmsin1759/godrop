"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const SLIDE_DURATION = 8000;
const CROSSFADE_DURATION = 0.7;
const NAV_H = 58; // matches Navbar h-[58px]
const spring = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ─── Shared motion variants ───────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const up: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: spring } },
};

const fromLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: spring } },
};

const fromRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: spring } },
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
  { c: "rgba(30,95,255,0.25)", label: "Parcel" },
  { c: "rgba(255,106,44,0.25)", label: "Truck" },
  { c: "rgba(255,106,44,0.25)", label: "Food" },
  { c: "rgba(30,95,255,0.25)", label: "Grocery" },
  { c: "rgba(91,142,255,0.25)", label: "Retail" },
  { c: "rgba(255,106,44,0.25)", label: "Pharmacy" },
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

function AppStoreBadge({ kind }: { kind: "apple" | "android" }) {
  return (
    <motion.div
      variants={up}
      style={{
        height: 50, padding: "0 18px", borderRadius: 12,
        background: "#000", border: "1px solid rgba(255,255,255,0.18)",
        display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer",
      }}
    >
      {kind === "apple" ? (
        <svg width="20" height="24" viewBox="0 0 22 26" fill="#fff" aria-hidden="true">
          <path d="M16.3 13.8c0-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.7-2.5-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.2-4.3-1.1C3 6.4 1 7.7 0 9.7c-2 3.5-.5 8.7 1.4 11.6.9 1.4 2.1 3 3.6 2.9 1.4-.1 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.5-2.9 1.1-1.7 1.5-3.3 1.5-3.4-.1 0-2.9-1.1-2.9-4.3zM13.5 4.3c.8-1 1.3-2.3 1.2-3.7-1.1.1-2.5.8-3.3 1.7-.7.9-1.4 2.2-1.2 3.6 1.2.1 2.5-.6 3.3-1.6z" />
        </svg>
      ) : (
        <svg width="20" height="22" viewBox="0 0 22 24" fill="none" aria-hidden="true">
          <path d="M1 1.5v21l11-10.5L1 1.5z" fill="#3DDC84" />
          <path d="M1 1.5l11 10.5L17 7 1 1.5z" fill="#5B8EFF" />
          <path d="M1 22.5L17 17l-5-5-11 10.5z" fill="#FF6A2C" />
          <path d="M17 7l5 5-5 5-5-5 5-5z" fill="#FFB020" />
        </svg>
      )}
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>
          {kind === "apple" ? "Download on the" : "Get it on"}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.1, marginTop: 1 }}>
          {kind === "apple" ? "App Store" : "Google Play"}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero 1 — Asymmetric split ────────────────────────────────

function Hero1() {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 70% 30%, #0F1933 0%, #06091C 60%, #02040E 100%)" }}
    >
      {/* Glows */}
      <div className="absolute pointer-events-none" style={{ top: -200, left: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,95,255,0.35) 0%, rgba(30,95,255,0) 70%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: -200, right: -120, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,106,44,0.4) 0%, rgba(255,106,44,0) 70%)" }} />
      <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {STARS.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff" opacity={s.opacity} />)}
      </svg>

      {/* Content row — paddingTop clears the fixed navbar */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start flex-1" style={{ paddingTop: NAV_H, paddingLeft: 64, paddingRight: 64 }}>

        {/* Left — staggered text */}
        <motion.div
          className="flex-1 max-w-[620px] pt-12 lg:pt-16 pb-10 flex flex-col"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow */}
          <motion.div
            variants={up}
            className="inline-flex items-center gap-2.5 self-start mb-6"
            style={{ padding: "6px 6px 6px 14px", borderRadius: 99, background: "rgba(255,106,44,0.12)", border: "1px solid rgba(255,106,44,0.25)", color: "#FFB38A", fontSize: 12, fontWeight: 600 }}
          >
            <span className="flex items-center gap-1.5">
              <span className="block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FF6A2C", boxShadow: "0 0 8px #FF6A2C" }} />
              Now live in 36 states
            </span>
            <span style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(255,106,44,0.2)", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
              NEW · Pharmacy
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={up}
            className="font-black leading-[0.98]"
            style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)", letterSpacing: -3, marginBottom: 24 }}
          >
            Move anything.
            <br />
            <span style={{ background: "linear-gradient(135deg, #FF6A2C 0%, #FFB020 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Anywhere
            </span>{" "}
            in Nigeria.
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={up}
            style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, maxWidth: 520, marginBottom: 36 }}
          >
            From a small parcel to a 10-ton truck — book riders, drivers, food, groceries and retail in one tap. On demand, all over the country.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={up} className="flex flex-wrap gap-3.5 mb-11">
            <a href="#download" className="inline-flex items-center gap-2.5 font-bold transition-opacity hover:opacity-90" style={{ padding: "16px 28px", borderRadius: 14, background: "linear-gradient(135deg, #FF6A2C, #E0531A)", color: "#fff", fontSize: 15, letterSpacing: -0.2, boxShadow: "0 12px 32px rgba(255,106,44,0.45)", textDecoration: "none" }}>
              Get the app — it&apos;s free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href="#how-it-works" className="inline-flex items-center gap-2.5 font-bold transition-opacity hover:opacity-80" style={{ padding: "16px 28px", borderRadius: 14, background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, letterSpacing: -0.2, border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none" }}>
              See how it works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8" /><path d="M10 8l6 4-6 4V8z" fill="#fff" /></svg>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={up} className="flex items-center gap-6">
            <div className="flex">
              {AVATAR_COLORS.map((c, i) => (
                <div key={i} className="flex items-center justify-center font-bold" style={{ width: 36, height: 36, borderRadius: 18, background: c, marginLeft: i === 0 ? 0 : -10, border: "2px solid #06091C", fontSize: 11, color: "#fff", zIndex: AVATAR_COLORS.length - i, position: "relative" }}>
                  {AVATAR_LABELS[i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#FFB020" aria-hidden="true"><path d="M12 3l2.8 6 6.2.6-4.7 4.3 1.4 6.3L12 17l-5.7 3.2L7.7 14 3 9.6 9.2 9 12 3z" /></svg>)}
                </div>
                <span className="font-bold text-sm">4.9</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                <b className="text-white">20k+</b> Nigerians moving on GoDrop
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — phone + orbit cards */}
        <div className="flex-1 relative hidden lg:block self-center" style={{ height: 680, minWidth: 460 }}>
          {/* Orbit rings — fade in */}
          <motion.svg
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.4 }}
            width="700" height="660" viewBox="0 0 700 660"
            className="absolute pointer-events-none"
            style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <circle cx="350" cy="330" r="180" fill="none" stroke="rgba(91,142,255,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="350" cy="330" r="280" fill="none" stroke="rgba(255,106,44,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
          </motion.svg>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: spring, delay: 0.45 }}
            className="absolute"
            style={{ top: 20, left: "50%", transform: "translateX(-50%)" }}
          >
            <div style={{ transform: "rotate(-5deg)", width: 280, height: 570, borderRadius: 44, background: "#02040E", padding: 8, boxShadow: "0 50px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(30,95,255,0.3)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: "linear-gradient(160deg, #1E5FFF 0%, #143FB0 100%)", position: "relative" }}>
                <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 90, height: 24, borderRadius: 16, background: "#000", zIndex: 5 }} />
                <div style={{ position: "absolute", top: 14, left: 20, fontSize: 11, fontWeight: 700, color: "#fff" }}>9:41</div>
                <div style={{ padding: "44px 16px 10px", color: "#fff" }}>
                  <div style={{ fontSize: 8, opacity: 0.7, letterSpacing: 0.4, fontWeight: 600 }}>DELIVER TO</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>📍 Lekki Phase 1</div>
                  <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3, marginTop: 10, lineHeight: 1.15 }}>
                    Hi Adaeze, <span style={{ color: "#FFB38A" }}>what are we</span><br />moving today?
                  </div>
                </div>
                <div style={{ position: "absolute", left: 8, right: 8, top: 164, bottom: 8, background: "#0F1933", borderRadius: 22, padding: 10 }}>
                  <div style={{ height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 8px", fontSize: 9, color: "rgba(255,255,255,0.5)" }}>🔍 Search…</div>
                  <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                    {SERVICE_TILES.map(t => (
                      <div key={t.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 6, height: 56, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ width: 18, height: 18, borderRadius: 5, background: t.c }} />
                        <div style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, padding: 8, borderRadius: 10, background: "linear-gradient(135deg, #FF6A2C, #FF9142)", color: "#fff" }}>
                    <div style={{ fontSize: 6, fontWeight: 700, opacity: 0.9, letterSpacing: 0.5 }}>LIMITED OFFER</div>
                    <div style={{ fontSize: 11, fontWeight: 800, marginTop: 1, lineHeight: 1.1 }}>₦0 delivery under 5kg</div>
                  </div>
                  <div style={{ marginTop: 6, padding: 7, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: "rgba(255,106,44,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🛵</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>Parcel · #A4782</div>
                      <div style={{ fontSize: 6, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>6 min · ETA 4:32 PM</div>
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
            className="absolute"
            style={{ top: 60, right: 0, width: 180, background: "rgba(15,25,51,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 14, boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(91,142,255,0.18)", border: "1px solid rgba(91,142,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5v-9z" stroke="#5B8EFF" strokeWidth="1.8" strokeLinejoin="round" /><path d="M3 7.5l9 4.5 9-4.5M12 12v9" stroke="#5B8EFF" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Parcel</div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Bike · 12 km</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>₦1,450</div>
          </motion.div>

          {/* Orbit card: Rider — bottom left */}
          <motion.div
            initial={{ opacity: 0, x: -40, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -4 }}
            transition={{ duration: 0.7, ease: spring, delay: 0.78 }}
            className="absolute"
            style={{ bottom: 90, left: 0, width: 200, background: "rgba(255,106,44,0.95)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 18, padding: 14, boxShadow: "0 24px 50px rgba(255,106,44,0.4)", display: "flex", alignItems: "center", gap: 10, color: "#fff" }}
          >
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#02061a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>TB</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Emeka · 4.9★</div>
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 1 }}>6 min away</div>
            </div>
          </motion.div>

          {/* Orbit card: Stats — right middle */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ duration: 0.7, ease: spring, delay: 0.9 }}
            className="absolute"
            style={{ top: 390, right: -10, width: 180, background: "rgba(15,25,51,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 14, boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 0.4 }}>NATIONWIDE</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginTop: 4 }}>36</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>states · 200+ cities</div>
          </motion.div>
        </div>
      </div>

      {/* Trusted by */}
      <motion.div
        variants={fade} initial="hidden" animate="show"
        className="relative z-10 flex flex-wrap items-center gap-8 px-16 pb-10"
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600 }}
      >
        <span style={{ letterSpacing: 0.5 }}>TRUSTED BY</span>
        <div className="flex flex-wrap gap-8 items-center">
          {PARTNER_LOGOS.map(l => <span key={l} style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.3, color: "rgba(255,255,255,0.5)" }}>{l}</span>)}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Hero 2 — Cinematic night city ────────────────────────────

function Hero2() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "radial-gradient(ellipse at 70% 30%, #143FB0 0%, #0A2266 35%, #050d27 75%, #02061a 100%)", color: "#fff" }}>
      {/* Aurora glows */}
      <div className="absolute pointer-events-none" style={{ top: -240, right: -120, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,106,44,0.55) 0%, rgba(255,106,44,0.2) 30%, rgba(255,106,44,0) 70%)" }} />
      <div className="absolute pointer-events-none" style={{ top: -200, left: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,95,255,0.45) 0%, rgba(30,95,255,0) 70%)" }} />

      {/* Stars */}
      <svg width="1440" height="500" viewBox="0 0 1440 500" className="absolute top-0 left-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 70 }, (_, i) => ({ x: (i * 137) % 1440, y: (i * 53) % 280, o: 0.25 + (i % 5) * 0.15, r: 0.8 + (i % 3) * 0.6 })).map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
        ))}
      </svg>

      {/* Night skyline — fades in */}
      <motion.svg
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.3 }}
        width="1440" height="900" viewBox="0 0 1440 900" className="absolute inset-0 pointer-events-none" aria-hidden="true"
      >
        <g opacity="0.6">
          {SKYLINE_FAR.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#020516" />)}
        </g>
        <g>
          {SKYLINE_MID.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#040a22" />)}
        </g>
        <rect x="700" y="340" width="60" height="560" fill="#02061a" />
        <rect x="715" y="340" width="30" height="560" fill="#FF6A2C" opacity="0.75" />
        <rect x="710" y="330" width="40" height="14" fill="#FF6A2C" />
        {WINDOWS.map((w, i) => <rect key={i} x={w.x} y={w.y} width="4" height="6" fill={w.fill} opacity="0.95" />)}
      </motion.svg>

      {/* Legibility overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(2,6,26,0.55) 0%, rgba(2,6,26,0.1) 40%, rgba(2,6,26,0.6) 100%)" }} />

      {/* Left text — staggered */}
      <motion.div
        className="absolute z-10 left-6 right-6 sm:left-10 sm:right-10 lg:left-16 lg:right-auto"
        style={{ top: NAV_H + 90, maxWidth: 680 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={up}
          className="inline-flex items-center gap-2 mb-7"
          style={{ padding: "6px 14px", borderRadius: 99, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600 }}
        >
          <span className="block w-1.5 h-1.5 rounded-full" style={{ background: "#1DB980", boxShadow: "0 0 8px #1DB980" }} />
          Live tracking · Real-time across Nigeria
        </motion.div>

        <motion.h1
          variants={up}
          className="font-black"
          style={{ fontSize: "clamp(2.4rem, 6.5vw, 6rem)", letterSpacing: "clamp(-2px, -0.06em, -4px)", lineHeight: 0.96 }}
        >
          One app for<br />
          <span style={{ background: "linear-gradient(135deg, #FF6A2C 0%, #FFB020 50%, #FF6A2C 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", backgroundSize: "200% 100%" }}>
            everything
          </span><br />
          you need delivered.
        </motion.h1>

        <motion.p
          variants={up}
          style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", marginTop: 28, lineHeight: 1.55, maxWidth: 520 }}
        >
          Parcels, trucks, food, groceries and shopping — booked, tracked and paid for in seconds. Built for Nigeria. 🇳🇬
        </motion.p>

        <motion.div variants={container} className="flex gap-3.5 mt-10">
          <AppStoreBadge kind="apple" />
          <AppStoreBadge kind="android" />
        </motion.div>
      </motion.div>

      {/* Right — floating live cards */}
      <div className="absolute hidden lg:block" style={{ right: 70, top: NAV_H + 70, width: 360 }}>
        {/* Tracking card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 2 }}
          transition={{ duration: 0.8, ease: spring, delay: 0.5 }}
          style={{ background: "rgba(15,25,51,0.85)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 22, color: "#fff", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "#1DB980", boxShadow: "0 0 10px #1DB980" }} />
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>LIVE TRACKING · A4782</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>4:32 PM</div>
          </div>
          <div style={{ height: 130, borderRadius: 14, overflow: "hidden", background: "#0A1A3E", marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="100%" height="100%" viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <path d="M0 70 Q 60 50, 120 60 T 260 50 T 320 30 L320 130 L0 130 Z" fill="#0F244F" opacity="0.7" />
              <path d="M0 40 L320 30" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <path d="M160 0 L170 130" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <path d="M40 110 Q 100 80, 170 70 T 290 30" stroke="#FF6A2C" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="40" cy="110" r="8" fill="#FF6A2C" stroke="#fff" strokeWidth="2" />
              <circle cx="290" cy="30" r="8" fill="#5B8EFF" stroke="#fff" strokeWidth="2" />
              <circle cx="165" cy="70" r="12" fill="#fff" />
              <text x="165" y="75" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1E5FFF">🛵</text>
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #FF6A2C, #E0531A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>TB</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Kelvin Chigbo</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>★ 4.9 · LAG 342 KJA</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>ETA</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FF6A2C" }}>6 min</div>
            </div>
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: -3 }}
          animate={{ opacity: 1, x: 0, rotate: -3 }}
          transition={{ duration: 0.75, ease: spring, delay: 0.7 }}
          style={{ marginTop: 16, marginLeft: 28, background: "rgba(255,106,44,0.95)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: 18, color: "#fff", boxShadow: "0 30px 60px rgba(255,106,44,0.45)", display: "flex", alignItems: "center", gap: 18 }}
        >
          <div>
            <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: 0.4, fontWeight: 600 }}>AVERAGE DELIVERY</div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 2, letterSpacing: -1, lineHeight: 1 }}>27 min</div>
          </div>
          <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.25)" }} />
          <div>
            <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: 0.4, fontWeight: 600 }}>RIDERS ONLINE</div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 2, letterSpacing: -1, lineHeight: 1 }}>12k+</div>
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
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #0A0E1A 0%, #06091C 50%, #02040E 100%)", color: "#fff" }}>
      {/* Grid */}
      <svg width="100%" height="100%" viewBox="0 0 1440 900" className="absolute inset-0 pointer-events-none" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.4 }} aria-hidden="true">
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
      <div className="absolute pointer-events-none" style={{ top: 200, left: "50%", transform: "translateX(-50%)", width: 1000, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,95,255,0.3) 0%, rgba(30,95,255,0) 60%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,106,44,0.35) 0%, rgba(255,106,44,0) 70%)" }} />

      {/* Centered copy — staggered */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center pb-4 px-16"
        style={{ paddingTop: NAV_H + 32 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={up}
          className="inline-flex items-center gap-2 mb-7"
          style={{ padding: "6px 6px 6px 14px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", fontSize: 12, fontWeight: 600 }}
        >
          <span style={{ padding: "3px 8px", borderRadius: 99, background: "linear-gradient(135deg, #FF6A2C, #E0531A)", fontSize: 10, fontWeight: 700, letterSpacing: 0.4 }}>NEW</span>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>GoDrop Business is live</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>

        <motion.h1
          variants={up}
          className="font-black"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)", letterSpacing: -4.5, lineHeight: 0.96, maxWidth: 1000 }}
        >
          Nigeria&apos;s everyday<br />
          <span style={{ background: "linear-gradient(135deg, #5B8EFF 0%, #FF6A2C 60%, #FFB020 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            logistics super-app.
          </span>
        </motion.h1>

        <motion.p
          variants={up}
          style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 24, lineHeight: 1.5, maxWidth: 600 }}
        >
          Send a parcel, book a truck, order lunch, or run a grocery — all from one app, with one wallet, in under 30 minutes.
        </motion.p>

        <motion.div variants={up} className="flex flex-wrap justify-center gap-3.5 mt-10">
          <a href="#download" className="inline-flex items-center gap-2.5 font-bold transition-opacity hover:opacity-90" style={{ padding: "16px 28px", borderRadius: 14, background: "linear-gradient(135deg, #FF6A2C, #E0531A)", color: "#fff", fontSize: 15, letterSpacing: -0.2, boxShadow: "0 12px 32px rgba(255,106,44,0.45)", textDecoration: "none" }}>
            Download GoDrop
          </a>
          <a href="#business" className="inline-flex items-center gap-2.5 font-bold transition-opacity hover:opacity-80" style={{ padding: "16px 28px", borderRadius: 14, background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, letterSpacing: -0.2, border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none" }}>
            For businesses
          </a>
        </motion.div>

        <motion.div variants={up} className="flex flex-wrap justify-center items-center gap-1.5 mt-6" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
          <span className="text-white font-bold">4.9★</span>
          <span>on App Store · iOS & Android</span>
          <span className="mx-2">·</span>
          <span className="text-white font-bold">20k+</span>
          <span>users</span>
          <span className="mx-2">·</span>
          <span className="text-white font-bold">₦0</span>
          <span>sign-up fee</span>
        </motion.div>
      </motion.div>

      {/* Service cards — staggered from below */}
      <div className="relative z-10 hidden lg:flex justify-center items-end gap-4 mt-auto" style={{ paddingBottom: 60 }}>
        {SERVICE_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 80 + s.baseY }}
            animate={{ opacity: 1, y: s.baseY }}
            transition={{ duration: 0.75, ease: spring, delay: 0.45 + i * 0.08 }}
            style={{
              width: 200, padding: 20, borderRadius: 22,
              background: s.featured
                ? "linear-gradient(160deg, rgba(255,106,44,0.95), rgba(224,83,26,0.95))"
                : "rgba(15,25,51,0.85)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${s.featured ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
              rotate: s.rot,
              boxShadow: s.featured ? "0 30px 60px rgba(255,106,44,0.5)" : "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 13, background: s.featured ? "rgba(255,255,255,0.18)" : "rgba(91,142,255,0.18)", border: `1px solid ${s.featured ? "rgba(255,255,255,0.3)" : "rgba(91,142,255,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SvcIcon icon={s.icon} stroke={s.featured ? "#fff" : s.tint} />
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.4, marginTop: 14 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.featured ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", marginTop: 4 }}>{s.desc}</div>
            <div className="inline-flex items-center gap-1.5 mt-3" style={{ fontSize: 12, fontWeight: 700, color: s.featured ? "#fff" : s.tint }}>
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

const SLIDES = [Hero1, Hero2, Hero3] as const;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const goTo = (next: number) => setCurrent(next);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

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
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-30" style={{ background: "linear-gradient(to top, #060606, transparent)" }} />

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full"
            style={{
              height: 4,
              width: i === current ? 28 : 8,
              background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px z-40" style={{ background: "rgba(255,255,255,0.1)" }}>
        <motion.div
          key={current}
          className="h-full"
          style={{ background: "#FF6A2C" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
        />
      </div>
    </section>
  );
}
