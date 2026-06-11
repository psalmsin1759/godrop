import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import ChapterLabel from "@/components/ui/ChapterLabel";

export const metadata: Metadata = {
  title: "For Vendors — Godrop",
  description: "Grow your restaurant, grocery, or retail business with Godrop. Reach thousands of customers across Lagos.",
};

const benefits = [
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    title: "Grow Your Revenue",
    body: "Tap into thousands of hungry customers in your area. Our data shows vendors see an average 40% revenue increase in their first 3 months on Godrop.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Real-Time Dashboard",
    body: "Manage orders, update your menu, track earnings, and view analytics — all from the Godrop Vendor Dashboard. No tech skills required.",
  },
  {
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Fast, Reliable Payouts",
    body: "Earnings are settled to your account weekly. Track every transaction in real-time. No hidden fees — just a simple, transparent commission.",
  },
  {
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    title: "Dedicated Riders",
    body: "Our network of verified riders is ready to deliver from your location. You focus on making great food and products — we handle the last mile.",
  },
  {
    icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
    title: "Free Marketing",
    body: "Get featured in curated collections, promotions, and push notifications. Godrop actively promotes high-rated vendors to drive more orders your way.",
  },
  {
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    title: "24/7 Support",
    body: "Our dedicated vendor support team is available around the clock to resolve issues, answer questions, and help your business grow.",
  },
];

const steps = [
  { number: "01", title: "Apply Online", body: "Fill in your business details, upload your documents, and submit your application — takes under 10 minutes." },
  { number: "02", title: "Get Verified", body: "Our team reviews your application within 48 hours. We verify your business registration and food safety compliance." },
  { number: "03", title: "Set Up Your Store", body: "Upload your menu or product catalogue, set your pricing and hours, and customise your storefront." },
  { number: "04", title: "Start Selling", body: "Go live and start receiving orders. Riders will collect from your location and deliver to customers." },
];

const categories = [
  "Restaurants & Food",
  "Grocery Stores",
  "Pharmacies",
  "Retail & Fashion",
  "Beauty & Health",
  "Logistics & Parcel",
];

export default function VendorsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink">
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(30,95,255,0.18) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-20 pt-24 sm:px-10 lg:px-16">
          <p className="mono-label mb-8 text-accent">For vendors</p>
          <h1 className="display max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] text-white">
            Reach more customers.
            <br />
            <span className="serif-accent text-accent">Earn more revenue.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60">
            Join hundreds of restaurants, grocery stores, pharmacies, and retailers
            already growing their business with Godrop. Getting started is free and
            takes less than 10 minutes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/vendors/onboard"
              className="inline-flex h-[56px] items-center justify-center rounded-full bg-accent px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
            >
              Become a Vendor — It&apos;s Free
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-[56px] items-center justify-center rounded-full border border-white/25 px-8 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white/60"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="mono-label mt-6 text-white/40">No upfront fees · Pay only when you earn</p>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-white/10 bg-ink-soft">
        <div className="mx-auto w-full max-w-[1500px] px-6 py-14 sm:px-10 lg:px-16">
          <p className="mono-label mb-8 text-center text-white/50">
            We support vendors across all categories
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((label) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-full border border-white/12 px-5 py-2.5 transition-colors duration-200 hover:border-accent/50"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-sm font-medium text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-ink py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          <ChapterLabel index="01" title="Why Godrop" className="mb-8" />
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)] text-white">
              Why vendors <span className="serif-accent text-accent">choose Godrop.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              Everything you need to run and grow a delivery business — without the
              headache.
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
          <ChapterLabel index="02" title="How it works" tone="dark" className="mb-8" />
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)]">
              Live in <span className="serif-accent text-accent">48 hours.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink/60">
              From application to first order in as little as 48 hours.
            </p>
          </div>
          <ol className="grid grid-cols-1 border-t border-ink/15 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ number, title, body }) => (
              <li
                key={number}
                className="flex flex-col gap-12 border-b border-ink/15 px-1 py-10 lg:border-b-0 lg:border-r lg:px-7 lg:py-12 lg:first:pl-1 lg:last:border-r-0"
              >
                <span className="font-mono text-sm font-bold text-accent">({number})</span>
                <div>
                  <h3 className="display mb-3 text-2xl !tracking-[-0.02em]">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink/60">{body}</p>
                </div>
              </li>
            ))}
          </ol>
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
            Ready to <span className="serif-accent text-accent">grow?</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            Join Godrop today and start reaching thousands of customers in your area.
          </p>
          <Link
            href="/vendors/onboard"
            className="mt-10 inline-flex h-[56px] items-center justify-center rounded-full bg-accent px-10 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
          >
            Apply to Become a Vendor
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
