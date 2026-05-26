/**
 * GLZ Bearings — Premium PDF catalogue generator.
 *
 * Rebuilt to match the Stitch "Kinetic Precision / Industrial Futurism"
 * design system: cinematic dark backgrounds, Bebas Neue headlines,
 * Inter body, Industrial Yellow (#F4C400) accents, hard-edged geometry,
 * HUD corner brackets, KPI cards, technical data tables and a global
 * network closer. Outputs A4 portrait.
 *
 * Run with `npm run gen:catalogue` or via the build `prebuild` hook.
 */

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { PRODUCTS, type Product } from "../products";
import { siteConfig } from "../siteConfig";

/* -------------------------------------------------------------------------- */
/*  Brand tokens (matches design-system DESIGN.md)                             */
/* -------------------------------------------------------------------------- */

const BRAND = {
  black: "#0B0B0B",
  surface: "#131313",
  graphite: "#1A1A1A",
  graphiteHi: "#201F1F",
  steel: "#5C5C5C",
  border: "#2A2A2A",
  outline: "#4E4632",
  yellow: "#F4C400",
  yellowSoft: "#FFE499",
  gold: "#D9A441",
  smoke: "#F5F5F5",
  muted: "#9A9A9A",
  variant: "#D1C5AB",
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 40,
};

type Doc = PDFKit.PDFDocument;

/* -------------------------------------------------------------------------- */
/*  Font registration — Bebas Neue (headlines) + Inter (body/data)             */
/* -------------------------------------------------------------------------- */

const FONT_DIR = path.resolve(process.cwd(), "src/lib/catalogue/fonts");
const FONTS = {
  head: path.join(FONT_DIR, "BebasNeue-Regular.ttf"),
  reg: path.join(FONT_DIR, "Inter-Regular.ttf"),
  med: path.join(FONT_DIR, "Inter-Medium.ttf"),
  sb: path.join(FONT_DIR, "Inter-SemiBold.ttf"),
  bold: path.join(FONT_DIR, "Inter-Bold.ttf"),
};

const F = {
  head: "Head",
  reg: "Reg",
  med: "Med",
  sb: "SB",
  bold: "Bold",
};

function registerFonts(doc: Doc) {
  doc.registerFont(F.head, FONTS.head);
  doc.registerFont(F.reg, FONTS.reg);
  doc.registerFont(F.med, FONTS.med);
  doc.registerFont(F.sb, FONTS.sb);
  doc.registerFont(F.bold, FONTS.bold);
}

/* -------------------------------------------------------------------------- */
/*  Image paths                                                                */
/* -------------------------------------------------------------------------- */

const IMG_DIR = path.resolve(process.cwd(), "public/images");
const STITCH_DIR = path.join(IMG_DIR, "stitch");

const HERO_CINEMATIC = path.join(STITCH_DIR, "hero-cinematic.png");
const BRAND_LOGO = path.join(IMG_DIR, "logo.jpeg");
const FACILITY_CNC = path.join(STITCH_DIR, "facility-cnc.png");
const EXPLODED_SPHERICAL = path.join(STITCH_DIR, "exploded-spherical.png");
const WORLD_MAP = path.join(STITCH_DIR, "world-map.png");

const photo = (file: string) => path.join(IMG_DIR, file);

const PRODUCT_PHOTOS: Record<string, string> = {
  "deep-groove-ball": photo("AdobeStock_1189537307_Preview.png"),
  "angular-contact": photo("AdobeStock_708968893_Preview.png"),
  "stainless-ball": photo("sutulo-bearing-1595147_1920.png"),
  "spherical-roller": photo("AdobeStock_689873510_Preview.jpeg"),
  "cylindrical-roller": photo("deel_de-ball-bearing-1236203_1920.png"),
  "tapered-roller": photo("simmer65-bearing-2347072_1920.jpg"),
  "needle-roller": photo("AdobeStock_1189537307_Preview.png"),
  "thrust-bearing": photo("openclipart-vectors-bearing-1293386_1920.png"),
  "ceramic-hybrid": photo("AdobeStock_708968893_Preview.png"),
};

function existing(p: string): string | null {
  return fs.existsSync(p) ? p : null;
}

function getProductPhoto(slug: string): string | null {
  return existing(PRODUCT_PHOTOS[slug] ?? "");
}

/* -------------------------------------------------------------------------- */
/*  Text sanitization (PDFKit + embedded TTF handles most Unicode, but we      */
/*  normalize the U+2212 minus to a regular hyphen-minus for safety in tables) */
/* -------------------------------------------------------------------------- */

