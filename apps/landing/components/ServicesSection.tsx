"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, inViewProps } from "@/lib/animations";

const SERVICES = [
  {
    id: "food",
    accent: "#FF6A2C",
    icon: "🍔",
    title: "Food Delivery",
    desc: "Your favourite restaurants, delivered hot and fast.",
    features: ["30-min average delivery", "1,200+ restaurant partners", "Real-time order tracking"],
    from: "From ₦350",
  },
  {
    id: "groceries",
    accent: "#1DB984",
    icon: "🛒",
    title: "Groceries",
    desc: "Fresh produce, household items, and essentials at your door.",
    features: ["Same-day delivery", "Partnered with major chains", "Cold-chain packaging"],
    from: "From ₦500",
  },
  {
    id: "parcels",
    accent: "#1E5FFF",
    icon: "📦",
    title: "Parcel Delivery",
    desc: "Send anything across Lagos in under an hour.",
    features: ["Door-to-door pickup", "Proof of delivery photo", "Insurance available"],
    from: "From ₦800",
  },
  {
    id: "retail",
    accent: "#FFB020",
    icon: "🛍️",
    title: "Retail",
    desc: "Shop from stores and get items delivered the same day.",
    features: ["200+ retail partners", "Pay on delivery option", "Easy returns"],
    from: "From ₦600",
  },
  {
    id: "pharma",
    accent: "#5B8EFF",
    icon: "💊",
    title: "Pharmacy",
    desc: "Medications and wellness products delivered with care.",
    features: ["Licensed pharmacies only", "Prescription verification", "Temperature-controlled"],
    from: "From ₦400",
  },
  {
    id: "trucks",
    accent: "#FF4D6D",
    icon: "🚛",
    title: "Truck Booking",
    desc: "Move homes or offices with vetted, insured operators.",
    features: ["Licensed operators only", "Load insurance included", "Hourly or per-trip pricing"],
    from: "Custom quote",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#060606] py-24 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8">

        <motion.div className="mb-16" variants={staggerContainer(0.1)} {...inViewProps}>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-16 h-px bg-white/20" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">Services</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: -1 }}
          >
            Everything delivered.
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Pick your category.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer(0.09, 0.1)}
          {...inViewProps}
        >
          {SERVICES.map((svc) => (
            <motion.div
              key={svc.id}
              variants={fadeUp}
              className="group relative rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              whileHover={{
                background: "rgba(255,255,255,0.04)",
                borderColor: `${svc.accent}30`,
                y: -4,
                transition: { duration: 0.2 },
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${svc.accent}15`, border: `1px solid ${svc.accent}25` }}
              >
                {svc.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1.5">{svc.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{svc.desc}</p>
              </div>

              <ul className="space-y-1.5">
                {svc.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/35">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: svc.accent }} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-xs font-semibold" style={{ color: svc.accent }}>{svc.from}</span>
                <span className="text-xs text-white/25 group-hover:text-white/50 transition-colors">
                  Learn more →
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
