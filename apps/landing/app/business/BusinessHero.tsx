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
    <section className="grain relative overflow-hidden bg-ink">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(30,95,255,0.16) 0%, transparent 65%)" }}
      />
      <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-20 pt-24 text-center sm:px-10">
        {/* Carousel content */}
        <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden">
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
              <p className="mono-label mb-7 text-accent">{slide.eyebrow}</p>
              <h1 className="display mx-auto max-w-4xl text-[clamp(2.8rem,6.5vw,6rem)] text-white">
                {slide.heading}
                <br />
                <span className="serif-accent text-accent">{slide.accent}</span>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/60">
                {slide.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev / Next controls */}
        <div className="mb-10 mt-8 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                className="h-1 cursor-pointer rounded-full border-none p-0"
                style={{
                  width: i === current ? 28 : 8,
                  background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* CTAs */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-[56px] items-center justify-center rounded-full bg-accent px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
          >
            Partner With Us
          </Link>
          <Link
            href="/about"
            className="inline-flex h-[56px] items-center justify-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white/60"
          >
            Learn About Godrop
          </Link>
        </div>
        <p className="mono-label mt-6 text-white/40">
          Business accounts are created by invitation — contact us to get started
        </p>
      </div>
    </section>
  );
}
