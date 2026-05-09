/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowForward,
  ChevronRight,
  ArrowOutward,
  Public,
  Verified,
  Factory,
  PrecisionManufacturing,
  Engineering,
} from "./components/Icons";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import { useEnquiry } from "./components/EnquiryModal";
import Magnetic from "./components/Magnetic";
import WorldNetwork from "./components/WorldNetwork";

// 3D bearing — client-only, no SSR (uses canvas/WebGL).
// Lazy-loaded; mounted only after first paint via DeferredBearing wrapper below.
const BearingHero = dynamic(() => import("./components/BearingHero"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white-smoke/30 text-[10px] tracking-[0.25em] uppercase">
      Loading geometry…
    </div>
  ),
});

/**
 * Defers WebGL Canvas mount until the browser is idle so the LCP element
 * (headline) wins the paint race. Falls back to setTimeout when
 * requestIdleCallback isn't available (Safari).
 */
function DeferredBearing() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
    let cancelled = false;
    const trigger = () => {
      if (!cancelled) setShow(true);
    };

    // Wait until the page has fully loaded AND the browser is idle.
    // This keeps the heavy three.js + drei chunk out of the
    // Lighthouse audit's "blocking" window entirely.
    const onLoad = () => {
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(trigger, { timeout: 4000 });
      } else {
        window.setTimeout(trigger, 2000);
      }
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);
  if (!show) {
    return <BearingPlaceholder />;
  }
  return <BearingHero />;
}

/**
 * Lightweight CSS-only placeholder shown while the WebGL Canvas
 * is deferred. ~0 cost, hints at the bearing geometry, and gives
 * the page a polished "loading" feel rather than a black square.
 */
function BearingPlaceholder() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative aspect-square w-[78%] rounded-full border border-steel/25"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(244,196,0,0.05), transparent 55%)",
        }}
      >
        {/* outer ring tick marks (suggest ball bearings) */}
        <div className="absolute inset-0 animate-[spin_14s_linear_infinite]">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-white-smoke/30"
                style={{
                  transform: `rotate(${angle}deg) translateY(-46%) translateX(-50%)`,
                  transformOrigin: "0 0",
                }}
              />
            );
          })}
        </div>
        {/* inner ring */}
        <div className="absolute inset-[22%] rounded-full border border-steel/20" />
        {/* center hub */}
        <div className="absolute inset-[40%] rounded-full bg-graphite/60 border border-industrial-yellow/40" />
        {/* sweeping highlight */}
        <div
          className="absolute inset-0 rounded-full animate-[spin_3.5s_linear_infinite] pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(244,196,0,0.35) 350deg, transparent 360deg)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 38%, black 39%, black 50%, transparent 51%)",
            mask: "radial-gradient(circle at 50% 50%, transparent 38%, black 39%, black 50%, transparent 51%)",
          }}
        />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-white-smoke/30">
        Loading geometry
      </div>
    </div>
  );
}

const IMAGES = {
  spherical:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwUqSSUjZ3z1imOpmCMsdsWu2ChLseUUKYobkgrC_wcC15JcR5_lhsEl7UyfRzkUweHiOUOLtywkKOVJ8J9tKqgRB2FQ3W4qNm8yA6Wzvq15PWOdjiAj8i8Wn0TGLfYpUWU-lJM8PIqqaOjh9lVNhMNnl590gb1fJK59ty85l4xmz8r6zuJgEqEFS_Gv1sslwaUfA0BeEQjA6gywwbn72lILgmnKadbIcxoxA8AC7baGjpig4zVkjXnd5mV0eJn8XZWmfC-BVMiA",
  cylindrical:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCoPsW7IoqZqvfqBwmJh0p1zP1V1pwJx1bx7cl1toSlh6NVeqbqtobvGzJgpdy0I_CFBfzx8TeAIsQt16BpNb6CCnfHZ3QFjNte6AGU62zYQGzRosMRp41XiNWZCMCsPSe_QBztp9HCu2PlCwaBWXVihBhYJ16McxizPuqNvFxrzpHrPJ7P4tZJPqZUHr46UXg30Crrb3DowvEkKYoF0dyREOodqY3qK_J8_-kvOTquLURU2WxUVVEElT8fMm6dEQGa8y87ZBpyJg",
  tapered:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkfhZmgJqJ0gO-GN76x-ywhzLv0ys8cQt6EPNAHyqrOOG6diZEZexMEk1cw1aWQ05M3PGfqqB9UMDMWMNzMMxpjB3BwbxTAYRdWWYfXskpQjuJpL2GJgJ3a1vedYrFg2BEcc-KFwNdffJXTdROC5g5ZsdWyw7Hoj9zfWl6CB2qWvlH37YOjFGRsoS8eYZIua3P2ZebxPbQqWpnxiI5sn6rU7X6sJJo-X1MdQD-k6Mtmkh2hX7lRcbFo7wosyxuirMlmb6A9PzPcg",
  map: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1kMpKvBD4mF4lhl1dh1Wx1v4qxJfQwrVgS-LuAPMpbjwqjGe1m9cA1I6ci7aM5T1tu8WdqRY6MmXJwBbfx54RvinqbjSSY6FNfM8T8TC5rPLg5LO3Ij0k4Xg4zQqm-6Tly7WzdhXd6qkwbZEYcPGS8yL4f2zjhGWmG7uvX69HLqRa-89gqv-zFVsMSlpnQ8-S7qk-Y-BmfTApX0gklHD1xJ2KLKUjVieQeqrMz7f9PAWLzW-0-7OC_l3wZUDP09475DQfCIZBpw",
};

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <IndustryStrip />
        <ProductShowcase />
        <ProcessSection />
        <ValuesSection />
        <NetworkSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  REUSABLE: scroll-reveal wrapper                                            */
