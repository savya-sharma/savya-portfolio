import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import vertex from './shaders/ghost.vert.glsl';
import fragment from './shaders/ghost.frag.glsl';

const ASPECT = 1.6; // canvas height / width, matches aspect-[5/8]

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

    const wander = wanderRef.current, bob = bobRef.current;
    const fallback = fallbackRef.current;
    const mm = gsap.matchMedia();
    // matchMedia only runs when a condition matches; `motion` and `reduce` cover every device.
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
        // Phones and tablets: the copy leaves no clear margin, so use the compact placement.
        mobile: '(max-width: 1023px)',
      },
      ({ conditions: { reduce, mobile } }) => {
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

        return () => {
          if (ghost) gsap.ticker.remove(tick);
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
  );
};

export default Ghost;
