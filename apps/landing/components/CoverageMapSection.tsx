"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const ZONES = [
  { name: "GRA Phase 1", x: 45, y: 40, delay: 0 },
  { name: "GRA Phase 2", x: 55, y: 35, delay: 0.08 },
  { name: "Trans Amadi", x: 32, y: 30, delay: 0.16 },
  { name: "Rumuola", x: 38, y: 48, delay: 0.24 },
  { name: "Diobu", x: 28, y: 55, delay: 0.32 },
  { name: "Mile 1", x: 42, y: 60, delay: 0.40 },
  { name: "Mile 3", x: 52, y: 65, delay: 0.48 },
  { name: "Rumuokwuta", x: 62, y: 44, delay: 0.56 },
  { name: "Rumuigbo", x: 68, y: 57, delay: 0.64 },
];

const COMING_SOON = [
  { name: "Lagos", flag: "🌊" },
  { name: "Abuja", flag: "🏛️" },
  { name: "Ibadan", flag: "🌿" },
  { name: "Kano", flag: "🌾" },
];

export default function CoverageMapSection() {
  return (
    <section className="bg-[#060606] py-24 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <motion.div variants={staggerContainer(0.1)} {...inViewProps}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div className="w-16 h-px bg-white/20" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">Coverage</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-white font-bold leading-tight mb-5"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: -1 }}
            >
              Live in Port Harcourt.
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>Coming to your city.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-base leading-relaxed mb-8 max-w-md">
              We cover all major areas in Port Harcourt — from GRA to Trans Amadi. Expanding to Lagos, Abuja, and Ibadan in Q3 2026.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-8 mb-10">
              {[
                { val: "20+", label: "Active zones" },
                { val: "4", label: "Cities coming" },
                { val: "24/7", label: "Service hours" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-white font-black text-2xl" style={{ letterSpacing: -0.5 }}>{s.val}</div>
                  <div className="text-white/30 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="text-white/25 text-[11px] font-semibold tracking-widest uppercase mb-3">Coming soon</p>
              <div className="flex flex-wrap gap-2">
                {COMING_SOON.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/40"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right — map visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative rounded-3xl overflow-hidden mx-auto"
              style={{
                background: "rgba(30,95,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                aspectRatio: "1 / 1",
                maxWidth: 480,
              }}
            >
              {/* Grid */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {Array.from({ length: 11 }).map((_, i) => (
                  <g key={i}>
                    <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="white" strokeWidth="0.4" />
                    <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="white" strokeWidth="0.4" />
                  </g>
                ))}
              </svg>

              {/* Glow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "50%", left: "50%",
                  width: "60%", height: "60%",
                  background: "radial-gradient(circle, rgba(30,95,255,0.18) 0%, transparent 70%)",
                  filter: "blur(24px)",
                  transform: "translate(-50%, -50%)",
                }}
              />

              {/* Zone dots */}
              {ZONES.map((zone) => (
                <motion.div
                  key={zone.name}
                  className="absolute group"
                  style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + zone.delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "#1E5FFF", width: 12, height: 12, top: -3, left: -3 }}
                    animate={{ scale: [1, 2.8], opacity: [0.4, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: zone.delay * 2, ease: "easeOut" }}
                  />
                  <div className="relative w-3 h-3 rounded-full border-2 border-white" style={{ background: "#1E5FFF" }} />
                  <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-[10px] font-semibold text-white bg-black/80 px-2 py-0.5 rounded-full pointer-events-none">
                    {zone.name}
                  </div>
                </motion.div>
              ))}

              {/* Port Harcourt label */}
              <div className="absolute bottom-5 left-5 text-white/15 text-xs font-bold tracking-widest uppercase select-none">Port Harcourt</div>

              {/* Legend */}
              <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] text-white/30">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E5FFF]" />
                Active zone
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
