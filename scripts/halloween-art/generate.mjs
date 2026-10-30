// Renders the Halloween decoration PNGs into public/images/halloween/.
//   node scripts/halloween-art/generate.mjs [--preview <dir>]
// --preview also writes each asset composited on the site's light and dark backgrounds.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Canvas, capsule, clamp, ellipse, encodePNG, fbm, mix, mix3, mulberry32, path, polygon, quad, smoothstep,
} from './raster.mjs';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/images/halloween');

// Palette: deep charcoal, muted grey, ghostly white, restrained violet.
const CHARCOAL = [0.07, 0.065, 0.08];
const VIOLET = [0.5, 0.42, 0.68];
const SILK = [0.93, 0.93, 0.97];
const SHADOW = [0.08, 0.07, 0.11];

const norm = ([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
};
const LIGHT = norm([-0.45, -0.6, 0.66]);
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

// Lambert + Blinn terms for a surface normal given by its screen-space xy.
function shade(nx, ny, shininess = 40) {
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return {
    nz,
    diff: Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]),
    spec: Math.pow(Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]), shininess),
  };
}

function lit(albedo, s, specK, rimK) {
  const rim = Math.pow(1 - s.nz, 2.5) * rimK;
  const k = 0.28 + 0.9 * s.diff;
  return [
    albedo[0] * k + s.spec * specK + VIOLET[0] * rim,
    albedo[1] * k + s.spec * specK + VIOLET[1] * rim,
    albedo[2] * k + s.spec * specK + VIOLET[2] * rim,
  ];
}

// Shaded ellipsoid; albedo(px, py, nx, ny) supplies surface texture.
function ellipsoid(c, e, albedo, { specK = 0.25, rimK = 0.18, feather = 1 } = {}) {
  c.draw(e, (px, py) => {
    const [nx, ny] = e.unit(px, py);
    return [...lit(albedo(px, py, nx, ny), shade(nx, ny), specK, rimK), 1];
  }, feather);
}

// Shaded tapered cylinder between a and b.
function limb(c, a, b, ra, rb, albedo = () => CHARCOAL, specK = 0.3) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-9;
  const ux = dx / len, uy = dy / len;
  c.draw(capsule(a[0], a[1], b[0], b[1], ra, rb), (px, py) => {
    const t = clamp(((px - a[0]) * ux + (py - a[1]) * uy) / len, 0, 1);
    const u = clamp(((px - a[0]) * -uy + (py - a[1]) * ux) / mix(ra, rb, t), -0.98, 0.98);
    return [...lit(albedo(px, py, t), shade(-uy * u, ux * u, 30), specK, 0.14), 1];
  });
}

function hair(c, x, y, angle, length, width, color, alpha) {
  const ex = x + Math.cos(angle) * length, ey = y + Math.sin(angle) * length;
  c.draw(capsule(x, y, ex, ey, width, width * 0.3), [...color, alpha]);
}

// ── Spider: top-down, head up, 512×512, body centred for rotation ──

