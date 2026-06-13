import { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Godrop",
  description: "Choose a new password for your Godrop account.",
};

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <section className="grain relative overflow-hidden bg-ink">
        <div
          className="pointer-events-none absolute -top-40 right-[-15%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,106,44,0.14) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto w-full max-w-xl px-6 py-24 sm:px-10">
          <div className="mb-16">
            <p className="mono-label mb-8 text-accent">Account security</p>
            <h1 className="display text-[clamp(2.6rem,6vw,4.5rem)] text-white">
              Set a new <span className="serif-accent text-accent">password.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/60">
              Choose a strong new password for your Godrop account.
            </p>
          </div>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
