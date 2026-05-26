"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowForward,
  ArrowOutward,
  ChevronRight,
} from "@/src/components/Icons";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import { useEnquiry } from "@/src/components/EnquiryModal";
import {
  PRODUCTS,
  CATALOGUE_PUBLIC_PATH,
  type BearingType,
  type LoadClass,
  type Product,
  type SpeedClass,
} from "@/src/lib/products";

/* -------------------------------------------------------------------------- */
/*  Local UI types                                                             */
/* -------------------------------------------------------------------------- */
type Tab = "All" | "HighSpeed" | "HeavyLoad" | "Corrosion";

const TABS: { key: Tab; label: string }[] = [
  { key: "All", label: "All Products" },
  { key: "HighSpeed", label: "High Speed" },
  { key: "HeavyLoad", label: "Heavy Load" },
  { key: "Corrosion", label: "Corrosion Resistant" },
];

const TYPE_OPTIONS: BearingType[] = ["Ball", "Roller", "Specialty"];
const LOAD_OPTIONS: LoadClass[] = ["Light", "Medium", "Heavy"];
const SPEED_OPTIONS: SpeedClass[] = ["Standard", "Medium", "High"];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <ProductsHero />
        <Catalogue />
        <ResourcesSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  HERO                                                                       */
/* -------------------------------------------------------------------------- */
function ProductsHero() {
  return (
    <section className="relative overflow-hidden border-b border-steel/15">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(244,196,0,0.05),transparent_60%)]" />
      <div className="relative max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10 py-16 sm:py-20 md:py-24 lg:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 mb-5 md:mb-6 text-[10px] sm:text-[11px] tracking-[0.25em] text-industrial-yellow/90">
            <span className="w-6 sm:w-8 h-px bg-industrial-yellow/60" />
            PRODUCTS
            <span className="w-6 sm:w-8 h-px bg-industrial-yellow/60" />
          </div>
          <h1 className="font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl 3xl:text-[5.5rem] uppercase leading-[0.95] tracking-tight mb-5 md:mb-6">
            Precision Engineered{" "}
            <span className="text-industrial-yellow">Products</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white-smoke/60 max-w-2xl mx-auto leading-relaxed">
            Explore our comprehensive catalogue of high-performance bearings,
            engineered for tight tolerances and demanding industrial
            applications.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Catalogue                                                                  */
