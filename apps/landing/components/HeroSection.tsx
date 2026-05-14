"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const slides = [
  {
    image: "/images/delivery-collage.png",
    badge: null,
    heading: "GODROP",
    sub: "Nigeria's On-Demand Delivery Platform",
    align: "center" as const,
    kenBurns: "scale-[1.08] translate-x-0 translate-y-0",
  },
  {
    image: "/images/delivery-collage.png",
    badge: "🍔  FOOD DELIVERY",
    heading: "Hot Meals,\nFast Drops",
    sub: "Restaurant favourites at your doorstep in minutes",
    align: "left" as const,
    kenBurns: "scale-[1.3] translate-x-[-8%]",
  },
  {
    image: "/images/delivery-collage.png",
    badge: "🛒  GROCERY DELIVERY",
    heading: "Fresh Picks,\nDelivered",
    sub: "Markets & supermarkets, straight to your kitchen",
    align: "left" as const,
    kenBurns: "scale-[1.4] translate-x-[4%] translate-y-[4%]",
  },
  {
    image: "/images/delivery-hero.png",
    badge: "📦  PARCEL & RETAIL",
    heading: "Any Package.\nAnywhere.",
    sub: "From small parcels to large retail orders",
    align: "left" as const,
    kenBurns: "scale-[1.2] translate-x-[6%]",
  },
  {
    image: "/images/delivery-collage.png",
    badge: "🚛  TRUCK BOOKING",
    heading: "Move Homes.\nMove Offices.",
    sub: "Book a truck for relocation across Lagos & beyond",
    align: "left" as const,
    kenBurns: "scale-[1.35] translate-x-[10%] translate-y-[8%]",
  },
  {
    image: "/images/delivery-hero.png",
    badge: null,
    heading: "Lagos Runs on\nGodrop",
    sub: "Food  •  Groceries  •  Parcels  •  Retail  •  Trucks",
    align: "center" as const,
    kenBurns: "scale-[1.15] translate-x-[3%]",
  },
];

const SLIDE_DURATION = 4000; // ms

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-advance slides
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  // GSAP parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          y: window.scrollY * 0.25,
          ease: "none",
          duration: 0,
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const slide = slides[current];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* Background image with Ken Burns per slide */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div
            className={`w-full h-full bg-cover bg-center transition-transform duration-[6000ms] ease-out ${slide.kenBurns}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(6,6,6,0.95) 0%, rgba(6,6,6,0.45) 50%, rgba(6,6,6,0.55) 100%)",
        }}
      />

      {/* Slide text */}
      <div
        className={`absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-16 z-10 ${
          slide.align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.75, ease }}
            className="max-w-2xl"
          >
            {/* Badge */}
            {slide.badge && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.1 }}
                className="inline-block bg-[#FF6A2C] text-white text-xs md:text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              >
                {slide.badge}
              </motion.div>
            )}

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-white font-black leading-[1.0] mb-4 whitespace-pre-line"
              style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)", letterSpacing: "-1.5px" }}
            >
              {slide.heading}
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.32 }}
              className="text-white/70 font-light leading-relaxed"
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.25rem)" }}
            >
              {slide.sub}
            </motion.p>

            {/* CTA buttons on last slide */}
            {current === slides.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: 0.5 }}
                className={`flex flex-wrap gap-3 mt-8 ${slide.align === "center" ? "justify-center" : ""}`}
              >
                <a
                  href="#download"
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1E5FFF" }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </a>
                <a
                  href="#download"
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#FF6A2C" }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                    <path d="M3.18 23.76c.31.17.67.19 1.01.04l12.94-7.33-2.79-2.8-11.16 10.09zm-1.76-20.3C1.16 3.77 1 4.15 1 4.58v14.84c0 .43.16.81.42 1.12l.06.06L9.64 12v-.2L1.48 3.4l-.06.06zM20.49 10.5L17.6 8.84l-3.09 3.1 3.09 3.1 2.93-1.66c.83-.47.83-1.46-.04-1.88zM4.19.48L17.13 7.8l-2.79 2.8L3.18.51C3.52.36 3.88.33 4.19.48z" />
                  </svg>
                  Google Play
                </a>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Slide dots */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/30"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#060606] to-transparent pointer-events-none z-10" />
    </section>
  );
}
