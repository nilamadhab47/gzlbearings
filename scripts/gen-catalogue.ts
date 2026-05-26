/**
 * Build-time script that produces public/glz-bearings-catalogue.pdf.
 * Wired into `npm run build` via the prebuild hook in package.json.
 */

import { writeCatalogueToPublic } from "../src/lib/catalogue/pdf";

async function main() {
  const t0 = Date.now();
  const outPath = await writeCatalogueToPublic();
  const ms = Date.now() - t0;
  // eslint-disable-next-line no-console
  console.log(`[catalogue] wrote ${outPath} in ${ms}ms`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[catalogue] generation failed", err);
  process.exit(1);
});