/* -------------------------------------------------------------------------- */
function Catalogue() {
  const enquiry = useEnquiry();
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<Set<BearingType>>(new Set());
  const [load, setLoad] = useState<LoadClass | null>(null);
  const [speed, setSpeed] = useState<SpeedClass | null>(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (tab === "HighSpeed" && p.speed !== "High") return false;
      if (tab === "HeavyLoad" && p.load !== "Heavy") return false;
      if (tab === "Corrosion" && !p.corrosionResistant) return false;
      if (types.size && !types.has(p.type)) return false;
      if (load && p.load !== load) return false;
      if (speed && p.speed !== speed) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = (
          p.name +
          " " +
          p.desc +
          " " +
          p.material +
          " " +
          p.applications.join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tab, query, types, load, speed]);

  const toggleType = (t: BearingType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const reset = () => {
    setTab("All");
    setQuery("");
    setTypes(new Set());
    setLoad(null);
    setSpeed(null);
  };

  const activeCount =
    types.size + (load ? 1 : 0) + (speed ? 1 : 0) + (tab !== "All" ? 1 : 0);

  return (
    <section className="py-12 sm:py-16 md:py-20 px-5 sm:px-6 md:px-10 max-w-[1440px] 3xl:max-w-site-xl mx-auto">
      {/* Search */}
      <div className="relative max-w-2xl mx-auto mb-10 md:mb-14">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by category, material, or application…"
          className="w-full bg-graphite/60 border border-steel/20 pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 text-sm text-white-smoke placeholder:text-white-smoke/35 focus:outline-none focus:border-industrial-yellow transition-colors"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white-smoke/40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-8 lg:gap-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <details className="lg:hidden border border-steel/20 bg-graphite/30 group" open={false}>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <FilterIcon />
                <span className="text-[12px] tracking-[0.18em] uppercase text-white-smoke">
                  Filters
                </span>
                {activeCount > 0 && (
                  <span className="text-[10px] tracking-[0.15em] uppercase text-industrial-yellow">
                    • {activeCount} active
                  </span>
                )}
              </div>
              <svg
                className="w-4 h-4 text-white-smoke/60 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="p-4 sm:p-6 border-t border-steel/15">
              <FilterPanelContent
                types={types}
                toggleType={toggleType}
                load={load}
                setLoad={setLoad}
                speed={speed}
                setSpeed={setSpeed}
                activeCount={activeCount}
                reset={reset}
              />
            </div>
          </details>

          <div className="hidden lg:block border border-steel/20 bg-graphite/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FilterIcon />
                <h3 className="text-[13px] tracking-[0.18em] uppercase text-white-smoke">
                  Filters
                </h3>
              </div>
              {activeCount > 0 && (
                <button
                  onClick={reset}
                  className="text-[11px] tracking-[0.15em] uppercase text-industrial-yellow hover:text-white-smoke transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <FilterPanelContent
              types={types}
              toggleType={toggleType}
              load={load}
              setLoad={setLoad}
              speed={speed}
              setSpeed={setSpeed}
              activeCount={activeCount}
              reset={reset}
              hideHeader
            />
          </div>

          <p className="hidden lg:block mt-4 text-[11px] tracking-[0.15em] uppercase text-white-smoke/35 px-1">
            Need help specifying?{" "}
            <button
              type="button"
              onClick={() => enquiry.open({ topic: "Engineering" })}
              className="text-industrial-yellow hover:text-white-smoke transition-colors"
            >
              Talk to engineering →
            </button>
          </p>
        </aside>

        {/* Main */}
        <div>
          <div className="flex flex-wrap gap-1 border-b border-steel/15 mb-6 md:mb-8 overflow-x-auto -mb-px">
            {TABS.map((t) => {
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative whitespace-nowrap px-4 sm:px-5 py-3 text-[11px] sm:text-[12px] tracking-[0.18em] uppercase transition-colors ${
                    isActive
                      ? "text-white-smoke"
                      : "text-white-smoke/50 hover:text-white-smoke/80"
                  }`}
                >
                  {t.label}
                  {isActive && (
                    <motion.span
                      layoutId="prod-tab-underline"
                      className="absolute left-0 right-0 -bottom-px h-px bg-industrial-yellow"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-white-smoke/40 mb-5 md:mb-6">
            <span>
              {filtered.length} {filtered.length === 1 ? "Product" : "Products"}
            </span>
            <span className="hidden md:block">Sorted by category</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState onReset={reset} />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-steel/15"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar primitives                                                         */
/* -------------------------------------------------------------------------- */
function FilterPanelContent({
  types,
  toggleType,
  load,
  setLoad,
  speed,
  setSpeed,
  activeCount,
  reset,
  hideHeader,
}: {
  types: Set<BearingType>;
  toggleType: (t: BearingType) => void;
  load: LoadClass | null;
  setLoad: (l: LoadClass | null) => void;
  speed: SpeedClass | null;
  setSpeed: (s: SpeedClass | null) => void;
  activeCount: number;
  reset: () => void;
  hideHeader?: boolean;
}) {
  return (
    <>
      {!hideHeader && activeCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={reset}
            className="text-[11px] tracking-[0.15em] uppercase text-industrial-yellow hover:text-white-smoke transition-colors"
          >
            Reset
          </button>
        </div>
      )}
      <FilterGroup label="Bearing Type">
        {TYPE_OPTIONS.map((t) => (
          <Checkbox
            key={t}
            label={`${t} Bearings`}
            checked={types.has(t)}
            onChange={() => toggleType(t)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Load Class">
        {LOAD_OPTIONS.map((l) => (
          <Radio
            key={l}
            label={l}
            checked={load === l}
            onChange={() => setLoad(load === l ? null : l)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Speed Class" last>
        {SPEED_OPTIONS.map((s) => (
          <Radio
            key={s}
            label={s}
            checked={speed === s}
            onChange={() => setSpeed(speed === s ? null : s)}
          />
        ))}
      </FilterGroup>
    </>
  );
}

function FilterGroup({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-6 pb-6 border-b border-steel/15"}>
      <h4 className="text-[10px] tracking-[0.25em] uppercase text-white-smoke/40 mb-3">
        {label}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 group select-none w-full text-left"
    >
      <span
        className={`relative w-4 h-4 border flex-shrink-0 transition-colors ${
          checked
            ? "bg-industrial-yellow border-industrial-yellow"
            : "border-steel/40 group-hover:border-steel/70"
        }`}
      >
        {checked && (
          <svg
            className="absolute inset-0 w-full h-full text-deep-black"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m3 8 3 3 7-7" />
          </svg>
        )}
      </span>
      <span className="text-[13px] text-white-smoke/70 group-hover:text-white-smoke transition-colors">
        {label}
      </span>
    </button>
  );
}

function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 group select-none w-full text-left"
    >
      <span
        className={`relative w-4 h-4 rounded-full border flex-shrink-0 transition-colors ${
          checked
            ? "border-industrial-yellow"
            : "border-steel/40 group-hover:border-steel/70"
        }`}
      >
        {checked && (
          <span className="absolute inset-1 rounded-full bg-industrial-yellow" />
        )}
      </span>
      <span className="text-[13px] text-white-smoke/70 group-hover:text-white-smoke transition-colors">
        {label}
      </span>
    </button>
  );
}

function FilterIcon() {
  return (
    <svg
      className="w-4 h-4 text-industrial-yellow"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product card                                                               */
/* -------------------------------------------------------------------------- */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const enquiry = useEnquiry();
  const inStock = product.availability === "In Stock";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.2),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-graphite hover:bg-[#1f1f1f] transition-colors flex flex-col"
    >
      <div className="relative aspect-[5/3] bg-deep-black overflow-hidden">
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
        />
        <Crosshair className="top-3 left-3" />
        <Crosshair className="top-3 right-3 rotate-90" />
        <Crosshair className="bottom-3 left-3 -rotate-90" />
        <Crosshair className="bottom-3 right-3 rotate-180" />
      </div>

      <div className="p-5 sm:p-6 md:p-7 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white-smoke/35 mb-1">
              {product.type} Bearing
            </div>
            <h3 className="text-lg text-white-smoke leading-snug">
              {product.name}
            </h3>
          </div>
          <span
            className={`shrink-0 text-[10px] uppercase font-semibold tracking-[0.18em] px-2.5 py-1 border ${
              inStock
                ? "border-industrial-yellow/40 text-industrial-yellow bg-industrial-yellow/5"
                : "border-steel/40 text-white-smoke/70 bg-deep-black/40"
            }`}
          >
            {product.availability}
          </span>
        </div>

        <p className="text-white-smoke/55 text-sm leading-relaxed mb-5">
          {product.desc}
        </p>

        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 py-4 px-4 sm:px-5 bg-deep-black/50 border border-steel/15 mb-5">
          <Spec label="Speed Class" value={product.speed} />
          <Spec label="Load Class" value={product.load} />
          <Spec label="Material" value={product.material} />
          <Spec label="Temp Range" value={product.tempRange} />
        </div>

        <div className="text-[10px] tracking-[0.2em] uppercase text-white-smoke/35 mb-2">
          Typical Applications
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white-smoke/75 mb-6">
          {product.applications.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>

        <div className="mt-auto flex items-stretch gap-2">
          <button
            type="button"
            onClick={() =>
              enquiry.open({
                topic: "Quote",
                productSlug: product.slug,
                productName: product.name,
                message: `I would like to request a quote for ${product.name}.`,
              })
            }
            className="flex-1 bg-graphite border border-steel/30 text-white-smoke text-[11px] tracking-[0.18em] uppercase font-semibold py-3 px-4 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors flex items-center justify-center gap-2"
          >
            Request Quote
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              enquiry.open({
                topic: "Engineering",
                productSlug: product.slug,
                productName: product.name,
                message: `Please share technical details for ${product.name}.`,
              })
            }
            aria-label="Request technical details"
            className="bg-graphite border border-steel/30 text-white-smoke/80 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors px-3 flex items-center justify-center"
          >
            <DocIcon />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.22em] uppercase text-white-smoke/35 mb-0.5">
        {label}
      </div>
      <div className="text-[12px] text-white-smoke font-medium">{value}</div>
    </div>
  );
}

function DocIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

function Crosshair({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${className}`}
    >
      <span className="absolute top-0 left-0 w-2 h-px bg-industrial-yellow/70" />
      <span className="absolute top-0 left-0 w-px h-2 bg-industrial-yellow/70" />
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="border border-steel/15 py-20 px-6 text-center">
      <div className="text-[11px] tracking-[0.2em] uppercase text-white-smoke/40 mb-3">
        No matches
      </div>
      <h3 className="font-display text-3xl uppercase tracking-tight mb-3">
        Nothing in this filter.
      </h3>
      <p className="text-white-smoke/55 max-w-md mx-auto mb-6 text-sm">
        Adjust the filters or get in touch — many configurations are made to
        spec.
      </p>
      <button
        onClick={onReset}
        className="text-[12px] tracking-[0.18em] uppercase text-industrial-yellow hover:text-white-smoke transition-colors"
      >
        Reset filters →
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Technical Resources                                                        */
/* -------------------------------------------------------------------------- */
function ResourcesSection() {
  const enquiry = useEnquiry();
  const items: {
    title: string;
    desc: string;
    cta: string;
    href?: string;
    download?: boolean;
    onClick?: () => void;
  }[] = [
    {
      title: "Product Brochure",
      desc: "Comprehensive overview of every category, configuration and application area.",
      cta: "Download Brochure",
      href: CATALOGUE_PUBLIC_PATH,
      download: true,
    },
    {
      title: "CAD Library",
      desc: "Drop-in 2D drawings and 3D models for direct integration into your assemblies.",
      cta: "Browse CAD Library",
      onClick: () =>
        enquiry.open({
          topic: "Engineering",
          message: "I'd like access to CAD drawings / 3D models for ",
        }),
    },
    {
      title: "Engineering Support",
      desc: "Speak with our application engineers to specify the right bearing for your operating envelope.",
      cta: "Contact Engineering",
      onClick: () => enquiry.open({ topic: "Engineering" }),
    },
  ];

  return (
    <section className="border-y border-steel/15 bg-graphite/15 py-16 md:py-20 lg:py-24">
      <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10">
        <div className="mb-10 md:mb-14 max-w-2xl">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.25em] text-industrial-yellow/90 mb-3 md:mb-4">
            <span className="w-1 h-5 bg-industrial-yellow" />
            TECHNICAL RESOURCES
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight">
            Specify with confidence.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-steel/15">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-deep-black p-8 sm:p-10 group"
            >
              <div className="text-[11px] tracking-[0.25em] text-white-smoke/35 mb-6">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl text-white-smoke mb-3">{it.title}</h3>
              <p className="text-white-smoke/55 text-sm leading-relaxed mb-8">
                {it.desc}
              </p>
              {it.href ? (
                <a
                  href={it.href}
                  download={it.download ? "" : undefined}
                  target={it.download ? "_blank" : undefined}
                  rel={it.download ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-industrial-yellow text-[12px] tracking-[0.18em] uppercase font-semibold hover:text-white-smoke transition-colors"
                >
                  {it.cta}
                  <ArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={it.onClick}
                  className="inline-flex items-center gap-2 text-industrial-yellow text-[12px] tracking-[0.18em] uppercase font-semibold hover:text-white-smoke transition-colors"
                >
                  {it.cta}
                  <ArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA                                                                        */
/* -------------------------------------------------------------------------- */
function CtaBanner() {
  const enquiry = useEnquiry();
  return (
    <section className="py-16 md:py-24 lg:py-28 px-5 sm:px-6 md:px-10">
      <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto border border-steel/20 bg-gradient-to-br from-graphite to-deep-black p-8 sm:p-10 md:p-14 lg:p-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div>
            <div className="text-[11px] tracking-[0.25em] text-industrial-yellow/80 mb-3 md:mb-4">
              CAN&apos;T FIND WHAT YOU NEED?
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight leading-[0.95]">
              We engineer
              <br />
              <span className="text-industrial-yellow">to your spec.</span>
            </h2>
          </div>
          <div className="md:pl-8 md:border-l border-steel/15">
            <p className="text-white-smoke/55 text-sm sm:text-base mb-6 md:mb-8 leading-relaxed">
              Many of our deliveries are custom assemblies built around the
              customer&apos;s exact operating envelope. Send us your
              requirements and our engineering team will respond.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => enquiry.open({ topic: "Quote" })}
                className="bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 sm:px-8 hover:bg-white-smoke transition-colors inline-flex items-center justify-center gap-2"
              >
                Request a Quote
                <ArrowOutward className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => enquiry.open({ topic: "Engineering" })}
                className="border border-steel/50 text-white-smoke text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 sm:px-8 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors"
              >
                Talk to Engineering
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
