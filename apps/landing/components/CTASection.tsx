"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, inViewProps } from "@/lib/animations";

export default function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden" id="download">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at 60% 50%, #091430 0%, #060d1e 40%, #060606 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "linear-gradient(160deg, #0e2060 0%, transparent 50%), linear-gradient(320deg, #2a0e00 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-8 text-center"
        variants={staggerContainer(0.12)}
        {...inViewProps}
      >
        {/* Stars */}
        <motion.div
          variants={scaleIn}
          className="flex justify-center gap-1 mb-6"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.svg
              key={i}
              viewBox="0 0 24 24"
              className="w-5 h-5"
              style={{ fill: "#FF6A2C" }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </motion.svg>
          ))}
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="text-white font-bold text-5xl md:text-7xl leading-tight mb-4"
        >
          Get started.
          <br />
          No fees. Actually free.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-white/60 text-base mb-10 max-w-sm mx-auto"
        >
          Join thousands of Nigerians already using Godrop to simplify their lives.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {[
            {
              label: "App Store",
              bg: "#1E5FFF",
              icon: <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />,
            },
            {
              label: "Google Play",
              bg: "#FF6A2C",
              icon: <path d="M3.18 23.76c.31.17.67.19 1.01.04l12.94-7.33-2.79-2.8-11.16 10.09zm-1.76-20.3C1.16 3.77 1 4.15 1 4.58v14.84c0 .43.16.81.42 1.12l.06.06L9.64 12v-.2L1.48 3.4l-.06.06zM20.49 10.5L17.6 8.84l-3.09 3.1 3.09 3.1 2.93-1.66c.83-.47.83-1.46-.04-1.88zM4.19.48L17.13 7.8l-2.79 2.8L3.18.51C3.52.36 3.88.33 4.19.48z" />,
            },
          ].map(({ label, bg, icon }) => (
            <motion.a
              key={label}
              href="#"
              className="flex items-center gap-3 text-white px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: bg }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">{icon}</svg>
              {label}
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
