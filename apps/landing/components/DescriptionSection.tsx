"use client";

import { motion } from "framer-motion";
import { inViewProps } from "@/lib/animations";

export default function DescriptionSection() {
  return (
    <section className="bg-[#060606] py-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="w-16 h-px bg-white/30 mb-12"
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p
          className="text-white text-xl md:text-2xl leading-relaxed max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          Godrop is Nigeria&apos;s on-demand delivery platform — connecting you to food delivery, grocery shopping, parcel services, and truck bookings through thousands of trusted partner riders across Nigerian cities. We bring them together so you can choose the path that works for you.
        </motion.p>
      </div>
    </section>
  );
}
