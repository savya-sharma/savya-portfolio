// Minimal anti-aliased SDF rasterizer and PNG encoder/decoder (no dependencies).
import { deflateSync, inflateSync, crc32 } from 'node:zlib';

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const mix = (a, b, t) => a + (b - a) * t;
export const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

export function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return mix(
    mix(hash2(ix, iy), hash2(ix + 1, iy), ux),
    mix(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux),
    uy,
  );
}

export function fbm(x, y, octaves = 4) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq + i * 17.3, y * freq - i * 9.1);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

// ── Shapes: { box: [x0, y0, x1, y1], sdf(px, py) } in pixel units ──

export function capsule(ax, ay, bx, by, ra, rb = ra) {
  const dx = bx - ax, dy = by - ay, ll = dx * dx + dy * dy || 1e-9, r = Math.max(ra, rb);
  return {
    box: [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.max(ax, bx) + r, Math.max(ay, by) + r],
    sdf(px, py) {
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / ll, 0, 1);
      return Math.hypot(px - ax - dx * t, py - ay - dy * t) - mix(ra, rb, t);
    },
  };
}

export function ellipse(cx, cy, rx, ry, rot = 0) {
  const cs = Math.cos(rot), sn = Math.sin(rot), r = Math.max(rx, ry);
  const local = (px, py) => {
    const x = px - cx, y = py - cy;
    return [x * cs + y * sn, -x * sn + y * cs];
  };
  return {
    box: [cx - r, cy - r, cx + r, cy + r],
    sdf(px, py) {
      const [lx, ly] = local(px, py);
      const k0 = Math.hypot(lx / rx, ly / ry);
      if (k0 < 1e-6) return -Math.min(rx, ry);
      const k1 = Math.hypot(lx / (rx * rx), ly / (ry * ry));
      return (k0 * (k0 - 1)) / k1;
    },
    // Normalized coordinates inside the ellipse (unit circle space).
    unit(px, py) {
      const [lx, ly] = local(px, py);
      return [lx / rx, ly / ry];
    },
  };
}

function boxOf(pts, pad) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y);
    x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
}

export function polygon(pts) {
  return {
    box: boxOf(pts, 0),
    sdf(px, py) {
      let d = Infinity, s = 1;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [vix, viy] = pts[i], [vjx, vjy] = pts[j];
        const ex = vjx - vix, ey = vjy - viy, wx = px - vix, wy = py - viy;
        const t = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey || 1e-9), 0, 1);
        const bx = wx - ex * t, by = wy - ey * t;
        d = Math.min(d, bx * bx + by * by);
        const c1 = py >= viy, c2 = py < vjy, c3 = ex * wy > ey * wx;
        if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
      }
      return s * Math.sqrt(d);
    },
  };
}

// Polyline stroke; `r` is a radius or one radius per point (for tapering).
export function path(pts, r) {
  const radii = typeof r === 'number' ? pts.map(() => r) : r;
  return {
    box: boxOf(pts, Math.max(...radii)),
    sdf(px, py) {
      let d = Infinity;
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const dx = bx - ax, dy = by - ay;
        const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1e-9), 0, 1);
        d = Math.min(d, Math.hypot(px - ax - dx * t, py - ay - dy * t) - mix(radii[i], radii[i + 1], t));
      }
      return d;
    },
  };
}

export function quad(a, c, b, n = 16) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return pts;
}

// ── Canvas (premultiplied float RGBA) ──

export class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Float32Array(w * h * 4);
  }

  // paint: [r, g, b, a] or (px, py, d) => [r, g, b, a], colors in 0..1.
  draw(shape, paint, feather = 1) {
    const { box, sdf } = shape;
    const pad = feather + 1, half = feather / 2, buf = this.px;
    const x0 = Math.max(0, Math.floor(box[0] - pad)), y0 = Math.max(0, Math.floor(box[1] - pad));
    const x1 = Math.min(this.w - 1, Math.ceil(box[2] + pad)), y1 = Math.min(this.h - 1, Math.ceil(box[3] + pad));
    const fn = typeof paint === 'function' ? paint : () => paint;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const d = sdf(px, py);
        if (d >= half) continue;
        const cov = d <= -half ? 1 : 0.5 - d / feather;
        const c = fn(px, py, d);
        const a = clamp(c[3] * cov, 0, 1);
        if (a <= 0) continue;
        const i = (y * this.w + x) * 4, ia = 1 - a;
        buf[i] = clamp(c[0], 0, 1) * a + buf[i] * ia;
        buf[i + 1] = clamp(c[1], 0, 1) * a + buf[i + 1] * ia;
        buf[i + 2] = clamp(c[2], 0, 1) * a + buf[i + 2] * ia;
        buf[i + 3] = a + buf[i + 3] * ia;
      }
    }
  }

  // Straight (non-premultiplied) 8-bit RGBA; fully transparent pixels are zeroed.
  toRGBA() {
    const out = new Uint8Array(this.w * this.h * 4);
    for (let i = 0; i < out.length; i += 4) {
      const a = this.px[i + 3];
      if (a < 0.5 / 255) continue;
      out[i] = Math.round(clamp(this.px[i] / a, 0, 1) * 255);
      out[i + 1] = Math.round(clamp(this.px[i + 1] / a, 0, 1) * 255);
      out[i + 2] = Math.round(clamp(this.px[i + 2] / a, 0, 1) * 255);
      out[i + 3] = Math.round(clamp(a, 0, 1) * 255);
    }
    return out;
  }
}

