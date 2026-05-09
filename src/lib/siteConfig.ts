/**
 * Single source of truth for site-wide config (SEO, brand, contact).
 * Update NEXT_PUBLIC_SITE_URL in your env to override the canonical origin.
 */
export const siteConfig = {
  name: "GLZ Bearings",
  legalName: "Glidex International Private Limited",
  tagline: "Turning Trust Into Motion",
  description:
    "GLZ Bearings (Glidex International Pvt. Ltd.) engineers precision industrial bearings — spherical, cylindrical, tapered and angular contact — for aerospace, mining, wind, rail and automotive applications. Tight tolerances, rigorous quality control, global delivery from New Delhi, India.",
  shortDescription:
    "Precision industrial bearings engineered for the world's most demanding environments. Manufactured in India, delivered globally.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://glzbearings.com",
  ogImage: "/opengraph-image",
  locale: "en_US",
  foundingYear: 2008,
  gstin: "07AALCG8125E1ZL",
  keywords: [
    "industrial bearings",
    "precision bearings",
    "spherical roller bearings",
    "cylindrical roller bearings",
    "tapered roller bearings",
    "angular contact bearings",
    "deep groove ball bearings",
    "thrust bearings",
    "custom bearing assemblies",
    "heavy industry bearings",
    "wind turbine bearings",
    "mining bearings",
    "aerospace bearings",
    "rail bearings",
    "automotive bearings",
    "bearing manufacturer India",
    "bearing supplier Delhi",
    "Glidex International",
    "GLZ Bearings",
    "GZL Bearings",
  ],
  contact: {
    email: "engineering@glzbearings.com",
    phone: "+919996474009",
    phoneDisplay: "+91 99964 74009",
    whatsapp: "919996474009",
    whatsappMessage:
      "Hi GLZ Bearings — I'd like to discuss a bearing requirement.",
    address: {
      street: "B-67, First Floor, Rewari Line, Industrial Area Phase-II",
      locality: "Mayapuri, New Delhi",
      city: "New Delhi",
      district: "South West Delhi",
      region: "Delhi",
      postalCode: "110064",
      country: "IN",
    },
  },
  social: {
    linkedin: "https://www.linkedin.com/company/glz-bearings",
  },
} as const;

export type SiteConfig = typeof siteConfig;
