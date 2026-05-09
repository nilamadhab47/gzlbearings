"use client";

import { motion } from "motion/react";
import { useId } from "react";

/**
 * Animated world network map — India (Haryana) as the central HQ.
 *
 * Layers:
 *  - /world.svg basemap (dimmed graphite outline)
 *  - SVG overlay with quadratic Bézier arcs from HQ → every destination
 *  - Each arc has: faint static stroke (draws in on viewport), a glow stroke,
 *    a traveling dashed pulse and a comet head moving along the path.
 *  - Hubs have layered halos and pulse rings; HQ has a brighter, larger
 *    multi-ring radial energy field.
 */

type Hub = {
  id: string;
  label: string;
  x: number; // 0..2000
  y: number; // 0..857
  primary?: boolean;
};

// Haryana, India ≈ 28.4°N, 76.5°E mapped onto the world.svg viewBox.
const HQ: Hub = {
  id: "ind",
  label: "HARYANA · INDIA",
  x: 1418,
  y: 320,
  primary: true,
};

const DESTINATIONS: Hub[] = [
  { id: "nam", label: "NORTH AMERICA", x: 488, y: 250 },
  { id: "usw", label: "US WEST", x: 360, y: 280 },
  { id: "lat", label: "LATAM", x: 660, y: 470 },
  { id: "sam", label: "SOUTH AMERICA", x: 720, y: 600 },
  { id: "eu", label: "EUROPE", x: 1040, y: 200 },
  { id: "uk", label: "UK", x: 970, y: 175 },
  { id: "afr", label: "AFRICA", x: 1110, y: 530 },
  { id: "saf", label: "SOUTH AFRICA", x: 1130, y: 660 },
  { id: "mea", label: "MIDDLE EAST", x: 1280, y: 320 },
  { id: "sea", label: "SE ASIA", x: 1620, y: 460 },
  { id: "cn", label: "CHINA", x: 1640, y: 290 },
  { id: "jp", label: "JAPAN", x: 1780, y: 280 },
  { id: "oce", label: "OCEANIA", x: 1820, y: 620 },
];

