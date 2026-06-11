import { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ChapterLabel from "@/components/ui/ChapterLabel";

export const metadata: Metadata = {
  title: "About — Godrop",
  description: "Learn about Godrop, Nigeria's on-demand delivery platform built for Lagos and beyond.",
};

const values = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Speed",
    body: "We obsess over minutes, not hours. Every system, process, and partnership is designed to move goods faster.",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Trust",
    body: "Every rider is verified, every vendor is vetted. Real-time tracking and end-to-end accountability means you always know where your order is.",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Community",
    body: "Riders earn fair income. Vendors grow their businesses. Customers get convenience. Everyone wins on Godrop.",
  },
  {
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Local First",
    body: "Built in Nigeria, for Nigeria. We understand Lagos traffic, local payment preferences, and the way Nigerians actually live and shop.",
  },
];

const stats = [
  { value: "10,000+", label: "Orders delivered" },
  { value: "500+", label: "Active riders" },
  { value: "200+", label: "Vendor partners" },
  { value: "4.8★", label: "Average rating" },
];

export default function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink">
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,106,44,0.16) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-24 pt-24 sm:px-10 lg:px-16">
          <p className="mono-label mb-8 text-accent">About us</p>
          <h1 className="display max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] text-white">
            Delivering Nigeria&apos;s{" "}
            <span className="serif-accent text-accent">tomorrow,</span> today.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60">
            Godrop is an on-demand logistics platform built for Nigerian cities —
            starting with Lagos. We connect customers to vendors and riders to
            earn meaningful income, all through one seamless app.
          </p>
        </div>
      </section>

      {/* Mission — bone chapter */}
      <section className="bg-bone py-24 text-ink sm:py-32">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-center gap-14 px-6 sm:px-10 md:grid-cols-2 lg:px-16">
          <div>
            <ChapterLabel index="01" title="Our mission" tone="dark" className="mb-8" />
            <h2 className="display mb-8 text-[clamp(2.2rem,4vw,3.5rem)]">
              Logistics that <span className="serif-accent text-accent">actually works.</span>
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-ink/65">
              To make reliable, affordable delivery accessible to every Nigerian —
              whether you&apos;re ordering jollof rice from your favourite spot,
              sending a birthday gift across town, or moving your entire apartment.
            </p>
            <p className="text-lg leading-relaxed text-ink/65">
              We believe logistics infrastructure is the backbone of commerce, and
              Nigeria deserves infrastructure that actually works.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            {stats.map(({ value, label }) => (
              <div key={label} className="border-t border-ink/20 pt-5">
                <p className="display text-4xl sm:text-5xl">{value}</p>
                <p className="mono-label mt-2 text-ink/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-ink py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          <ChapterLabel index="02" title="Our values" className="mb-8" />
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)] text-white">
              What we <span className="serif-accent text-accent">stand for.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              The principles that drive every product decision, every partnership,
              every hire.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {values.map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-ink-soft p-8 transition-colors duration-200 hover:border-white/25"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <h3 className="display mb-3 text-2xl !tracking-[-0.02em] text-white">{title}</h3>
                <p className="text-[15px] leading-relaxed text-white/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden border-t border-white/10 bg-ink py-28 sm:py-36">
        <div
          className="pointer-events-none absolute bottom-[-50%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-[50%]"
          style={{ background: "radial-gradient(ellipse, rgba(255,106,44,0.3) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-[1500px] flex-col items-center px-6 text-center sm:px-10">
          <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)] text-white">
            Join the <span className="serif-accent text-accent">movement.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            Whether you want to order, sell, or ride — there&apos;s a place for you
            on Godrop.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="https://dashboard.naijagodrop.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[56px] items-center justify-center rounded-full bg-accent px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
            >
              Login to Dashboard
            </a>
            <a
              href="/contact"
              className="inline-flex h-[56px] items-center justify-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white/60"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
