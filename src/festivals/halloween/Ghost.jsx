import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import vertex from './shaders/ghost.vert.glsl';
import fragment from './shaders/ghost.frag.glsl';

const ASPECT = 1.6; // canvas height / width, matches aspect-[5/8]
const STIR_RADIUS = 220;

// A ghost-sized WebGL canvas (not full-screen). Returns null when WebGL is unavailable.
function createGhostRenderer(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: ASPECT },
    uOpacity: { value: 0 },
    uStir: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  scene.add(new THREE.Mesh(geometry, material));

  return {
    uniforms,
    resize() {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (w && h) renderer.setSize(w, h, false);
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

const Ghost = () => {
  const wanderRef = useRef(null);
  const bobRef = useRef(null);
  const avoidRef = useRef(null);
  const canvasHostRef = useRef(null);
  const fallbackRef = useRef(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    // A fresh canvas per effect run, so a disposed (context-lost) canvas is never reused.
    const canvas = document.createElement('canvas');
    canvas.className = 'block w-full aspect-[5/8]';
    const ghost = webgl ? createGhostRenderer(canvas) : null;
    if (webgl && !ghost) {
      setWebgl(false);
      return;
    }
    if (ghost) canvasHostRef.current.appendChild(canvas);

    const onContextLost = (e) => {
      e.preventDefault();
      setWebgl(false);
    };
    let observer;
    if (ghost) {
      canvas.addEventListener('webglcontextlost', onContextLost);
      ghost.resize();
      observer = new ResizeObserver(() => {
        ghost.resize();
        ghost.render();
      });
      observer.observe(canvas);
    }

    const wander = wanderRef.current, bob = bobRef.current, avoid = avoidRef.current;
    const fallback = fallbackRef.current;
    const mm = gsap.matchMedia();
    // matchMedia only runs when a condition matches; `motion` and `reduce` cover every device.
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
        // Phones and tablets: the copy leaves no clear margin, so use the compact placement.
        mobile: '(max-width: 1023px)',
        finePointer: '(hover: hover) and (pointer: fine)',
      },
      ({ conditions: { reduce, mobile, finePointer } }) => {
        // Drift region: the left margin, clear of centred headings, the corner webs and
        // the bat band; on desktop it stays above the fold where content cards start.
        const region = () => {
          const w = window.innerWidth, h = window.innerHeight;
          return mobile
            ? { x: [4, w * 0.14], y: [h * 0.68, h * 0.78] }
            : { x: [w * 0.02, w * 0.12], y: [h * 0.36, h * 0.5] };
        };
        const start = region();
        gsap.set(wander, {
          x: (start.x[0] + start.x[1]) / 2,
          y: (start.y[0] + start.y[1]) / 2,
        });

        // Phones have no clear margin beside the copy, so the ghost is fainter there.
        const opacity = mobile ? 0.7 : 1;
        if (reduce) {
          if (ghost) {
            ghost.uniforms.uTime.value = 6;
            ghost.uniforms.uOpacity.value = opacity;
            ghost.render();
          } else {
            gsap.set(fallback, { opacity: opacity * 0.9 });
          }
          return;
        }

        if (ghost) {
          gsap.to(ghost.uniforms.uOpacity, { value: opacity, duration: 2.5, delay: 1.5, ease: 'sine.inOut' });
        } else {
          gsap.to(fallback, { opacity: opacity * 0.9, duration: 2.5, delay: 1.5, ease: 'sine.inOut' });
        }

        gsap
          .timeline({ repeat: -1, repeatRefresh: true })
          .to(wander, {
            x: () => gsap.utils.random(...region().x),
            y: () => gsap.utils.random(...region().y),
            duration: () => gsap.utils.random(9, 13),
            ease: 'sine.inOut',
          });
        gsap.fromTo(bob, { y: -10 }, { y: 10, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.fromTo(bob, { rotation: -2.5 }, { rotation: 2.5, duration: 5.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        const tick = (time) => {
          ghost.uniforms.uTime.value = time;
          ghost.render();
        };
        if (ghost) gsap.ticker.add(tick);

        // Desktop only: drift slightly away from a close pointer and stir the smoke.
        let frame = 0, px = 0, py = 0, near = false;
        const check = () => {
          frame = 0;
          const r = avoid.getBoundingClientRect();
          const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
          const k = 1 - Math.hypot(dx, dy) / STIR_RADIUS;
          if (k > 0) {
            near = true;
            gsap.to(avoid, { x: -Math.sign(dx) * 34 * k, y: -Math.sign(dy) * 12 * k, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
            if (ghost) gsap.to(ghost.uniforms.uStir, { value: k, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
          } else if (near) {
            near = false;
            gsap.to(avoid, { x: 0, y: 0, delay: 0.6, duration: 2, ease: 'sine.inOut', overwrite: 'auto' });
            if (ghost) gsap.to(ghost.uniforms.uStir, { value: 0, delay: 0.6, duration: 2, ease: 'sine.inOut', overwrite: 'auto' });
          }
        };
        const onMove = (e) => {
          px = e.clientX;
          py = e.clientY;
          if (!frame) frame = requestAnimationFrame(check);
        };
        if (!mobile && finePointer) window.addEventListener('pointermove', onMove, { passive: true });

        return () => {
          if (ghost) gsap.ticker.remove(tick);
          window.removeEventListener('pointermove', onMove);
          cancelAnimationFrame(frame);
          gsap.killTweensOf([avoid, ghost ? ghost.uniforms.uStir : null].filter(Boolean));
        };
      },
    );

    return () => {
      mm.revert();
      observer?.disconnect();
      if (ghost) {
        gsap.killTweensOf(ghost.uniforms.uOpacity);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        ghost.dispose();
        canvas.remove();
      }
    };
  }, [webgl]);

  return (
    <div ref={wanderRef} className="absolute left-0 top-0 w-[96px] lg:w-[150px]">
      <div ref={bobRef}>
        <div ref={avoidRef}>
          {webgl ? (
            <div ref={canvasHostRef} />
          ) : (
            // Static fallback when WebGL is unavailable.
            <img
              ref={fallbackRef}
              src="/images/halloween/ghost.png"
              alt=""
              draggable="false"
              decoding="async"
              className="block w-full h-auto select-none"
              style={{ opacity: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Ghost;
