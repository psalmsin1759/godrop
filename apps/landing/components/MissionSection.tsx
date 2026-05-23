"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const VALUES = [
  {
    accent: "#1E5FFF",
    icon: "🇳🇬",
    title: "Built in Nigeria",
    body: "We're not a foreign startup adapting to Nigeria. We were born here — we understand the roads, the culture, and the hustle.",
  },
  {
    accent: "#FF6A2C",
    icon: "⚡",
    title: "Speed as a right",
    body: "Fast delivery shouldn't be a luxury. Our mission is to make reliable, affordable logistics available to every Nigerian.",
  },
  {
    accent: "#1DB984",
    icon: "🤝",
    title: "Riders first",
    body: "Our riders are partners, not gig workers. Fair pay, accident insurance, and tools to grow their income are non-negotiable.",
  },
];

export default function MissionSection() {
  return (
    <section className="bg-[#060606] py-24 border-b border-white/5 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(30,95,255,0.04) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — statement */}
          <motion.div variants={staggerContainer(0.1)} {...inViewProps}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div className="w-16 h-px bg-white/20" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">Our mission</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-white font-bold leading-tight mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: -1 }}
            >
              Logistics that works for every Nigerian.
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>Built for Nigeria.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-base leading-relaxed max-w-lg mb-8">
              GoDrop started with one rider and one bike in Lekki. Today we power tens of thousands of deliveries every month.
              Our vision: logistics that works for every Nigerian, not just those in the right neighbourhood.
            </motion.p>
            <motion.a
              variants={fadeUp}
              href="#about"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#1E5FFF" }}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
            >
              Read our story
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Right — values */}
          <motion.div className="flex flex-col gap-4" variants={staggerContainer(0.1, 0.15)} {...inViewProps}>
            {VALUES.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                whileHover={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: `${v.accent}30`,
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${v.accent}15`, border: `1px solid ${v.accent}25` }}
                >
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1.5">{v.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{v.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
