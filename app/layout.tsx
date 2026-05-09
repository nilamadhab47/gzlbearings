import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/src/lib/siteConfig";
import EnquiryProvider from "@/src/components/EnquiryModal";
import WelcomeModal from "@/src/components/WelcomeModal";
import MouseSpotlight from "@/src/components/MouseSpotlight";
import CustomCursor from "@/src/components/CustomCursor";
import WhatsAppFab from "@/src/components/WhatsAppFab";
import Analytics from "@/src/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "industrial",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
    url: siteConfig.url,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  referrer: "strict-origin-when-cross-origin",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "Manufacturer"],
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.legalName,
  alternateName: [siteConfig.name, "GZL Bearings"],
  url: siteConfig.url,
  logo: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/logo.png`,
    width: 612,
    height: 627,
  },
  image: `${siteConfig.url}/logo.png`,
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.phone,
  foundingDate: String(siteConfig.foundingYear),
  slogan: siteConfig.tagline,
  description: siteConfig.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.contact.address.street,
    addressLocality: siteConfig.contact.address.locality,
    addressRegion: siteConfig.contact.address.region,
    postalCode: siteConfig.contact.address.postalCode,
    addressCountry: siteConfig.contact.address.country,
  },
  vatID: siteConfig.gstin,
  taxID: siteConfig.gstin,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      areaServed: ["IN", "US", "EU", "GB", "JP", "CN", "AE", "AU", "ZA", "BR"],
      availableLanguage: ["en"],
    },
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: siteConfig.contact.phone,
      url: `https://wa.me/${siteConfig.contact.whatsapp}`,
      availableLanguage: ["en"],
    },
  ],
  knowsAbout: [
    "Industrial Bearings",
    "Spherical Roller Bearings",
    "Cylindrical Roller Bearings",
    "Tapered Roller Bearings",
    "Angular Contact Bearings",
    "Aerospace Engineering",
    "Wind Energy",
    "Heavy Machinery",
  ],
  sameAs: [siteConfig.social.linkedin, `https://wa.me/${siteConfig.contact.whatsapp}`],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.shortDescription,
  inLanguage: "en-US",
  publisher: { "@id": `${siteConfig.url}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <EnquiryProvider>
          <MouseSpotlight />
          <CustomCursor />
          {children}
          <WhatsAppFab />
          <WelcomeModal />
        </EnquiryProvider>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <Analytics />
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
