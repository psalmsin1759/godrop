import { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Community Guidelines — Godrop",
  description: "Standards of conduct for the Godrop community of customers, vendors, and riders.",
};

const guidelines = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Be Respectful",
    body: "Treat every person on the Godrop platform — customers, riders, vendors, and support staff — with dignity and respect. Harassment, abusive language, threats, or discriminatory behaviour of any kind will result in immediate suspension.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Be Honest",
    body: "Provide accurate information on your account, orders, and reviews. False ratings, fraudulent refund requests, and fake reviews undermine trust for everyone. We use automated fraud detection and review flagged accounts manually.",
  },
  {
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    title: "Deliver What You Promise",
    body: "Vendors must ensure listed items are available, accurately described, and prepared to the stated quality standard. Riders must complete assigned deliveries promptly. Repeated cancellations or order failures will affect your account standing.",
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Comply with the Law",
    body: "Only list and order items that are legal under Nigerian law. No controlled substances, counterfeit goods, weapons, or items that violate NAFDAC regulations may be listed or transported using Godrop.",
  },
  {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    title: "Safety First",
    body: "Riders must obey all traffic laws and never handle a delivery while intoxicated. Customers must ensure their delivery location is safe and accessible. Report any safety concerns immediately through the in-app report feature or email safety@godrop.ng.",
  },
  {
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    title: "Protect Privacy",
    body: "Do not share other users' personal information outside the Godrop platform. Contact details shared for delivery purposes must not be used for unsolicited marketing. Any data misuse will be treated as a serious violation.",
  },
  {
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    title: "Review Fairly",
    body: "Ratings and reviews should reflect your genuine experience. Do not leave reviews in exchange for incentives or to damage a competitor's reputation. Godrop investigates reports of review manipulation and may remove accounts found to be gaming the system.",
  },
  {
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Report Violations",
    body: "If you witness a violation of these guidelines, use the in-app report button or email safety@godrop.ng. We take all reports seriously and investigate within 48 hours. Retaliation against anyone who reports in good faith is itself a violation.",
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <PageShell>
      <article className="max-w-4xl mx-auto px-6 py-24">
        <header className="mb-16 text-center">
          <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">Community</p>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-6">Community Guidelines</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Godrop works because people trust each other. These guidelines keep that trust intact — for customers,
            vendors, and riders across Nigeria.
          </p>
          <p className="text-white/40 text-sm mt-4">Last updated: May 14, 2026</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guidelines.map(({ icon, title, body }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1E5FFF]/15 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
              <p className="text-white/60 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#1E5FFF]/10 to-[#FF6A2C]/10 border border-white/10 rounded-2xl p-8 text-center">
          <h2 className="text-white text-2xl font-bold mb-3">Violations &amp; Enforcement</h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            Violations of these guidelines may result in warnings, temporary suspension, or permanent deactivation
            depending on severity. We aim to be fair — if you believe an action was taken in error, appeal via
            appeals@godrop.ng within 14 days.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
