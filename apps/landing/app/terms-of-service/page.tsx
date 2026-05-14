import { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service — Godrop",
  description: "The terms and conditions governing your use of Godrop.",
};

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-12">
          <p className="text-[#FF6A2C] text-sm font-semibold tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-4">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: May 14, 2026</p>
        </header>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <Section title="1. Acceptance of Terms">
            By downloading, installing, or using the Godrop application or website, you agree to be bound by these
            Terms of Service (&quot;Terms&quot;). If you do not agree, do not use our Services. These Terms govern the
            relationship between Godrop Technologies Ltd (&quot;Godrop&quot;) and users, vendors, and riders operating in Nigeria.
          </Section>

          <Section title="2. Eligibility">
            You must be at least 18 years old to use Godrop. By using our Services, you represent that you meet this
            requirement and that all information you provide is accurate and complete.
          </Section>

          <Section title="3. User Accounts">
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must immediately notify us of any unauthorized use at security@godrop.ng.</li>
              <li>Accounts may not be transferred or sold to third parties.</li>
            </ul>
          </Section>

          <Section title="4. Orders and Delivery">
            <p>When you place an order through Godrop:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>You authorize Godrop to act as your agent in placing the order with the vendor.</li>
              <li>Order acceptance by a vendor creates a binding agreement between you and the vendor.</li>
              <li>Delivery times are estimates and may vary due to traffic, weather, or other factors.</li>
              <li>Godrop is a technology platform; we are not responsible for the quality of goods from vendors.</li>
              <li>Once a rider is assigned and pickup confirmed, cancellations may incur a fee.</li>
            </ul>
          </Section>

          <Section title="5. Payments">
            <p>All transactions are processed in Nigerian Naira (₦) via Paystack.</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Prices displayed include applicable VAT as required by Nigerian law.</li>
              <li>Refunds for failed or cancelled orders are credited to your Godrop wallet within 3–5 business days.</li>
              <li>Godrop wallet balances are non-transferable and cannot be withdrawn to a bank account.</li>
              <li>We reserve the right to cancel suspicious transactions.</li>
            </ul>
          </Section>

          <Section title="6. Vendor and Rider Conduct">
            Vendors and riders onboarded to Godrop agree to:
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Provide accurate information during onboarding and KYC verification.</li>
              <li>Maintain the quality, hygiene, and accuracy of listed products/services.</li>
              <li>Complete deliveries and orders in a timely and professional manner.</li>
              <li>Comply with all applicable Nigerian laws including NAFDAC, CAC, and tax regulations.</li>
            </ul>
          </Section>

          <Section title="7. Prohibited Activities">
            You may not:
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Use Godrop for any fraudulent or illegal purpose</li>
              <li>Submit false or misleading information</li>
              <li>Reverse-engineer, hack, or scrape our platform</li>
              <li>Harass, abuse, or harm other users, vendors, or riders</li>
              <li>List or order controlled substances, weapons, or prohibited items</li>
              <li>Create multiple accounts to abuse promotions</li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            All content, trademarks, logos, and software on the Godrop platform are owned by Godrop Technologies Ltd
            or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.
          </Section>

          <Section title="9. Limitation of Liability">
            To the maximum extent permitted by Nigerian law, Godrop shall not be liable for indirect, incidental,
            special, consequential, or punitive damages arising from your use of our Services. Our total liability
            shall not exceed the amount paid by you for the specific order giving rise to the claim.
          </Section>

          <Section title="10. Dispute Resolution">
            Any disputes arising from these Terms shall first be resolved through good-faith negotiation. If unresolved
            within 30 days, disputes shall be submitted to arbitration under the Lagos Chamber of Commerce and Industry
            Arbitration Rules. The governing law is the law of the Federal Republic of Nigeria.
          </Section>

          <Section title="11. Termination">
            Godrop reserves the right to suspend or terminate your account at any time for violation of these Terms,
            fraudulent activity, or any reason we deem appropriate. You may delete your account at any time through
            the app settings.
          </Section>

          <Section title="12. Changes to Terms">
            We may modify these Terms at any time. Material changes will be communicated via email or in-app
            notification with at least 14 days&apos; notice. Continued use of the Services after changes constitutes acceptance.
          </Section>

          <Section title="13. Contact">
            <p>Godrop Technologies Ltd</p>
            <p>Lagos, Nigeria</p>
            <p>Email: legal@godrop.ng</p>
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
