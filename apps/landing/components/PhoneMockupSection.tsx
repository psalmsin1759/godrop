"use client";

import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight, scaleIn, staggerContainer, inViewProps } from "@/lib/animations";

function Phone({ tint = "#193853", delay = 0 }: { tint?: string; delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
      }}
      className="relative w-[220px] h-[440px] rounded-[2.5rem] border-2 border-white/10 overflow-hidden shadow-2xl"
      style={{ background: tint }}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
      <div className="absolute inset-0 flex flex-col pt-14 px-4 pb-6">
        <div className="bg-white/10 rounded-xl h-36 w-full mb-3 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-white/30" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>
        <div className="bg-white/10 rounded-lg h-4 w-3/4 mb-2" />
        <div className="bg-white/10 rounded-lg h-3 w-full mb-1" />
        <div className="bg-white/10 rounded-lg h-3 w-2/3 mb-4" />
        <div className="mt-auto flex gap-2">
          {["Food", "Parcels", "Trucks"].map((label) => (
            <div key={label} className="flex-1 bg-white/15 rounded-xl py-3 flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/20 rounded-full" />
              <span className="text-white/60 text-[9px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function PhoneMockupSection() {
  return (
    <section className="bg-[#060606] py-24 overflow-hidden" id="businesses">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Phones — slide in from left */}
          <motion.div
            className="flex items-end gap-4 justify-center md:justify-start"
            variants={staggerContainer(0.1)}
            {...inViewProps}
          >
            <div className="translate-y-8">
              <Phone tint="#193853" delay={0} />
            </div>
            <Phone tint="#1a1a1a" delay={0.1} />
          </motion.div>

          {/* Text — slide in from right */}
          <motion.div
            variants={staggerContainer(0.12)}
            {...inViewProps}
          >
            <motion.h2
              variants={fadeUp}
              className="text-white font-bold text-4xl md:text-5xl leading-tight mb-6"
            >
              Delivery, finally made simple.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/60 text-base leading-relaxed max-w-md"
            >
              Whether you&apos;re ordering lunch, sending a parcel across town, or moving to a new apartment — Godrop handles it all in a few taps.
            </motion.p>
            <motion.a
              variants={scaleIn}
              href="#download"
              className="inline-flex mt-8 items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Get the App
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
