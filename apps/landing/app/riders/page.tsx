import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import ChapterLabel from "@/components/ui/ChapterLabel";

export const metadata: Metadata = {
  title: "For Riders — Godrop",
  description: "Earn money on your schedule. Join Godrop as a delivery rider in Lagos and beyond.",
};

const benefits = [
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Earn Great Income",
    body: "Riders on Godrop earn between ₦60,000 and ₦200,000+ per month depending on hours worked and order volume. You get paid weekly, directly to your bank account.",
  },
  {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "Flexible Hours",
    body: "Work when you want. Set your availability in the app, go online when you're ready, and take a break whenever you need. No fixed shifts, no bosses.",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Safety & Insurance",
    body: "All riders are covered under our third-party liability policy during active deliveries. We also provide in-app emergency support and a 24/7 rider helpline.",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Instant Job Alerts",
    body: "Our smart dispatch system sends you orders nearby so you spend less time waiting and more time earning. Accept or decline — always your choice.",
  },
  {
    icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
    title: "Real-Time Earnings Tracker",
    body: "Watch your earnings grow in real-time inside the rider app. Request withdrawals instantly — funds hit your bank within 24 hours.",
  },
  {
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    title: "Community & Growth",
    body: "Join thousands of riders across Lagos. Top performers unlock bonuses, priority dispatch, and a fast track to Godrop fleet management roles.",
  },
];

const requirements = [
  "18 years or older",
  "Valid government-issued ID (NIN, Driver's License, or Voter's Card)",
  "A bicycle, motorcycle, or car",
  "Android or iOS smartphone",
  "Nigerian bank account for payouts",
  "Guarantor information (for your protection and ours)",
];

const earnings = [
  { value: "₦200k+", label: "Top rider monthly earnings" },
  { value: "500+", label: "Active riders on platform" },
  { value: "24hrs", label: "Withdrawal to bank" },
  { value: "4.7★", label: "Average rider satisfaction" },
];

export default function RidersPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink">
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,106,44,0.16) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-20 pt-24 sm:px-10 lg:px-16">
          <p className="mono-label mb-8 text-accent">For riders</p>
          <h1 className="display max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] text-white">
            Your hustle.
            <br />
            <span className="serif-accent text-accent">Your earnings.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60">
            Join thousands of riders already earning on Godrop. Work on your
            schedule, earn great income, and be part of Nigeria&apos;s
            fastest-growing delivery network.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/riders/onboard"
              className="inline-flex h-[56px] items-center justify-center rounded-full bg-accent px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
            >
              Apply to Become a Rider
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-[56px] items-center justify-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white/60"
            >
              Have Questions?
            </Link>
          </div>
          <p className="mono-label mt-6 text-white/40">Free to join · Earnings start from day one</p>
        </div>
      </section>

      {/* Earnings banner — orange chapter */}
      <section className="grain relative overflow-hidden bg-accent py-20 text-white sm:py-24">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-x-8 gap-y-12 px-6 sm:px-10 lg:grid-cols-4 lg:px-16">
          {earnings.map(({ value, label }) => (
            <div key={label} className="border-t border-white/30 pt-5">
              <p className="display text-4xl sm:text-5xl">{value}</p>
              <p className="mono-label mt-2 text-white/75">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-ink py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          <ChapterLabel index="01" title="The perks" className="mb-8" />
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)] text-white">
              Why ride <span className="serif-accent text-accent">with Godrop?</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              The perks that make Godrop the best platform for riders in Nigeria.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-ink-soft p-7 transition-colors duration-200 hover:border-white/25"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <h3 className="display mb-2.5 text-xl !tracking-[-0.02em] text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements — bone chapter */}
      <section className="bg-bone py-24 text-ink sm:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          <ChapterLabel index="02" title="Requirements" tone="dark" className="mb-8" />
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)]">
              What you need <span className="serif-accent text-accent">to apply.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink/60">
              Simple requirements — most riders are approved within 48 hours.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {requirements.map((text) => (
              <div
                key={text}
                className="flex items-center gap-4 rounded-2xl border border-ink/15 bg-white/60 px-6 py-5"
              >
                <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-ink/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden bg-ink py-28 sm:py-36">
        <div
          className="pointer-events-none absolute bottom-[-50%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-[50%]"
          style={{ background: "radial-gradient(ellipse, rgba(255,106,44,0.3) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-[1500px] flex-col items-center px-6 text-center sm:px-10">
          <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)] text-white">
            Ready to start <span className="serif-accent text-accent">earning?</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            The application takes about 10 minutes. Our team reviews it within 48
            hours and onboards you to the rider app.
          </p>
          <Link
            href="/riders/onboard"
            className="group mt-10 inline-flex h-[56px] items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
          >
            Start Your Application
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
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
