import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Cobweb from './Cobweb';
import HangingBranch from './HangingBranch';
import Spider from './Spider';
// Ghost.jsx and Bats.jsx are paused for now; render <Ghost /> and <Bats /> here to restore them.

gsap.registerPlugin(ScrollTrigger);

// Lightweight ambient motion and atmosphere, scoped to this layer.
const LAYER_CSS = `
@keyframes hw-web-sway {
  from { transform: rotate(-0.35deg) skewX(-0.25deg); opacity: 1; }
  to { transform: rotate(0.35deg) skewX(0.25deg); opacity: 0.8; }
}
@keyframes hw-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes hw-flicker {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  18% { opacity: 1; transform: scale(1.04); }
  32% { opacity: 0.76; }
  47% { opacity: 0.95; transform: scale(0.98); }
  63% { opacity: 0.8; }
  80% { opacity: 1; transform: scale(1.03); }
}
.hw-web-sway { animation: hw-web-sway 6s ease-in-out infinite alternate; }
.hw-lantern-glow { animation: hw-flicker 3.2s ease-in-out infinite; }
.hw-atmosphere {
  background:
    radial-gradient(circle at 100% 0, rgba(58, 50, 82, 0.08), transparent 32%),
    radial-gradient(circle at 100% 100%, rgba(58, 50, 82, 0.07), transparent 28%);
  animation: hw-fade-in 3s ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .hw-web-sway, .hw-atmosphere, .hw-lantern-glow { animation: none; }
}
`;

// Fixed and click-through. z-9 sits above page content (hero is z-8) but the
// layer renders before <Menu /> (also z-9), so the menu and its panel stay on top.
const HalloweenLayer = () => {
  const ambientRef = useRef(null);
  const { pathname } = useLocation();

  // Dim the ambient pieces while the visitor reads, restore them near the top.
  // Rebuilt per route: HomePage and ThreeScene kill every ScrollTrigger when they unmount.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ambientRef.current, { opacity: 1 }, {
        opacity: 0.45,
        ease: 'none',
        scrollTrigger: { start: 0, end: () => window.innerHeight * 0.6, scrub: 0.8 },
      });
    });
    return () => ctx.revert();
  }, [pathname]);

  return (
    <div
      className="halloween-layer fixed inset-0 z-[9] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{LAYER_CSS}</style>
      <div ref={ambientRef} className="absolute inset-0">
        <div className="hw-atmosphere absolute inset-0" />
        {/* Top-right, so the spider hangs in front of its web and the left side is left to the branch. */}
        <Cobweb corner="top-right" className="w-[150px] sm:w-[220px] md:w-[min(26vw,340px)]" />
        <Cobweb corner="bottom-right" delay={0.6} className="w-[110px] sm:w-[160px] md:w-[min(18vw,250px)]" />
        <HangingBranch />
      </div>
      <Spider />
    </div>
  );
};

export default HalloweenLayer;
