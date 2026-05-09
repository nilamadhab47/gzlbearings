import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Build a WhatsApp deep-link / wa.me URL with optional pre-filled text.
 * Uses api.whatsapp.com on desktop-style flows and wa.me as a universal short link.
 */
export function getWhatsAppUrl(message?: string) {
  const text = encodeURIComponent(message ?? siteConfig.contact.whatsappMessage);
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${text}`;
}

export const whatsAppHref = getWhatsAppUrl();
