import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from '../components/Home';
import About from '../components/About';
import Projects from '../components/Projects';
// import Abilities from '../components/Abilities';
import Footer from '../components/Footer';
import Abilities from '../components/Abilities';

gsap.registerPlugin(ScrollTrigger);

function ContactForm() {
  const [result, setResult] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "0cc9c40d-1784-493c-8a87-2ad573c166dc");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    setResult(data.success ? "Success!" : "Error");
    // Reset form fields after submit (if submit succeeded or failed)
    setFormState({
      name: "",
      email: "",
      message: ""
    });
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const submitRef = useRef();
  const submitBtnRef = useRef();

  useEffect(() => {
    if(submitRef.current) {
      const text = "Submit";
      submitRef.current.innerHTML = text
        .split("")
        .map((l) => `<span style="display:inline-block">${l === " " ? "&nbsp;" : l}</span>`)
        .join("");
    }
  }, []);

  // Animate all "span" children of the button text on button hover
  useEffect(() => {
    const btn = submitBtnRef.current;
    if (!btn) return;

    const handleMouseEnter = () => {
      if (!submitRef.current) return;
      const spans = submitRef.current.querySelectorAll("span");
      gsap.to(spans, {
        scale: 1.3,
        fontWeight: "bold",
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        stagger: 0.08,
      });
    };

    btn.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      btn.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex flex-col gap-4 md:gap-6 max-w-xl mx-auto w-full bg-[#181818] bg-opacity-60 rounded-lg p-6 md:p-10 items-stretch mt-10"
      autoComplete="off"
    >
      <input
        type="text"
        name="name"
        required
        className="bg-[#222] border border-[#333] rounded px-4 py-2 text-lg text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#F45E2B] transition"
        placeholder="Your Name"
        value={formState.name}
        onChange={handleChange}
        autoComplete="off"
      />
      <input
        type="email"
        name="email"
        required
        className="bg-[#222] border border-[#333] rounded px-4 py-2 text-lg text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#F45E2B] transition"
        placeholder="Your Email"
        value={formState.email}
        onChange={handleChange}
        autoComplete="off"
      />
      <textarea
        name="message"
        required
        className="bg-[#222] border border-[#333] rounded px-4 py-3 text-lg text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#F45E2B] min-h-[130px] transition"
        placeholder="Message"
        value={formState.message}
        onChange={handleChange}
        autoComplete="off"
      ></textarea>
      <button
        ref={submitBtnRef}
        type="submit"
        className="bg-[#F45E2B] text-white text-xl cursor-pointer font-semibold py-2 px-6 rounded hover:bg-[#d44e1b] transition mt-2"
      >
        <span ref={submitRef}></span>
      </button>
      {result && (
        <p className={`text-center text-lg font-medium mt-2 ${result === 'Success!' ? 'text-green-500' : 'text-red-500'}`}>{result}</p>
      )}
    </form>
  );
}

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
              Let's Build Something <br /> &nbsp;
              <span className="text-[#F45E2B]">
                Remarkable
              </span>
            </h1>
            {/* <h1 className="text-center leading-none text-[3em] xs:text-[4em] sm:text-[7em] md:text-[9em]">
              Apparently, this is <br /> how I&nbsp;
              <span className="text-[#F45E2B]">
                work!
              </span>
            </h1> */}
          </div>

          {/* CTA form */}
          <ContactForm />

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
