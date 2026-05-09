import type { Metadata } from "next";
import ProductsPage from "@/src/views/ProductsPage";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Precision bearing categories engineered for specific load profiles, speed envelopes, and operating environments — spherical, cylindrical, tapered and angular contact bearings.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Products — GLZ Bearings",
    description:
      "Browse precision bearings by type, load class, speed and material. Custom assemblies engineered to your spec.",
    url: "/products",
    type: "website",
  },
};

export default function Page() {
  return <ProductsPage />;
}
