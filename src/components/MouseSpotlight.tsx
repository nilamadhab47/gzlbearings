"use client";

import { useEffect, useRef } from "react";

/**
 * Soft yellow spotlight that follows the cursor across the whole viewport.
 * Pointer-events-none, hidden on touch devices and when prefers-reduced-motion.
 *
 * Uses requestAnimationFrame + lerp for buttery movement without re-rendering React.
 */
export default function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on touch / reduced-motion
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isTouch || reduced) return;

    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { ...target };
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target = { x: e.clientX, y: e.clientY };
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      el.style.transform = `translate3d(${pos.x - 300}px, ${pos.y - 300}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      <div
        ref={ref}
        className="absolute top-0 left-0 w-[600px] h-[600px] opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(244,196,0,0.10) 0%, rgba(244,196,0,0.04) 35%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
