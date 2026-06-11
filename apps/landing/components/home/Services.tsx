"use client";

import { motion } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";
import { fadeUp, inViewProps } from "@/lib/animations";

type Service = {
  index: string;
  name: string;
  desc: string;
  from: string;
  chips: string[];
  bg: string;
  fg: string;
  muted: string;
  icon: React.ReactNode;
};

const ICON_STROKE = { strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const SERVICES: Service[] = [
  {
    index: "01",
    name: "Food",
    desc: "480+ restaurants, from buka rice to fine dining — delivered hot, tracked to your gate.",
    from: "from ₦900",
    chips: ["480+ restaurants", "Live tracking", "Hot bag riders"],
    bg: "#FF6A2C",
    fg: "#FFFFFF",
    muted: "rgba(255,255,255,0.75)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...ICON_STROKE} aria-hidden="true">
        <path d="M3 11c0-4.5 4-7.5 9-7.5s9 3 9 7.5H3z" />
        <path d="M2 13h20M5 16.5h14l-1 3.5H6l-1-3.5z" />
      </svg>
    ),
  },
  {
    index: "02",
    name: "Grocery",
    desc: "Shoprite, Ebeano and open-air markets — a personal shopper picks, you approve, we deliver.",
    from: "from ₦1,200",
    chips: ["Personal shoppers", "Market runs", "Same-day"],
    bg: "#2F7D5F",
    fg: "#FFFFFF",
    muted: "rgba(255,255,255,0.75)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...ICON_STROKE} aria-hidden="true">
        <path d="M3 5h3l2.5 11h10l2-8H7" />
        <circle cx="10" cy="20" r="1.6" />
        <circle cx="17" cy="20" r="1.6" />
      </svg>
    ),
  },
  {
    index: "03",
    name: "Retail",
    desc: "Fashion, tech and home goods from stores across the city — shopped and shipped in hours, not days.",
    from: "from ₦1,500",
    chips: ["Same-day shopping", "Verified stores", "Easy returns"],
    bg: "#FFB020",
    fg: "#0A0A0B",
    muted: "rgba(10,10,11,0.7)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...ICON_STROKE} aria-hidden="true">
        <path d="M3.5 8h17l-1 12H4.5l-1-12z" />
        <path d="M8 10V7a4 4 0 018 0v3" />
      </svg>
    ),
  },
  {
    index: "04",
    name: "Parcel",
    desc: "Documents, gifts, anything under 20kg — a rider is at your door in minutes, across town in under an hour.",
    from: "from ₦1,450",
    chips: ["Door-to-door", "Under 60 min", "Insured"],
    bg: "#1E5FFF",
    fg: "#FFFFFF",
    muted: "rgba(255,255,255,0.75)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...ICON_STROKE} aria-hidden="true">
        <path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5v-9z" />
        <path d="M3 7.5l9 4.5 9-4.5M12 12v9" />
      </svg>
    ),
  },
  {
    index: "05",
    name: "Truck",
    desc: "Moving house or hauling stock? Book vans to ten-ton trucks with vetted drivers and loaders.",
    from: "from ₦25,000",
    chips: ["Vans → 10-ton", "Vetted drivers", "Loaders included"],
    bg: "#141416",
    fg: "#FFFFFF",
    muted: "rgba(255,255,255,0.7)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...ICON_STROKE} aria-hidden="true">
        <rect x="1.5" y="6.5" width="12" height="9" rx="1.2" />
        <path d="M13.5 9h4.3l3.2 3.2v3.3h-7.5V9z" />
        <circle cx="6.5" cy="17.5" r="2" />
        <circle cx="17" cy="17.5" r="2" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="relative bg-bone py-28 text-ink sm:py-36">
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <ChapterLabel index="02" title="What we move" tone="dark" className="mb-10" />

        <motion.h2
          variants={fadeUp}
          {...inViewProps}
          className="display mb-20 text-[clamp(2.8rem,7vw,7rem)] text-ink"
        >
          Five ways <span className="serif-accent text-accent">to move.</span>
        </motion.h2>

        <div className="flex flex-col gap-8">
          {SERVICES.map((s, i) => (
            <article
              key={s.name}
              className="sticky overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]"
              style={{
                top: `calc(12vh + ${i * 2.6}rem)`,
                background: s.bg,
                color: s.fg,
              }}
            >
              <div className="grid min-h-[60vh] grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
                {/* Copy */}
                <div className="flex flex-col justify-between gap-12 p-8 sm:p-12 lg:p-16">
                  <div className="flex items-start justify-between">
                    <span className="mono-label" style={{ color: s.muted }}>
                      {s.index} — {s.name}
                    </span>
                    <span
                      className="rounded-full border px-4 py-1.5 font-mono text-xs font-bold"
                      style={{ borderColor: s.muted, color: s.fg }}
                    >
                      {s.from}
                    </span>
                  </div>

                  <div>
                    <h3 className="display text-[clamp(3rem,8vw,7.5rem)]">{s.name}</h3>
                    <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ color: s.muted }}>
                      {s.desc}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2.5">
                      {s.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full px-4 py-2 text-xs font-semibold"
                          style={{
                            background: s.fg === "#0A0A0B" ? "rgba(10,10,11,0.08)" : "rgba(255,255,255,0.12)",
                            border: `1px solid ${s.fg === "#0A0A0B" ? "rgba(10,10,11,0.18)" : "rgba(255,255,255,0.22)"}`,
                          }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Oversized icon panel */}
                <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 70% 40%, ${
                        s.fg === "#0A0A0B" ? "rgba(10,10,11,0.10)" : "rgba(255,255,255,0.14)"
                      } 0%, transparent 65%)`,
                    }}
                  />
                  <div className="h-[340px] w-[340px] opacity-90" style={{ color: s.fg }}>
                    {s.icon}
                  </div>
                  <span
                    className="display pointer-events-none absolute -bottom-10 -right-4 select-none text-[12rem] opacity-[0.08]"
                    style={{ color: s.fg }}
                  >
                    {s.index}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
