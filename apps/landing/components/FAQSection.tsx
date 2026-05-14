"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const faqs = [
  { q: "Is Godrop really free to use?", a: "Yes — downloading and using Godrop as a customer is completely free. We only charge a small delivery fee per order, with no subscriptions or hidden costs." },
  { q: "Which cities does Godrop operate in?", a: "We currently operate in Lagos, Abuja, Port Harcourt, Ibadan, and 8 other major cities across Nigeria. We're expanding fast." },
  { q: "Can businesses use Godrop for bulk deliveries?", a: "Absolutely. We have a dedicated business tier with volume discounts, API integration, and a logistics dashboard for SMEs and enterprises." },
  { q: "How long does a typical delivery take?", a: "Most deliveries within the same LGA are completed in 30–60 minutes. Cross-city deliveries typically take 2–4 hours depending on traffic." },
  { q: "What makes Godrop different from other delivery apps?", a: "Godrop covers everything — food, groceries, parcels, retail, and even truck relocation — all in one app, built specifically for Nigerian cities." },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1, y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 },
        },
      }}
      className={`rounded-full border transition-all duration-300 overflow-hidden ${
        open ? "rounded-2xl border-white/20 bg-white/5" : "border-white/15 hover:border-white/30"
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-white text-sm font-medium">{q}</span>
        <motion.svg
          viewBox="0 0 24 24"
          className="w-5 h-5 shrink-0 text-white/50"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="bg-[#060606] py-24" id="about">
      <div className="max-w-4xl mx-auto px-8">
        {/* About CTA */}
        <motion.div
          className="text-center mb-16"
          variants={staggerContainer(0.1)}
          {...inViewProps}
        >
          <motion.p variants={fadeUp} className="text-white/60 text-base mb-5">
            Learn more about our approach
          </motion.p>
          <motion.a
            variants={fadeUp}
            href="#"
            className="inline-flex items-center px-6 py-2.5 rounded-full border border-white/40 text-white text-sm hover:bg-white hover:text-black transition-all"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            About Us
          </motion.a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          {...inViewProps}
          className="w-12 h-px bg-white/20 mx-auto mb-16"
        />

        <motion.div
          className="text-center mb-12"
          variants={staggerContainer(0.1)}
          {...inViewProps}
        >
          <motion.h2
            variants={fadeUp}
            className="text-white font-bold text-4xl md:text-5xl mb-4"
          >
            Questions? Totally fair.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 text-xs uppercase tracking-widest">
            FAQ
          </motion.p>
        </motion.div>

        {/* FAQ items stagger in */}
        <motion.div
          className="space-y-3"
          variants={staggerContainer(0.07)}
          {...inViewProps}
        >
          {faqs.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
