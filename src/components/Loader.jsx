import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Loader = () => {
  const [counter, setCounter] = useState(0);
  const counterRef = useRef();

  useEffect(() => {
    const obj = { val: 0 };
    // Small delay then animate counter using GSAP
    const tl = gsap.timeline();
    tl.to(obj, {
      delay: 0.5,
      val: 100,
      duration: 2.5,
      ease: "power1.out",
      onUpdate: () => {
        setCounter(Math.round(obj.val));
      }
    });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div>    
      <div className="loader h-screen">
        <div className="loader__counter h-full flex items-center justify-center font-[brucke] font-bold text-[2rem]">
          <span ref={counterRef}>{counter}</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
