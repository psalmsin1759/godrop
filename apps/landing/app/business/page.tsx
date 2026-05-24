import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
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
  { text: "Registered Nigerian business (CAC Certificate)" },
  { text: "Valid Tax Identification Number (TIN)" },
  { text: "Owner KYC — NIN or BVN + government-issued ID" },
  { text: "Nigerian corporate or personal bank account" },
  { text: "Minimum of 2 riders ready to be onboarded" },
  { text: "Defined service areas within our coverage zones" },
];

export default function BusinessPage() {
  return (
    <PageShell>
      <BusinessHero />

      {/* Stats banner */}
      <section className="bg-gradient-to-r from-[#1E5FFF]/10 to-[#FF6A2C]/10 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Riders on the platform" },
            { value: "₦0", label: "Setup or subscription fee" },
            { value: "24hrs", label: "Wallet withdrawal to bank" },
            { value: "PH", label: "Operational coverage (expanding)" },
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
          <h2 className="text-white text-3xl font-black mb-4">Built for serious logistics operators</h2>
          <p className="text-white/50 max-w-lg mx-auto">Everything your business needs to run a professional delivery operation.</p>
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
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-white text-3xl font-black mb-4">How to get started</h2>
            <p className="text-white/50 max-w-lg mx-auto">The onboarding process is straightforward. Most businesses are live within a week.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map(({ step, title, body }) => (
              <div key={step} className="flex gap-5 bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-[#1E5FFF] font-black text-3xl leading-none shrink-0">{step}</span>
                <div>
                  <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-white text-3xl font-black mb-4">Requirements</h2>
          <p className="text-white/50">We verify every business to maintain platform integrity and protect our riders.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map(({ text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
              <span className="text-[#1E5FFF] font-black shrink-0">✓</span>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white/[0.03] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-white text-4xl font-black mb-4">Ready to partner with Godrop?</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Reach out to our partnerships team. We&apos;ll walk you through the process and get your business account set up.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#FF6A2C" }}
          >
            Contact Our Team →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
