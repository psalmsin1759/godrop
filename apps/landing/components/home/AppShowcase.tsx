"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";
import AppStoreButtons from "@/components/ui/AppStoreButtons";
import { fadeUp, scaleIn, staggerContainer, inViewProps } from "@/lib/animations";

const SCREENSHOTS = [
  {
    src: "/images/app-screenshots/order-tracking.png",
    alt: "Live order tracking screen in the Godrop app, showing a rider en route on the map",
  },
  {
    src: "/images/app-screenshots/app-home.png",
    alt: "Godrop app home screen with delivery categories: parcel, truck, food, grocery, retail and pharmacy",
  },
  {
    src: "/images/app-screenshots/truck-booking.png",
    alt: "Truck booking screen in the Godrop app with vehicle options and pricing",
  },
];

// Where a "tap" lands on each screen before navigating to the next one
const TAP_POINTS = [
  { x: 9, y: 9 }, // order-tracking: back button -> home
  { x: 50, y: 56 }, // app-home: "Truck" tile -> truck booking
  { x: 8, y: 8 }, // truck-booking: back -> order tracking
];

const HOLD_MS = 2600;
const PRESS_MS = 380;

const FEATURES = [
  {
    n: "01",
    title: "Live tracking, street by street",
    body: "Every order has a pulse. Watch your rider weave through traffic in real time and share the link with whoever's waiting at the door.",
  },
  {
    n: "02",
    title: "One wallet for everything",
    body: "Top up once, pay everywhere — food, trucks, market runs. Cards, transfers and USSD via Paystack. Refunds land back in seconds.",
  },
  {
    n: "03",
    title: "Schedule it, batch it",
    body: "Set deliveries for later, send to multiple addresses in one go, and save your regular routes. Built for busy weeks and small businesses.",
  },
  {
    n: "04",
    title: "Vetted, rated, insured",
    body: "Every rider and driver is identity-verified and community-rated. Parcels are covered, and support is a tap away — humans, not bots.",
  },
];

function PhoneMock() {
  const [active, setActive] = useState(0);
  const [tapping, setTapping] = useState(false);

  useEffect(() => {
    const pressTimer = setTimeout(() => setTapping(true), HOLD_MS);
    const switchTimer = setTimeout(() => {
      setActive((i) => (i + 1) % SCREENSHOTS.length);
      setTapping(false);
    }, HOLD_MS + PRESS_MS);
    return () => {
      clearTimeout(pressTimer);
      clearTimeout(switchTimer);
    };
  }, [active]);

  const tap = TAP_POINTS[active];

  return (
    <div className="relative mx-auto w-[290px] sm:w-[320px]">
      {/* Glow */}
      <div
        className="absolute -inset-16 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(30,95,255,0.28) 0%, transparent 65%)" }}
      />
      <div className="relative rounded-[3rem] border border-white/10 bg-[#101014] p-2.5 shadow-[0_60px_120px_rgba(0,0,0,0.6)]">
        <div className="relative aspect-[1080/2424] overflow-hidden rounded-[2.4rem] bg-[#0B1226]">
          {/* Screenshot carousel */}
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: tapping ? 0.97 : 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: tapping ? PRESS_MS / 1000 : 0.18, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={SCREENSHOTS[active].src}
                alt={SCREENSHOTS[active].alt}
                fill
                priority={active === 0}
                sizes="(min-width: 640px) 320px, 290px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Tap illusion */}
          <AnimatePresence>
            {tapping && (
              <motion.div
                key="tap-ripple"
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${tap.x}%`, top: `${tap.y}%` }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: PRESS_MS / 1000, ease: "easeOut" }}
              >
                <span className="absolute inset-0 rounded-full bg-white/50 animate-ping" />
                <span className="block h-9 w-9 rounded-full border-2 border-white/80 bg-white/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
            {SCREENSHOTS.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show screenshot ${i + 1} of ${SCREENSHOTS.length}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShowcase() {
  return (
    <section className="grain relative bg-ink py-32 text-white sm:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="05" title="The app" className="mb-10" />

        <motion.h2
          variants={fadeUp}
          {...inViewProps}
          className="display mb-24 max-w-4xl text-[clamp(2.8rem,6.5vw,6.5rem)]"
        >
          The whole city, <span className="serif-accent text-accent">in your pocket.</span>
        </motion.h2>

        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:gap-12">
          {/* Sticky phone */}
          <div className="order-last lg:order-first">
            <motion.div variants={scaleIn} {...inViewProps} className="lg:sticky lg:top-28">
              <PhoneMock />
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            variants={staggerContainer(0.1)}
            {...inViewProps}
            className="flex flex-col justify-center gap-14 lg:gap-20"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.n} variants={fadeUp} className="border-t border-white/10 pt-8">
                <span className="font-mono text-sm font-bold text-accent">({f.n})</span>
                <h3 className="display mt-5 text-2xl !tracking-[-0.02em] sm:text-3xl">{f.title}</h3>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">{f.body}</p>
              </motion.div>
            ))}
            <motion.div variants={fadeUp}>
              <AppStoreButtons />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
