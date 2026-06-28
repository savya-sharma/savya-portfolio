import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Three.js postprocessing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import vertex from '../shaders/vertex.glsl';
import fragment from '../shaders/fragment.glsl';

gsap.registerPlugin(ScrollTrigger);

const ThreeScene = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const sphereRef = useRef(null);
  const animationFrameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const composerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false // Set alpha to false so background is solid (not transparent)
    });
    renderer.setClearColor(0xffffff, 1); // White background
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 2;
    cameraRef.current = camera;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create geometry and material with shaders
    const geometry = new THREE.IcosahedronGeometry(1, 200, 200);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorChange: { value: 0 }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    materialRef.current = material;

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.y = -1.4;
    scene.add(sphere);
    sphereRef.current = sphere;

    // --- Postprocessing setup ---
    const renderScene = new RenderPass(scene, camera);

    // UnrealBloomPass parameters: (resolution, strength, radius, threshold)
    // You can tune the bloom settings as desired.
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.1,    // strength
      0.1,   // radius
      0.9    // threshold
    );


    

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // GSAP ScrollTrigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.landing',
        start: 'top top',
        end: 'bottom center',
        scrub: 2.3,
      }
    });

    tl.to(sphere.position, {
      y: 0,
      z: -1,
      ease: 'power2.inOut',
    }, "a")
      .to(material.uniforms.uColorChange, {
        value: 1,
        ease: 'power2.inOut',
      }, "a")
      .to('.landing h1, h5', {
        opacity: 0,
      }, "a")
      .to('.landing p', {
        opacity: 1,
      });

    // Animation loop (use composer for postprocessing bloom)
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      material.uniforms.uTime.value = clockRef.current.getElapsedTime();
      composer.render();
    };
    animate();

    // Handle window resize (update bloom/composer size too)
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Kill ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      composer && composer.dispose && composer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      className="pointer-events-none w-full h-full block"
      style={{ display: 'block', width: '100vw', height: '100vh', maxWidth: '100%', maxHeight: '100%', margin: 0, padding: 0 }}
    />
  );
};

export default ThreeScene;
