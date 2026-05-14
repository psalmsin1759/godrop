"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const reviews = [
  { title: "One of the most helpful apps", body: "Godrop has completely changed how I run my business. Same-day delivery to all my customers without hiring a single rider.", author: "Chidinma O.", stars: 5 },
  { title: "Benefit to mind and body", body: "I order groceries every week through Godrop. The delivery is always on time and the app is really easy to use.", author: "Emeka A.", stars: 5 },
  { title: "Long overdue", body: "Lagos needed something like this. I've tried other apps but Godrop actually delivers when they say they will.", author: "Fatimah B.", stars: 5 },
  { title: "Amazing for all walks of life", body: "Used Godrop to move my stuff when I relocated. The truck booking feature is a game changer. Super affordable too.", author: "Taiwo K.", stars: 5 },
  { title: "How apps should be", body: "Clean, fast, reliable. From food to parcels, everything just works. This is how Nigerian delivery should feel.", author: "Bola A.", stars: 5 },
  { title: "Saved my business", body: "My restaurant started using Godrop for deliveries. Revenue went up 40% in the first month. Cannot recommend enough.", author: "Adeola M.", stars: 5 },
];

const tabContent: Record<string, { headline: string; description: string; features: string[] }> = {
  Food: {
    headline: "Hot meals at your door in 30 min",
    description: "Order from hundreds of restaurants, local spots, and cloud kitchens near you. Real-time tracking from kitchen to doorstep.",
    features: ["30-min average delivery", "Live order tracking", "500+ restaurant partners", "Contactless delivery"],
  },
  Groceries: {
    headline: "Fresh groceries, same-day delivery",
    description: "Shop from supermarkets, open markets, and specialty stores. Fresh produce, staples, and household essentials delivered fast.",
    features: ["Same-day delivery", "Fresh & local produce", "Bulk order support", "Scheduled delivery slots"],
  },
  Parcels: {
    headline: "Send parcels across the city instantly",
    description: "Fast, secure parcel delivery across Lagos and beyond. Package tracking, proof of delivery, and insurance coverage included.",
    features: ["Same-hour pickup", "Real-time GPS tracking", "Proof of delivery", "Insurance up to ₦500k"],
  },
  Retail: {
    headline: "Shop from any store, delivered to you",
    description: "Can't make it to the market? We'll shop for you. From fashion to electronics, we handle the errand so you don't have to.",
    features: ["Personal shopping service", "Any retail store", "Price transparency", "Photo confirmation"],
  },
  Trucks: {
    headline: "Truck bookings for moves & freight",
    description: "Moving apartments or shipping bulk freight? Book a truck in minutes. Professional drivers, padded trucks, and door-to-door service.",
    features: ["Various truck sizes", "Professional movers", "Interstate delivery", "Upfront pricing"],
  },
};

function GoldStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5" style={{ fill: "#FFB800" }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: typeof reviews[0] }) {
  return (
    <div className="shrink-0 w-72 bg-[#111111] rounded-2xl p-6 border border-white/5">
      <GoldStars count={r.stars} />
      <p className="text-white font-semibold text-sm mt-3 mb-2 leading-snug">{r.title}</p>
      <p className="text-white/50 text-sm leading-relaxed line-clamp-4">{r.body}</p>
      <p className="text-white/30 text-xs mt-4">{r.author}</p>
    </div>
  );
}

export default function ReviewsSection() {
  const [activeTab, setActiveTab] = useState("Food");
  const trackRef = useRef<HTMLDivElement>(null);
  const tabs = Object.keys(tabContent);

  const taglineRef = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(taglineRef, { once: true, margin: "-10%" });

  // Auto-scroll marquee via CSS animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Clone cards for seamless loop already handled by duplicating in JSX
  }, []);

  const content = tabContent[activeTab];

  return (
    <section className="bg-[#060606] py-16 overflow-hidden" id="individuals">
      {/* Source label */}
      <div className="max-w-7xl mx-auto px-8 mb-5">
        <p className="text-white/40 text-xs uppercase tracking-widest">App Store Reviews</p>
      </div>

      {/* Auto-scrolling marquee */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 w-max"
          style={{
            animation: "marquee 35s linear infinite",
          }}
        >
          {[...reviews, ...reviews, ...reviews].map((r, i) => (
            <ReviewCard key={i} r={r} />
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-8 mt-16">
        <motion.p
          ref={taglineRef}
          className="text-white text-2xl md:text-3xl font-semibold leading-snug max-w-2xl mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Delivery is better together. Godrop helps you get what you need and puts it right at your fingertips.
        </motion.p>

        {/* Feature tabs */}
        <div className="flex gap-3 flex-wrap mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                activeTab === tab
                  ? "bg-white text-black border-white"
                  : "text-white/70 border-white/20 hover:border-white/50 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-4"
        >
          <div>
            <h3 className="text-white text-2xl font-bold mb-3">{content.headline}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{content.description}</p>
          </div>
          <ul className="space-y-3">
            {content.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Marquee keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
