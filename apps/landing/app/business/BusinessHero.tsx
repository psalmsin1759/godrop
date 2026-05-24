"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const slides = [
  {
    eyebrow: "For Business",
    heading: "Your fleet.",
    accent: "Your control.",
    sub: "Partner with Godrop to run your own branded delivery operation. Manage riders, track every order, and control your earnings — all from a single business dashboard.",
  },
  {
    eyebrow: "Business Wallet",
    heading: "All earnings.",
    accent: "One dashboard.",
    sub: "Every kobo your riders earn flows into your centralised business wallet. Monitor performance in real-time and withdraw to your bank account anytime.",
  },
  {
    eyebrow: "Fleet Management",
    heading: "Your riders.",
    accent: "Your brand.",
    sub: "Build a dedicated delivery fleet that operates exclusively under your business. Assign riders, track orders, and scale your operation as you grow.",
  },
  {
    eyebrow: "Team Access",
    heading: "Full control.",
    accent: "Zero friction.",
    sub: "Add sub-admins to help run daily operations. Owners set the rules — admins handle the work. Every action is logged for full accountability.",
  },
];

export default function BusinessHero() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }, [current]);

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  useEffect(() => {
    const t = setTimeout(() => go((current + 1) % slides.length), 5000);
    return () => clearTimeout(t);
  }, [current, go]);

  const slide = slides[current];

  return (
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
      {/* Carousel content */}
      <div className="relative overflow-hidden min-h-[260px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">
              {slide.eyebrow}
            </p>
            <h1 className="text-white text-5xl md:text-6xl font-black leading-tight mb-6">
              {slide.heading}<br />
              <span className="text-[#1E5FFF]">{slide.accent}</span>
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              {slide.sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-center gap-4 mt-8 mb-10">
        <button
          onClick={prev}
          aria-label="Previous"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                backgroundColor: i === current ? "#1E5FFF" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/contact"
          className="px-8 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#1E5FFF" }}
        >
          Partner With Us
        </Link>
        <Link
          href="/about"
          className="px-8 py-4 rounded-full text-white font-bold text-base border border-white/20 hover:border-white/40 transition-colors"
        >
          Learn About Godrop
        </Link>
      </div>
      <p className="text-white/30 text-sm mt-4">Business accounts are created by invitation — contact us to get started.</p>
    </section>
  );
}
