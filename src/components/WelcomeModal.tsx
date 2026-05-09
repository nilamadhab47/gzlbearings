"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Logo from "./Logo";
import { useEnquiry } from "./EnquiryModal";
import { ArrowForward } from "./Icons";

const STORAGE_KEY = "glz:welcome:v1";
const SHOW_DELAY_MS = 1400;

/**
 * First-visit welcome modal. Shows once per browser (localStorage flag),
 * after a short delay so it doesn't pop immediately on load.
 *
 * Reset the flag from devtools with:
 *   localStorage.removeItem('glz:welcome:v1')
 */
export default function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const enquiry = useEnquiry();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setOpen(false);
  }

  // body scroll lock + ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[180] bg-deep-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md sm:max-w-lg bg-graphite border border-steel/25 overflow-hidden"
          >
            {/* yellow band */}
            <div className="relative bg-industrial-yellow px-6 sm:px-8 pt-8 pb-7 sm:pt-10 sm:pb-9 overflow-hidden">
              {/* subtle moving sheen */}
              <motion.div
                aria-hidden
                initial={{ x: "-110%" }}
                animate={{ x: "110%" }}
                transition={{
                  duration: 2.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="absolute inset-y-0 -inset-x-12 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                }}
              />
              <button
                type="button"
                aria-label="Close"
                onClick={dismiss}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-deep-black/70 hover:text-deep-black text-lg leading-none"
              >
                ✕
              </button>

              <div className="relative flex items-center gap-4">
                <Logo size="lg" href={null} showWordmark={false} />
                <div className="leading-tight">
                  <div className="font-display text-deep-black text-2xl sm:text-3xl tracking-tight">
                    GLZ
                    <span className="align-super text-[10px] ml-0.5">™</span>
                  </div>
                  <div className="font-display text-deep-black/80 text-[11px] sm:text-[12px] tracking-[0.22em] uppercase">
                    Bearings
                  </div>
                </div>
              </div>

              <div className="relative mt-5 sm:mt-6 text-deep-black">
                <div className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold mb-2 sm:mb-3">
                  Newly Launched · 2026
                </div>
                <h2
                  id="welcome-title"
                  className="font-display text-2xl sm:text-3xl uppercase tracking-tight leading-[0.95]"
                >
                  Turning Trust
                  <br />
                  Into Motion.
                </h2>
              </div>
            </div>

            {/* dark body */}
            <div className="px-6 sm:px-8 py-7 sm:py-8">
              <p className="text-white-smoke/65 text-sm sm:text-[15px] leading-relaxed mb-6">
                Welcome to the new home of GLZ Bearings. We&apos;re a precision
                engineering authority delivering bearings to the world&apos;s
                most demanding industries — and our team is ready to help you
                spec the right one.
              </p>

              <ul className="space-y-2.5 mb-7 text-[13px] text-white-smoke/75">
                <Bullet>Tight-tolerance precision bearings</Bullet>
                <Bullet>Custom assemblies built to your envelope</Bullet>
                <Bullet>Engineering response within one business day</Bullet>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    dismiss();
                    enquiry.open({ topic: "General" });
                  }}
                  className="flex-1 bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-3.5 px-5 hover:bg-white-smoke transition-colors inline-flex items-center justify-center gap-2"
                >
                  Get in Touch
                  <ArrowForward className="w-4 h-4" />
                </button>
                <Link
                  href="/products"
                  onClick={dismiss}
                  className="flex-1 border border-steel/40 text-white-smoke text-[12px] font-semibold tracking-[0.18em] uppercase py-3.5 px-5 hover:border-industrial-yellow hover:text-industrial-yellow transition-colors text-center"
                >
                  Explore Products
                </Link>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="mt-5 w-full text-[11px] tracking-[0.18em] uppercase text-white-smoke/35 hover:text-white-smoke/70 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-[7px] inline-block w-3 h-px bg-industrial-yellow shrink-0"
      />
      <span>{children}</span>
    </li>
  );
}