function spider() {
  const c = new Canvas(512, 512);
  const rnd = mulberry32(11);
  const cx = 256, ceph = [256, 252], abd = [256, 360];

  const legAlbedo = (px, py, t) => {
    const band = (1 - smoothstep(0, 0.1, t)) * 0.5 + smoothstep(0.88, 1, t) * 0.6;
    return mix3(CHARCOAL, [0.2, 0.18, 0.24], band * 0.5 + fbm(px / 3, py / 3) * 0.25);
  };

  // [attach angle°, segment directions°, lengths, start radius]
  const legs = [
    [-60, [-55, -75, -88, -96], [55, 50, 46, 22], 5.2],
    [-25, [-15, -35, -50, -58], [50, 46, 40, 20], 5.0],
    [10, [25, 50, 62, 68], [44, 40, 36, 18], 4.8],
    [40, [55, 80, 92, 98], [57, 52, 48, 23], 5.4],
  ];
  const deg = (d) => (d * Math.PI) / 180;

  for (const side of [-1, 1]) {
    for (const [attach, dirs, lens, r0] of legs) {
      const a = deg(attach);
      let p = [ceph[0] + side * 42 * Math.cos(a) * 0.82, ceph[1] + 48 * Math.sin(a) * 0.82];
      const radii = [r0, r0 * 0.8, r0 * 0.6, r0 * 0.4, r0 * 0.2];
      const pts = [p];
      dirs.forEach((d, i) => {
        p = [p[0] + side * Math.cos(deg(d)) * lens[i], p[1] + Math.sin(deg(d)) * lens[i]];
        pts.push(p);
      });
      for (let i = 0; i < 4; i++) {
        limb(c, pts[i], pts[i + 1], radii[i], radii[i + 1], legAlbedo);
        // Setae: fine bristles angled toward the leg tip.
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const len = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax);
        const count = Math.floor(len / 3.2);
        for (let k = 0; k < count; k++) {
          const t = (k + rnd()) / count, r = mix(radii[i], radii[i + 1], t);
          const s = k % 2 ? 1 : -1;
          const hx = ax + (bx - ax) * t - Math.sin(ang) * r * s * 0.9;
          const hy = ay + (by - ay) * t + Math.cos(ang) * r * s * 0.9;
          const light = rnd() < 0.25;
          hair(c, hx, hy, ang + s * (0.5 + rnd() * 0.4), (2.5 + rnd() * 4) * (0.5 + r / 6), 0.38,
            light ? [0.42, 0.4, 0.48] : [0.04, 0.035, 0.05], light ? 0.5 : 0.9);
        }
      }
      for (let i = 1; i < 4; i++) {
        ellipsoid(c, ellipse(pts[i][0], pts[i][1], radii[i] * 1.12, radii[i] * 1.12),
          () => [0.15, 0.135, 0.17], { specK: 0.35 });
      }
    }
  }

  // Abdomen with a muted folium pattern and fur.
  const abdomen = ellipse(abd[0], abd[1], 60, 80);
  ellipsoid(c, abdomen, (px, py, nx, ny) => {
    const fur = 0.8 + 0.4 * fbm(px / 2.2, py / 2.2);
    const v = Math.sin((ny * 3.2 + Math.abs(nx) * 2.6) * Math.PI);
    const mark = smoothstep(0.55, 0.92, v) * (1 - smoothstep(0.28, 0.5, Math.abs(nx)))
      * smoothstep(-0.85, -0.45, ny) * (1 - smoothstep(0.55, 0.85, ny));
    const spine = (1 - smoothstep(0.04, 0.1, Math.abs(nx))) * smoothstep(-0.9, -0.4, ny) * (1 - smoothstep(0.1, 0.5, ny));
    const base = [CHARCOAL[0] * fur, CHARCOAL[1] * fur, CHARCOAL[2] * fur];
    return mix3(base, [0.36, 0.33, 0.43], clamp(mark * 0.6 + spine * 0.35, 0, 1));
  }, { specK: 0.16, feather: 1.2 });
  for (let i = 0; i < 320; i++) {
    const a = rnd() * Math.PI * 2;
    const x = abd[0] + Math.cos(a) * 60 * 0.97, y = abd[1] + Math.sin(a) * 80 * 0.97;
    const out = Math.atan2(Math.sin(a) / 80, Math.cos(a) / 60);
    hair(c, x, y, out + (rnd() - 0.5) * 0.9, 2.5 + rnd() * 4.5, 0.42, [0.045, 0.04, 0.055], 0.9);
  }
  for (let i = 0; i < 220; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.9;
    const nx = Math.cos(a) * r, ny = Math.sin(a) * r;
    hair(c, abd[0] + nx * 60, abd[1] + ny * 80, Math.PI / 2 + nx * 0.9 + (rnd() - 0.5) * 0.4,
      3 + rnd() * 3, 0.3, [0.5, 0.48, 0.56], 0.16 + (1 - r) * 0.12);
  }

  // Pedicel, chelicerae with fangs, pedipalps.
  limb(c, [cx, 296], [cx, 282], 7, 8);
  for (const side of [-1, 1]) {
    ellipsoid(c, ellipse(cx + side * 10, 208, 9, 15, side * -0.15),
      (px, py) => mix3(CHARCOAL, [0.16, 0.15, 0.19], fbm(px / 2, py / 2) * 0.6), { specK: 0.4 });
    limb(c, [cx + side * 9, 195], [cx + side * 5, 189], 1.7, 0.4, () => [0.03, 0.03, 0.04], 0.5);
    const palp = [[cx + side * 18, 218], [cx + side * 32, 196], [cx + side * 31, 177], [cx + side * 24, 165]];
    const pr = [3.6, 3.0, 2.5, 2.1];
    for (let i = 0; i < 3; i++) limb(c, palp[i], palp[i + 1], pr[i], pr[i + 1], legAlbedo);
    ellipsoid(c, ellipse(palp[3][0], palp[3][1], 3.6, 4.2), () => [0.11, 0.1, 0.13], { specK: 0.45 });
  }

  // Cephalothorax with radial striae and fovea.
  const carapace = ellipse(ceph[0], ceph[1], 42, 48);
  ellipsoid(c, carapace, (px, py, nx, ny) => {
    const phi = Math.atan2(ny, nx), r = Math.hypot(nx, ny);
    const striae = Math.pow(Math.abs(Math.cos(phi * 4)), 14) * smoothstep(0.2, 0.6, r);
    const k = (0.9 + 0.25 * fbm(px / 2.5, py / 2.5)) * (1 - striae * 0.35);
    return [CHARCOAL[0] * k + 0.03, CHARCOAL[1] * k + 0.028, CHARCOAL[2] * k + 0.036];
  }, { specK: 0.42, feather: 1.1 });
  c.draw(ellipse(cx, 262, 2.2, 6), [0.02, 0.02, 0.03, 0.7], 2);
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    hair(c, ceph[0] + Math.cos(a) * 40, ceph[1] + Math.sin(a) * 46, a + (rnd() - 0.5) * 0.6,
      1.5 + rnd() * 2.5, 0.35, [0.045, 0.04, 0.055], 0.8);
  }

  // Eight eyes in two rows.
  const eyes = [[-6, 219, 4.3], [6, 219, 4.3], [-15, 223, 3.1], [15, 223, 3.1],
    [-4, 228, 2.6], [4, 228, 2.6], [-20, 230, 2.7], [20, 230, 2.7]];
  for (const [ex, ey, er] of eyes) {
    const e = ellipse(cx + ex, ey, er, er);
    c.draw(e, (px, py) => {
      const [nx, ny] = e.unit(px, py);
      const s = shade(nx, ny, 90);
      const rim = Math.pow(1 - s.nz, 3) * 0.35;
      return [0.02 + s.spec * 0.95 + VIOLET[0] * rim, 0.02 + s.spec * 0.95 + VIOLET[1] * rim,
        0.03 + s.spec * 1.0 + VIOLET[2] * rim, 1];
    });
  }
  return c;
}

