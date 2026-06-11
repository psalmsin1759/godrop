"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Wraps a child so it gently follows the cursor while hovered. */
export default function Magnetic({
  children,
  strength = 0.25,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
