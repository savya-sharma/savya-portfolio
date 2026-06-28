import React, { useRef, useState } from "react";

const projectData = [
  {
    img: "../images/projectImg1.webp",
    title: "Zajno",
    year: "2025",
    desc: "React, Three, shader, Gsap",
    src: "https://interactive-crystal-plane.vercel.app/",
  },
  {
    img: "../images/projectImg2.webp",
    title: "Inertia",
    year: "2025",
    desc: "Next, Gsap",
    src: "https://inertia-iota-ashen.vercel.app/",
  },
  {
    img: "../images/projectImg3.webp",
    title: "Cylinder Gallery",
    year: "2025",
    desc: "React, Three, shader, Gsap",
    src: "https://cylinder-gallery.vercel.app/",
  },
  {
    img: "../images/projectImg4.webp",
    title: "Thirtysix Studio",
    year: "2024",
    desc: "React, Gsap, locomotive",
    src: "https://thirtysixstudio-demo.com/",
  },
  {
    img: "../images/projectImg5.webp",
    title: "Ochi",
    year: "2024",
    desc: "React, Gsap",
    src: "https://ochi-six-iota.vercel.app/",
  },
  {
    img: "../images/projectImg6.webp",
    title: "Scroll based distortion",
    year: "2026",
    desc: "React, Three, shader, Gsap",
    src: "https://scroll-based-shader-distortion.vercel.app/",
  },
  {
    img: "../images/projectImg7.webp",
    title: "Floating gallery",
    year: "2026",
    desc: "React, Three, shader, Gsap",
    src: "https://floating-image-gallery-jade.vercel.app/",
  },
  {
    img: "../images/projectImg8.webp",
    title: "Shopify addition",
    year: "2026",
    desc: "React, Three, shader, Gsap",
    src: "https://shopify-addition.vercel.app/",
  },
  {
    img: "../images/projectImg9.webp",
    title: "SVG transition",
    year: "2026",
    desc: "React, Gsap",
    src: "https://svg-page-transition.vercel.app/",
  },
];

import gsap from "gsap";

const Projects = () => {
  const [overlay, setOverlay] = useState({ visible: false, x: 0, y: 0 });
  const projectsRef = useRef(null);
  const overlayRef = useRef(null);

  // Position adjustment for overlay offset from mouse (e.g., so mouse doesn't cover overlay)
  const overlayOffset = { x: 58, y: 32 };

  const handleMouseMove = (e) => {
    let boundingRect = projectsRef.current.getBoundingClientRect();
    setOverlay((prev) => ({
      ...prev,
      x: e.clientX - boundingRect.left + overlayOffset.x,
      y: e.clientY - boundingRect.top + overlayOffset.y,
    }));

    // Animate overlay movement with gsap if visible
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        x: e.clientX - boundingRect.left + overlayOffset.x,
        y: e.clientY - boundingRect.top + overlayOffset.y,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const showOverlay = (e) => {
    handleMouseMove(e);
    setOverlay((prev) => ({
      ...prev,
      visible: true,
    }));

    // Animate overlay appearance
    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );
    }
  };

  const hideOverlay = () => {
    // Animate overlay disappearance
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.85,
        ease: "power2.out",
      });
    }
    setOverlay((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <div className="page3 relative w-full min-h-screen pb-32 pt-32 px-4 md:px-24">
      <div className="py-18 relative">
        <div className="w-[20vw] sm:w-[8vw] absolute top-7 sm:top-12 left-1/2 sm:left-[24%] -translate-x-1/2 sm:translate-x-0">
          <img className="w-full" src="../images/arrow3.webp" alt="" />
        </div>
        <div className="absolute -top-7 sm:top-4 left-1/2 sm:left-[10%] -translate-x-1/2 sm:translate-x-0">
          <h1 className="bg-[#262626] px-17 py-2 sm:p-8 text-white text-[1.4em] sm:text-[2em] text-center">
            Recent <span className="text-[#F45E2B]">Projects</span>
          </h1>
        </div>
        <h1 className="font-[italic] text-center text-[6em] sm:text-[14em]">
          Projects
        </h1>
      </div>
      <div
        className="projects font-[light] grid grid-cols-1 md:grid-cols-3 gap-28 md:gap-12 relative"
        ref={projectsRef}
        style={{ minHeight: "400px" }}
      >
        {overlay.visible && (
          <div
            className="overlay pointer-events-none z-50 absolute bg-orange-500 px-2 rounded-md shadow-lg transition duration-75 select-none"
            style={{
              left: overlay.x,
              top: overlay.y,
              transform: "translate(-50%, -120%)",
            }}
          >
            visit site
          </div>
        )}

        {projectData.map((proj, i) => (
          <a
            href={proj.src}
            target="_blank"
            rel="noopener noreferrer"
            className="project flex flex-col sm:w-[25vw] gap-4 relative"
            key={i}
            onMouseEnter={showOverlay}
            onMouseLeave={hideOverlay}
            onMouseMove={handleMouseMove}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="border-b pb-2 border-gray-300">
              <div className="project w-full sm:w-[25vw] h-[40vh] sm:h-[35vh] bg-black flex-shrink-0">
                <img
                  className="object-cover w-full h-full"
                  src={proj.img}
                  alt=""
                />
              </div>
            </div>
            <div className="project_content flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h2 className="text-[1.3rem] sm:text-[1.3rem]">{proj.title}</h2>
                <h3 className="text-[1.1em] sm:text-[.9rem] opacity-[.8]">
                  {proj.year}
                </h3>
              </div>
              <div className="text-[1em] sm:text-[1rem] opacity-[.8] flex flex-col gap-4">
                <p>{proj.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Projects;
