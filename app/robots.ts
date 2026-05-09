import type { MetadataRoute } from "next";
import { siteConfig } from "@/src/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web", "PerplexityBot", "Google-Extended"],
        allow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
