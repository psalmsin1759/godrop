"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PRESS = [
  "TechCabal",
  "TechPoint.Africa",
  "Nairametrics",
  "BusinessDay",
  "The Guardian NG",
  "Techeconomy.ng",
];

export default function PressSection() {
  return (
    <section className="bg-[#060606] py-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">

        <motion.div
          className="text-center mb-12"
          variants={staggerContainer(0.08)}
          {...inViewProps}
        >
          <motion.p variants={fadeUp} className="text-[11px] font-semibold tracking-widest uppercase text-white/25 mb-10">
            As seen in
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5"
            variants={staggerContainer(0.07)}
            {...inViewProps}
          >
            {PRESS.map((name) => (
              <motion.span
                key={name}
                variants={fadeUp}
                className="text-white/20 hover:text-white/55 transition-colors duration-300 font-semibold text-base tracking-tight select-none cursor-default"
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Pull quote */}
        <motion.div
          className="max-w-xl mx-auto text-center mt-12 pt-10 border-t border-white/[0.06]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease }}
        >
          <svg className="mx-auto mb-5 opacity-15" width="26" height="20" viewBox="0 0 26 20" fill="white" aria-hidden="true">
            <path d="M0 20V12C0 5.2 3.9 1.3 11.7 0l1.3 2.2C9.1 3.2 7 5.1 6.1 9H10V20H0Zm16 0V12C16 5.2 19.9 1.3 27.7 0L29 2.2c-3.9 1-6 2.9-6.9 6.8H26V20H16Z" />
          </svg>
          <p className="text-white/45 text-lg font-medium leading-relaxed italic">
            "GoDrop is redefining last-mile logistics for Nigeria's fastest-growing cities."
          </p>
          <p className="text-white/25 text-[11px] font-semibold tracking-widest uppercase mt-4">
            — TechCabal
          </p>
        </motion.div>

      </div>
    </section>
  );
}
