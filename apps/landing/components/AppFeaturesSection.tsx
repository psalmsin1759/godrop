"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const TrackingVisual = () => (
  <div className="w-full h-52 rounded-2xl overflow-hidden relative" style={{ background: "#081530" }}>
    <svg width="100%" height="100%" viewBox="0 0 300 208" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`h${i}`} x1="0" y1={i * 38} x2="300" y2={i * 38} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`v${i}`} x1={i * 43} y1="0" x2={i * 43} y2="208" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d="M50 170 Q 110 120, 170 95 T 260 50" stroke="#FF6A2C" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="5,3" />
      <circle cx="50" cy="170" r="6" fill="#FF6A2C" />
      <circle cx="260" cy="50" r="6" fill="#1E5FFF" />
      <circle cx="260" cy="50" r="14" fill="rgba(30,95,255,0.2)" />
      <circle cx="160" cy="100" r="15" fill="white" />
      <text x="160" y="106" textAnchor="middle" fontSize="15">🛵</text>
    </svg>
    <div
      className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
      style={{ background: "#1E5FFF" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      ETA 8 min
    </div>
  </div>
);

const WalletVisual = () => (
  <div
    className="w-full h-52 rounded-2xl p-5 flex flex-col justify-between"
    style={{ background: "rgba(255,176,32,0.07)", border: "1px solid rgba(255,176,32,0.14)" }}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs text-white/30 mb-1">GoDrop Wallet</p>
        <p className="text-2xl font-black text-white">
          ₦24,500<span className="text-white/30 text-base font-medium">.00</span>
        </p>
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: "rgba(255,176,32,0.18)" }}>
        💳
      </div>
    </div>
    <div className="space-y-2.5">
      {[
        { label: "Food — Chicken Republic", time: "2h ago", amt: "−₦2,400" },
        { label: "Parcel to Victoria Island", time: "Yesterday", amt: "−₦1,200" },
        { label: "Wallet top-up", time: "Mon", amt: "+₦10,000" },
      ].map((t) => (
        <div key={t.label} className="flex justify-between items-center text-xs">
          <div>
            <p className="text-white/60 font-medium">{t.label}</p>
            <p className="text-white/25">{t.time}</p>
          </div>
          <p className={`font-semibold ${t.amt.startsWith("+") ? "text-[#1DB984]" : "text-white/45"}`}>{t.amt}</p>
        </div>
      ))}
    </div>
  </div>
);

const HistoryVisual = () => (
  <div
    className="w-full h-52 rounded-2xl overflow-hidden"
    style={{ background: "rgba(29,185,132,0.05)", border: "1px solid rgba(29,185,132,0.12)" }}
  >
    {[
      { icon: "🍔", title: "Burger + Fries", status: "Delivered", time: "Today, 2:14 PM" },
      { icon: "📦", title: "Parcel — Documents", status: "Delivered", time: "Yesterday" },
      { icon: "🛒", title: "Weekly Groceries", status: "Delivered", time: "Mon, 10:30 AM" },
      { icon: "💊", title: "Pharmacy — Vitamins", status: "Delivered", time: "Last week" },
    ].map((o, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: "rgba(255,255,255,0.05)" }}>
          {o.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white/65 truncate">{o.title}</p>
          <p className="text-[10px] text-white/25">{o.time}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(29,185,132,0.15)", color: "#1DB984" }}>
          {o.status}
        </span>
      </div>
    ))}
  </div>
);

const RatingVisual = () => (
  <div
    className="w-full h-52 rounded-2xl p-5 flex flex-col gap-4"
    style={{ background: "rgba(255,106,44,0.06)", border: "1px solid rgba(255,106,44,0.12)" }}
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: "rgba(255,106,44,0.15)" }}>
        🧑‍✈️
      </div>
      <div>
        <p className="text-sm font-bold text-white/80">Emeka O.</p>
        <div className="flex gap-0.5 mt-0.5">
          {"★★★★★".split("").map((s, i) => (
            <span key={i} className="text-sm" style={{ color: "#FFB020" }}>{s}</span>
          ))}
        </div>
      </div>
      <div className="ml-auto text-right">
        <p className="text-xl font-black text-white">4.97</p>
        <p className="text-[10px] text-white/25">384 trips</p>
      </div>
    </div>
    <p className="text-xs text-white/35 italic leading-relaxed">
      "Very fast delivery, kept me updated the whole time. Will definitely request him again!"
    </p>
    <div className="flex flex-wrap gap-2 mt-auto">
      {["On time", "Friendly", "Safe handling"].map((tag) => (
        <span
          key={tag}
          className="text-[10px] px-2.5 py-1 rounded-full text-white/40"
          style={{ background: "rgba(255,106,44,0.1)", border: "1px solid rgba(255,106,44,0.15)" }}
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const FEATURES = [
  {
    id: "tracking",
    accent: "#1E5FFF",
    icon: "📍",
    title: "Live GPS tracking",
    desc: "Watch your rider move in real time. Get precise ETAs that update as they ride.",
    Visual: TrackingVisual,
  },
  {
    id: "wallet",
    accent: "#FFB020",
    icon: "💳",
    title: "In-app wallet",
    desc: "Top up once, pay for every order instantly — no card details every time.",
    Visual: WalletVisual,
  },
  {
    id: "history",
    accent: "#1DB984",
    icon: "📋",
    title: "Order history",
    desc: "Every order, every receipt. Reorder your favourites with a single tap.",
    Visual: HistoryVisual,
  },
  {
    id: "ratings",
    accent: "#FF6A2C",
    icon: "⭐",
    title: "Rider ratings",
    desc: "Rate after every delivery. We use feedback to keep our rider quality high.",
    Visual: RatingVisual,
  },
];

export default function AppFeaturesSection() {
  const [active, setActive] = useState(0);
  const ActiveVisual = FEATURES[active].Visual;

  return (
    <section className="bg-[#060606] py-24 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">

        <motion.div className="mb-14" variants={staggerContainer(0.1)} {...inViewProps}>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-16 h-px bg-white/20" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">App features</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: -1 }}
          >
            Built for how
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>you actually move.</span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Feature tabs */}
          <motion.div className="flex flex-col gap-3" variants={staggerContainer(0.09, 0.1)} {...inViewProps}>
            {FEATURES.map((f, i) => (
              <motion.button
                key={f.id}
                variants={fadeUp}
                onClick={() => setActive(i)}
                className="text-left rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all duration-200"
                style={{
                  background: active === i ? `${f.accent}0E` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${active === i ? `${f.accent}2E` : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: active === i ? `${f.accent}1A` : "rgba(255,255,255,0.05)" }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold transition-colors duration-200"
                    style={{ color: active === i ? "#fff" : "rgba(255,255,255,0.45)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed mt-1 transition-colors duration-200"
                    style={{ color: active === i ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.22)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Visual panel */}
          <motion.div
            className="lg:sticky lg:top-28"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <ActiveVisual />
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
