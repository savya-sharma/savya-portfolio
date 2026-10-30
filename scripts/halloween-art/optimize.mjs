// Crops and downsizes the supplied illustrations for the site. The originals are left as-is.
//   node scripts/halloween-art/optimize.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alphaBounds, decodePNG, encodePNG, resample } from './raster.mjs';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/images/halloween');

// [source, output, output width] — widths are ~2× their largest display size.
const JOBS = [
  ['Glowing Vintage Hanging Lantern.png', 'lantern.png', 220],
  ['bat_transparent.png', 'bat-hanging.png', 112],
];

for (const [src, out, width] of JOBS) {
  const img = decodePNG(readFileSync(join(DIR, src)));
  const crop = alphaBounds(img);
  const height = Math.round((crop.h / crop.w) * width);
  const png = encodePNG(width, height, resample(img, crop, width, height));
  writeFileSync(join(DIR, out), png);
  // The top-centre of the topmost opaque row is where each piece hangs from.
  const top = [];
  for (let x = crop.x; x < crop.x + crop.w; x++) if (img.rgba[(crop.y * img.w + x) * 4 + 3] > 8) top.push(x);
  const hangX = ((top[0] + top[top.length - 1]) / 2 - crop.x) / crop.w;
  console.log(`${out}\t${width}x${height}\t${(png.length / 1024).toFixed(1)} KB\thang point x=${(hangX * 100).toFixed(1)}%  (from ${src}, ${img.w}x${img.h}, ${(readFileSync(join(DIR, src)).length / 1024).toFixed(0)} KB)`);
}
