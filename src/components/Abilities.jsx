import { useEffect, useRef } from "react";
import gsap from "gsap";

const Abilities = () => {
  const resumeRef = useRef();
  const resumeBtnRef = useRef();

  // Split "View Resume" into span letters when mounted
  useEffect(() => {
    if (resumeRef.current) {
      const text = "View Resume";
      resumeRef.current.innerHTML = text
        .split("")
        .map(
          (l) =>
            `<span style="display:inline-block">${l === " " ? "&nbsp;" : l}</span>`
        )
        .join("");
    }
  }, []);

  // GSAP Hover Animation for Resume Button
  useEffect(() => {
    const btn = resumeBtnRef.current;
    if (!btn) return;

    const handleResumeHover = () => {
      if (!resumeRef.current) return;
      const spans = resumeRef.current.querySelectorAll("span");
      gsap.to(spans, {
        scale: 1.3,
        fontWeight: "bold",
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        stagger: 0.08,
      });
    };

    btn.addEventListener("mouseenter", handleResumeHover);

    return () => {
      btn.removeEventListener("mouseenter", handleResumeHover);
    };
  }, []);

  return (
    <div className="page5 relative w-full font-[light] min-h-screen pt-38 pb-24 text-white px-4 md:px-24">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 relative">
        <h3 className="text-[1em] text-center sm:text-left mb-8 sm:mb-0">
          These are the technologies and areas I'm actively{" "}
          <br className="hidden sm:inline" /> exploring and building creative
          interactions and <br className="hidden sm:inline" /> formated frontend
          experiences.
        </h3>
        <div className="block sm:block absolute md:w-[10vw] w-[16vw] top-41 right-12 md:top-16 md:right-[18%]">
          <img src="../images/arrow5.png" alt="" className="w-full" />
        </div>
        <div className="font-[italic] leading-none text-[3em] md:text-[3.5em] sm:text-[4em] md:text-[5em] text-center sm:text-right">
          <h2 className="">
            What i <br className="hidden sm:inline" /> work with
          </h2>
        </div>
      </div>

      <div className="abilities-section pt-12">
        <div className="border-b border-white/60 py-8 sm:py-13 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h2 className="text-[2em] sm:text-[2.5em] md:text-[3em] font-[regular] text-center sm:text-left">
            React.js
          </h2>
          <p className="text-[1em] sm:text-[1.1em] text-center sm:text-right">
            Component-Driven UI
            <br className="inline sm:hidden" />
          </p>
        </div>
        <div className="border-b border-white/60 py-8 sm:py-13 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h2 className="text-[2em] sm:text-[2.5em] md:text-[3em] font-[regular] text-center sm:text-left">
            Next.js
          </h2>
          <p className="text-[1em] sm:text-[1.1em] text-center sm:text-right">
            App Router / SEO,
            <br className="inline sm:hidden" />
          </p>
        </div>
        <div className="py-8 sm:py-13 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h2 className="text-[2em] sm:text-[2.5em] md:text-[3em] font-[regular] text-center sm:text-left">
            GSAP
          </h2>
          <p className="text-[1em] sm:text-[1.1em] text-center sm:text-right">
            High-Performance Animations
            <br className="inline sm:hidden" />
          </p>
        </div>

        <div className="resume flex justify-center items-center pt-10">
          <a
            ref={resumeBtnRef}
            href="https://doc-08-a8-apps-viewer.googleusercontent.com/viewer/secure/pdf/35v1bid3loa0ujkb45jgc31jdvgdrg9g/d2kmf530800a8gsl3dqmrdvmb8iq7jg5/1777626375000/drive/11059610839172634502/ACFrOgBPymXuWJtSMj5LbqgcLnuT8zQRIsbekC6fZ0jH_mQoZL0ruDVWtET1S-yCHoKyvnitSyQqQQlByZQ2G3jSXwASqk8z9erJJKgvd-L9dXgK0EKU9cgicUeVmirNePxBI4ZsiXzGEZx8IX31PCJTua4xEWYyr3_THmzpmc0Bz-VmUXWZOU0MvMtuw39aGp6_TBNJOWrVG9sXCp4H9eiSp1hozJmZliRL2kb81IMvQly20GGgCKdoc9TY0hc=?print=true&nonce=0csg5tk5osjje&user=11059610839172634502&hash=b6j46tm6vjrib64poj36fn964v7gtorv"
            className="border-none flex items-center gap-3 sm:gap-5 bg-[#F45E2B] text-[1.15em] xs:text-[1.3em] sm:text-[1.5em] py-4 sm:py-5 px-5 sm:px-9 shadow-md "
          >
            <span ref={resumeRef} className="text-sm sm:text-base"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 sm:w-5 sm:h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Abilities;
