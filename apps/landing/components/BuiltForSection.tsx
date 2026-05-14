"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

function PhoneCard({ color = "#3a7363", delay = 0 }: { color?: string; delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
      className="w-[200px] h-[400px] rounded-[2.2rem] border-2 border-white/10 overflow-hidden shadow-xl flex flex-col"
      style={{ background: color }}
    >
      <div className="flex-1 flex flex-col p-4 pt-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <div className="bg-white/20 rounded h-2 w-20 mb-1" />
            <div className="bg-white/10 rounded h-2 w-14" />
          </div>
        </div>
        <div className="bg-white/10 rounded-xl flex-1 mb-3 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-white/30" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <div className="bg-white/20 rounded-lg h-8 flex items-center px-3">
            <div className="w-2 h-2 bg-white/60 rounded-full mr-2" />
            <div className="bg-white/30 rounded h-2 w-24" />
          </div>
          <div className="bg-white/10 rounded-lg h-8 flex items-center px-3">
            <div className="w-2 h-2 bg-white/40 rounded-full mr-2" />
            <div className="bg-white/20 rounded h-2 w-16" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BuiltForSection() {
  return (
    <section className="bg-[#060606] py-24">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Text — slides in from left */}
          <motion.div variants={staggerContainer(0.12)} {...inViewProps}>
            <motion.h2
              variants={fadeUp}
              className="text-white font-bold text-4xl md:text-5xl leading-tight mb-6"
            >
              Built by Nigerians. Backed by businesses that get it.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/60 text-base leading-relaxed max-w-md"
            >
              We understand Lagos traffic. We know what it means to need something delivered now. Godrop was built from the ground up for Nigerian cities — with local knowledge, local partners, and real commitment.
            </motion.p>
          </motion.div>

          {/* Phones — stagger in from right */}
          <motion.div
            className="flex items-end gap-3 justify-center md:justify-end"
            variants={staggerContainer(0.12)}
            {...inViewProps}
          >
            <div className="translate-y-6">
              <PhoneCard color="#0B1F4A" delay={0} />
            </div>
            <PhoneCard color="#1E5FFF" delay={0.1} />
            <div className="-translate-y-4">
              <PhoneCard color="#BF3D00" delay={0.2} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
