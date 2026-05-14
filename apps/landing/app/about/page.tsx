import { Metadata } from "next";
import PageShell from "@/components/PageShell";

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

export default function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">About Us</p>
        <h1 className="text-white text-5xl md:text-6xl font-black leading-tight mb-6">
          Delivering Nigeria&apos;s<br />
          <span className="text-[#1E5FFF]">tomorrow</span>, today.
        </h1>
        <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
          Godrop is an on-demand logistics platform built for Nigerian cities — starting with Lagos.
          We connect customers to vendors and riders to earn meaningful income, all through one seamless app.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-white/[0.03] border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-white text-3xl font-black mb-6">Our Mission</h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              To make reliable, affordable delivery accessible to every Nigerian — whether you&apos;re ordering jollof rice
              from your favourite spot, sending a birthday gift across town, or moving your entire apartment.
            </p>
            <p className="text-white/60 text-lg leading-relaxed">
              We believe logistics infrastructure is the backbone of commerce, and Nigeria deserves infrastructure
              that actually works.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "10,000+", label: "Orders Delivered" },
              { value: "500+", label: "Active Riders" },
              { value: "200+", label: "Vendor Partners" },
              { value: "4.8★", label: "Average Rating" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-white text-3xl font-black mb-1">{value}</p>
                <p className="text-white/50 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-white text-3xl font-black mb-4">What We Stand For</h2>
          <p className="text-white/50 max-w-lg mx-auto">The principles that drive every product decision, every partnership, every hire.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(({ icon, title, body }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-white/20 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#1E5FFF]/15 flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-[#1E5FFF]/10 to-[#FF6A2C]/10 border border-white/10 rounded-3xl p-12">
          <h2 className="text-white text-3xl font-black mb-4">Join the movement</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">Whether you want to order, sell, or ride — there&apos;s a place for you on Godrop.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://godrop-dashboard.vercel.app/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: "#1E5FFF" }}
            >
              Login to Dashboard
            </a>
            <a
              href="/contact"
              className="px-8 py-3.5 rounded-full text-white text-sm font-semibold border border-white/20 hover:border-white/40 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
