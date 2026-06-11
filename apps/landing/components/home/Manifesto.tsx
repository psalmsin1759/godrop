"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";

// serif: rendered as italic serif accent
const SENTENCE: { text: string; serif?: boolean }[] = [
  { text: "Nigeria" },
  { text: "doesn't" },
  { text: "wait.", serif: true },
  { text: "Neither" },
  { text: "should" },
  { text: "you." },
  { text: "Godrop" },
  { text: "moves" },
  { text: "dinner," },
  { text: "groceries," },
  { text: "parcels" },
  { text: "—" },
  { text: "even" },
  { text: "ten-ton" },
  { text: "trucks", serif: true },
  { text: "—" },
  { text: "through" },
  { text: "Africa's" },
  { text: "busiest" },
  { text: "cities," },
  { text: "in" },
  { text: "one" },
  { text: "tap.", serif: true },
];

function Word({
  word,
  serif,
  progress,
  range,
}: {
  word: string;
  serif?: boolean;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={serif ? "serif-accent text-accent" : undefined}
    >
      {word}{" "}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <section className="relative bg-ink py-36 text-white sm:py-48">
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="01" title="The promise" className="mb-12" />
        <p
          ref={ref}
          className="display max-w-5xl text-[clamp(1.9rem,4.6vw,4.2rem)] !leading-[1.12] !tracking-[-0.02em]"
        >
          {SENTENCE.map((w, i) => (
            <Word
              key={i}
              word={w.text}
              serif={w.serif}
              progress={scrollYProgress}
              range={[i / SENTENCE.length, (i + 1) / SENTENCE.length]}
            />
          ))}
        </p>
      </div>
    </section>
  );
}
