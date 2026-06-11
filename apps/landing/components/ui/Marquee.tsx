"use client";

import type { CSSProperties, ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
};

export default function Marquee({
  children,
  duration = 30,
  reverse = false,
  className = "",
}: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max animate-marquee ${reverse ? "reverse" : ""}`}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
