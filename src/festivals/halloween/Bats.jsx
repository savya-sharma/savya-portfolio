import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

// Bats are laid out in a 380×260 design box with the body centre at (190, 135),
// then scaled down. bat-wing.png is a right wing whose shoulder pivot is at (7, 49).
const BOX = { w: 380, h: 260, cx: 190, cy: 135 };
const WING = { w: 170, h: 120, left: 192, top: 80, pivot: '7px 49px' };
const BODY = { w: 80, h: 150, left: 150, top: 65 };

// Per-bat size and flap period (seconds); phones use the first three.
const BATS = [
  { scale: 0.24, period: 0.42 },
  { scale: 0.19, period: 0.34 },
  { scale: 0.21, period: 0.38 },
  { scale: 0.16, period: 0.31 },
  { scale: 0.18, period: 0.36 },
];

// One flap: fast downstroke, slower upstroke. scaleX foreshortens the wing at the
// top and bottom of the stroke; skewY lets the tip lag behind the arm.
function flapKeyframes(period) {
  return [
    { rotation: -4, scaleX: 1, skewY: 0, duration: period * 0.2, ease: 'power2.in' },
    { rotation: 30, scaleX: 0.86, skewY: 5, duration: period * 0.18, ease: 'power1.out' },
    { rotation: -2, scaleX: 0.97, skewY: -2, duration: period * 0.32, ease: 'sine.inOut' },
    { rotation: -38, scaleX: 0.84, skewY: -4, duration: period * 0.3, ease: 'sine.out' },
  ];
}

const Bat = ({ batRef }) => (
  <div
    ref={batRef}
    className="absolute left-0 top-0 will-change-transform"
    style={{ width: BOX.w, height: BOX.h, marginLeft: -BOX.cx, marginTop: -BOX.cy, opacity: 0 }}
  >
    {/* Faint silver rim (≈1px once scaled) so bats still read on dark sections. */}
    <div data-bat-body className="relative w-full h-full" style={{ filter: 'drop-shadow(0 0 6px rgba(210,205,225,0.55))' }}>
      {[true, false].map((mirrored) => (
        <div
          key={mirrored ? 'left' : 'right'}
          className="absolute"
          style={{
            left: mirrored ? 2 * BOX.cx - WING.left - WING.w : WING.left,
            top: WING.top,
            width: WING.w,
            height: WING.h,
            transform: mirrored ? 'scaleX(-1)' : undefined,
          }}
        >
          <img
            data-wing
            src="/images/halloween/bat-wing.png"
            alt=""
            draggable="false"
            decoding="async"
            className="block w-full h-full select-none"
            style={{ transformOrigin: WING.pivot }}
          />
        </div>
      ))}
      <img
        src="/images/halloween/bat-body.png"
        alt=""
        draggable="false"
        decoding="async"
        className="absolute select-none"
        style={{ left: BODY.left, top: BODY.top, width: BODY.w, height: BODY.h }}
      />
    </div>
  </div>
);

const Bats = () => {
  const batRefs = useRef([]);

  useEffect(() => {
    const mm = gsap.matchMedia();
    // matchMedia only runs when a condition matches; `motion` and `reduce` cover every device.
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
        mobile: '(max-width: 767px)',
      },
      ({ conditions: { reduce, mobile } }) => {
        const els = batRefs.current.filter(Boolean);
        gsap.set(els, { opacity: 0 });
        if (reduce) return;

        const bats = els.slice(0, mobile ? 3 : BATS.length).map((el, i) => {
          const { scale, period } = BATS[i];
          const wings = el.querySelectorAll('[data-wing]');
          const body = el.querySelector('[data-bat-body]');
          gsap.set(el, { scale: mobile ? scale * 0.75 : scale });
          gsap.set(wings, { rotation: -38, scaleX: 0.84, skewY: -4 });
          // Each wing runs its own cycle (offset slightly when played).
          const flaps = [...wings].map((wing) =>
            gsap.to(wing, { keyframes: flapKeyframes(period), repeat: -1, paused: true }),
          );
          // The body lifts on the downstroke.
          const bob = gsap.to(body, {
            keyframes: [
              { y: -8, duration: period * 0.38, ease: 'power1.out' },
              { y: 4, duration: period * 0.62, ease: 'sine.inOut' },
            ],
            repeat: -1,
            paused: true,
          });
          return { el, flaps, bob };
        });

        const flight = () => {
          const W = window.innerWidth, H = window.innerHeight;
          const { random } = gsap.utils;
          // Upper band only, so the group passes above the main copy.
          // Capped in pixels so tall portrait screens don't push the band into headings.
          const bottom = Math.min((mobile ? 0.16 : 0.24) * H, mobile ? 140 : 200);
          const dir = Math.random() < 0.5 ? 1 : -1;
          const startX = dir > 0 ? -140 : W + 140, endX = dir > 0 ? W + 140 : -140;
          const at = (t) => startX + (endX - startX) * t;
          // Stay below the header (logo and menu button), with room for every lane.
          const top = 70, lane = mobile ? 22 : 30;
          const halfSpread = ((bats.length - 1) / 2) * lane;
          const baseY = random(top + halfSpread, Math.max(top + halfSpread, bottom));
          const clampY = gsap.utils.clamp(top, bottom + halfSpread + 40);

          bats.forEach(({ el, flaps, bob }, i) => {
            // Each bat gets its own lane so the group reads as separate animals.
            const y0 = clampY(baseY + (i - (bats.length - 1) / 2) * lane + random(-10, 10));
            const path = [
              { x: startX, y: y0 },
              { x: at(0.3), y: clampY(y0 + random(-30, 20)) },
              { x: at(0.62), y: clampY(y0 + random(-25, 30)) },
              { x: endX, y: clampY(y0 + random(-70, 10)) },
            ];
            const phase = Math.random();
            flaps.forEach((f, w) => f.progress((phase + w * 0.04) % 1).play());
            bob.progress(phase).play();
            gsap.set(el, { x: startX, y: y0, rotation: 0, opacity: 1 });
            gsap.to(el, {
              motionPath: { path, curviness: 1.3 },
              duration: random(7.5, 10.5) * (mobile ? 0.75 : 1),
              delay: i * random(0.3, 0.8),
              ease: 'none',
              onComplete: () => {
                flaps.forEach((f) => f.pause());
                bob.pause();
                gsap.set(el, { opacity: 0 });
              },
            });
            // Gentle banking along the way.
            gsap.fromTo(el, { rotation: random(-6, 0) }, {
              rotation: random(0, 7), duration: random(1.4, 2.2), ease: 'sine.inOut', yoyo: true, repeat: 5,
            });
          });
        };

        // A bounded schedule: one group of 3–5 bats roughly every half minute.
        gsap
          .timeline({ repeat: -1, repeatRefresh: true, delay: 5 })
          .call(flight)
          .to({}, { duration: () => gsap.utils.random(24, 34) });

        return () => gsap.killTweensOf(els);
      },
    );
    return () => mm.revert();
  }, []);

  return BATS.map((_, i) => <Bat key={i} batRef={(el) => (batRefs.current[i] = el)} />);
};

export default Bats;
