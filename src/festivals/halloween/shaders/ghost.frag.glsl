#include noise.glsl;

varying vec2 vUv;
uniform float uTime;
uniform float uAspect;  // canvas height / width
uniform float uOpacity; // fade in / out
uniform float uStir;    // 0..1 extra turbulence from a nearby pointer

const vec3 EDGE = vec3(0.56, 0.58, 0.70);
const vec3 CORE = vec3(0.975, 0.978, 0.995);
const vec3 SMOKE = vec3(0.74, 0.76, 0.86);
const vec3 HALO = vec3(0.50, 0.50, 0.64);
const vec3 SHADE = vec3(0.20, 0.18, 0.28);

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Head plus a gently flaring, open-ended drape. The body's top corners sit inside
// the head so the shoulders stay smooth; the bottom is left to the dissolve.
float ghostShape(vec2 p) {
    float head = length((p - vec2(0.0, 1.16)) * vec2(1.0, 1.06)) - 0.27;
    float halfWidth = mix(0.30, 0.245, smoothstep(0.45, 1.16, p.y));
    float body = max(abs(p.x) - halfWidth, p.y - 1.16);
    return smin(head, body, 0.12);
}

float softEllipse(vec2 p, vec2 c, vec2 r, float angle) {
    vec2 d = p - c;
    float s = sin(angle), co = cos(angle);
    d = vec2(co * d.x + s * d.y, -s * d.x + co * d.y) / r;
    return 1.0 - smoothstep(0.45, 1.25, length(d));
}

void main() {
    float t = uTime;
    // x in -0.5..0.5, y from 0 (bottom) to uAspect (top).
    vec2 p = vec2(vUv.x - 0.5, vUv.y * uAspect);

    // 1 toward the bottom of the ghost, 0 for the head and shoulders.
    float low = 1.0 - smoothstep(0.25, 1.05, p.y);

    // Gentle cloth sway that grows down the body.
    p.x += sin(t * 0.9 + p.y * 3.0) * 0.02 * (1.0 - smoothstep(0.6, 1.2, p.y));

    // Smoke: vertically stretched noise scrolling upward, domain-warped once.
    vec3 q = vec3(p.x * 3.2, p.y * 1.6 - t * 0.3, t * 0.1);
    float n1 = fbm(q);
    float n2 = fbm(q * 1.5 + vec3(n1 * 1.2, 0.0, t * 0.06));
    float turbulence = (0.8 + 0.6 * uStir) * low;
    vec2 warped = p + vec2((n1 - 0.5) * 0.24, (n2 - 0.5) * 0.08) * turbulence;

    float d = ghostShape(warped);

    // Edge diffusion widens as the body turns to smoke.
    float edge = mix(0.012, 0.1, low);
    float body = 1.0 - smoothstep(-edge, edge, d);

    // Dissolve: a soft, height-driven threshold against the smoke noise.
    float height = smoothstep(0.0, 1.0, p.y);
    float dissolve = smoothstep(0.2, 0.9, height * 0.95 + (n2 - 0.5) * 0.7 + 0.15);
    float floorFade = smoothstep(0.0, 0.3, p.y);

    // Thin wisps rising off the lower hem, just around the silhouette.
    float wispNoise = fbm(vec3(p.x * 7.0 + n1 * 1.8, p.y * 1.3 - t * 0.45, t * 0.15));
    float wisp = smoothstep(0.55, 0.82, wispNoise) * low * (1.0 - smoothstep(-0.02, 0.12, d)) * floorFade;

    float depth = clamp(-d / 0.2, 0.0, 1.0);
    vec3 col = mix(EDGE, CORE, smoothstep(0.0, 1.0, depth));
    col = mix(col, SMOKE, low * 0.5);
    // Subtle inner light near the chest, breathing slowly.
    float glow = exp(-length(p - vec2(0.0, 1.0)) * 3.2) * (0.06 + 0.03 * sin(t * 1.3));
    col += vec3(0.85, 0.88, 1.0) * glow;

    float alpha = body * dissolve * floorFade * mix(0.45, 0.88, smoothstep(0.0, 0.8, depth));
    col = mix(SMOKE, col, alpha / max(alpha + wisp * 0.4, 1e-4));
    alpha = alpha + wisp * 0.4 * (1.0 - alpha);

    // Restrained face: soft hollow eyes with an occasional slow blink, faint mouth.
    float blink = 1.0 - 0.85 * smoothstep(0.96, 1.0, sin(t * 0.55));
    float eyes = softEllipse(p, vec2(-0.085, 1.18), vec2(0.03, 0.05 * blink), 0.2)
               + softEllipse(p, vec2(0.085, 1.18), vec2(0.03, 0.05 * blink), -0.2);
    float mouth = softEllipse(p, vec2(0.0, 1.07), vec2(0.018, 0.026), 0.0) * 0.4;
    float face = clamp(eyes * 0.6 + mouth, 0.0, 1.0) * body;
    col = mix(col, SHADE, face);
    alpha = max(alpha, face * 0.7);

    // Faint cool halo so the pale form still reads on white sections.
    float halo = exp(-max(d, 0.0) / 0.045) * (1.0 - body) * 0.2 * dissolve * floorFade;
    float outA = alpha + halo * (1.0 - alpha);
    vec3 outCol = (col * alpha + HALO * halo * (1.0 - alpha)) / max(outA, 1e-4);

    gl_FragColor = vec4(outCol, outA * uOpacity);
}
