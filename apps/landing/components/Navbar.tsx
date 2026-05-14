"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const navLinks = [
  { label: "For Vendors", href: "/vendors" },
  { label: "For Riders", href: "/riders" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-[58px] backdrop-blur-md border-b border-white/5 transition-colors duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(6,6,6,0.95)" : "rgba(6,6,6,0.5)",
      }}
      initial={{ y: -58, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex items-center h-full px-8">
        {/* Logo */}
        <motion.div whileHover={{ opacity: 0.85 }} transition={{ duration: 0.15 }}>
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo/godrop-mark.svg"
              alt="Godrop"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-white font-bold text-lg tracking-tight">GoDrop</span>
          </Link>
        </motion.div>

        {/* Desktop links — absolute center */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {navLinks.map(({ label, href }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}>
              <Link
                href={href}
                className="text-white/80 text-sm hover:text-white transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="hidden md:flex ml-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.a
            href="https://godrop-dashboard.vercel.app/login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-5 py-2 rounded-full text-white text-sm font-semibold whitespace-nowrap"
            style={{ backgroundColor: "#1E5FFF" }}
            whileHover={{ backgroundColor: "#FF6A2C", scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Login
          </motion.a>
        </motion.div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            className="absolute top-[58px] left-0 right-0 bg-[#0d0d0d] border-b border-white/10 flex flex-col p-6 gap-5 md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map(({ label, href }) => (
              <Link key={label} href={href} className="text-white/80 text-sm" onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            <a href="https://godrop-dashboard.vercel.app/login" target="_blank" rel="noopener noreferrer" className="text-sm text-white font-semibold rounded-full px-5 py-2 text-center" style={{ backgroundColor: "#1E5FFF" }}>Login</a>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
