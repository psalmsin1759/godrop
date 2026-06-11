import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import ChapterLabel from "@/components/ui/ChapterLabel";
import BusinessHero from "./BusinessHero";

export const metadata: Metadata = {
  title: "For Business — Godrop",
  description: "Scale your logistics with Godrop. Manage your own fleet of riders, track deliveries, and control your operations under one business account.",
};

const benefits = [
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Your Own Rider Fleet",
    body: "Assign and manage a dedicated team of riders who operate exclusively under your business. Build a branded delivery network that works for your specific operations.",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    title: "Centralised Business Wallet",
    body: "All rider earnings flow into a single business wallet. Monitor your cash flow in real-time, track rider performance, and manage withdrawals from one dashboard.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Full Order Analytics",
    body: "See every order completed by every rider under your business. Filter by rider, date range, or delivery category. Export reports for accounting and reconciliation.",
  },
  {
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    title: "Team Access Control",
    body: "Add sub-admins to help manage day-to-day operations. Owners retain full control while admins handle rider assignments and order monitoring — all with full audit trails.",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Priority Dispatch",
    body: "Business accounts get preferential order routing. Your riders get first-priority dispatch for deliveries in your registered service areas during peak hours.",
  },
  {
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    title: "Dedicated Support",
    body: "Business accounts get access to a dedicated account manager and priority support channel — not a chatbot. Real help when your operations need it most.",
  },
];

const steps = [
  {
    step: "01",
    title: "Apply via our team",
    body: "Contact us with your business details. Our partnerships team reviews your application and gets back to you within 2 business days.",
  },
  {
    step: "02",
    title: "Complete verification",
    body: "Submit your CAC registration, owner KYC, and banking information. We verify everything securely before activation.",
  },
  {
    step: "03",
    title: "Onboard your riders",
    body: "Once approved, your business account is created and you assign riders to your fleet from the dashboard.",
  },
  {
    step: "04",
    title: "Go live",
    body: "Start taking orders. All rider earnings aggregate to your business wallet — withdraw anytime to your registered bank account.",
  },
];

const requirements = [
  "Registered Nigerian business (CAC Certificate)",
  "Valid Tax Identification Number (TIN)",
  "Owner KYC — NIN or BVN + government-issued ID",
  "Nigerian corporate or personal bank account",
  "Minimum of 2 riders ready to be onboarded",
  "Defined service areas within our coverage zones",
];

const stats = [
  { value: "500+", label: "Riders on the platform" },
  { value: "₦0", label: "Setup or subscription fee" },
  { value: "24hrs", label: "Wallet withdrawal to bank" },
  { value: "PH", label: "Operational coverage (expanding)" },
];

export default function BusinessPage() {
  return (
    <PageShell>
      <BusinessHero />

      {/* Stats banner — orange chapter */}
      <section className="grain relative overflow-hidden bg-accent py-20 text-white sm:py-24">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-x-8 gap-y-12 px-6 sm:px-10 lg:grid-cols-4 lg:px-16">
          {stats.map(({ value, label }) => (
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
          <ChapterLabel index="01" title="The platform" className="mb-8" />
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)] text-white">
              Built for serious <span className="serif-accent text-accent">logistics operators.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              Everything your business needs to run a professional delivery
              operation.
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

      {/* How it works — bone chapter */}
      <section className="bg-bone py-24 text-ink sm:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          <ChapterLabel index="02" title="Getting started" tone="dark" className="mb-8" />
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)]">
              How to <span className="serif-accent text-accent">get started.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink/60">
              The onboarding process is straightforward. Most businesses are live
              within a week.
            </p>
          </div>
          <ol className="grid grid-cols-1 border-t border-ink/15 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, title, body }) => (
              <li
                key={step}
                className="flex flex-col gap-12 border-b border-ink/15 px-1 py-10 lg:border-b-0 lg:border-r lg:px-7 lg:py-12 lg:first:pl-1 lg:last:border-r-0"
              >
                <span className="font-mono text-sm font-bold text-accent">({step})</span>
                <div>
                  <h3 className="display mb-3 text-2xl !tracking-[-0.02em]">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink/60">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-ink py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          <ChapterLabel index="03" title="Requirements" className="mb-8" />
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)] text-white">
              What we <span className="serif-accent text-accent">verify.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              We verify every business to maintain platform integrity and protect
              our riders.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {requirements.map((text) => (
              <div
                key={text}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-soft px-6 py-5"
              >
                <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-white/80">{text}</span>
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
            Ready to partner <span className="serif-accent text-accent">with Godrop?</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            Reach out to our partnerships team. We&apos;ll walk you through the
            process and get your business account set up.
          </p>
          <Link
            href="/contact"
            className="group mt-10 inline-flex h-[56px] items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
          >
            Contact Our Team
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
