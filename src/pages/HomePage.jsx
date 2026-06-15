import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from '../components/Home';
import About from '../components/About';
import Projects from '../components/Projects';
// import Abilities from '../components/Abilities';
import Footer from '../components/Footer';
import Abilities from '../components/Abilities';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  useEffect(() => {
    // Page4 animation (testimonials section)
    const page4 = document.querySelector(".page4");

    if (page4) {
      const pageTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: page4,
          start: "top 40%",
          end: "bottom 120%",
          scrub: true,
        },
      });

      pageTimeline.set(page4, {
        padding: '5vw',
        y: '8%',
      }).to(page4, {
        y: 0,
        padding: 0,
        duration: 2.6,
        ease: 'sine.out'
      });
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="main w-full text-[#262626]">
      <Home />
      <About />
      <Projects />
      <Abilities />


      {/* Page 4 - Testimonial */}
      <div className="page4 px-[5vw] pt-41">
        <div className="p4-container min-h-[72vh] sm:min-h-screen text-white pt-24 mt-38">
          <div className="pt-10">
            <h1 className="text-center leading-none text-[3em] xs:text-[4em] sm:text-[7em] md:text-[9em]">
              Apparently, this is <br /> how I&nbsp;
              <span className="text-[#F45E2B]">
                work!
              </span>
            </h1>
          </div>

          {/* Endorsement */}
          {/* <div className="text-[1.5em] font-[light] flex justify-center pt-38">
            <div className="flex flex-col gap-16 sm:gap-20">
              <h2
                className="w-[95vw] max-w-[550px] sm:w-[35vw] leading-[1.2em] text-[.9em] sm:text-[1.25em] text-center sm:text-left">
                Savya has a strong ability to translate abstract ideas into clean,
                engaging frontend
                experiences. With a structured approach to code and a keen eye for design, Savya consistently delivers
                responsive interfaces enhanced by smooth animations and thoughtful interactions. Their work reflects a
                balance of creativity, performance, and technical clarity.
              </h2>
              <h2 className="text-[.8em] sm:text-[.9em] italic opacity-[.9] text-center sm:text-left">
                Tech Trainer&nbsp;|&nbsp;superreply <br />
                Rohit Jain
              </h2>
            </div>
          </div> */}
        </div>
      </div>

      {/* Other Testimonials */}
      {/* <div className="p4-container w-full min-h-screen text-white">
        <div className="text-[1.5em] font-[light] flex justify-center pt-38">
          <div className="flex flex-col gap-16 sm:gap-20">
            <h2
              className="w-[95vw] max-w-[550px] sm:w-[35vw] leading-[1.2em] text-[.9em] sm:text-[1.25em] text-center sm:text-left">
              Savya has a strong ability to translate abstract ideas into clean,
              engaging frontend
              experiences. With a structured approach to code and a keen eye for design, Savya consistently delivers
              responsive interfaces enhanced by smooth animations and thoughtful interactions. Their work reflects a
              balance of creativity, performance, and technical clarity.
            </h2>
            <h2 className="text-[.8em] sm:text-[.9em] italic opacity-[.9] text-center sm:text-left">
              Tech Trainer&nbsp;|&nbsp;superreply <br />
              Rohit Jain
            </h2>
          </div>
        </div>

        <div className="text-[1.5em] font-[light] flex justify-center pt-38">
          <div className="flex flex-col gap-16 sm:gap-20">
            <h2
              className="w-[95vw] max-w-[550px] sm:w-[35vw] leading-[1.2em] text-[.9em] sm:text-[1.25em] text-center sm:text-left">
              Savya has a strong ability to translate abstract ideas into clean,
              engaging frontend
              experiences. With a structured approach to code and a keen eye for design, Savya consistently delivers
              responsive interfaces enhanced by smooth animations and thoughtful interactions. Their work reflects a
              balance of creativity, performance, and technical clarity.
            </h2>
            <h2 className="text-[.8em] sm:text-[.9em] italic opacity-[.9] text-center sm:text-left">
              Tech Trainer&nbsp;|&nbsp;superreply <br />
              Rohit Jain
            </h2>
          </div>
        </div>
      </div> */}

      <Footer />
    </div>
  );
};

export default HomePage;