/** Stable pseudo-random in [0,1) seeded by string. */
function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Quadratic curve from HQ outward with a vertical lift proportional to span. */
function arcPath(x1: number, y1: number, x2: number, y2: number, bend = 0.3) {
  const mx = (x1 + x2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const lift = Math.min(220, dist * bend);
  const my = Math.min(y1, y2) - lift;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

export default function WorldNetwork() {
  const uid = useId();
  const glowId = `${uid}-glow`;
  const hqGlowId = `${uid}-hqglow`;
  const lineGradId = `${uid}-line`;
  const softId = `${uid}-soft`;

  return (
    <div className="relative aspect-[2000/857] w-full border border-steel/20 overflow-hidden bg-deep-black">
      <img
        src="/world.svg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-[0.16] [filter:invert(1)_grayscale(1)_brightness(1.4)]"
      />

      {/* Soft yellow energy field under HQ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${(HQ.x / 2000) * 100}%`,
          top: `${(HQ.y / 857) * 100}%`,
          width: "38%",
          height: "85%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(244,196,0,0.22) 0%, rgba(244,196,0,0.06) 35%, transparent 65%)",
          filter: "blur(2px)",
        }}
      />

      <svg
        viewBox="0 0 2000 857"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F4C400" stopOpacity="0.0" />
            <stop offset="20%" stopColor="#F4C400" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#F4C400" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F4C400" stopOpacity="0.0" />
          </linearGradient>

          <radialGradient id={glowId}>
            <stop offset="0%" stopColor="#F4C400" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#F4C400" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F4C400" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={hqGlowId}>
            <stop offset="0%" stopColor="#FFE066" stopOpacity="1" />
            <stop offset="30%" stopColor="#F4C400" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#F4C400" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F4C400" stopOpacity="0" />
          </radialGradient>

          <filter id={softId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {DESTINATIONS.map((d, i) => {
          const r = seed(d.id);
          const path = arcPath(HQ.x, HQ.y, d.x, d.y, 0.22 + r * 0.18);
          const dur = 6 + r * 3.5; // 6.0s – 9.5s, slower & more cinematic
          const delay = (i * 0.7 + r * 1.2) % 6;

          return (
            <g key={d.id}>
              {/* Soft outer glow stroke */}
              <motion.path
                d={path}
                fill="none"
                stroke="#F4C400"
                strokeOpacity={0.18}
                strokeWidth={4}
                strokeLinecap="round"
                filter={`url(#${softId})`}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.35 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 1.6,
                  delay: i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {/* Sharp core line */}
              <motion.path
                d={path}
                fill="none"
                stroke={`url(#${lineGradId})`}
                strokeWidth={1}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.9 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 1.4,
                  delay: 0.15 + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {/* Traveling dash pulse */}
              <motion.path
                d={path}
                fill="none"
                stroke="#FFE066"
                strokeWidth={1.6}
                strokeOpacity={0.95}
                strokeLinecap="round"
                initial={{
                  strokeDasharray: "26 700",
                  strokeDashoffset: 700,
                }}
                animate={{ strokeDashoffset: [700, -120] }}
                transition={{
                  duration: dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />

              {/* Comet head */}
              <circle
                r={3.2}
                fill="#FFE680"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(244,196,0,0.95))",
                }}
              >
                <animateMotion
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                  begin={`${delay}s`}
                  rotate="auto"
                  path={path}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.08;0.9;1"
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                  begin={`${delay}s`}
                />
              </circle>

              {/* Trailing micro-particle */}
              <circle r={1.6} fill="#F4C400" opacity={0.7}>
                <animateMotion
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                  begin={`${delay + 0.18}s`}
                  path={path}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.7;0.7;0"
                  keyTimes="0;0.1;0.85;1"
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                  begin={`${delay + 0.18}s`}
                />
              </circle>
            </g>
          );
        })}

        {/* Destination hubs */}
        {DESTINATIONS.map((h, i) => {
          const r = 3.5;
          return (
            <g key={h.id} transform={`translate(${h.x} ${h.y})`}>
              <circle r={r * 5} fill={`url(#${glowId})`} />
              <motion.circle
                r={r}
                fill="none"
                stroke="#F4C400"
                strokeWidth={1.2}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: [1, 3.2], opacity: [0.6, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: (i % 5) * 0.4,
                }}
                style={{ transformOrigin: "center", transformBox: "fill-box" }}
              />
              <circle r={r} fill="#F4C400" />
            </g>
          );
        })}

        {/* HQ — India / Haryana */}
        <g transform={`translate(${HQ.x} ${HQ.y})`}>
          <circle r={70} fill={`url(#${hqGlowId})`} />

          {[0, 0.6, 1.2].map((d, i) => (
            <motion.circle
              key={i}
              r={9}
              fill="none"
              stroke="#F4C400"
              strokeWidth={1.4}
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: [1, 5.5], opacity: [0.85, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: d,
              }}
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            />
          ))}

          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center", transformBox: "fill-box" }}
          >
            <circle
              r={16}
              fill="none"
              stroke="#F4C400"
              strokeOpacity={0.5}
              strokeWidth={0.8}
              strokeDasharray="4 6"
            />
            <circle
              r={24}
              fill="none"
              stroke="#F4C400"
              strokeOpacity={0.25}
              strokeWidth={0.6}
              strokeDasharray="2 8"
            />
          </motion.g>

          <motion.circle
            r={9}
            fill="#FFE066"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              transformOrigin: "center",
              transformBox: "fill-box",
              filter: "drop-shadow(0 0 14px rgba(244,196,0,0.95))",
            }}
          />
          <circle r={3} fill="#0B0B0B" />

          <g transform="translate(18 5)">
            <text
              x={0}
              y={0}
              fill="#F4C400"
              style={{
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.22em",
              }}
            >
              {HQ.label}
            </text>
            <text
              x={0}
              y={14}
              fill="#ECECEC"
              fillOpacity={0.55}
              style={{
                fontSize: 9,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                letterSpacing: "0.3em",
              }}
            >
              GLOBAL HQ · MFG · LOGISTICS
            </text>
          </g>
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(11,11,11,0.7)_100%)]" />
    </div>
  );
}
