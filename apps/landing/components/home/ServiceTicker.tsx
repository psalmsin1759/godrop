import Marquee from "@/components/ui/Marquee";

const ITEMS = ["Food", "Grocery", "Retail", "Parcel", "Truck", "Pharmacy"];

export default function ServiceTicker() {
  return (
    <div className="relative z-20 mt-4 -mb-8 -rotate-2 bg-accent py-4 shadow-[0_20px_60px_rgba(255,106,44,0.35)]">
      <Marquee duration={22}>
        {ITEMS.map((item) => (
          <span key={item} className="flex items-center">
            <span className="display px-6 text-3xl uppercase text-white sm:text-4xl">
              {item}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0A0B" aria-hidden="true">
              <path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2z" />
            </svg>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
