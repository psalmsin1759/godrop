"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const navLinks = [
  { label: "Vendors", href: "/vendors" },
  { label: "Riders", href: "/riders" },
  { label: "Business", href: "/business" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the overlay menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 h-[58px] transition-colors duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(10,10,11,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
        initial={{ y: -58 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <nav className="mx-auto flex h-full w-full max-w-[1500px] items-center px-6 sm:px-10 lg:px-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo/godrop-mark.svg"
              alt="Godrop"
              width={28}
              height={28}
              className="h-7 w-7"
              loading="eager"
            />
            <span className="display text-lg text-white">godrop</span>
          </Link>

          {/* Desktop links */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="mono-label whitespace-nowrap text-white/65 transition-colors duration-200 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="ml-auto hidden items-center gap-6 md:flex">
            <a
              href="https://dashboard.naijagodrop.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label text-white/65 transition-colors duration-200 hover:text-white"
            >
              Login
            </a>
            <a
              href="#download"
              className="flex h-9 items-center rounded-full bg-accent px-5 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-accent-light"
            >
              Get the app
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="ml-auto flex h-10 w-10 cursor-pointer items-center justify-center text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 8h18M3 16h18" />}
            </svg>
          </button>
        </nav>
      </motion.header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] flex flex-col justify-end bg-ink px-6 pb-12 pt-24 md:hidden"
          >
            <nav className="flex flex-col">
              {navLinks.map(({ label, href }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.08 + i * 0.06 }}
                  className="border-b border-white/10"
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="display block py-5 text-4xl text-white transition-colors duration-200 hover:text-accent"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
              className="mt-10 flex flex-col gap-3"
            >
              <a
                href="#download"
                onClick={() => setMenuOpen(false)}
                className="flex h-[54px] items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white"
              >
                Get the app
              </a>
              <a
                href="https://dashboard.naijagodrop.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[54px] items-center justify-center rounded-full border border-white/25 text-[15px] font-bold text-white"
              >
                Login
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
