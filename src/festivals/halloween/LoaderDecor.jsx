import { useEffect, useState } from 'react';

// Shown inside the site Loader while Halloween is active: the spider lowers on its
// thread as the counter climbs, under a corner web and a warm lantern glow, then
// climbs away as the counter fades.
const LOADER_CSS = `
@keyframes hw-loader-flicker {
  0%, 100% { opacity: 0.88; transform: scale(1); }
  20% { opacity: 1; transform: scale(1.04); }
  38% { opacity: 0.78; }
  55% { opacity: 0.96; transform: scale(0.98); }
  72% { opacity: 0.82; }
  86% { opacity: 1; transform: scale(1.03); }
}
@keyframes hw-loader-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.hw-loader-glow { animation: hw-loader-flicker 2.6s ease-in-out infinite; }
.hw-loader-web { animation: hw-loader-in 1.2s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .hw-loader-glow, .hw-loader-web { animation: none; }
}
`;

// The spider stops this far above the viewport centre, clear of the counter.
const DROP = 'calc(50vh - 120px)';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LoaderDecor = ({ progress = 0 }) => {
  const [reduce] = useState(prefersReducedMotion);
  const [leaving, setLeaving] = useState(false);
  const done = progress >= 100;
  const p = Math.min(Math.max(progress, 0), 100) / 100;

  // The Loader fades its counter 0.2s after reaching 100; leave alongside it.
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setLeaving(true), 200);
    return () => clearTimeout(timer);
  }, [done]);

  // 0 = hidden above the top edge, 1 = resting above the counter.
  const drop = reduce ? 1 : leaving ? -0.3 : -0.2 + 1.2 * p;
  const transition = leaving ? 'transform 0.7s cubic-bezier(0.5, 0, 0.75, 0)' : 'transform 0.15s linear';

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.7s ease 0.15s' }}
    >
      <style>{LOADER_CSS}</style>
      <img
        src="/images/halloween/cobweb-corner.png"
        alt=""
        draggable="false"
        className="hw-loader-web absolute top-0 right-0 w-[140px] md:w-[220px] -scale-x-100 select-none"
      />
      <div
        className="hw-loader-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          opacity: 0.25 + 0.6 * p,
          background: 'radial-gradient(circle, rgba(255,170,80,0.42) 0%, rgba(244,94,43,0.16) 40%, rgba(244,94,43,0) 70%)',
        }}
      />
      <div
        className="absolute top-0 left-1/2 w-px origin-top"
        style={{
          height: DROP,
          transform: `scaleY(${Math.max(drop, 0)})`,
          transition,
          background: 'linear-gradient(to bottom, rgba(140,138,155,0.35), rgba(105,100,120,0.8))',
        }}
      />
      {/* spider.png is head-up; flipped, the thread attaches 14% from its top (~6px). */}
      <div
        className="absolute top-0 left-1/2 -ml-[22px] w-[44px]"
        style={{ transform: `translateY(calc(${DROP} * ${drop} - 6px))`, transition }}
      >
        <img
          src="/images/halloween/spider.png"
          alt=""
          draggable="false"
          className="block w-full h-auto select-none rotate-180"
        />
      </div>
    </div>
  );
};

export default LoaderDecor;
