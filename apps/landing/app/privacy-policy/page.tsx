import { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Godrop",
  description: "How Godrop collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-12">
          <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-4">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: May 14, 2026</p>
        </header>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">
          <Section title="1. Introduction">
            Godrop Technologies Ltd (&quot;Godrop&quot;, &quot;we&quot;, &quot;our&quot;) is committed to protecting the privacy of our users,
            vendors, and riders. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application, website, and related services (&quot;Services&quot;) in Nigeria.
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-white">Account Information:</strong> When you register, we collect your name, phone number, email address, and profile photo.</p>
            <p className="mt-3"><strong className="text-white">Location Data:</strong> We collect your real-time location to match you with nearby vendors and assign riders to your order. You can disable location access in device settings, but this will limit functionality.</p>
            <p className="mt-3"><strong className="text-white">Transaction Data:</strong> We collect records of your orders, payments, and delivery history.</p>
            <p className="mt-3"><strong className="text-white">Device Information:</strong> We collect device type, operating system, IP address, and push notification tokens to provide our Services.</p>
            <p className="mt-3"><strong className="text-white">KYC Documents (Riders &amp; Vendors):</strong> For compliance and safety, riders and vendors submit government-issued ID, vehicle papers, and related documents. These are stored securely and used solely for identity verification.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and fulfill your delivery orders</li>
              <li>Facilitate payments via Paystack</li>
              <li>Send transactional notifications (OTPs, order updates)</li>
              <li>Improve our Services through analytics</li>
              <li>Detect fraud and ensure platform safety</li>
              <li>Comply with applicable Nigerian laws and regulations</li>
              <li>Respond to customer support requests</li>
            </ul>
          </Section>

          <Section title="4. Sharing of Information">
            <p>We do not sell your personal data. We share information only with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong className="text-white">Vendors:</strong> Your delivery address and contact info are shared with the vendor fulfilling your order.</li>
              <li><strong className="text-white">Riders:</strong> Your delivery address and order details are shared with the assigned rider.</li>
              <li><strong className="text-white">Payment Processors:</strong> Paystack processes payments; your card/bank data is governed by Paystack&apos;s privacy policy.</li>
              <li><strong className="text-white">Service Providers:</strong> Cloud infrastructure (Cloudinary, Railway) and analytics partners under strict data processing agreements.</li>
              <li><strong className="text-white">Law Enforcement:</strong> When required by Nigerian law or court order.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            We retain your personal data for as long as your account is active and for 5 years thereafter as required
            by Nigerian financial regulations. KYC documents are retained for 7 years per FCCPC guidelines.
            You may request deletion of your account data by contacting hello@godrop.ng.
          </Section>

          <Section title="6. Security">
            We implement industry-standard security measures including TLS encryption in transit, bcrypt password hashing,
            JWT authentication with short-lived tokens, and access controls. No method of transmission over the Internet
            is 100% secure, and we cannot guarantee absolute security.
          </Section>

          <Section title="7. Your Rights">
            Under the Nigeria Data Protection Act (NDPA) 2023, you have the right to:
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Object to processing for direct marketing</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact our Data Protection Officer at privacy@godrop.ng.</p>
          </Section>

          <Section title="8. Cookies">
            Our website uses essential cookies for session management and analytics cookies (with your consent) to
            understand how visitors interact with our site. You may disable cookies in your browser settings.
          </Section>

          <Section title="9. Children">
            Our Services are not directed to children under 13. We do not knowingly collect personal information from
            children. If you believe a child has provided us with personal data, contact us immediately.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of material changes via email or
            in-app notification at least 14 days before the change takes effect.
          </Section>

          <Section title="11. Contact Us">
            <p>Godrop Technologies Ltd</p>
            <p>Lagos, Nigeria</p>
            <p>Email: privacy@godrop.ng</p>
          </Section>
        </div>
      </article>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-white text-xl font-bold mb-4">{title}</h2>
      <div className="text-white/70">{children}</div>
    </section>
  );
}