// ── PNG encoding (8-bit RGBA, adaptive per-row filtering) ──

function paeth(a, b, c) {
  const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// Decodes 8-bit, non-interlaced RGBA or RGB PNGs to straight RGBA.
export function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('Not a PNG');
  let w = 0, h = 0, depth = 0, type = 0, interlace = 0;
  const idat = [];
  for (let o = 8; o < buf.length;) {
    const len = buf.readUInt32BE(o), name = buf.toString('ascii', o + 4, o + 8);
    if (name === 'IHDR') {
      w = buf.readUInt32BE(o + 8); h = buf.readUInt32BE(o + 12);
      depth = buf[o + 16]; type = buf[o + 17]; interlace = buf[o + 20];
    } else if (name === 'IDAT') idat.push(buf.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  if (depth !== 8 || (type !== 6 && type !== 2) || interlace) {
    throw new Error(`Unsupported PNG (bit depth ${depth}, color type ${type}, interlace ${interlace})`);
  }
  const bpp = type === 6 ? 4 : 3, stride = w * bpp;
  const raw = inflateSync(Buffer.concat(idat)), px = new Uint8Array(stride * h);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? px[y * stride + i - bpp] : 0;
      const b = y ? px[(y - 1) * stride + i] : 0;
      const c = i >= bpp && y ? px[(y - 1) * stride + i - bpp] : 0;
      const p = filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : filter === 4 ? paeth(a, b, c) : 0;
      px[y * stride + i] = (raw[y * (stride + 1) + 1 + i] + p) & 255;
    }
  }
  if (bpp === 4) return { w, h, rgba: px };
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0, j = 0; i < px.length; i += 3, j += 4) {
    rgba[j] = px[i]; rgba[j + 1] = px[i + 1]; rgba[j + 2] = px[i + 2]; rgba[j + 3] = 255;
  }
  return { w, h, rgba };
}

// Bounding box of pixels with alpha above `threshold`.
export function alphaBounds({ w, h, rgba }, threshold = 8) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > threshold) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x);
        y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Area-averaged downscale of a crop, in premultiplied alpha so edges stay clean.
export function resample({ w, rgba }, crop, dw, dh) {
  const out = new Uint8Array(dw * dh * 4);
  const sx = crop.w / dw, sy = crop.h / dh;
  for (let y = 0; y < dh; y++) {
    const fy0 = crop.y + y * sy, fy1 = fy0 + sy;
    for (let x = 0; x < dw; x++) {
      const fx0 = crop.x + x * sx, fx1 = fx0 + sx;
      let r = 0, g = 0, b = 0, a = 0, area = 0;
      for (let iy = Math.floor(fy0); iy < Math.ceil(fy1); iy++) {
        const wy = Math.min(fy1, iy + 1) - Math.max(fy0, iy);
        for (let ix = Math.floor(fx0); ix < Math.ceil(fx1); ix++) {
          const wt = wy * (Math.min(fx1, ix + 1) - Math.max(fx0, ix));
          const i = (iy * w + ix) * 4, al = rgba[i + 3] / 255;
          r += rgba[i] * al * wt; g += rgba[i + 1] * al * wt; b += rgba[i + 2] * al * wt;
          a += al * wt; area += wt;
        }
      }
      const o = (y * dw + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a);
        out[o + 3] = Math.round((a / area) * 255);
      }
    }
  }
  return out;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

export function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  const zero = new Uint8Array(stride);
  const candidate = new Uint8Array(stride);
  const best = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const row = rgba.subarray(y * stride, (y + 1) * stride);
    const prev = y ? rgba.subarray((y - 1) * stride, y * stride) : zero;
    let bestScore = Infinity, bestType = 0;
    for (let type = 0; type <= 4; type++) {
      let score = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= 4 ? row[i - 4] : 0, b = prev[i], c = i >= 4 ? prev[i - 4] : 0;
        const p = type === 0 ? 0 : type === 1 ? a : type === 2 ? b : type === 3 ? (a + b) >> 1 : paeth(a, b, c);
        const v = (row[i] - p) & 255;
        candidate[i] = v;
        score += v < 128 ? v : 256 - v;
      }
      if (score < bestScore) {
        bestScore = score;
        bestType = type;
        best.set(candidate);
      }
    }
    raw[y * (stride + 1)] = bestType;
    raw.set(best, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
