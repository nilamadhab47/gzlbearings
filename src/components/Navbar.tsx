"use client";

import Link from "next/link";
import MobileNav from "./MobileNav";
import Logo from "./Logo";
import { useEnquiry } from "./EnquiryModal";

export default function Navbar() {
  const enquiry = useEnquiry();
  const links = [
    { label: "Products", href: "/products" },
    { label: "Services", href: "/#services" },
    { label: "About", href: "/#about" },
  ];
  return (
    <nav className="fixed w-full z-50 border-b border-steel/15 bg-deep-black/80 backdrop-blur-xl">
      <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10 h-[72px] grid grid-cols-2 md:grid-cols-3 items-center">
        <div className="justify-self-start">
          <Logo size="md" />
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-10 justify-self-center text-[13px] tracking-[0.05em] text-white-smoke/75">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative py-2 hover:text-white-smoke transition-colors after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-industrial-yellow after:transition-all hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <button
            type="button"
            onClick={() => enquiry.open({ topic: "Quote" })}
            className="bg-industrial-yellow text-deep-black text-[11px] md:text-[12px] font-semibold tracking-[0.18em] uppercase py-3 px-4 lg:px-6 hover:bg-white-smoke transition-colors hidden md:block"
          >
            Request Quote
          </button>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}
