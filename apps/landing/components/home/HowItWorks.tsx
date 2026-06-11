"use client";

import { motion } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const STEPS = [
  {
    n: "01",
    title: "Drop a pin",
    body: "Tell us what's moving and where it's going. Instant upfront pricing in Naira — no haggling, no surprises.",
  },
  {
    n: "02",
    title: "Match in seconds",
    body: "The nearest vetted rider or driver accepts in under 30 seconds. You see their name, rating and plate before they arrive.",
  },
  {
    n: "03",
    title: "Track to the door",
    body: "Watch the route live, share tracking with the receiver, and pay with your wallet, card or transfer when it lands.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bone pb-32 pt-8 text-ink sm:pb-40">
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="03" title="How it works" tone="dark" className="mb-10" />

        <div className="mb-20 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.h2
            variants={fadeUp}
            {...inViewProps}
            className="display max-w-3xl text-[clamp(2.8rem,6vw,6rem)]"
          >
            Booked in <span className="serif-accent text-accent">seconds.</span>
          </motion.h2>
          <motion.p variants={fadeUp} {...inViewProps} className="max-w-sm text-base leading-relaxed text-ink/60">
            No phone calls, no “how much last?”. Three taps between you and a
            rider already on the way.
          </motion.p>
        </div>

        <motion.ol
          variants={staggerContainer(0.14)}
          {...inViewProps}
          className="grid grid-cols-1 border-t border-ink/15 md:grid-cols-3"
        >
          {STEPS.map((step) => (
            <motion.li
              key={step.n}
              variants={fadeUp}
              className="group flex flex-col gap-16 border-b border-ink/15 px-1 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 md:first:pl-1 md:last:border-r-0"
            >
              <span className="font-mono text-sm font-bold text-accent">({step.n})</span>
              <div>
                <h3 className="display mb-4 text-3xl !tracking-[-0.02em] sm:text-4xl">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink/60">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
