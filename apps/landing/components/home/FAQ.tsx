"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChapterLabel from "@/components/ui/ChapterLabel";

const FAQS = [
  {
    q: "Where is Godrop available?",
    a: "We're live in 36 states and 200+ cities, with the deepest coverage in Lagos, Abuja, Port Harcourt and Ibadan. Open the app and drop a pin — if we're there, you'll see live pricing instantly.",
  },
  {
    q: "How fast is delivery, really?",
    a: "Across Lagos our average door-to-door time is 27 minutes for parcels and food. Trucks for relocation are typically matched within the hour and scheduled at your convenience.",
  },
  {
    q: "How do I pay?",
    a: "Card, bank transfer, USSD or your Godrop wallet — all powered by Paystack. Prices are shown upfront in Naira before you book, and refunds return to your wallet in seconds.",
  },
  {
    q: "Is my package insured?",
    a: "Yes. Every delivery is covered against loss or damage, every rider is identity-verified, and you can track the journey live and share it with the receiver.",
  },
  {
    q: "Can my business use Godrop?",
    a: "Absolutely. Godrop Business gives you bulk booking, a delivery dashboard, monthly invoicing and API access. Hundreds of SMEs already run their logistics on it.",
  },
];

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/12">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-6 py-7 text-left"
      >
        <span className="display text-xl !tracking-[-0.02em] text-white transition-colors duration-200 group-hover:text-accent sm:text-2xl lg:text-3xl">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-8 text-[15px] leading-relaxed text-white/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-white/10 bg-ink py-28 text-white sm:py-36">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-16 px-6 sm:px-10 lg:grid-cols-[1fr_1.6fr] lg:px-16">
        <div>
          <ChapterLabel index="08" title="Questions" className="mb-8" />
          <h2 className="display text-[clamp(2.4rem,4.5vw,4rem)]">
            Good <span className="serif-accent text-accent">questions.</span>
          </h2>
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/55">
            Can&apos;t find what you&apos;re looking for? Our support team answers in
            minutes, not days.
          </p>
        </div>

        <div className="border-t border-white/12">
          {FAQS.map((faq, i) => (
            <Item
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
