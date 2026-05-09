"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  showWordmark?: boolean;
  className?: string;
};

const SIZES: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

/**
 * Brand logo. Drop the master image at: public/logo.png
 * (the yellow GLZ™ wordmark on yellow background).
 *
 * Falls back to a typographic mark if the image is missing.
 */
export default function Logo({
  size = "md",
  href = "/",
  showWordmark = true,
  className = "",
}: LogoProps) {
  const h = SIZES[size];
  const [errored, setErrored] = useState(false);

  const mark = errored ? (
    <span
      className="inline-flex items-center justify-center bg-industrial-yellow font-display text-deep-black"
      style={{ height: h, width: h, fontSize: h * 0.42, lineHeight: 1 }}
    >
      GLZ
    </span>
  ) : (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: h, width: h }}
    >
      <Image
        src="/logo.png"
        alt="GLZ Bearings"
        fill
        priority
        sizes={`${h}px`}
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </span>
  );

  const inner = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {mark}
      {showWordmark && (
        <span className="font-display text-xl tracking-[0.18em] text-white-smoke hidden sm:inline-block">
          BEARINGS
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link
      href={href}
      aria-label="GLZ Bearings — home"
      className="inline-flex items-center"
    >
      {inner}
    </Link>
  );
}
