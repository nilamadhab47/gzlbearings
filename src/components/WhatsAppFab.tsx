"use client";

import { motion } from "motion/react";
import { siteConfig } from "@/src/lib/siteConfig";
import { getWhatsAppUrl } from "@/src/lib/whatsapp";

/**
 * Floating WhatsApp action button. Fixed bottom-right, opens wa.me with a
 * pre-filled message. Hidden under WelcomeModal/EnquiryModal via z-index.
 */
export default function WhatsAppFab() {
  return (
    <motion.a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${siteConfig.name} on WhatsApp`}
      data-cursor="hover"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[140] flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.6)] hover:shadow-[0_14px_36px_-10px_rgba(37,211,102,0.8)] transition-shadow"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full bg-[#25D366]/40 blur-md"
      />
      <svg
        viewBox="0 0 32 32"
        width="22"
        height="22"
        fill="currentColor"
        aria-hidden
        className="shrink-0"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.794 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.345 0 2.408-.522 2.408-1.756 0-.96-1.13-1.49-1.395-1.49z" />
        <path d="M16 0C7.16 0 0 7.16 0 16c0 2.737.687 5.317 1.892 7.578L0 32l8.61-2.243A15.926 15.926 0 0 0 16 32c8.84 0 16-7.16 16-16S24.84 0 16 0zm0 29.32c-2.45 0-4.74-.7-6.685-1.91l-4.66 1.215 1.245-4.55A13.282 13.282 0 0 1 2.68 16C2.68 8.66 8.66 2.68 16 2.68c7.34 0 13.32 5.98 13.32 13.32 0 7.34-5.98 13.32-13.32 13.32z" />
      </svg>
      <span className="text-sm font-medium tracking-wide hidden sm:inline">
        Chat on WhatsApp
      </span>
    </motion.a>
  );
}
