"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, fadeIn, staggerContainer, inViewProps } from "@/lib/animations";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "For Vendors", href: "/vendors" },
  { label: "For Riders", href: "/riders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Community Guidelines", href: "/community-guidelines" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const socialIcons = [
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Twitter",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-white/10 relative">
      {/* Main content — sits above watermark via z-10 */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16">

        {/* Top row: nav + social left | store badges right */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">

          {/* Nav links + social */}
          <motion.nav
            className="flex flex-col gap-3"
            variants={staggerContainer(0.07)}
            {...inViewProps}
          >
            {navLinks.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                variants={fadeUp}
                className="text-white/70 text-sm hover:text-white transition-colors w-fit"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.a>
            ))}

            <motion.div variants={fadeIn} className="flex gap-3 mt-4">
              {socialIcons.map(({ label, path }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-white/40 hover:text-white transition-colors"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d={path} />
                  </svg>
                </motion.a>
              ))}
            </motion.div>
          </motion.nav>

          {/* Store badges */}
          <motion.div
            className="flex flex-col sm:flex-row md:flex-col gap-3 self-start"
            variants={staggerContainer(0.1)}
            {...inViewProps}
          >
            {/* App Store */}
            <motion.div variants={fadeUp}>
              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 border border-white/20 hover:border-white/50 rounded-xl px-4 py-2.5 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <p className="text-white/40 text-[10px] leading-none mb-0.5">Download on the</p>
                  <p className="text-white text-sm font-semibold leading-none">App Store</p>
                </div>
              </motion.a>
            </motion.div>

            {/* Google Play */}
            <motion.div variants={fadeUp}>
              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 border border-white/20 hover:border-white/50 rounded-xl px-4 py-2.5 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
                  <path d="M3.18 23.76c.31.17.67.19 1.01.04l12.94-7.33-2.79-2.8-11.16 10.09zm-1.76-20.3C1.16 3.77 1 4.15 1 4.58v14.84c0 .43.16.81.42 1.12l.06.06L9.64 12v-.2L1.48 3.4l-.06.06zM20.49 10.5L17.6 8.84l-3.09 3.1 3.09 3.1 2.93-1.66c.83-.47.83-1.46-.04-1.88zM4.19.48L17.13 7.8l-2.79 2.8L3.18.51C3.52.36 3.88.33 4.19.48z" />
                </svg>
                <div>
                  <p className="text-white/40 text-[10px] leading-none mb-0.5">Get it on</p>
                  <p className="text-white text-sm font-semibold leading-none">Google Play</p>
                </div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="border-t border-white/10 pt-5 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3 gap-x-6"
          variants={fadeIn}
          {...inViewProps}
        >
          <motion.a
            href="#"
            className="flex items-center gap-2 shrink-0"
            whileHover={{ opacity: 0.85 }}
            transition={{ duration: 0.2 }}
          >
            <Image src="/images/logo/godrop-mark.svg" alt="Godrop" width={28} height={28} className="h-7 w-7" />
            <span className="text-white font-bold text-base">GoDrop</span>
          </motion.a>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/40 text-xs">
            <span className="whitespace-nowrap">© Godrop 2026</span>
            {legalLinks.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                className="whitespace-nowrap hover:text-white/70 transition-colors"
                whileHover={{ color: "rgba(255,255,255,0.7)" }}
              >
                {label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Watermark — clipped inside its own overflow-hidden container, never overlaps bottom bar */}
      <div
        className="w-full overflow-hidden select-none pointer-events-none"
        style={{ height: "clamp(60px, 10vw, 120px)" }}
      >
        <p
          className="text-white/[0.05] font-black leading-none whitespace-nowrap text-center"
          style={{ fontSize: "min(18vw, 220px)", letterSpacing: "-0.02em" }}
        >
          GODROP
        </p>
      </div>
    </footer>
  );
}
