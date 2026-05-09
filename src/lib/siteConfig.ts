/**
 * Single source of truth for site-wide config (SEO, brand, contact).
 * Update NEXT_PUBLIC_SITE_URL in your env to override the canonical origin.
 */
export const siteConfig = {
  name: "GLZ Bearings",
  legalName: "GLZ Bearings International",
  tagline: "Turning Trust Into Motion",
  description:
    "GLZ Bearings engineers precision industrial bearings — spherical, cylindrical, tapered and angular contact — for aerospace, mining, wind, rail and automotive applications. Tight tolerances, rigorous quality control, global delivery.",
  shortDescription:
    "Precision industrial bearings engineered for the world's most demanding environments.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://glzbearings.com",
  ogImage: "/og.png",
  locale: "en_US",
  keywords: [
    "industrial bearings",
    "precision bearings",
    "spherical roller bearings",
    "cylindrical roller bearings",
    "tapered roller bearings",
    "angular contact bearings",
    "custom bearing assemblies",
    "heavy industry bearings",
    "wind turbine bearings",
    "mining bearings",
    "aerospace bearings",
    "GLZ Bearings",
  ],
  contact: {
    email: "engineering@glzbearings.com",
    phone: "+91 20 4000 1234",
    address: {
      street: "Plot 14, Industrial Sector 8",
      locality: "Pune",
      region: "Maharashtra",
      country: "IN",
    },
  },
  social: {
    linkedin: "https://www.linkedin.com/company/glz-bearings",
  },
} as const;

export type SiteConfig = typeof siteConfig;
