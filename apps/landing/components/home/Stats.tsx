"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

function CountUp({ to, format }: { to: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => format(v));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [inView, to, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

const STATS: { to: number; format: (n: number) => string; label: string }[] = [
  { to: 20, format: (n) => `${Math.round(n)}k+`, label: "Nigerians on Godrop" },
  { to: 27, format: (n) => `${Math.round(n)}`, label: "Minutes, average delivery" },
  { to: 36, format: (n) => `${Math.round(n)}`, label: "States covered" },
  { to: 12000, format: (n) => `${(Math.round(n / 100) / 10).toFixed(n >= 11950 ? 0 : 1)}k`, label: "Riders & drivers online" },
];

export default function Stats() {
  return (
    <section className="grain relative overflow-hidden bg-accent py-28 text-white sm:py-36">
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)" }}
      />
      <div className="relative mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="04" title="The numbers" className="mb-10" />

        <motion.h2
          variants={fadeUp}
          {...inViewProps}
          className="display mb-20 max-w-4xl text-[clamp(2.6rem,5.5vw,5.5rem)]"
        >
          Moving a country, <span className="serif-accent">one drop</span> at a time.
        </motion.h2>

        <motion.dl
          variants={staggerContainer(0.12)}
          {...inViewProps}
          className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="border-t border-white/30 pt-6">
              <dd className="display text-[clamp(3rem,6vw,6rem)] tabular-nums">
                <CountUp to={stat.to} format={stat.format} />
              </dd>
              <dt className="mono-label mt-3 text-white/75">{stat.label}</dt>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
