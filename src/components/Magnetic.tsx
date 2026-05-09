"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";

type MagneticProps = HTMLMotionProps<"div"> & {
  /** Max pixel pull toward the cursor. Default 8 (subtle, enterprise-feeling). */
  strength?: number;
  children: React.ReactNode;
};

/**
 * Subtle magnetic hover wrapper. Children are pulled toward the cursor with a
 * spring while hovered. No-ops on touch devices.
 *
 * Wrap a button/link/card:
 *   <Magnetic><button …/></Magnetic>
 */
export default function Magnetic({
  strength = 8,
  children,
  className = "",
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // clamp to strength
    const max = Math.max(r.width, r.height) / 2;
    x.set((dx / max) * strength);
    y.set((dy / max) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
