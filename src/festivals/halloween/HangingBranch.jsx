import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Design units are CSS px at full size; the piece is scaled down on smaller screens.
// Hang points on branch.png come from scripts/halloween-art/generate.mjs (BRANCH_ANCHORS);
// hangX values are where lantern.png's ring and bat-hanging.png's feet sit
// (reported by scripts/halloween-art/optimize.mjs).
const BRANCH = { w: 360, h: 110 };
const LANTERN = { x: 235, y: 54, rope: 46, w: 100, hangX: 50, glowY: 94 };
const BAT = { x: 100, y: 58, w: 50, hangX: 19.5 };

const HangingBranch = () => {
  const branchRef = useRef(null);
  const swingRef = useRef(null);
  const batRef = useRef(null);

  useEffect(() => {
    const branch = branchRef.current, swing = swingRef.current, bat = batRef.current;
    const mm = gsap.matchMedia();
    // matchMedia only runs when a condition matches; `motion` and `reduce` cover every device.
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      ({ conditions: { reduce } }) => {
        if (reduce) {
          gsap.set([branch, swing, bat], { opacity: 1 });
          return;
        }

        // Entrance: the branch grows in from the edge, the bat appears, the lantern lowers.
        gsap
          .timeline({ delay: 0.8 })
          .fromTo(branch, { opacity: 1, clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.out' })
          .fromTo(bat, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, '-=0.6')
          .fromTo(swing, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 1.4, ease: 'back.out(1.6)' }, '-=0.9');

        // Ambient pendulum swing and a slower sway for the sleeping bat.
        gsap.fromTo(swing, { rotation: -3.5 }, { rotation: 3.5, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.fromTo(bat, { rotation: -1.5 }, { rotation: 1.5, duration: 4.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <div
      // Phones and tablets have no free margin, so the piece sits small near the bottom-left.
      className="absolute left-0 top-[76vh] lg:top-[34vh] origin-top-left scale-[0.48] lg:scale-[0.65] xl:scale-100"
      style={{ width: BRANCH.w, height: BRANCH.h }}
    >
      {/* Folded bat, tucked just under the bark so its feet grip the limb. */}
      <div
        ref={batRef}
        className="absolute"
        style={{ left: BAT.x - BAT.hangX, top: BAT.y - 5, width: BAT.w, transformOrigin: `${BAT.hangX}px 0px`, opacity: 0 }}
      >
        <img
          src="/images/halloween/bat-hanging.png"
          alt=""
          draggable="false"
          decoding="async"
          className="block w-full h-auto select-none"
          style={{ filter: 'drop-shadow(0 0 1px rgba(210,205,225,0.45))' }}
        />
      </div>

      {/* Lantern: pivots where the rope leaves the branch. */}
      <div
        ref={swingRef}
        className="absolute w-0 h-0"
        style={{ left: LANTERN.x, top: LANTERN.y - 2, transformOrigin: '0px 0px', opacity: 0 }}
      >
        <div className="w-0 h-0">
          <div
            className="absolute"
            style={{
              left: -0.75, top: 0, width: 1.5, height: LANTERN.rope + 5,
              background: 'linear-gradient(to bottom, rgba(128,102,74,0.95), rgba(92,72,52,0.95))',
            }}
          />
          <div className="absolute" style={{ left: -LANTERN.hangX, top: LANTERN.rope, width: LANTERN.w }}>
            {/* Warm light from the glass, flickering (CSS, see HalloweenLayer). */}
            <div
              className="hw-lantern-glow absolute rounded-full"
              style={{
                width: 240, height: 240, left: LANTERN.hangX - 120, top: LANTERN.glowY - 120,
                background: 'radial-gradient(circle, rgba(255,170,80,0.38) 0%, rgba(244,94,43,0.14) 38%, rgba(244,94,43,0) 70%)',
              }}
            />
            <img
              src="/images/halloween/lantern.png"
              alt=""
              draggable="false"
              decoding="async"
              className="relative block w-full h-auto select-none"
            />
          </div>
        </div>
      </div>

      <img
        ref={branchRef}
        src="/images/halloween/branch.png"
        alt=""
        draggable="false"
        decoding="async"
        className="absolute inset-0 w-full h-full select-none"
        style={{ opacity: 0 }}
      />
    </div>
  );
};

export default HangingBranch;