// ── Cobweb: anchored to the top-left corner, 768×768 ──

function raySeg(ox, oy, dx, dy, [ax, ay], [bx, by]) {
  const ex = bx - ax, ey = by - ay, den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const t = ((ax - ox) * ey - (ay - oy) * ex) / den;
  const u = ((ax - ox) * dy - (ay - oy) * dx) / den;
  return t > 0 && u >= 0 && u <= 1 ? t : Infinity;
}

function cobweb() {
  const S = 768, c = new Canvas(S, S), rnd = mulberry32(31);
  const hub = [206, 196];
  const frame = quad([1, 650], [262, 258], [690, 1], 48);
  const bounds = [[[1, 1], [1, 650]], [[1, 1], [690, 1]]];
  for (let i = 0; i < frame.length - 1; i++) bounds.push([frame[i], frame[i + 1]]);

  const threads = []; // { pts, r, alpha, spiral }
  threads.push({ pts: frame, r: 0.55, alpha: 0.9 });
  // Anchor lines beyond the frame and one broken, hanging strand.
  threads.push({ pts: quad(frame[14], [70, 700], [1, 767], 20), r: 0.45, alpha: 0.7 });
  threads.push({ pts: quad(frame[36], [700, 60], [767, 1], 20), r: 0.45, alpha: 0.7 });
  threads.push({ pts: quad(frame[26], [455, 340], [470, 470], 20), r: 0.38, alpha: 0.65 });
  threads.push({ pts: quad(frame[8], [100, 600], [70, 690], 16), r: 0.35, alpha: 0.55 });

  // Radial spokes ending on the walls or the frame.
  const N = 17, spokes = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (rnd() - 0.5) * 0.22;
    const dx = Math.cos(a), dy = Math.sin(a);
    const len = Math.min(...bounds.map(([p, q]) => raySeg(hub[0], hub[1], dx, dy, p, q)));
    if (!Number.isFinite(len)) continue;
    spokes.push({ a, dx, dy, len });
    threads.push({ pts: [hub, [hub[0] + dx * len, hub[1] + dy * len]], r: 0.5, alpha: 0.85 });
  }
  spokes.sort((p, q) => p.a - q.a);

  // Capture spiral: sagging segments between neighbouring spokes.
  const at = (s, r) => [hub[0] + s.dx * r, hub[1] + s.dy * r];
  const spiralPts = [];
  let r = 24;
  for (let step = 0; r < 560; step++) {
    const i = step % spokes.length, s0 = spokes[i], s1 = spokes[(i + 1) % spokes.length];
    const spacing = 11 + r * 0.024 + (rnd() - 0.5) * 7;
    const r1 = r + spacing / spokes.length;
    if (s0.len > r + 4 && s1.len > r1 + 4 && rnd() > 0.07) {
      const p0 = at(s0, r + (rnd() - 0.5) * 3), p1 = at(s1, r1 + (rnd() - 0.5) * 3);
      const sag = 0.03 + rnd() * 0.1;
      const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      const ctrl = [mix(mid[0], hub[0], sag), mix(mid[1], hub[1], sag) + 1 + rnd() * 3];
      const pts = quad(p0, ctrl, p1, 10);
      threads.push({ pts, r: 0.34, alpha: 0.45 + rnd() * 0.45, spiral: true });
      spiralPts.push(pts[5]);
    } else if (rnd() < 0.08 && s0.len > r + 10) {
      // Broken strand drooping under gravity.
      const p0 = at(s0, r);
      threads.push({ pts: quad(p0, [p0[0] + 6, p0[1] + 14], [p0[0] + 4, p0[1] + 22 + rnd() * 18], 10), r: 0.32, alpha: 0.6 });
    }
    r = r1;
  }
  // Dense, irregular hub.
  for (let i = 0; i < 30; i++) {
    const s0 = spokes[Math.floor(rnd() * spokes.length)], s1 = spokes[Math.floor(rnd() * spokes.length)];
    threads.push({ pts: [at(s0, 3 + rnd() * 18), at(s1, 3 + rnd() * 18)], r: 0.35, alpha: 0.7 });
  }

  // The web is displayed at ~0.2–0.45× its pixel size, so strands are drawn heavier.
  // Soft shadow first so silk reads on light backgrounds, then the silk itself.
  const WEIGHT = 2.2;
  for (const t of threads) c.draw(path(t.pts, t.r * WEIGHT + 1.1), [...SHADOW, 0.3 * t.alpha], 1.5);
  for (const t of threads) {
    c.draw(path(t.pts, t.r * WEIGHT), (px, py) => {
      const glint = 0.6 + 0.4 * fbm(px / 40, py / 40);
      const fade = mix(1, 0.6, smoothstep(160, 760, Math.hypot(px, py)));
      return [...SILK, t.alpha * glint * fade];
    });
  }

  // Dew droplets.
  for (let i = 0; i < 26; i++) {
    const [x, y] = spiralPts[Math.floor(rnd() * spiralPts.length)];
    const rad = 2 + rnd() * rnd() * 3.5;
    const e = ellipse(x, y + rad * 0.3, rad, rad * 1.1);
    c.draw(e, (px, py) => {
      const [nx, ny] = e.unit(px, py);
      const s = shade(nx, ny, 60);
      const rim = Math.pow(1 - s.nz, 2);
      const v = 0.72 + s.spec * 0.3 - rim * 0.4;
      return [v, v, v + 0.04, 0.55 + rim * 0.3 + s.spec * 0.15];
    });
  }
  return c;
}

