/**
 * Generates all site imagery via Gemini 2.5 Flash Image ("Nano Banana").
 *
 * Usage:
 *   1. Put your key in .env.local:  GEMINI_API_KEY=ya29...
 *   2. npm run gen:images
 *
 * Output: public/images/*.png
 */

import { GoogleGenAI } from "@google/genai";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";

// load .env.local then .env
config({ path: ".env.local" });
config();

const KEY = process.env.GEMINI_API_KEY;
if (!KEY || KEY === "MY_GEMINI_API_KEY") {
  console.error(
    "\n[gen-images] GEMINI_API_KEY missing. Add it to .env.local and retry.\n"
  );
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-2.5-flash-image";

const OUT_DIR = "public/images";

// Shared style suffix — keeps everything visually consistent
const STYLE = `
Cinematic industrial photography. Dark moody atmosphere with tungsten / amber rim lighting against deep black (#0B0B0B) and graphite (#1A1A1A) backgrounds. Hint of warm yellow accent (#F4C400) only where naturally motivated by light sources or sparks. Premium engineering brand aesthetic — restrained, calm, confident. No text, no logos, no watermarks. Sharp focus on subject, soft fall-off into shadow. Shot on full-frame DSLR, 50mm prime, shallow depth of field where appropriate. Photorealistic, NOT illustrated, NOT 3D-render-looking, NOT cartoon.
`.trim();

type Job = {
  file: string;
  aspect: "1:1" | "16:9" | "4:3" | "3:2";
  prompt: string;
};

const JOBS: Job[] = [
  // ── Product cards ──────────────────────────────────────────────
  {
    file: "products/spherical.png",
    aspect: "4:3",
    prompt: `Macro studio photograph of a single spherical roller bearing, isolated on a graphite-dark background. Polished chrome steel surface with anisotropic brushed-metal reflections. Slight oil sheen. Centred, three-quarter angle, dramatic side light from upper-left, deep shadows on the right. ${STYLE}`,
  },
  {
    file: "products/cylindrical.png",
    aspect: "4:3",
    prompt: `Macro studio photograph of a single cylindrical roller bearing, isolated on a graphite-dark background. Cylindrical rollers visible inside the cage. Hardened chrome steel, mirror polish, micro-machining marks faintly visible. Top-down 30° angle, key light from camera-right, fill bounce. ${STYLE}`,
  },
  {
    file: "products/tapered.png",
    aspect: "4:3",
    prompt: `Macro studio photograph of a single tapered roller bearing, isolated on a graphite-dark background. Cone-shaped rollers and tapered race clearly visible. Case-hardened steel finish. Three-quarter angle showing both inner cone and outer cup. Strong rim light along the taper edge. ${STYLE}`,
  },

  // ── Process / "How we work" steps ──────────────────────────────
  {
    file: "process/01-specification.png",
    aspect: "3:2",
    prompt: `An engineer's workspace: technical engineering drawings of a bearing on dark drafting paper, mechanical pencil and metal calipers laid across them, single warm desk lamp pooling light. Top-down view. Hands not visible. Atmosphere of focused calculation. ${STYLE}`,
  },
  {
    file: "process/02-material.png",
    aspect: "3:2",
    prompt: `Stacked steel bar stock and forged steel rings in an industrial warehouse, viewed at eye level. Rough cold-rolled finish on raw stock contrasted with polished forged rings. Dim factory lighting from above with shafts of light cutting through dust. ${STYLE}`,
  },
  {
    file: "process/03-manufacturing.png",
    aspect: "3:2",
    prompt: `CNC grinding machine precisely finishing a steel bearing race. Coolant fluid spray catching the light. Sparks faintly visible. Tight close-up of the grinding wheel meeting the rotating workpiece. Industrial environment, controlled lighting. ${STYLE}`,
  },
  {
    file: "process/04-quality.png",
    aspect: "3:2",
    prompt: `A coordinate measuring machine (CMM) inspecting a finished bearing in a clean metrology lab. Precision probe touching the race surface. Clinical low-light environment, single overhead spot. Calm, deliberate, engineered. ${STYLE}`,
  },

  // ── Hero atmosphere (optional fallback if 3D fails) ────────────
  {
    file: "hero/atmosphere.png",
    aspect: "16:9",
    prompt: `Wide cinematic shot of a dark industrial precision-engineering facility at night. Polished concrete floor, faint warm amber light spilling from machinery, deep blacks dominate the frame, atmospheric haze. No people. Empty space on the left for text overlay. ${STYLE}`,
  },

  // ── Network background (subtle world map alternative) ──────────
  {
    file: "network/factory.png",
    aspect: "2:1",
    prompt: `Aerial twilight shot of a vast industrial manufacturing complex, container yard with shipping containers, illuminated by warm sodium lights. Deep blue-black sky, monochromatic with warm accents. Wide cinematic crop. ${STYLE}`,
  },
];

await mkdir(OUT_DIR, { recursive: true });
for (const sub of ["products", "process", "hero", "network"]) {
  await mkdir(join(OUT_DIR, sub), { recursive: true });
}

console.log(`\n[gen-images] Generating ${JOBS.length} images via ${MODEL}\n`);

let ok = 0;
let fail = 0;

for (const job of JOBS) {
  const outPath = join(OUT_DIR, job.file);
  if (existsSync(outPath)) {
    console.log(`  ⏭  ${job.file}  (exists, skipping)`);
    continue;
  }
  process.stdout.write(`  ⋯  ${job.file}  ${job.aspect}  ...`);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: job.prompt }] }],
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: job.aspect },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No image data returned");
    }

    const buf = Buffer.from(imagePart.inlineData.data!, "base64");
    await writeFile(outPath, buf);
    process.stdout.write(`  ✓  (${(buf.length / 1024).toFixed(0)} KB)\n`);
    ok++;
  } catch (err: any) {
    process.stdout.write(`  ✗\n     ${err?.message || err}\n`);
    fail++;
  }
}

console.log(`\n[gen-images] Done. ${ok} ok, ${fail} failed.\n`);
