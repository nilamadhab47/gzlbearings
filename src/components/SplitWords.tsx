"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  text: string;
  className?: string;
  highlight?: string; // word(s) to color in industrial-yellow
  delay?: number;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  children?: ReactNode;
};

const container: Variants = {
  hidden: {},
  visible: (delay: number = 0) => ({
    transition: {
      staggerChildren: 0.06,
      delayChildren: delay,
    },
  }),
};

const word: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Animates words sliding up from below a clip mask. Use for hero headlines.
 * If `highlight` is provided, those exact words are colored industrial-yellow.
 */
export default function SplitWords({
  text,
  className,
  highlight,
  delay = 0,
  as: Tag = "h1",
}: Props) {
  const words = text.split(" ");
  const highlightSet = new Set(
    (highlight || "")
      .split(" ")
      .map((w) => w.toLowerCase())
      .filter(Boolean),
  );

  const MotionTag = motion[Tag] as typeof motion.h1;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
      custom={delay}
    >
      {words.map((w, i) => {
        const clean = w.replace(/[.,!?;:]/g, "").toLowerCase();
        const isHi = highlightSet.has(clean);
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: "0.08em", marginRight: "0.25em" }}
          >
            <motion.span
              variants={word}
              className={`inline-block ${isHi ? "text-industrial-yellow" : ""}`}
            >
              {w}
            </motion.span>
          </span>
        );
      })}
    </MotionTag>
  );
}