// ── Ghost upper body, 512×640; lower body fades out for the shader smoke ──

function smin(a, b, k) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return mix(b, a, h) - k * h * (1 - h);
}

function ghost() {
  const c = new Canvas(512, 640);
  const head = ellipse(256, 210, 104, 116);
  const body = ellipse(256, 430, 158, 236);
  const shape = {
    box: [60, 80, 452, 640],
    sdf: (px, py) => smin(head.sdf(px, py), body.sdf(px, py), 95),
  };
  // Lower silhouette dissolves between y≈400 and y≈610 (wispy, noise-driven).
  const fade = (px, py) => 1 - smoothstep(400, 610, py + 60 * (fbm(px / 46, py / 70) - 0.5));
  const EDGE = [0.64, 0.66, 0.77], CORE = [0.975, 0.978, 0.99];

  // Faint aura.
  c.draw({ box: shape.box, sdf: (px, py) => shape.sdf(px, py) - 10 }, (px, py) => [...EDGE, 0.1 * fade(px, py)], 36);
  c.draw(shape, (px, py, d) => {
    const t = clamp(-d / 100, 0, 1);
    const folds = 0.93 + 0.1 * fbm(px / 34, py / 130);
    const top = 1 + 0.05 * (1 - py / 640);
    const col = mix3(EDGE, CORE, smoothstep(0, 0.85, t)).map((v) => Math.min(1, v * folds * top));
    const alpha = (0.4 + 0.52 * Math.pow(t, 0.7)) * (0.9 + 0.1 * fbm(px / 20, py / 20)) * fade(px, py);
    return [...col, alpha];
  }, 7);

  // Subtle hollows and features.
  for (const side of [-1, 1]) {
    c.draw(ellipse(256 + side * 40, 226, 36, 34), [0.5, 0.5, 0.62, 0.12], 30);
    const eye = ellipse(256 + side * 38, 210, 11, 17, side * 0.22);
    c.draw(eye, (px, py) => {
      const [nx, ny] = eye.unit(px, py);
      return [0.16, 0.14, 0.22, 0.62 * (1 - 0.45 * (nx * nx + ny * ny))];
    }, 12);
  }
  c.draw(ellipse(256, 270, 7, 10), [0.22, 0.2, 0.28, 0.32], 10);
  return c;
}

