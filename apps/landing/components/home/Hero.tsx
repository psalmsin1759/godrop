"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Magnetic from "@/components/ui/Magnetic";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const ROTATING = ["dinner", "groceries", "a parcel", "new sneakers", "a whole house"];

const lineReveal: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.12 },
  }),
};

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="serif-accent inline-block text-accent"
        >
          {ROTATING[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="grain relative flex min-h-svh flex-col overflow-hidden bg-ink text-white">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute -top-48 right-[-10%] h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(30,95,255,0.22) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-[800px] w-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,44,0.18) 0%, transparent 65%)" }}
      />

      {/* Animated route line */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        aria-hidden="true"
      >
        <motion.path
          d="M-40 760 C 240 700, 380 520, 640 540 S 1080 380, 1480 250"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          strokeDasharray="3 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, ease: "easeOut", delay: 0.6 }}
        />
        <motion.circle
          r="5"
          fill="#FF6A2C"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
        >
          <animateMotion
            dur="14s"
            repeatCount="indefinite"
            path="M-40 760 C 240 700, 380 520, 640 540 S 1080 380, 1480 250"
          />
        </motion.circle>
      </svg>

      {/* Body */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-end px-6 pb-10 pt-32 sm:px-10 lg:px-16">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mono-label mb-8 flex items-center gap-3 text-white/60"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Lagos → everywhere · live in 36 states
        </motion.p>

        {/* Headline */}
        <h1 className="display text-[clamp(3.4rem,11.5vw,11.5rem)]">
          <span className="block overflow-hidden">
            <motion.span custom={0} variants={lineReveal} initial="hidden" animate="show" className="block">
              We move
            </motion.span>
          </span>
          <span className="block overflow-hidden py-[0.06em]">
            <motion.span custom={1} variants={lineReveal} initial="hidden" animate="show" className="block">
              <RotatingWord />
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              custom={2}
              variants={lineReveal}
              initial="hidden"
              animate="show"
              className="text-stroke block text-white"
            >
              anywhere.
            </motion.span>
          </span>
        </h1>

        {/* Sub + CTAs */}
        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
            className="max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
          >
            Food, groceries, retail, parcels and ten-ton trucks — booked, tracked
            and paid for in one tap. Built for Nigeria.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.82 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a
                href="#download"
                className="group inline-flex h-[58px] items-center gap-3 rounded-full bg-accent px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
              >
                Get the app
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#services"
                className="inline-flex h-[58px] items-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white/60"
              >
                Explore services
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* Bottom stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-white/10 pt-6"
        >
          {[
            ["4.9★", "App Store rating"],
            ["20k+", "Nigerians moving"],
            ["27 min", "average delivery"],
            ["₦0", "sign-up fee"],
          ].map(([value, label]) => (
            <p key={label} className="flex items-baseline gap-2.5">
              <span className="font-mono text-sm font-bold text-white">{value}</span>
              <span className="mono-label text-white/45">{label}</span>
            </p>
          ))}
          <span className="mono-label ml-auto hidden items-center gap-2 text-white/45 md:flex">
            Scroll
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </span>
        </motion.div>
      </div>
    </section>
  );
}
