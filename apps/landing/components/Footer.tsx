import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Business", href: "/business" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Become a vendor", href: "/vendors" },
      { label: "Ride with us", href: "/riders" },
      { label: "Vendor onboarding", href: "/vendors/onboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms-of-service" },
      { label: "Community guidelines", href: "/community-guidelines" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/naijagodrop",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Twitter",
    href: "https://x.com/naijagodrop",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-white">
      <div className="mx-auto w-full max-w-[1500px] px-6 pt-20 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 gap-10 pb-20 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand / contact */}
          <div className="col-span-2 md:col-span-1">
            <p className="display text-2xl">godrop</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Nigeria&apos;s everyday logistics super-app.
            </p>
            <a
              href="mailto:hello@naijagodrop.com"
              className="mono-label mt-6 inline-block text-white/65 transition-colors duration-200 hover:text-accent"
            >
              hello@naijagodrop.com
            </a>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mono-label mb-5 text-white/45">{col.title}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-7 sm:flex-row sm:items-center">
          <p className="mono-label text-white/40">
            © {new Date().getFullYear()} Godrop Technologies Ltd
          </p>
          <p className="mono-label text-white/40">Nigeria</p>
        </div>
      </div>

      {/* Oversized clipped wordmark */}
      <div aria-hidden="true" className="relative select-none overflow-hidden leading-none">
        <p className="display -mb-[4.5vw] whitespace-nowrap text-center text-[18.5vw] uppercase leading-[0.95] text-white/[0.07]">
          godrop
        </p>
      </div>
    </footer>
  );
}