// ── Bats: posed PNGs (380×260, body centred at (190, 135)) and animation layers ──
// `layers` picks what to draw; a null wing is skipped. (cx, cy) is the body centre.

function bat({ seed, tilt = 0, left, right, cx = 190, cy = 135, w = 380, h = 260, layers = ['wings', 'body'] }) {
  const c = new Canvas(w, h), rnd = mulberry32(seed);
  const cs = Math.cos(tilt), sn = Math.sin(tilt);
  const T = ([x, y]) => [cx + x * cs - y * sn, cy + x * sn + y * cs];
  const MEMBRANE = [0.1, 0.085, 0.115], THIN = [0.27, 0.21, 0.32], BONE = [0.2, 0.18, 0.23];

  const membrane = (pts) => {
    c.draw(polygon(pts.map(T)), (px, py, d) => {
      const tone = smoothstep(0, 3.5, -d);
      const col = mix3(THIN, MEMBRANE, 0.35 + 0.65 * tone).map((v) => v * (0.88 + 0.22 * fbm(px / 6, py / 6)));
      return [...col, 0.95 * mix(0.88, 1, tone)];
    });
  };

  const bone = (a, b, ra, rb) => limb(c, T(a), T(b), ra, rb, () => BONE, 0.2);

  const wings = [[-1, left], [1, right]].filter(([, wing]) => wing);
  if (layers.includes('wings')) {
    for (const [s, { sp: spread, lift }] of wings) {
      const sp = spread * 0.86;
      const P = (x, y) => [s * x, y];
      const S = P(9, -6), E = P(50 * sp, -26 + lift * 0.35), W = P(92 * sp, -36 + lift * 0.65);
      const D2 = P(150 * sp, -30 + lift), D3 = P(168 * sp, 2 + lift * 0.9);
      const D4 = P(140 * sp, 36 + lift * 0.65), D5 = P(88 * sp, 44 + lift * 0.35), F = P(15, 44);
      const scallop = (a, b, k) => {
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        return quad(a, [mix(mid[0], W[0], k), mix(mid[1], W[1], k)], b, 12).slice(1);
      };
      // The root runs in to the body's midline so a rotating wing layer stays attached.
      membrane([S, E, W, D2, ...scallop(D2, D3, 0.3), ...scallop(D3, D4, 0.32),
        ...scallop(D4, D5, 0.3), ...scallop(D5, F, 0.22), P(2, 40), P(2, -4)]);

      bone(S, E, 2.6, 2.0);
      bone(E, W, 2.0, 1.6);
      for (const D of [D2, D3, D4, D5]) bone(W, D, 1.25, 0.45);
      ellipsoid(c, ellipse(...T(W), 2.3, 2.3), () => BONE);
      bone(W, [W[0] + s * 3, W[1] - 8], 1.3, 0.3); // thumb claw
    }
  }
  if (!layers.includes('body')) return c;

  for (const s of [-1, 1]) {
    const F = [s * 15, 44];
    bone([s * 8, 30], F, 1.8, 1.2); // leg
    for (const k of [-1, 0, 1]) bone(F, [F[0] + s * (1.5 + k * 1.5), F[1] + 4], 0.6, 0.2);
  }
  membrane([[-15, 44], ...quad([-15, 44], [-6, 62], [0, 64], 8).slice(1), ...quad([0, 64], [6, 62], [15, 44], 8).slice(1), [0, 30]]);

  // Furry body and head.
  const fur = (px, py) => CHARCOAL.map((v, i) => v * (0.75 + 0.55 * fbm(px / 2.2, py / 2.2)) + [0.02, 0.01, 0.015][i]);
  const [bx, by] = T([0, 10]);
  ellipsoid(c, ellipse(bx, by, 17, 30, tilt), fur, { specK: 0.1, feather: 1.3 });
  for (let i = 0; i < 420; i++) {
    const a = rnd() * Math.PI * 2;
    const [hx, hy] = T([Math.cos(a) * 16, 10 + Math.sin(a) * 29]);
    hair(c, hx, hy, Math.atan2(Math.sin(a) / 30, Math.cos(a) / 17) + tilt + (rnd() - 0.5) * 1.2,
      0.8 + rnd() * 1.6, 0.3, [0.06, 0.05, 0.065], 0.55);
  }
  for (const s of [-1, 1]) {
    const P = (x, y) => T([s * x, y]);
    c.draw(polygon([P(3, -31), P(14, -26), P(16, -53)]), [...CHARCOAL, 1], 1.4);
    c.draw(polygon([P(6, -31), P(12, -28), P(14.5, -46)]), [0.3, 0.22, 0.28, 0.6], 1.6);
  }
  const [hx, hy] = T([0, -22]);
  ellipsoid(c, ellipse(hx, hy, 13.5, 13), fur, { specK: 0.15 });
  const [mx, my] = T([0, -14.5]);
  ellipsoid(c, ellipse(mx, my, 6, 5.5, tilt), () => [0.09, 0.075, 0.09], { specK: 0.3 });
  for (const s of [-1, 1]) {
    const [ex, ey] = T([s * 4.6, -24]);
    c.draw(ellipse(ex, ey, 1.8, 1.8), [0.015, 0.012, 0.02, 1]);
    c.draw(ellipse(ex - 0.5, ey - 0.6, 0.6, 0.6), [0.86, 0.82, 1, 0.85]);
    const [nx, ny] = T([s * 1.6, -16.5]);
    c.draw(ellipse(nx, ny, 0.9, 0.7), [0.02, 0.02, 0.025, 0.9]);
  }
  return c;
}

