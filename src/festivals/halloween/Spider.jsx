import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// spider.png is head-up; flipped, the spinnerets sit 14% from the image top,
// which is where the thread attaches (see the -mt offsets below).
const THREAD_BASE = 100; // px, scaled to the current drop length

const Spider = () => {
  const rigRef = useRef(null);
  const threadRef = useRef(null);
  const bodyRef = useRef(null);
  const legsRef = useRef(null);

  useEffect(() => {
    const legs = legsRef.current;
    const setThread = gsap.quickSetter(threadRef.current, 'scaleY');
    const setBody = gsap.quickSetter(bodyRef.current, 'y', 'px');
    // drop: scripted thread length.
    const state = { drop: 0 };
    const render = () => {
      setThread(Math.max(0, state.drop) / THREAD_BASE);
      setBody(state.drop);
    };

    const mm = gsap.matchMedia();
    // matchMedia only runs when a condition matches; `motion` and `reduce` cover every device.
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 767px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      ({ conditions: { mobile, reduce } }) => {
        const hidden = mobile ? -60 : -90;
        // Rest positions stay in the top band of the viewport, clear of the hero copy.
        // Below 1280px headings reach the spider's column, so the drop is capped above them.
        const maxDrop = () => (window.innerWidth < 1280 ? 120 : 300);
        const rest = () =>
          Math.min(gsap.utils.random(mobile ? 0.07 : 0.14, mobile ? 0.12 : 0.3) * window.innerHeight, maxDrop());
        state.drop = hidden;
        render();

        if (reduce) {
          state.drop = Math.min((mobile ? 0.09 : 0.2) * window.innerHeight, maxDrop());
          render();
          return;
        }

        gsap
          .timeline({ repeat: -1, repeatRefresh: true, delay: 1.5, onUpdate: render })
          .to(state, { drop: rest, duration: 3.4, ease: 'power2.inOut' })
          .to(state, { drop: '+=18', duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '+=1.4')
          .to(state, { drop: () => gsap.utils.random(40, 80), duration: 2.8, ease: 'power2.inOut' }, '+=2.2')
          .to(state, { drop: rest, duration: 2.6, ease: 'power3.inOut' }, '+=2.5')
          .to(state, { drop: hidden, duration: 3, ease: 'power2.in' }, '+=3')
          .to({}, { duration: 5 });

        // Pendulum swing around the anchor at the top edge.
        gsap.fromTo(
          rigRef.current,
          { rotation: -2.2 },
          { rotation: 2.2, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        );

        // Occasional leg fidget while hanging.
        gsap
          .timeline({ repeat: -1, repeatDelay: 1.8, repeatRefresh: true })
          .to(legs, { rotation: () => gsap.utils.random(-7, 7), scaleX: 1.04, duration: 0.35, ease: 'sine.inOut' })
          .to(legs, { rotation: 0, scaleX: 1, duration: 0.5, ease: 'sine.inOut' }, '+=0.5');
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={rigRef}
      className="absolute top-0 right-[128px] md:right-[168px] w-[56px] md:w-[84px] origin-top"
    >
      <div className="relative">
        <div
          ref={threadRef}
          className="absolute top-0 left-1/2 w-px origin-top"
          style={{
            height: THREAD_BASE,
            transform: 'scaleY(0)',
            background: 'linear-gradient(to bottom, rgba(140,138,155,0.35), rgba(105,100,120,0.8))',
          }}
        />
        <div ref={bodyRef} className="absolute top-0 left-0 w-full -mt-[8px] md:-mt-[12px]">
          <div ref={legsRef} className="origin-[50%_14%]">
            <img
              src="/images/halloween/spider.png"
              alt=""
              draggable="false"
              decoding="async"
              className="block w-full h-auto select-none rotate-180"
              // Faint silver rim so the charcoal spider still reads on dark sections.
              style={{ filter: 'drop-shadow(0 0 1px rgba(205,200,220,0.45))' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spider;
