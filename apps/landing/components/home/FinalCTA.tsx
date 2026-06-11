"use client";

import { motion } from "framer-motion";
import AppStoreButtons from "@/components/ui/AppStoreButtons";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

export default function FinalCTA() {
  return (
    <section
      id="download"
      className="grain relative overflow-hidden border-t border-white/10 bg-ink py-36 text-white sm:py-48"
    >
      {/* Sunrise glow */}
      <div
        className="pointer-events-none absolute bottom-[-40%] left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-[50%]"
        style={{ background: "radial-gradient(ellipse, rgba(255,106,44,0.4) 0%, rgba(255,106,44,0.12) 40%, transparent 70%)" }}
      />

      <motion.div
        variants={staggerContainer(0.12)}
        {...inViewProps}
        className="relative mx-auto flex w-full max-w-[1500px] flex-col items-center px-6 text-center sm:px-10"
      >
        <motion.p variants={fadeUp} className="mono-label mb-10 text-white/55">
          Free on iOS & Android · ₦0 sign-up
        </motion.p>

        <motion.h2 variants={fadeUp} className="display text-[clamp(3.4rem,12vw,12rem)]">
          Ready to <span className="serif-accent text-accent">move?</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-8 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
        >
          Join 20,000+ Nigerians who stopped waiting. Your first delivery fee is
          on us.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-12">
          <AppStoreButtons className="justify-center" />
        </motion.div>
      </motion.div>
    </section>
  );
}
