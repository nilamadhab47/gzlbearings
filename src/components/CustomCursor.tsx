"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Custom cursor: a small yellow dot + a larger outlined ring that lags slightly.
 * - Ring scales up and fills with low-opacity yellow when hovering interactive elements
 *   (a, button, [role="button"], input, textarea, select, [data-cursor="hover"]).
 * - Hidden on touch devices and when prefers-reduced-motion is set.
 * - Native cursor is hidden via a class added to <html> while active.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Dot follows raw mouse position (instant)
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Ring follows with a spring (smooth lag)
  const ringXSpring = useSpring(dotX, {
    stiffness: 350,
    damping: 30,
    mass: 0.4,
  });
  const ringYSpring = useSpring(dotY, {
    stiffness: 350,
    damping: 30,
    mass: 0.4,
  });

  // Track whether we should show the cursor at all
  const visible = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isTouch || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const handleMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible.current) {
        visible.current = true;
      }
    };

    const handleLeave = () => {
      visible.current = false;
      dotX.set(-100);
      dotY.set(-100);
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]';

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(interactiveSelector)) {
        setHovering(true);
      }
    };
    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const related = e.relatedTarget as HTMLElement | null;
      if (!target) return;
      if (
        target.closest(interactiveSelector) &&
        !(related && related.closest && related.closest(interactiveSelector))
      ) {
        setHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring — springs, scales on hover/press */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] mix-blend-difference"
        style={{
          x: ringXSpring,
          y: ringYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: pressed ? 0.85 : hovering ? 2.4 : 1,
            borderColor: hovering
              ? "rgba(244, 196, 0, 1)"
              : "rgba(255, 255, 255, 0.8)",
            backgroundColor: hovering
              ? "rgba(244, 196, 0, 0.12)"
              : "rgba(244, 196, 0, 0)",
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            borderWidth: 1.5,
            borderStyle: "solid",
          }}
        />
      </motion.div>

      {/* Inner dot — instant, brand yellow */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: hovering ? 0 : pressed ? 0.6 : 1,
            opacity: hovering ? 0 : 1,
          }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#F4C400",
            boxShadow: "0 0 12px rgba(244, 196, 0, 0.6)",
          }}
        />
      </motion.div>
    </>
  );
}
