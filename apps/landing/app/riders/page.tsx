import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";

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
  { icon: "✓", text: "18 years or older" },
  { icon: "✓", text: "Valid government-issued ID (NIN, Driver's License, or Voter's Card)" },
  { icon: "✓", text: "A bicycle, motorcycle, or car" },
  { icon: "✓", text: "Android or iOS smartphone" },
  { icon: "✓", text: "Nigerian bank account for payouts" },
  { icon: "✓", text: "Guarantor information (for your protection and ours)" },
];

export default function RidersPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">For Riders</p>
        <h1 className="text-white text-5xl md:text-6xl font-black leading-tight mb-6">
          Your hustle.<br />
          <span className="text-[#1E5FFF]">Your earnings.</span>
        </h1>
        <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Join thousands of riders already earning on Godrop. Work on your schedule, earn great income,
          and be part of Nigeria&apos;s fastest-growing delivery network.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/riders/onboard"
            className="px-8 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#1E5FFF" }}
          >
            Apply to Become a Rider
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 rounded-full text-white font-bold text-base border border-white/20 hover:border-white/40 transition-colors"
          >
            Have Questions?
          </Link>
        </div>
        <p className="text-white/30 text-sm mt-4">Free to join. Earnings start from day one.</p>
      </section>

      {/* Earnings banner */}
      <section className="bg-gradient-to-r from-[#1E5FFF]/10 to-[#FF6A2C]/10 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "₦200k+", label: "Top rider monthly earnings" },
            { value: "500+", label: "Active riders on platform" },
            { value: "24hrs", label: "Withdrawal to bank" },
            { value: "4.7★", label: "Average rider satisfaction" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-white text-3xl font-black mb-1">{value}</p>
              <p className="text-white/50 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-white text-3xl font-black mb-4">Why ride with Godrop?</h2>
          <p className="text-white/50 max-w-lg mx-auto">The perks that make Godrop the best platform for riders in Nigeria.</p>
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

      {/* Requirements */}
      <section className="bg-white/[0.03] border-y border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-white text-3xl font-black mb-4">What you need to apply</h2>
            <p className="text-white/50">Simple requirements — most riders are approved within 48 hours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <span className="text-[#1E5FFF] font-black">{icon}</span>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-white text-4xl font-black mb-4">Ready to start earning?</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          The application takes about 10 minutes. Our team reviews it within 48 hours and onboards you to the rider app.
        </p>
        <Link
          href="/riders/onboard"
          className="inline-block px-10 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#FF6A2C" }}
        >
          Start Your Application →
        </Link>
      </section>
    </PageShell>
  );
}