function safe(s: string): string {
  return s
    .replace(/\u2212/g, "-")
    // Subscripts (₀-₉) → plain digits
    .replace(/[\u2080-\u2089]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    // Superscripts → plain digits (for cm³ → cm3 etc.)
    .replace(/\u00b3/g, "3")
    .replace(/\u00b2/g, "2")
    // μ (greek mu U+03BC) + µ (micro sign U+00B5) → u
    .replace(/[\u03bc\u00b5]/g, "u")
    // Right-arrow → ASCII chevron
    .replace(/\u2192/g, ">");
}

/* -------------------------------------------------------------------------- */
/*  Low-level drawing helpers                                                  */
/* -------------------------------------------------------------------------- */

function fillBg(doc: Doc, color = BRAND.black) {
  doc.save();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill(color);
  doc.restore();
}

/** HUD corner brackets — engineering "scope" framing. */
function hudBrackets(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  size = 10,
  color = BRAND.yellow,
  lineW = 1
) {
  doc.save();
  doc.strokeColor(color).lineWidth(lineW);
  doc.moveTo(x, y + size).lineTo(x, y).lineTo(x + size, y).stroke();
  doc.moveTo(x + w - size, y).lineTo(x + w, y).lineTo(x + w, y + size).stroke();
  doc.moveTo(x, y + h - size).lineTo(x, y + h).lineTo(x + size, y + h).stroke();
  doc.moveTo(x + w - size, y + h).lineTo(x + w, y + h).lineTo(x + w, y + h - size).stroke();
  doc.restore();
}

/** Thin yellow accent bar — used under eyebrows. */
function tick(doc: Doc, x: number, y: number, w = 24, h = 2, color = BRAND.yellow) {
  doc.save();
  doc.rect(x, y, w, h).fill(color);
  doc.restore();
}

/** Eyebrow label with dash bracketing on either side, all caps tracked. */
function eyebrow(
  doc: Doc,
  text: string,
  x: number,
  y: number,
  opts: { color?: string; size?: number; tracking?: number; brackets?: boolean } = {}
) {
  const { color = BRAND.yellow, size = 8, tracking = 2.6, brackets = false } = opts;
  doc.save();
  doc.font(F.bold).fontSize(size).fillColor(color);
  const t = safe(text).toUpperCase();
  if (brackets) {
    doc.text("— " + t + " —", x, y, { characterSpacing: tracking, lineBreak: false });
  } else {
    doc.text(t, x, y, { characterSpacing: tracking, lineBreak: false });
  }
  doc.restore();
}

/** Bebas Neue display text. */
function display(
  doc: Doc,
  text: string,
  x: number,
  y: number,
  opts: { size?: number; color?: string; tracking?: number; width?: number; align?: "left" | "center" | "right" } = {}
) {
  const { size = 48, color = BRAND.smoke, tracking = 1.5, width, align = "left" } = opts;
  doc.save();
  doc.font(F.head).fontSize(size).fillColor(color);
  doc.text(safe(text), x, y, {
    characterSpacing: tracking,
    width,
    align,
    lineBreak: false,
  });
  doc.restore();
}

/** GLZ wordmark — uses logo image when available, otherwise text fallback. */
function wordmark(doc: Doc, x: number, y: number, size = 18) {
  if (fs.existsSync(BRAND_LOGO)) {
    const tile = size * 2.4;
    doc.save();
    // Yellow brand tile background
    doc.rect(x, y - 4, tile, tile).fill(BRAND.yellow);
    // Logo fills the tile (cover keeps aspect ratio, crops the surrounding yellow background of the source).
    doc.save();
    doc.rect(x, y - 4, tile, tile).clip();
    doc.image(BRAND_LOGO, x, y - 4, { cover: [tile, tile], align: "center", valign: "center" } as PDFKit.Mixins.ImageOption);
    doc.restore();
    doc.restore();
    return;
  }
  doc.save();
  doc.font(F.head).fontSize(size).fillColor(BRAND.yellow);
  doc.text("GLZ", x, y, { characterSpacing: 1.5, lineBreak: false });
  const w = doc.widthOfString("GLZ");
  doc.fillColor(BRAND.smoke);
  doc.text("BEARINGS", x + w + 6, y, { characterSpacing: 1.5, lineBreak: false });
  doc.restore();
}

/** Page chrome — top bar with logo + section nav + page number. */
function pageChrome(
  doc: Doc,
  opts: { section: string; page: string; nav?: string[]; activeNav?: string }
) {
  const { section, page, nav = ["CATALOG", "TECHNICAL", "MANUFACTURING", "ENTERPRISE"], activeNav } = opts;
  // Top bar
  doc.save();
  doc.rect(0, 0, PAGE.width, 56).fill(BRAND.black);
  doc.restore();

  wordmark(doc, PAGE.margin, 22, 14);

  // nav items center (shrunk + offset so it doesn't collide with page indicator)
  let nx = PAGE.width / 2 - 140;
  nav.forEach((item) => {
    const active = activeNav?.toUpperCase() === item.toUpperCase();
    doc.save();
    doc.font(F.bold).fontSize(7).fillColor(active ? BRAND.yellow : BRAND.muted);
    doc.text(item, nx, 26, { characterSpacing: 1.4, lineBreak: false });
    const w = doc.widthOfString(item, { characterSpacing: 1.4 });
    if (active) {
      doc.rect(nx, 38, w, 1).fill(BRAND.yellow);
    }
    nx += w + 14;
    doc.restore();
  });

  // page indicator right
  doc.save();
  doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
  doc.text(safe(page).toUpperCase(), 0, 26, {
    characterSpacing: 1.6,
    width: PAGE.width - PAGE.margin,
    align: "right",
    lineBreak: false,
  });
  doc.restore();

  // hairline
  doc.save();
  doc
    .moveTo(0, 56)
    .lineTo(PAGE.width, 56)
    .strokeColor(BRAND.border)
    .lineWidth(0.5)
    .stroke();
  doc.restore();

  // section ribbon
  doc.save();
  doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
  doc.text(safe(section).toUpperCase(), PAGE.margin, 66, {
    characterSpacing: 2,
    lineBreak: false,
  });
  doc.restore();
}

/** Page footer — copy strip across bottom. */
function pageFooter(doc: Doc, label: string) {
  const y = PAGE.height - 28;
  doc.save();
  doc
    .moveTo(PAGE.margin, y - 10)
    .lineTo(PAGE.width - PAGE.margin, y - 10)
    .strokeColor(BRAND.border)
    .lineWidth(0.4)
    .stroke();
  doc.font(F.bold).fontSize(6.5).fillColor(BRAND.muted);
  doc.text("GLZ BEARINGS", PAGE.margin, y - 2, { characterSpacing: 1.5, lineBreak: false });
  doc.font(F.reg).fontSize(6.5).fillColor(BRAND.muted);
  doc.text(safe(label), 0, y - 2, {
    width: PAGE.width - PAGE.margin,
    align: "right",
    lineBreak: false,
  });
  doc.restore();
}

/** Card surface — graphite container with thin border + optional yellow top accent. */
function card(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { topAccent?: boolean; fill?: string; border?: string } = {}
) {
  const { topAccent = false, fill = BRAND.graphite, border = BRAND.border } = opts;
  doc.save();
  doc.rect(x, y, w, h).fill(fill);
  doc.rect(x, y, w, h).strokeColor(border).lineWidth(0.6).stroke();
  if (topAccent) {
    doc.rect(x, y, w, 2).fill(BRAND.yellow);
  }
  doc.restore();
}

/** Image placed in a clip-rect with a dark vignette for cinematic mood. */
function bgImage(doc: Doc, src: string, x: number, y: number, w: number, h: number, overlay = 0.55) {
  if (!fs.existsSync(src)) return;
  doc.save();
  doc.rect(x, y, w, h).clip();
  // `cover` preserves aspect ratio, scaling the image to fill the box and cropping overflow.
  doc.image(src, x, y, { cover: [w, h], align: "center", valign: "center" } as PDFKit.Mixins.ImageOption);
  doc.restore();
  if (overlay > 0) {
    doc.save();
    doc.fillOpacity(overlay);
    doc.rect(x, y, w, h).fill(BRAND.black);
    doc.restore();
  }
}

/** KPI card — big number top, label below, optional unit small to right. */
function kpiCard(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  opts: { unit?: string; valueColor?: string } = {}
) {
  const { unit, valueColor = BRAND.yellow } = opts;
  card(doc, x, y, w, h, { topAccent: true });
  // Auto-shrink value text if too long
  doc.save();
  let valSize = 32;
  const v = safe(value);
  doc.font(F.head).fontSize(valSize);
  while (doc.widthOfString(v, { characterSpacing: 0.8 }) > w - 36 && valSize > 14) {
    valSize -= 2;
    doc.fontSize(valSize);
  }
  doc.fillColor(valueColor);
  doc.text(v, x + 14, y + 18, { characterSpacing: 0.8, lineBreak: false });
  const vw = doc.widthOfString(v, { characterSpacing: 0.8 });
  if (unit) {
    doc.font(F.med).fontSize(7).fillColor(BRAND.muted);
    doc.text(safe(unit).toUpperCase(), x + 14 + vw + 4, y + 18 + valSize - 12, {
      characterSpacing: 1.2,
      lineBreak: false,
    });
  }
  doc.font(F.bold).fontSize(6.5).fillColor(BRAND.muted);
  doc.text(safe(label).toUpperCase(), x + 14, y + h - 18, {
    width: w - 28,
    characterSpacing: 1.6,
    lineBreak: false,
  });
  doc.restore();
}

/* -------------------------------------------------------------------------- */
/*  PAGE 1 — Cover                                                             */
/* -------------------------------------------------------------------------- */

function coverPage(doc: Doc) {
  fillBg(doc, BRAND.black);

  // Full-bleed cinematic hero
  bgImage(doc, HERO_CINEMATIC, 0, 0, PAGE.width, PAGE.height, 0.4);

  // Top dark gradient strip (extra contrast for header)
  doc.save();
  doc.fillOpacity(0.55);
  doc.rect(0, 0, PAGE.width, 90).fill(BRAND.black);
  doc.restore();

  // Bottom dark gradient strip
  doc.save();
  doc.fillOpacity(0.6);
  doc.rect(0, PAGE.height - 280, PAGE.width, 280).fill(BRAND.black);
  doc.restore();

  // Header
  wordmark(doc, PAGE.margin, 30, 16);

  // Top-right: download badge (decorative)
  const dlW = 110;
  const dlH = 24;
  const dlX = PAGE.width - PAGE.margin - dlW;
  doc.save();
  doc.rect(dlX, 28, dlW, dlH).fill(BRAND.yellow);
  doc.font(F.bold).fontSize(8).fillColor(BRAND.black);
  doc.text("PRODUCT CATALOG · 2026", dlX, 35, {
    width: dlW,
    align: "center",
    characterSpacing: 1.4,
    lineBreak: false,
  });
  doc.restore();

  // Edge HUD brackets — full page frame
  hudBrackets(doc, 20, 20, PAGE.width - 40, PAGE.height - 40, 14, BRAND.yellow, 1.2);

  // Side rail (left): ESTABLISHED 1984 vertical-ish stack
  const railX = PAGE.margin;
  const railY = 130;
  eyebrow(doc, `EST. ${siteConfig.foundingYear}`, railX, railY, {
    color: BRAND.yellow,
    size: 7.5,
    tracking: 2.8,
  });
  doc.save();
  doc.moveTo(railX, railY + 18).lineTo(railX + 36, railY + 18).strokeColor(BRAND.yellow).lineWidth(1).stroke();
  doc.restore();
  eyebrow(doc, "PRECISION ARCHIVE / V.2026", railX, railY + 28, {
    color: BRAND.muted,
    size: 7,
    tracking: 2.2,
  });

  // Title block — bottom-left
  const titleY = PAGE.height - 260;
  eyebrow(doc, "— PRECISION ENGINEERED —", PAGE.margin, titleY, {
    color: BRAND.yellow,
    size: 8.5,
    tracking: 3,
  });
  display(doc, "MOTION", PAGE.margin, titleY + 18, { size: 78, color: BRAND.smoke, tracking: 1.5 });
  display(doc, "SYSTEMS", PAGE.margin, titleY + 80, { size: 78, color: BRAND.yellow, tracking: 1.5 });

  // Subtitle
  doc.save();
  doc.font(F.reg).fontSize(10).fillColor(BRAND.variant);
  doc.text(
    "Industrial bearings engineered for aerospace, mining, wind, rail and automotive — manufactured in India, delivered globally with unforgiving tolerances and aerospace-grade discipline.",
    PAGE.margin,
    titleY + 152,
    { width: PAGE.width - PAGE.margin * 2 - 40, lineGap: 3 }
  );
  doc.restore();

  // Badges row — bottom
  const bY = PAGE.height - 70;
  const badges = ["AEROSPACE GRADE", "CERTIFIED TOLERANCE", "ISO 9001 / IATF 16949"];
  let bx = PAGE.margin;
  badges.forEach((b) => {
    doc.save();
    doc.font(F.bold).fontSize(7).fillColor(BRAND.yellow);
    const bw = doc.widthOfString(b, { characterSpacing: 1.8 }) + 18;
    doc.rect(bx, bY, bw, 18).strokeColor(BRAND.yellow).lineWidth(0.6).stroke();
    doc.text(b, bx + 9, bY + 6, { characterSpacing: 1.8, lineBreak: false });
    doc.restore();
    bx += bw + 8;
  });
}

/* -------------------------------------------------------------------------- */
/*  PAGE 2 — Mastery of Mechanics (intro)                                      */
/* -------------------------------------------------------------------------- */

function masteryPage(doc: Doc) {
  doc.addPage();
  fillBg(doc, BRAND.black);
  pageChrome(doc, {
    section: "01 · INTRODUCTION / MASTERY OF MECHANICS",
    page: `P.02 / V.2026`,
    activeNav: "CATALOG",
  });

  // Two-column hero: image left, text right
  const topY = 92;
  const imgW = 260;
  const imgH = 320;
  const imgX = PAGE.margin;
  const imgY = topY;

  bgImage(doc, FACILITY_CNC, imgX, imgY, imgW, imgH, 0.15);
  hudBrackets(doc, imgX, imgY, imgW, imgH, 12, BRAND.yellow, 1);

  // image caption strip
  doc.save();
  doc.rect(imgX, imgY + imgH - 32, imgW, 32).fill(BRAND.black).fillOpacity(0.75);
  doc.restore();
  doc.save();
  doc.font(F.bold).fontSize(7).fillColor(BRAND.yellow);
  doc.text("FACILITY · CNC MACHINING — NEW DELHI", imgX + 12, imgY + imgH - 22, {
    characterSpacing: 1.6,
    lineBreak: false,
  });
  doc.font(F.reg).fontSize(6.5).fillColor(BRAND.muted);
  doc.text("PROC_LIVE / 2026", imgX + 12, imgY + imgH - 11, {
    characterSpacing: 1.4,
    lineBreak: false,
  });
  doc.restore();

  // Right column
  const cX = PAGE.margin + imgW + 26;
  const cW = PAGE.width - cX - PAGE.margin;

  eyebrow(doc, `EST. ${siteConfig.foundingYear}  /  ENGINEERING DIVISION`, cX, topY, {
    color: BRAND.yellow,
    size: 7.5,
    tracking: 2.4,
  });

  display(doc, "MASTERY", cX, topY + 16, { size: 44, color: BRAND.smoke, tracking: 1.2 });
  display(doc, "OF MECHANICS.", cX, topY + 54, { size: 44, color: BRAND.yellow, tracking: 1.2 });

  doc.save();
  doc.font(F.reg).fontSize(10).fillColor(BRAND.variant);
  doc.text(
    safe(siteConfig.description),
    cX,
    topY + 110,
    { width: cW, lineGap: 3.5 }
  );
  doc.restore();

  // Pull-quote block (right column, below image bottom)
  const qY = topY + 270;
  doc.save();
  doc.rect(cX, qY, 3, 60).fill(BRAND.yellow);
  doc.font(F.med).fontSize(9.5).fillColor(BRAND.smoke);
  doc.text(
    "\u201CWe don\u2019t ship bearings. We ship trust in motion \u2014 every component traceable, every tolerance verified, every shipment underwritten by our engineers.\u201D",
    cX + 14,
    qY,
    { width: cW - 14, lineGap: 2.5 }
  );
  doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
  doc.text("— DIRECTOR, ENGINEERING", cX + 14, qY + 50, {
    characterSpacing: 1.5,
    lineBreak: false,
  });
  doc.restore();

  // STATS ROW — full-width band
  const statsY = topY + imgH + 30;
  const stats = [
    { value: "40+", label: "EXPORT COUNTRIES" },
    { value: "2M+", label: "BEARINGS PRODUCED" },
    { value: "ISO", label: "9001 / IATF 16949" },
    { value: "24H", label: "ENGINEERING RESPONSE" },
  ];
  const sW = (PAGE.width - PAGE.margin * 2) / stats.length;
  doc.save();
  doc.rect(PAGE.margin, statsY, PAGE.width - PAGE.margin * 2, 2).fill(BRAND.yellow);
  stats.forEach((s, i) => {
    const x = PAGE.margin + i * sW;
    doc.font(F.head).fontSize(36).fillColor(BRAND.smoke);
    doc.text(s.value, x, statsY + 14, { characterSpacing: 0.8, lineBreak: false });
    doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
    doc.text(s.label, x, statsY + 56, { characterSpacing: 1.8, lineBreak: false });
  });
  doc.restore();

  // Material / Tolerance / Lubrication / Compliance grid
  const grid = [
    { k: "MATERIAL GRADE", v: "AISI 52100", sub: "Chrome / Carburised" },
    { k: "TOLERANCE", v: "P4 / ABEC 7", sub: "Sub-micron deviation" },
    { k: "LUBRICATION", v: "MoS2 / Synthetic", sub: "Operating -50 to 250 \u00B0C" },
    { k: "COMPLIANCE", v: "ISO 492", sub: "Aerospace audited" },
  ];
  const gY = statsY + 92;
  const gW = (PAGE.width - PAGE.margin * 2) / grid.length;
  grid.forEach((g, i) => {
    const x = PAGE.margin + i * gW;
    card(doc, x + 4, gY, gW - 8, 86, { topAccent: false, fill: BRAND.graphite });
    eyebrow(doc, g.k, x + 16, gY + 14, { color: BRAND.yellow, size: 7, tracking: 1.6 });
    doc.save();
    doc.font(F.head).fontSize(18).fillColor(BRAND.smoke);
    doc.text(safe(g.v), x + 16, gY + 30, { lineBreak: false });
    doc.font(F.reg).fontSize(8).fillColor(BRAND.muted);
    doc.text(safe(g.sub), x + 16, gY + 58, { lineBreak: false });
    doc.restore();
  });

  pageFooter(doc, "P.02 · INTRODUCTION");
}

/* -------------------------------------------------------------------------- */
/*  PAGE 3+ — Product Showcase (one per product, matching design screen 2)     */
/* -------------------------------------------------------------------------- */

function productPage(doc: Doc, p: Product, index: number) {
  doc.addPage();
  fillBg(doc, BRAND.black);
  const pageLabel = `P.${String(index + 3).padStart(2, "0")} / ${String(index + 1).padStart(2, "0")} OF ${String(PRODUCTS.length).padStart(2, "0")}`;
  pageChrome(doc, {
    section: `02 · CATALOG / ${p.type.toUpperCase()} SERIES`,
    page: pageLabel,
    activeNav: "CATALOG",
  });

  // Top hero band — left: copy + buttons, right: bearing photo on dark
  const heroY = 92;
  const heroH = 240;
  const leftW = 280;
  const rightX = PAGE.margin + leftW + 20;
  const rightW = PAGE.width - PAGE.margin - rightX;

  // LEFT — eyebrow + big title + desc + 2 buttons
  eyebrow(
    doc,
    `CATEGORY · ${p.type.toUpperCase()} BEARINGS`,
    PAGE.margin,
    heroY,
    { color: BRAND.yellow, size: 8, tracking: 2.4 }
  );

  // Two-line big title from product name
  const parts = splitTitle(p.name);
  display(doc, parts[0]!, PAGE.margin, heroY + 16, { size: 36, color: BRAND.smoke, tracking: 1 });
  display(doc, parts[1] ?? "", PAGE.margin, heroY + 50, { size: 36, color: BRAND.yellow, tracking: 1 });

  doc.save();
  doc.font(F.reg).fontSize(9.5).fillColor(BRAND.variant);
  doc.text(safe(p.desc), PAGE.margin, heroY + 100, { width: leftW, lineGap: 3 });
  doc.restore();

  // Buttons row
  const btnY = heroY + heroH - 36;
  drawButton(doc, PAGE.margin, btnY, 140, 26, "REQUEST QUOTE  >", { primary: true });
  drawButton(doc, PAGE.margin + 148, btnY, 110, 26, "TECH SHEET", { primary: false });

  // RIGHT — photo card
  card(doc, rightX, heroY, rightW, heroH, { topAccent: true, fill: BRAND.graphite });
  const photoSrc = getProductPhoto(p.slug);
  if (photoSrc && fs.existsSync(photoSrc)) {
    const pad = 14;
    doc.save();
    doc.image(photoSrc, rightX + pad, heroY + pad, {
      fit: [rightW - pad * 2, heroH - pad * 2],
      align: "center",
      valign: "center",
    } as PDFKit.Mixins.ImageOption);
    doc.restore();
  } else if (fs.existsSync(HERO_CINEMATIC)) {
    bgImage(doc, HERO_CINEMATIC, rightX + 1, heroY + 3, rightW - 2, heroH - 4, 0.1);
  }
  hudBrackets(doc, rightX, heroY, rightW, heroH, 10, BRAND.yellow, 0.8);
  // ID stamp
  doc.save();
  doc.font(F.bold).fontSize(6.5).fillColor(BRAND.yellow);
  const idStem = p.slug.toUpperCase().replace(/-/g, " ").split(" ")[0]!.slice(0, 6);
  const idTail = String(7005 + index * 7).padStart(4, "0");
  doc.text(`MODEL_ID · GLZ-${idStem}-${idTail}`, rightX + 12, heroY + 12, {
    characterSpacing: 1.4,
    lineBreak: false,
  });
  doc.restore();
  // chip
  const chipText = p.availability.toUpperCase();
  const chipW = 86;
  doc.save();
  doc
    .rect(rightX + rightW - chipW - 12, heroY + heroH - 28, chipW, 18)
    .fill(p.availability === "In Stock" ? BRAND.yellow : BRAND.graphiteHi);
  doc
    .font(F.bold)
    .fontSize(7)
    .fillColor(p.availability === "In Stock" ? BRAND.black : BRAND.yellow);
  doc.text(chipText, rightX + rightW - chipW - 12, heroY + heroH - 22, {
    width: chipW,
    align: "center",
    characterSpacing: 1.4,
    lineBreak: false,
  });
  doc.restore();

  // KPI cards row — 4 cards
  const kY = heroY + heroH + 22;
  const kH = 76;
  const kCount = 4;
  const kGap = 10;
  const kW = (PAGE.width - PAGE.margin * 2 - kGap * (kCount - 1)) / kCount;
  const kpis = kpisFor(p);
  kpis.forEach((k, i) => {
    const x = PAGE.margin + i * (kW + kGap);
    kpiCard(doc, x, kY, kW, kH, k.value, k.label, { unit: k.unit });
  });

  // TECH DATA TABLE
  const tY = kY + kH + 22;
  techDataTable(doc, p, PAGE.margin, tY, PAGE.width - PAGE.margin * 2);

  // BOTTOM: Material + Applications row (two cards)
  const bH = 84;
  const bY = PAGE.height - 60 - bH;
  const halfW = (PAGE.width - PAGE.margin * 2 - 12) / 2;
  // Material Science card
  card(doc, PAGE.margin, bY, halfW, bH, { topAccent: true });
  eyebrow(doc, "MATERIAL SCIENCE", PAGE.margin + 14, bY + 14, {
    color: BRAND.yellow,
    size: 7.5,
    tracking: 2,
  });
  doc.save();
  doc.font(F.head).fontSize(18).fillColor(BRAND.smoke);
  doc.text(safe(p.material), PAGE.margin + 14, bY + 30, { lineBreak: false });
  doc.font(F.reg).fontSize(8.5).fillColor(BRAND.variant);
  doc.text(
    `OPERATING ${safe(p.tempRange)}  ·  ${p.corrosionResistant ? "CORROSION RESISTANT" : "STANDARD FINISH"}`,
    PAGE.margin + 14,
    bY + 56,
    { width: halfW - 28, characterSpacing: 0.6, lineBreak: false }
  );
  doc.restore();

  // Applications card
  const aX = PAGE.margin + halfW + 12;
  card(doc, aX, bY, halfW, bH, { topAccent: true });
  eyebrow(doc, "TYPICAL APPLICATIONS", aX + 14, bY + 14, {
    color: BRAND.yellow,
    size: 7.5,
    tracking: 2,
  });
  doc.save();
  doc.font(F.med).fontSize(10).fillColor(BRAND.smoke);
  doc.text(p.applications.join("    ·    "), aX + 14, bY + 36, {
    width: halfW - 28,
    lineGap: 2,
  });
  doc.restore();

  pageFooter(doc, `${pageLabel} · ${p.name.toUpperCase()}`);
}

function splitTitle(name: string): [string, string?] {
  const n = name.toUpperCase().replace(/\s+BEARING$/, "");
  const words = n.split(" ");
  if (words.length <= 2) return [words.join(" "), "BEARING"];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ") + " BEARING"];
}

function drawButton(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  opts: { primary?: boolean } = {}
) {
  const { primary = false } = opts;
  doc.save();
  if (primary) {
    doc.rect(x, y, w, h).fill(BRAND.yellow);
    doc.font(F.bold).fontSize(8).fillColor(BRAND.black);
  } else {
    doc.rect(x, y, w, h).strokeColor(BRAND.steel).lineWidth(1).stroke();
    doc.font(F.bold).fontSize(8).fillColor(BRAND.smoke);
  }
  doc.text(label, x, y + (h - 8) / 2, {
    width: w,
    align: "center",
    characterSpacing: 1.6,
    lineBreak: false,
  });
  doc.restore();
}

/** Synthesises plausible KPI values per product type. */
function kpisFor(p: Product): { value: string; unit?: string; label: string }[] {
  const speed =
    p.speed === "High" ? "45,000" : p.speed === "Medium" ? "18,000" : "9,500";
  const staticLoad =
    p.load === "Heavy" ? "248.0" : p.load === "Medium" ? "128.5" : "62.4";
  const tempMax = p.tempRange.match(/(\d+)\s*°/g)?.slice(-1)[0] ?? "200 °C";
  const tol =
    p.speed === "High" ? "P4 / ABEC 7" : p.speed === "Medium" ? "P5 / ABEC 5" : "P6 / ABEC 3";
  return [
    { value: speed, unit: "RPM", label: "MAX LIMITING SPEED" },
    { value: staticLoad, unit: "kN", label: "STATIC LOAD RATING" },
    { value: tol, label: "PRECISION GRADE" },
    { value: tempMax.replace(/\s/g, ""), label: "THERMAL CEILING" },
  ];
}

/** Technical catalog data table — 4 sample SKUs per product. */
function techDataTable(doc: Doc, p: Product, x: number, y: number, w: number) {
  // Heading bar
  doc.save();
  doc.font(F.head).fontSize(14).fillColor(BRAND.smoke);
  doc.text("TECHNICAL CATALOG DATA", x, y, { characterSpacing: 1, lineBreak: false });
  doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
  doc.text("METRIC", 0, y + 4, {
    width: x + w - PAGE.margin,
    align: "right",
    characterSpacing: 1.6,
    lineBreak: false,
  });
  // separator
  doc
    .moveTo(x, y + 22)
    .lineTo(x + w, y + 22)
    .strokeColor(BRAND.yellow)
    .lineWidth(1)
    .stroke();
  doc.restore();

  // Columns
  const headers = ["MODEL ID", "BORE d", "OUTER D", "WIDTH B", "DYN Cr", "STA C0r", "MAX RPM", "GRADE"];
  const widths = [0.22, 0.08, 0.08, 0.08, 0.09, 0.09, 0.12, 0.24].map((f) => f * w);

  const headerY = y + 30;
  let cx = x;
  doc.save();
  doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
  headers.forEach((h, i) => {
    doc.text(h, cx, headerY, { width: widths[i]! - 6, characterSpacing: 1.4, lineBreak: false });
    cx += widths[i]!;
  });
  doc.restore();
  doc
    .moveTo(x, headerY + 18)
    .lineTo(x + w, headerY + 18)
    .strokeColor(BRAND.border)
    .lineWidth(0.6)
    .stroke();

  // Rows
  const rows = skusFor(p);
  rows.forEach((row, i) => {
    const ry = headerY + 26 + i * 22;
    cx = x;
    doc.save();
    row.forEach((cell, ci) => {
      if (ci === 0) {
        doc.font(F.bold).fontSize(9).fillColor(BRAND.yellow);
      } else if (ci === headers.length - 1) {
        // Grade pill
        doc.font(F.bold).fontSize(7).fillColor(BRAND.yellow);
        const pillW = doc.widthOfString(cell, { characterSpacing: 1 }) + 12;
        doc.rect(cx, ry - 2, pillW, 16).strokeColor(BRAND.yellow).lineWidth(0.6).stroke();
        doc.text(cell, cx + 6, ry + 2, { characterSpacing: 1, lineBreak: false });
        cx += widths[ci]!;
        return;
      } else {
        doc.font(F.med).fontSize(9).fillColor(BRAND.smoke);
      }
      doc.text(cell, cx, ry, { width: widths[ci]! - 6, lineBreak: false });
      cx += widths[ci]!;
    });
    doc.restore();
    // row hairline
    doc
      .moveTo(x, ry + 16)
      .lineTo(x + w, ry + 16)
      .strokeColor(BRAND.border)
      .lineWidth(0.3)
      .stroke();
  });
}

function skusFor(p: Product): string[][] {
  const base = p.slug.split("-")[0]!.toUpperCase().slice(0, 4);
  // pseudo-dimensions: vary by load class
  const sets =
    p.load === "Heavy"
      ? [
          ["60", "110", "22", "64.0", "50.0", "18,000", "P4 / ABEC 7"],
          ["80", "140", "26", "92.5", "78.0", "14,000", "P4 / ABEC 7"],
          ["100", "180", "34", "148.0", "128.5", "9,800", "P5 / ABEC 5"],
          ["120", "215", "40", "212.0", "186.0", "7,200", "P5 / ABEC 5"],
        ]
      : p.load === "Medium"
      ? [
          ["25", "47", "12", "14.8", "9.5", "48,000", "P4 / ABEC 7"],
          ["40", "68", "15", "24.5", "18.2", "32,000", "P4 / ABEC 7"],
          ["50", "80", "16", "31.0", "24.5", "26,000", "P5 / ABEC 5"],
          ["60", "95", "18", "42.5", "33.0", "20,000", "P5 / ABEC 5"],
        ]
      : [
          ["10", "26", "8", "4.55", "2.36", "65,000", "P2 / ABEC 9"],
          ["15", "32", "9", "5.85", "3.10", "55,000", "P4 / ABEC 7"],
          ["20", "42", "12", "9.40", "5.05", "42,000", "P4 / ABEC 7"],
          ["25", "52", "15", "14.0", "7.85", "34,000", "P4 / ABEC 7"],
        ];
  return sets.map(([d, D, B, Cr, C0r, rpm, grade], i) => [
    `GLZ-${base}-${(7005 + i * 3).toString().padStart(4, "0")}-${i % 2 ? "E" : "C"}`,
    d!,
    D!,
    B!,
    Cr!,
    C0r!,
    rpm!,
    grade!,
  ]);
}

/* -------------------------------------------------------------------------- */
/*  ENGINEERING / TECHNICAL page (screen 3)                                    */
/* -------------------------------------------------------------------------- */

function engineeringPage(doc: Doc) {
  doc.addPage();
  fillBg(doc, BRAND.black);
  pageChrome(doc, {
    section: "03 · ENGINEERING / PRECISION SERIES",
    page: `P.${String(PRODUCTS.length + 3).padStart(2, "0")} / TECHNICAL`,
    activeNav: "TECHNICAL",
  });

  // Title
  eyebrow(doc, "GLZ ENGINEERING / V.2026 TECHNICAL CATALOG", PAGE.margin, 92, {
    color: BRAND.yellow,
    size: 8,
    tracking: 2.4,
  });
  display(doc, "PRECISION", PAGE.margin, 110, { size: 44, color: BRAND.smoke, tracking: 1 });
  display(doc, "UNDER PRESSURE.", PAGE.margin, 150, { size: 44, color: BRAND.yellow, tracking: 1 });

  // Two-column main: exploded image left, precision metrics right
  const blockY = 210;
  const leftW = 320;
  const blockH = 280;
  // exploded image
  bgImage(doc, EXPLODED_SPHERICAL, PAGE.margin, blockY, leftW, blockH, 0.12);
  hudBrackets(doc, PAGE.margin, blockY, leftW, blockH, 10, BRAND.yellow, 1);
  // tech tag
  doc.save();
  doc.font(F.bold).fontSize(6.5).fillColor(BRAND.yellow);
  doc.text("● SYSTEM_LIVE: TECHNICAL_VISUAL_019", PAGE.margin + 10, blockY + 10, {
    characterSpacing: 1.4,
    lineBreak: false,
  });
  doc.restore();

  // Precision Metrics sidebar
  const sX = PAGE.margin + leftW + 16;
  const sW = PAGE.width - sX - PAGE.margin;
  card(doc, sX, blockY, sW, blockH, { topAccent: true });
  eyebrow(doc, "PRECISION METRICS", sX + 14, blockY + 14, {
    color: BRAND.yellow,
    size: 9,
    tracking: 2,
  });

  const metrics = [
    { k: "ABEC RATING COMPLIANCE", v: "ABEC 7/9", pct: 0.9 },
    { k: "PEAK RPM THRESHOLD", v: "125,000+", pct: 0.95 },
    { k: "TOLERANCE DEVIATION (μm)", v: "< 0.005", pct: 0.7 },
  ];
  metrics.forEach((m, i) => {
    const my = blockY + 42 + i * 50;
    doc.save();
    doc.font(F.bold).fontSize(6.5).fillColor(BRAND.muted);
    doc.text(safe(m.k), sX + 14, my, {
      width: sW - 28,
      characterSpacing: 1.2,
      lineBreak: false,
    });
    doc.font(F.head).fontSize(14).fillColor(BRAND.yellow);
    doc.text(safe(m.v), sX + 14, my + 10, {
      width: sW - 28,
      align: "right",
      lineBreak: false,
    });
    // bar
    doc.rect(sX + 14, my + 32, sW - 28, 2).fill(BRAND.border);
    doc.rect(sX + 14, my + 32, (sW - 28) * m.pct, 2).fill(BRAND.yellow);
    doc.restore();
  });

  // Material spec mini-grid inside sidebar
  const mY = blockY + 200;
  doc.save();
  doc.font(F.bold).fontSize(7).fillColor(BRAND.yellow);
  doc.text("MATERIAL SPECIFICATION", sX + 14, mY, { characterSpacing: 1.6, lineBreak: false });
  doc.restore();
  const spec = [
    { k: "STEEL GRADE", v: "AISI 52100" },
    { k: "HARDNESS", v: "HRC 64.2" },
    { k: "DENSITY", v: "7.81 g/cm³" },
    { k: "COEF. EXP", v: "11.5 μm/m·C" },
  ];
  const sgW = (sW - 28 - 8) / 2;
  spec.forEach((s, i) => {
    const cx = sX + 14 + (i % 2) * (sgW + 8);
    const cy = mY + 16 + Math.floor(i / 2) * 36;
    doc.save();
    doc.rect(cx, cy, sgW, 32).strokeColor(BRAND.border).lineWidth(0.5).stroke();
    doc.font(F.bold).fontSize(6).fillColor(BRAND.muted);
    doc.text(safe(s.k), cx + 6, cy + 5, { characterSpacing: 1.2, lineBreak: false });
    doc.font(F.head).fontSize(11).fillColor(BRAND.smoke);
    doc.text(safe(s.v), cx + 6, cy + 16, { lineBreak: false });
    doc.restore();
  });

  // Process cards row
  const procY = blockY + blockH + 22;
  const procs = [
    {
      code: "PROC-A1",
      title: "PRECISION FORGING",
      body: "Near-net-shape ring rolling ensures optimal grain structure alignment for extreme fatigue resistance in high-load aerospace applications.",
    },
    {
      code: "PROC-A2",
      title: "HEAT TREATMENT",
      body: "Atmosphere-controlled vacuum hardening achieves 62-64 HRC while maintaining exceptional core toughness and dimensional stability.",
    },
    {
      code: "PROC-A3",
      title: "QA INSPECTION",
      body: "100% automated optical inspection (AOI) combined with ultrasonic subsurface testing for zero-defect delivery mandates.",
    },
  ];
  const pW = (PAGE.width - PAGE.margin * 2 - 16) / 3;
  const pH = 130;
  procs.forEach((p, i) => {
    const x = PAGE.margin + i * (pW + 8);
    card(doc, x, procY, pW, pH, { topAccent: true });
    doc.save();
    doc.font(F.bold).fontSize(6.5).fillColor(BRAND.muted);
    doc.text(p.code, x + pW - 70, procY + 12, {
      width: 60,
      align: "right",
      characterSpacing: 1.4,
      lineBreak: false,
    });
    doc.font(F.head).fontSize(15).fillColor(BRAND.yellow);
    doc.text(p.title, x + 14, procY + 32, { characterSpacing: 0.8, lineBreak: false });
    doc.font(F.reg).fontSize(8).fillColor(BRAND.variant);
    doc.text(p.body, x + 14, procY + 56, { width: pW - 28, lineGap: 2.5 });
    doc.restore();
  });

  pageFooter(doc, "P.TECH · PRECISION SERIES");
}

/* -------------------------------------------------------------------------- */
/*  GLOBAL NETWORK page (screen 4)                                             */
/* -------------------------------------------------------------------------- */

function globalNetworkPage(doc: Doc) {
  doc.addPage();
  fillBg(doc, BRAND.black);
  pageChrome(doc, {
    section: "04 · ENTERPRISE / GLOBAL NETWORK",
    page: `P.${String(PRODUCTS.length + 4).padStart(2, "0")} / NETWORK`,
    activeNav: "ENTERPRISE",
  });

  // World map hero
  const mapY = 86;
  const mapH = 240;
  bgImage(doc, WORLD_MAP, 0, mapY, PAGE.width, mapH, 0.25);
  // dark gradient bottom of map for legibility
  doc.save();
  doc.fillOpacity(0.55);
  doc.rect(0, mapY + mapH - 110, PAGE.width, 110).fill(BRAND.black);
  doc.restore();

  // Overlay headline on map
  eyebrow(doc, "GLOBAL LOGISTICS & ENTERPRISE", PAGE.margin, mapY + mapH - 92, {
    color: BRAND.yellow,
    size: 8,
    tracking: 2.4,
  });
  display(doc, "MANUFACTURING HUB.", PAGE.margin, mapY + mapH - 76, {
    size: 30,
    color: BRAND.smoke,
    tracking: 0.8,
  });
  doc.save();
  doc.font(F.reg).fontSize(9).fillColor(BRAND.variant);
  doc.text(
    "Forty-plus markets served. Aerospace-grade traceability from forge to flight.",
    PAGE.margin,
    mapY + mapH - 36,
    { width: 380, lineGap: 2.5 }
  );
  doc.restore();

  // Network KPI strip
  const nY = mapY + mapH + 16;
  const nW = (PAGE.width - PAGE.margin * 2 - 16) / 3;
  const ncards = [
    { v: "42", l: "NETWORK CAPACITY", u: "HUBS" },
    { v: "24/7", l: "LEAD TIME", u: "CONTACT" },
    { v: "100%", l: "COMPLIANCE", u: "AUDITED" },
  ];
  ncards.forEach((n, i) => {
    const x = PAGE.margin + i * (nW + 8);
    kpiCard(doc, x, nY, nW, 70, n.v, n.l, { unit: n.u });
  });

  // INDUSTRIES SERVED
  const iY = nY + 86;
  eyebrow(doc, "INDUSTRIES SERVED", PAGE.margin, iY, {
    color: BRAND.yellow,
    size: 9,
    tracking: 2.4,
  });
  const industries = [
    { tag: "AERO-001", name: "AEROSPACE", note: "Turbine spindles · Landing gear · Actuators" },
    { tag: "MIN-002", name: "MINING & AGGREGATE", note: "Crushers · Conveyors · Vibrating screens" },
    { tag: "WND-003", name: "WIND ENERGY", note: "Main shaft · Yaw · Pitch · Gearbox" },
  ];
  const iH = 86;
  const iW2 = (PAGE.width - PAGE.margin * 2 - 16) / 3;
  industries.forEach((ind, i) => {
    const x = PAGE.margin + i * (iW2 + 8);
    const y = iY + 18;
    card(doc, x, y, iW2, iH, { topAccent: true });
    doc.save();
    doc.font(F.bold).fontSize(6.5).fillColor(BRAND.muted);
    doc.text(ind.tag, x + iW2 - 70, y + 10, {
      width: 60,
      align: "right",
      characterSpacing: 1.4,
      lineBreak: false,
    });
    doc.font(F.head).fontSize(16).fillColor(BRAND.yellow);
    doc.text(ind.name, x + 14, y + 28, { characterSpacing: 0.6, lineBreak: false });
    doc.font(F.reg).fontSize(8).fillColor(BRAND.variant);
    doc.text(ind.note, x + 14, y + 54, { width: iW2 - 28, lineGap: 2 });
    doc.restore();
  });

  // CLOSER strip
  const cY = iY + 130;
  doc.save();
  doc.rect(PAGE.margin, cY, PAGE.width - PAGE.margin * 2, 100).fill(BRAND.graphite);
  doc.rect(PAGE.margin, cY, 3, 100).fill(BRAND.yellow);
  doc.restore();
  display(doc, "BUILT FOR PERFORMANCE.", PAGE.margin + 18, cY + 16, {
    size: 24,
    color: BRAND.smoke,
    tracking: 0.8,
  });
  display(doc, "TRUSTED WORLDWIDE.", PAGE.margin + 18, cY + 44, {
    size: 24,
    color: BRAND.yellow,
    tracking: 0.8,
  });

  // Contact block right
  const cxR = PAGE.width / 2 + 40;
  doc.save();
  doc.font(F.bold).fontSize(7).fillColor(BRAND.muted);
  doc.text("GLOBAL HQ", cxR, cY + 16, { characterSpacing: 1.6, lineBreak: false });
  doc.font(F.med).fontSize(8.5).fillColor(BRAND.smoke);
  doc.text(siteConfig.legalName, cxR, cY + 28, { lineBreak: false });
  doc.font(F.reg).fontSize(7.5).fillColor(BRAND.variant);
  doc.text(
    `${siteConfig.contact.address.street}\n${siteConfig.contact.address.locality}, ${siteConfig.contact.address.postalCode}, IN`,
    cxR,
    cY + 40,
    { lineGap: 1.5, width: PAGE.width - PAGE.margin - cxR }
  );
  doc.font(F.bold).fontSize(8).fillColor(BRAND.yellow);
  doc.text(siteConfig.contact.phoneDisplay, cxR, cY + 72, { lineBreak: false });
  doc.text(siteConfig.contact.email, cxR + 90, cY + 72, { lineBreak: false });
  doc.restore();

  pageFooter(doc, "P.NETWORK · BUILT FOR PERFORMANCE");
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export async function buildCatalogueBuffer(): Promise<Buffer> {
  const doc = new PDFDocument({
    size: [PAGE.width, PAGE.height],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    info: {
      Title: `${siteConfig.name} — Product Catalogue 2026`,
      Author: siteConfig.legalName,
      Subject: "Precision industrial bearings · Product catalogue 2026",
      Keywords:
        "bearings, industrial bearings, spherical, cylindrical, tapered, angular contact, GLZ Bearings, Glidex International",
      Creator: siteConfig.name,
    },
  });

  registerFonts(doc);

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  coverPage(doc);
  masteryPage(doc);
  PRODUCTS.forEach((p, i) => productPage(doc, p, i));
  engineeringPage(doc);
  globalNetworkPage(doc);

  doc.end();
  return done;
}

export async function writeCatalogueToPublic(): Promise<string> {
  const buf = await buildCatalogueBuffer();
  const outDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "glz-bearings-catalogue.pdf");
  fs.writeFileSync(outPath, buf);
  return outPath;
}

let cachedBuffer: Buffer | null = null;
export async function getCatalogueAttachment(): Promise<{
  filename: string;
  content: Buffer;
}> {
  if (cachedBuffer) {
    return { filename: "glz-bearings-catalogue.pdf", content: cachedBuffer };
  }
  const pre = path.resolve(process.cwd(), "public/glz-bearings-catalogue.pdf");
  if (fs.existsSync(pre)) {
    cachedBuffer = fs.readFileSync(pre);
  } else {
    cachedBuffer = await buildCatalogueBuffer();
  }
  return { filename: "glz-bearings-catalogue.pdf", content: cachedBuffer };
}
