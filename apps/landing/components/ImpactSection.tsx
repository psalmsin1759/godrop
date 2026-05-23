"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

function useCountUp(target: number, duration = 1800, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

type Stat = {
  target: number;
  format: (n: number) => string;
  label: string;
  sub: string;
  accent: string;
};

const STATS: Stat[] = [
  {
    target: 50000,
    format: (n) => `${Math.round(n).toLocaleString()}+`,
    label: "Deliveries completed",
    sub: "And growing every day",
    accent: "#1E5FFF",
  },
  {
    target: 2000,
    format: (n) => `${Math.round(n).toLocaleString()}+`,
    label: "Riders earning daily",
    sub: "Real income, flexible hours",
    accent: "#FF6A2C",
  },
  {
    target: 500,
    format: (n) => `₦${Math.round(n)}M+`,
    label: "Paid out to riders",
    sub: "Directly into their accounts",
    accent: "#1DB984",
  },
  {
    target: 98,
    format: (n) => `${Math.round(n)}%`,
    label: "On-time delivery rate",
    sub: "Industry-leading reliability",
    accent: "#FFB020",
  },
  {
    target: 12,
    format: (n) => `${Math.round(n)}`,
    label: "Cities launching 2026",
    sub: "Nigeria-wide expansion",
    accent: "#5B8EFF",
  },
  {
    target: 49,
    format: (n) => `${(n / 10).toFixed(1)}★`,
    label: "Average app rating",
    sub: "Across iOS and Android",
    accent: "#FFB020",
  },
];

function StatCell({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const value = useCountUp(stat.target, 1800, inView);

  return (
    <div ref={ref} className="bg-[#060606] flex flex-col items-center justify-center py-10 px-6 text-center">
      <div
        className="font-black mb-2 text-white"
        style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: -1 }}
      >
        {stat.format(value)}
      </div>
      <div className="text-white/60 text-sm font-semibold">{stat.label}</div>
      <div className="text-white/25 text-xs mt-1">{stat.sub}</div>
    </div>
  );
}

export default function ImpactSection() {
  return (
    <section className="bg-[#060606] py-24 border-b border-white/5 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(30,95,255,0.05) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-8 relative">

        <motion.div className="mb-16 text-center" variants={staggerContainer(0.1)} {...inViewProps}>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <div className="w-16 h-px bg-white/20" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">Impact</span>
            <div className="w-16 h-px bg-white/20" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: -1 }}
          >
            Real numbers.
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Real people.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/35 mt-4 max-w-lg mx-auto text-base leading-relaxed">
            GoDrop is more than an app — it's livelihoods, businesses, and communities connected across Lagos.
          </motion.p>
        </motion.div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-px"
          style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }}
        >
          {STATS.map((stat) => (
            <StatCell key={stat.label} stat={stat} />
          ))}
        </div>

      </div>
    </section>
  );
}
