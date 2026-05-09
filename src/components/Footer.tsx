"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useEnquiry } from "./EnquiryModal";
import { siteConfig } from "@/src/lib/siteConfig";
import { getWhatsAppUrl } from "@/src/lib/whatsapp";

export default function Footer() {
  const enquiry = useEnquiry();
  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Products",
      links: [
        { label: "Spherical Roller", href: "/products" },
        { label: "Cylindrical Roller", href: "/products" },
        { label: "Tapered Roller", href: "/products" },
        { label: "Angular Contact", href: "/products" },
        { label: "Custom Assemblies", href: "/products" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About GLZ", href: "#" },
        { label: "Engineering", href: "#" },
        { label: "Quality", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Product Brochure", href: "#" },
        { label: "CAD Library", href: "#" },
        { label: "Datasheets", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Support", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-deep-black border-t border-steel/15">
      <div className="max-w-[1440px] 3xl:max-w-site-xl mx-auto px-5 sm:px-6 md:px-10 pt-14 md:pt-20 pb-8 md:pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-12 md:mb-16">
          <div className="col-span-2 md:pr-8">
            <div className="mb-6">
              <Logo size="md" />
            </div>
            <p className="text-white-smoke/45 text-sm leading-relaxed mb-8 max-w-xs">
              {siteConfig.shortDescription}
            </p>
            <div className="text-[12px] text-white-smoke/40 leading-relaxed not-italic">
              <div className="mb-1">{siteConfig.legalName}</div>
              <div>{siteConfig.contact.address.street}</div>
              <div>{siteConfig.contact.address.locality}</div>
              <div>
                {siteConfig.contact.address.region} {siteConfig.contact.address.postalCode}, India
              </div>
              <div className="mt-2">
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-white-smoke transition-colors"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </div>
              <div>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white-smoke transition-colors"
                >
                  WhatsApp · {siteConfig.contact.phoneDisplay}
                </a>
              </div>
              <div>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white-smoke transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h6 className="text-[11px] tracking-[0.2em] uppercase text-white-smoke/80 mb-5">
                {col.title}
              </h6>
              <ul className="space-y-3 text-[13px] text-white-smoke/50">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-white-smoke transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-steel/15 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 text-[11px] text-white-smoke/35">
          <div>© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved. · GSTIN {siteConfig.gstin}</div>
          <div className="flex gap-5 md:gap-6">
            <a href="#" className="hover:text-white-smoke transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white-smoke transition-colors">
              Privacy
            </a>
            <button
              type="button"
              onClick={() => enquiry.open({ topic: "General" })}
              className="hover:text-white-smoke transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
