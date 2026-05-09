"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, ArrowForward } from "./Icons";
import Logo from "./Logo";
import { useEnquiry } from "./EnquiryModal";

const LINKS: { label: string; href: string }[] = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const enquiry = useEnquiry();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.classList.toggle("nav-open", open);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("nav-open");
    };
  }, [open]);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden text-white-smoke"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ transform: "translateZ(0)" }}
            className="fixed inset-0 z-[150] isolate bg-deep-black/95 backdrop-blur-md md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: "#141414", transform: "translateZ(0)" }}
              className="absolute right-0 top-0 h-full w-[82%] max-w-sm border-l border-steel/20 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-steel/15">
                <Logo size="sm" href={null} />
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="text-white-smoke/70 hover:text-white-smoke text-xl leading-none w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 px-6 py-8 flex flex-col">
                <div className="text-[10px] tracking-[0.25em] text-white-smoke/40 uppercase mb-6">
                  
                </div>
                <ul className="space-y-1">
                  {LINKS.map((l, i) => (
                    <motion.li
                      key={l.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="block py-4 font-display text-3xl tracking-wide text-white-smoke hover:text-industrial-yellow transition-colors border-b border-steel/10"
                      >
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-10">
                  <div className="text-[10px] tracking-[0.25em] text-white-smoke/40 uppercase mb-3">
                    Get in touch
                  </div>
                  <div className="text-[12px] text-white-smoke/60 leading-relaxed">
                    engineering@glzbearings.com
                    <br />
                    +91 20 4000 1234
                  </div>
                </div>
              </nav>

              <div className="p-6 border-t border-steel/15">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    enquiry.open({ topic: "Quote" });
                  }}
                  className="w-full bg-industrial-yellow text-deep-black text-[12px] font-semibold tracking-[0.18em] uppercase py-4 px-6 flex items-center justify-center gap-3 hover:bg-white-smoke transition-colors"
                >
                  Request Quote
                  <ArrowForward className="w-4 h-4" />
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
