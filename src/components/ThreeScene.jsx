import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
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

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      material.uniforms.uTime.value = clockRef.current.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
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

