import type { Metadata } from "next";
import ProductsPage from "@/src/views/ProductsPage";
import { siteConfig } from "@/src/lib/siteConfig";

export const metadata: Metadata = {
  title: "Precision Bearings Catalogue",
  description:
    "Browse GLZ precision bearing categories — spherical, cylindrical, tapered and angular contact — engineered for specific load profiles, speed envelopes, and operating environments. Custom assemblies to spec.",
  alternates: { canonical: "/products" },
  keywords: [
    "bearing catalogue",
    "spherical roller bearings",
    "cylindrical roller bearings",
    "tapered roller bearings",
    "angular contact bearings",
    "custom bearing assemblies",
  ],
  openGraph: {
    title: "Precision Bearings Catalogue — GLZ Bearings",
    description:
      "Browse precision bearings by type, load class, speed and material. Custom assemblies engineered to your spec.",
    url: "/products",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precision Bearings Catalogue — GLZ Bearings",
    description:
      "Browse precision bearings by type, load class, speed and material.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteConfig.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Products",
      item: `${siteConfig.url}/products`,
    },
  ],
};

export default function Page() {
  return (
    <>
      <ProductsPage />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
