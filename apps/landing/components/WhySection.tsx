"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PEEK = 10; // vh each previous card peeks from behind the new one

const panels = [
  {
    id: "intro",
    type: "intro" as const,
    bg: "#060606",
    heading: "",
    body: "",
    dotColor: "",
  },
  {
    id: "speed",
    type: "panel" as const,
    heading: "Speed loves convenience.",
    body: "In today's Nigeria, people expect things fast. On Godrop, the story flips. Within 30 minutes, customers report a surge in satisfaction and repeat orders. That shift doesn't come from luck — it comes from a network built around speed.",
    dotColor: "#1E5FFF",
    bg: "#111111",
  },
  {
    id: "reliability",
    type: "panel" as const,
    heading: "Reliability that earns trust.",
    body: "A single late delivery can lose a customer forever. More than 90% of Godrop deliveries arrive on time. Businesses that use Godrop consistently report higher retention, stronger reviews, and more repeat orders week over week.",
    dotColor: "#FF6A2C",
    bg: "#0d0d0d",
  },
  {
    id: "sameday",
    type: "panel" as const,
    heading: "Same-day delivery.",
    body: "Instant gratification isn't a luxury — it's an expectation. More than 80% of Godrop customers say fast delivery keeps them ordering again. That shift doesn't come from waiting. It comes from finding a platform that delivers AND grows alongside you.",
    dotColor: "#6B9FFF",
    bg: "#111111",
  },
];

function DotGrid({ color }: { color: string }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-5 h-5 rounded-full"
          style={{ background: color }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.015, ease }}
        />
      ))}
    </div>
  );
}

export default function WhySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const total = panels.length; // 4

      panels.forEach((_, i) => {
        if (i === 0) return;

        const panel = panelRefs.current[i];
        if (!panel) return;

        // Start each panel fully below the viewport
        gsap.set(panel, { yPercent: 100 });

        // Slide it up until it rests with (i * PEEK)vh from the top,
        // so each previous card peeks by PEEK vh
        gsap.to(panel, {
          yPercent: i * PEEK,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            // Each panel slides in during its slice of the total scroll
            start: `${((i - 1) / total) * 100}% top`,
            end: `${(i / total) * 100}% top`,
            scrub: 1.2,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    /* Section is panels×100vh tall — creates the scroll runway */
    <section
      ref={sectionRef}
      style={{ height: `${panels.length * 100}vh` }}
      className="relative"
    >
      {/* Sticky viewport: pins to top while section scrolls */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {panels.map((panel, i) => (
          <div
            key={panel.id}
            ref={(el) => { panelRefs.current[i] = el; }}
            className="absolute inset-0 w-full h-full"
            style={{
              background: panel.bg,
              zIndex: 10 + i,
              borderRadius: i > 0 ? "1.5rem 1.5rem 0 0" : undefined,
            }}
          >
            {panel.type === "intro" ? (
              /* ── Intro card ── */
              <div className="h-full flex flex-col justify-center px-8 md:px-16">
                <div className="max-w-7xl mx-auto w-full">
                  <div className="w-16 h-px bg-white/30 mb-14" />
                  <p className="text-white text-xl md:text-2xl leading-relaxed max-w-xl mb-5">
                    The demand is clear: fast, reliable delivery changes outcomes.
                    That&apos;s what Godrop was built for.
                  </p>
                  <p className="text-white/40 text-sm">Why It Works</p>
                </div>
              </div>
            ) : (
              /* ── Content card ── */
              <div className="h-full flex flex-col justify-center px-8 md:px-16">
                {/* Peek label — visible when card is peeking behind the next */}
                <div className="absolute top-5 left-8 md:left-16">
                  <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
                    {panel.heading.split(" ").slice(0, 2).join(" ")}
                  </p>
                </div>

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  {/* Text */}
                  <div>
                    <h2
                      className="text-white font-bold leading-tight mb-6"
                      style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                    >
                      {panel.heading}
                    </h2>
                    <p className="text-white/50 text-base leading-relaxed max-w-md">
                      {panel.body}
                    </p>
                  </div>

                  {/* Dot grid */}
                  <div className="hidden md:flex justify-end items-center">
                    <DotGrid color={panel.dotColor} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