// ── Branch: gnarled limb entering from the left edge, 720×220 (displayed at 50%) ──
// The lantern rope and the folded bat hang from its underside at BRANCH_ANCHORS.

const BRANCH = { w: 720, h: 220, length: 690 };
const branchY = (x) => 92 + 22 * (x / BRANCH.w) + 6 * Math.sin(x / 90);
const branchR = (x) => mix(22, 4, Math.pow(clamp(x, 0, BRANCH.length) / BRANCH.length, 0.8));
const BRANCH_ANCHORS = { bat: 200, lantern: 470 };

function branch() {
  const c = new Canvas(BRANCH.w, BRANCH.h), rnd = mulberry32(51);
  const BARK = [0.2, 0.155, 0.125], DARK = [0.06, 0.048, 0.045];
  // Bark streaks run along the limb, with fine grain on top.
  const bark = (px, py) => {
    const streak = smoothstep(0.35, 0.7, fbm(px / 16, py / 2.2));
    return mix3(DARK, BARK, streak).map((v) => v * (0.8 + 0.4 * fbm(px / 3, py / 3)));
  };

  const twig = (start, angle, length, r0, depth) => {
    let p = start, a = angle;
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      a += (rnd() - 0.5) * 0.35 - 0.06; // slight upward curl
      const q = [p[0] + Math.cos(a) * (length / steps), p[1] + Math.sin(a) * (length / steps)];
      limb(c, p, q, mix(r0, 0.7, i / steps), mix(r0, 0.7, (i + 1) / steps), bark, 0.1);
      if (depth > 0 && i === 1) twig(q, a + (rnd() < 0.5 ? -0.7 : 0.6), length * 0.45, r0 * 0.5, depth - 1);
      p = q;
    }
  };

  // Twigs behind the main limb.
  twig([250, branchY(250)], -1.05, 92, 7, 1);
  twig([560, branchY(560)], -0.7, 70, 4.5, 1);
  twig([420, branchY(420)], 0.6, 48, 3.8, 0);
  twig([BRANCH.length - 6, branchY(BRANCH.length - 6)], -0.35, 40, 3, 0);
  twig([BRANCH.length - 6, branchY(BRANCH.length - 6)], 0.45, 34, 2.6, 0);

  // Main limb, starting off-canvas so it emerges from the page edge.
  for (let x = -12; x < BRANCH.length; x += 12) {
    const x2 = Math.min(x + 12, BRANCH.length);
    limb(c, [x, branchY(x)], [x2, branchY(x2)], branchR(x), branchR(x2), bark, 0.12);
  }
  // Long bark cracks.
  for (let k = 0; k < 7; k++) {
    const x0 = rnd() * 420, len = 60 + rnd() * 140, off = (rnd() - 0.5) * 1.1;
    const pts = [];
    for (let x = x0; x < x0 + len; x += 6) pts.push([x, branchY(x) + off * branchR(x) + Math.sin(x / 11 + k) * 0.8]);
    c.draw(path(pts, 0.7), [...DARK, 0.55]);
  }
  // Knot.
  const kx = 128, ky = branchY(kx) - 2;
  ellipsoid(c, ellipse(kx, ky, 10, 7, 0.1), () => [0.13, 0.1, 0.085], { specK: 0.15 });
  c.draw(ellipse(kx + 1, ky, 4, 2.6, 0.1), [0.04, 0.03, 0.03, 0.9], 1.5);

  // Rope wrapped around the limb where the lantern hangs.
  const ROPE = () => [0.5, 0.4, 0.29];
  const lx = BRANCH_ANCHORS.lantern;
  for (let k = 0; k < 3; k++) {
    const x = lx - 7 + k * 7;
    limb(c, [x - 4, branchY(x) - branchR(x) - 1.5], [x + 4, branchY(x) + branchR(x) + 1.5], 2.4, 2.4, ROPE, 0.15);
  }
  return c;
}