/* -------------------------------------------------------------------------- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  HERO — 2-col with vertical 3D bearing, parallax on scroll                  */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  const enquiry = useEnquiry();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const yBearing = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section
      ref={ref}
      className="relative min-h-[80vh] md:min-h-[88vh] lg:min-h-[92vh] flex items-center overflow-hidden pt-[72px]"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(244,196,0,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-black" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <motion.div
            style={{ y: yCopy, opacity: opacityFade }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6 md:mb-8 text-[10px] sm:text-[11px] tracking-[0.25em] text-industrial-yellow/90"
            >
              <span className="w-6 sm:w-8 h-px bg-industrial-yellow/60" />
              PRECISION ENGINEERING
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="font-display text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl 3xl:text-[6rem] uppercase leading-[0.95] tracking-tight mb-6 md:mb-8"
            >
              Turning Trust
              <br />
              <span className="text-industrial-yellow">Into Motion.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-white-smoke/60 max-w-xl mb-8 md:mb-12 leading-relaxed"
            >
              Engineering authority in precision bearings. Tight tolerances,
              rigorous quality control, and a global supply network built for
              the world&apos;s most demanding environments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Magnetic strength={10}>
                <button
                  type="button"
                  onClick={() => enquiry.open({ topic: "Quote" })}
                  className="group bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 sm:px-8 flex items-center justify-center sm:justify-start gap-3 hover:bg-white-smoke transition-colors w-full sm:w-auto"
                >
                  Request a Quote
                  <ArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Magnetic>

              <Magnetic strength={8}>
                <Link
                  href="/products"
                  className="border border-steel/50 text-white-smoke text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 sm:px-8 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors text-center inline-flex items-center justify-center w-full sm:w-auto"
                >
                  Explore Products
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>

          {/* 3D bearing */}
          <motion.div
            style={{ y: yBearing }}
            className="lg:col-span-6 relative order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
              className="relative aspect-square w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[600px] mx-auto"
            >
              <CornerCrosshair className="top-0 left-0" />
              <CornerCrosshair className="top-0 right-0 rotate-90" />
              <CornerCrosshair className="bottom-0 left-0 -rotate-90" />
              <CornerCrosshair className="bottom-0 right-0 rotate-180" />

              <DeferredBearing />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CornerCrosshair({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute w-8 h-8 ${className}`}>
      <span className="absolute top-0 left-0 w-3 h-px bg-industrial-yellow/60" />
      <span className="absolute top-0 left-0 w-px h-3 bg-industrial-yellow/60" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  INDUSTRY STRIP — replaces certification chips                              */
/* -------------------------------------------------------------------------- */
function IndustryStrip() {
  const items = [
    "Aerospace",
    "Automotive",
    "Wind Energy",
    "Heavy Mining",
    "Rail & Transit",
    "Marine",
    "Agriculture",
    "Industrial Robotics",
  ];
  return (
    <section className="border-y border-steel/15 bg-graphite/30 py-6 sm:py-8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-10 flex items-center gap-6 md:gap-10">
        <div className="hidden md:block text-[10px] tracking-[0.25em] text-white-smoke/40 shrink-0">
          INDUSTRIES SERVED
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 sm:gap-12 whitespace-nowrap"
          >
            {[...items, ...items].map((item, i) => (
              <span
                key={i}
                className="text-[12px] sm:text-[14px] tracking-[0.2em] text-white-smoke/45 uppercase font-medium"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PRODUCT SHOWCASE — clean, no spec numbers                                  */
/* -------------------------------------------------------------------------- */
function ProductShowcase() {
  const products = [
    {
      title: "Spherical Roller Bearings",
      desc: "Self-aligning design that accommodates heavy radial loads and shaft misalignment in continuous-duty industrial applications.",
      img: IMAGES.spherical,
      use: "Heavy industry, mining, paper mills",
    },
    {
      title: "Cylindrical Roller Bearings",
      desc: "High radial load capacity with a separable design suited to high-speed applications requiring strict rotational rigidity.",
      img: IMAGES.cylindrical,
      use: "Gearboxes, electric motors, machine tools",
    },
    {
      title: "Tapered Roller Bearings",
      desc: "Optimised for combined radial and axial loads in heavy machinery, gearboxes and automotive driveline applications.",
      img: IMAGES.tapered,
      use: "Automotive, heavy vehicles, industrial drives",
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-28 px-5 sm:px-6 md:px-10 max-w-[1440px] 3xl:max-w-site-xl mx-auto">
      <Reveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-3 md:mb-4">
              PRODUCTS
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-3">
              Precision Categories
            </h2>
            <p className="text-white-smoke/55 text-sm sm:text-base leading-relaxed">
              Engineered for specific load profiles, speed envelopes and
              operating environments.
            </p>
          </div>

          <a
            href="/products"
            className="flex items-center gap-2 text-white-smoke/80 hover:text-industrial-yellow text-[12px] tracking-[0.2em] uppercase transition-colors group"
          >
            All Products
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-steel/15">
        {products.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group bg-graphite hover:bg-[#1f1f1f] transition-colors"
          >
            <div className="aspect-[4/3] bg-deep-black overflow-hidden relative">
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
              />
            </div>

            <div className="p-6 sm:p-7 md:p-8">
              <h3 className="text-xl sm:text-2xl text-white-smoke mb-3 leading-tight">
                {p.title}
              </h3>
              <p className="text-white-smoke/55 text-sm leading-relaxed mb-6">
                {p.desc}
              </p>

              <div className="py-4 border-y border-steel/15 mb-6">
                <div className="text-[10px] tracking-[0.2em] text-white-smoke/35 uppercase mb-1">
                  Typical Applications
                </div>
                <div className="text-[13px] text-white-smoke/80">{p.use}</div>
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-industrial-yellow hover:text-white-smoke transition-colors text-[12px] tracking-[0.18em] uppercase font-semibold"
              >
                Learn More
                <ArrowOutward className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PROCESS SECTION — scroll-driven SVG line drawing                           */
/* -------------------------------------------------------------------------- */
function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  // SVG path length is animated 0 → 1 as user scrolls
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
    {
      title: "Specification",
      desc: "Application engineers translate operating loads, speeds and environment into a precise bearing specification.",
    },
    {
      title: "Material Selection",
      desc: "Steel grade, heat treatment and lubrication strategy are chosen to match the duty cycle and lifetime targets.",
    },
    {
      title: "Manufacturing",
      desc: "Tightly toleranced grinding, turning and finishing operations on calibrated machinery deliver true running surfaces.",
    },
    {
      title: "Quality & Delivery",
      desc: "Each batch is inspected, traced and dispatched from the nearest hub to minimise downtime in the field.",
    },
  ];

  return (
    <section className="border-y border-steel/15 bg-graphite/15 py-16 md:py-24 lg:py-28">
      <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10">
        <Reveal>
          <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-3 md:mb-4">
            HOW WE WORK
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-3 max-w-2xl">
            From specification to spindle.
          </h2>
          <p className="text-white-smoke/55 text-sm sm:text-base max-w-xl mb-12 md:mb-16 lg:mb-20 leading-relaxed">
            A disciplined four-stage process that turns engineering
            requirements into reliable rotational performance.
          </p>
        </Reveal>

        <div ref={ref} className="relative">
          {/* SVG line that draws on scroll — desktop only */}
          <svg
            className="absolute left-1/2 -translate-x-1/2 top-0 h-full hidden md:block pointer-events-none"
            width="2"
            viewBox="0 0 2 1000"
            preserveAspectRatio="none"
          >
            {/* faint base line */}
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="1000"
              stroke="#3a3939"
              strokeWidth="1"
            />
            {/* animated yellow line */}
            <motion.line
              x1="1"
              y1="0"
              x2="1"
              y2="1000"
              stroke="#F4C400"
              strokeWidth="2"
              style={{ pathLength }}
            />
          </svg>

          <ol className="space-y-12 sm:space-y-16 md:space-y-24 lg:space-y-28">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative md:grid md:grid-cols-2 md:gap-12 lg:gap-16 items-center"
                >
                  {/* node dot */}
                  <span className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-3 h-3 bg-industrial-yellow border-[3px] border-deep-black" />

                  <div className={isLeft ? "md:pr-12 lg:pr-16 md:text-right" : "md:order-2 md:pl-12 lg:pl-16"}>
                    <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-2 md:mb-3">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight mb-3 md:mb-4">
                      {step.title}
                    </h3>
                    <p className="text-white-smoke/55 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <div className="hidden md:block" />
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  VALUES — restrained, no specific stat numbers                              */
/* -------------------------------------------------------------------------- */
function ValuesSection() {
  const values = [
    {
      icon: PrecisionManufacturing,
      title: "Precision Engineered",
      desc: "Every component is mathematically verified for flawless rotational dynamics, with tight tolerances enforced at each stage of manufacture.",
    },
    {
      icon: Public,
      title: "Globally Distributed",
      desc: "Strategic inventory hubs across multiple continents ensure rapid deployment of critical components to minimise costly downtime.",
    },
    {
      icon: Verified,
      title: "Performance Guaranteed",
      desc: "Rigorously stress-tested in simulated extreme environments and backed by a comprehensive engineering warranty.",
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-28 px-5 sm:px-6 md:px-10 max-w-[1440px] 3xl:max-w-site-xl mx-auto">
      <Reveal>
        <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-3 md:mb-4">
          STANDARDS
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-10 md:mb-14 lg:mb-16 max-w-2xl">
          Built on engineering discipline.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-steel/15">
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-deep-black p-8 sm:p-10"
          >
            <v.icon className="w-7 h-7 text-industrial-yellow mb-6 sm:mb-8" />
            <h4 className="text-lg text-white-smoke mb-3 font-medium">
              {v.title}
            </h4>
            <p className="text-white-smoke/55 text-sm leading-relaxed">
              {v.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  NETWORK MAP — calmer, generic stat copy                                    */
/* -------------------------------------------------------------------------- */
function NetworkSection() {
  return (
    <section className="border-y border-steel/15 bg-graphite/20 py-16 md:py-24 lg:py-28">
      <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-10 md:mb-14 lg:mb-16 items-end">
            <div>
              <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-3 md:mb-4">
                NETWORK
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight">
                Strategic Global Hubs
              </h2>
            </div>
            <p className="text-white-smoke/55 text-sm sm:text-base leading-relaxed max-w-md">
              An interconnected supply chain spanning multiple continents,
              built around engineered logistics for mission-critical
              components.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <WorldNetwork />
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-steel/15 mt-8 md:mt-12">
          {[
            { v: "Global", l: "Distribution reach" },
            { v: "Multi-hub", l: "Inventory network" },
            { v: "Engineered", l: "To customer spec" },
            { v: "24 / 7", l: "Engineering support" },
          ].map((s, i) => (
            <div key={i} className="bg-deep-black p-6 sm:p-8">
              <div className="font-display text-2xl sm:text-3xl md:text-4xl text-white-smoke mb-2">
                {s.v}
              </div>
              <div className="text-[10px] tracking-[0.2em] text-white-smoke/40 uppercase">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA BANNER                                                                 */
/* -------------------------------------------------------------------------- */
function CtaBanner() {
  const enquiry = useEnquiry();
  return (
    <section className="py-16 md:py-24 lg:py-28 px-5 sm:px-6 md:px-10">
      <Reveal>
        <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto border border-steel/20 bg-gradient-to-br from-graphite to-deep-black p-8 sm:p-10 md:p-14 lg:p-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-3 md:mb-4">
                READY TO ENGINEER
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight leading-[0.95]">
                Spec your next
                <br />
                <span className="text-industrial-yellow">heavy-duty project.</span>
              </h2>
            </div>
            <div className="md:pl-8 md:border-l border-steel/15">
              <p className="text-white-smoke/55 text-sm sm:text-base mb-6 md:mb-8 leading-relaxed">
                Partner with our application engineers to specify the exact
                bearing configuration for your operating envelope.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => enquiry.open({ topic: "Engineering" })}
                  className="bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 sm:px-8 hover:bg-white-smoke transition-colors"
                >
                  Contact Engineering
                </button>
                <button
                  type="button"
                  onClick={() => enquiry.open({ topic: "Quote" })}
                  className="border border-steel/50 text-white-smoke text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 sm:px-8 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors"
                >
                  Request a Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

