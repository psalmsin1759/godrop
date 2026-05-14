import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";

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
  { emoji: "🍽️", label: "Restaurants & Food" },
  { emoji: "🛒", label: "Grocery Stores" },
  { emoji: "💊", label: "Pharmacies" },
  { emoji: "🛍️", label: "Retail & Fashion" },
  { emoji: "🧴", label: "Beauty & Health" },
  { emoji: "📦", label: "Logistics & Parcel" },
];

export default function VendorsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">For Vendors</p>
        <h1 className="text-white text-5xl md:text-6xl font-black leading-tight mb-6">
          Reach more customers.<br />
          <span className="text-[#1E5FFF]">Earn more revenue.</span>
        </h1>
        <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Join hundreds of restaurants, grocery stores, pharmacies, and retailers already growing their business with Godrop.
          Getting started is free and takes less than 10 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/vendors/onboard"
            className="px-8 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#1E5FFF" }}
          >
            Become a Vendor — It&apos;s Free
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 rounded-full text-white font-bold text-base border border-white/20 hover:border-white/40 transition-colors"
          >
            Talk to Sales
          </Link>
        </div>
        <p className="text-white/30 text-sm mt-4">No upfront fees. Pay only when you earn.</p>
      </section>

      {/* Categories */}
      <section className="bg-white/[0.03] border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="text-white/50 text-sm text-center mb-8 font-medium">We support vendors across all categories</p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
                <span>{emoji}</span>
                <span className="text-white/80 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-white text-3xl font-black mb-4">Why vendors choose Godrop</h2>
          <p className="text-white/50 max-w-lg mx-auto">Everything you need to run and grow a delivery business — without the headache.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon, title, body }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#1E5FFF]/15 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/[0.03] border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-white text-3xl font-black mb-4">How it works</h2>
            <p className="text-white/50">From application to first order in as little as 48 hours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map(({ number, title, body }) => (
              <div key={number} className="flex gap-5">
                <span className="text-[#1E5FFF]/40 font-black text-5xl leading-none shrink-0">{number}</span>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-white text-4xl font-black mb-4">Ready to grow?</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">Join Godrop today and start reaching thousands of customers in your area.</p>
        <Link
          href="/vendors/onboard"
          className="inline-block px-10 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#FF6A2C" }}
        >
          Apply to Become a Vendor
        </Link>
      </section>
    </PageShell>
  );
}
