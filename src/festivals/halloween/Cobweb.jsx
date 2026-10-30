import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// cobweb-corner.png is drawn for the top-left corner; other corners are mirrored.
const CORNERS = {
  'top-left': { position: 'top-0 left-0', flip: '', origin: '0% 0%' },
  'top-right': { position: 'top-0 right-0', flip: '-scale-x-100', origin: '100% 0%' },
  'bottom-left': { position: 'bottom-0 left-0', flip: '-scale-y-100', origin: '0% 100%' },
  'bottom-right': { position: 'bottom-0 right-0', flip: '-scale-100', origin: '100% 100%' },
};

const Cobweb = ({ corner = 'top-left', className = '', delay = 0 }) => {
  const revealRef = useRef(null);
  const { position, flip, origin } = CORNERS[corner] || CORNERS['top-left'];

  useEffect(() => {
    const mm = gsap.matchMedia();
    // matchMedia only runs when a condition matches, so both motion states are listed.
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      if (conditions.reduce) {
        gsap.set(revealRef.current, { opacity: 1 });
        return;
      }
      // Unfurl from the anchored corner.
      gsap.fromTo(
        revealRef.current,
        { opacity: 0, clipPath: `circle(0% at ${origin})` },
        { opacity: 1, clipPath: `circle(145% at ${origin})`, duration: 2.8, ease: 'power2.out', delay },
      );
    });
    return () => mm.revert();
  }, [origin, delay]);

  return (
    <div ref={revealRef} className={`absolute ${position} ${className}`} style={{ opacity: 0 }}>
      {/* Very slight drift and shimmer, as if caught by air (CSS, see HalloweenLayer). */}
      <div
        className="hw-web-sway"
        style={{ transformOrigin: origin, animationDelay: `${-delay * 5}s`, animationDuration: `${6 + delay * 2}s` }}
      >
        <img
          src="/images/halloween/cobweb-corner.png"
          alt=""
          draggable="false"
          decoding="async"
          className={`block w-full h-auto select-none ${flip}`}
        />
      </div>
    </div>
  );
};

export default Cobweb;
