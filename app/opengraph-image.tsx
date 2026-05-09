import { ImageResponse } from "next/og";
import { siteConfig } from "@/src/lib/siteConfig";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0B0B0B",
          backgroundImage:
            "radial-gradient(ellipse at 25% 15%, rgba(244,196,0,0.18) 0%, rgba(11,11,11,1) 55%)",
          color: "#F5F5F5",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        {/* Top row: brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#F4C400",
              color: "#0B0B0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            GLZ
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#9A9A9A",
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#FFFFFF",
              maxWidth: 1000,
            }}
          >
            {siteConfig.tagline}.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#B8B8B8",
              maxWidth: 940,
            }}
          >
            Precision industrial bearings — spherical, cylindrical, tapered &amp; angular contact —
            engineered in India, delivered globally.
          </div>
        </div>

        {/* Bottom row: domain + accent */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: "#F4C400",
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            glzbearings.com
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#7A7A7A",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Aerospace · Mining · Wind · Rail
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