console.log('branch anchors (css px at 50%):', Object.fromEntries(
  Object.entries(BRANCH_ANCHORS).map(([k, x]) => [k, { x: x / 2, y: +((branchY(x) + branchR(x) * 0.85) / 2).toFixed(1) }]),
));

// ── Output ──

const assets = [
  ['spider.png', spider],
  ['cobweb-corner.png', cobweb],
  ['ghost.png', ghost],
  ['bat-1.png', () => bat({ seed: 1, tilt: -0.08, left: { sp: 0.9, lift: -70 }, right: { sp: 0.9, lift: -70 } })],
  ['bat-2.png', () => bat({ seed: 2, tilt: 0.06, left: { sp: 1.1, lift: 0 }, right: { sp: 1.1, lift: 0 } })],
  ['bat-3.png', () => bat({ seed: 3, tilt: -0.18, left: { sp: 0.78, lift: 72 }, right: { sp: 0.78, lift: 72 } })],
  ['bat-4.png', () => bat({ seed: 4, tilt: 0.3, left: { sp: 0.6, lift: 20 }, right: { sp: 1.05, lift: -40 } })],
  // Animation layers. Right wing only (mirror for the left); shoulder pivot at (7, 49).
  ['bat-wing.png', () => bat({ seed: 5, right: { sp: 1, lift: 0 }, cx: -2, cy: 55, w: 170, h: 120, layers: ['wings'] })],
  // Body, head, legs and tail membrane; body centre at (40, 70).
  ['bat-body.png', () => bat({ seed: 5, cx: 40, cy: 70, w: 80, h: 150, layers: ['body'] })],
  ['branch.png', branch],
];

function preview(canvas, rgba) {
  const { w, h } = canvas, out = new Uint8Array(w * 2 * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w * 2; x++) {
      const bg = x < w ? 245 : 21, i = (y * w + (x % w)) * 4, o = (y * w * 2 + x) * 4, a = rgba[i + 3] / 255;
      for (let k = 0; k < 3; k++) out[o + k] = Math.round(rgba[i + k] * a + bg * (1 - a));
      out[o + 3] = 255;
    }
  }
  return encodePNG(w * 2, h, out);
}

const previewIdx = process.argv.indexOf('--preview');
const previewDir = previewIdx > -1 ? process.argv[previewIdx + 1] : null;
mkdirSync(OUT_DIR, { recursive: true });
if (previewDir) mkdirSync(previewDir, { recursive: true });

for (const [name, render] of assets) {
  const canvas = render();
  const rgba = canvas.toRGBA();
  const png = encodePNG(canvas.w, canvas.h, rgba);
  writeFileSync(join(OUT_DIR, name), png);
  if (previewDir) writeFileSync(join(previewDir, `preview-${name}`), preview(canvas, rgba));
  console.log(`${name}\t${canvas.w}x${canvas.h}\t${(png.length / 1024).toFixed(1)} KB`);
}
