import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page2 relative w-full min-h-[72vh] sm:min-h-screen pt-24 bg-blue-700">
      <div className="flex flex-col gap-16 sm:gap-24 items-center justify-center text-white relative px-4 sm:px-0">
        <div className="w-[22vw] sm:w-[9vw] absolute top-1 sm:top-2 left-1/2 sm:left-[25%] -translate-x-1/2 sm:translate-x-0">
          <img
            className="object-cover w-full"
            src="../images/arrow4.png"
            alt=""
          />
        </div>
        <div className="absolute -top-2 sm:top-0 left-1/2 sm:left-42 -translate-x-1/2 sm:translate-x-0">
          <h2 className="bg-white px-4 sm:px-8 py-2 sm:py-4 text-blue-700 leading-none text-[1.1em] sm:text-[2em] text-center">
            Don't you want know <br />
            to about me
          </h2>
        </div>
        <div className="flex justify-center pt-20 sm:pt-34 w-full">
          <div className="w-full sm:w-[58%] px-1">
            <h1 className="text-2xl sm:text-5xl text-center leading-snug">
              I'm <span className="font-[italic]">Savya,</span> a Creative
              Developer who loves turning visual ideas into dope (spectacular)
              things—human experiences. I'm curious about how good design enhances
              our ability to focus on what truly matters, without ever getting in the
              way.
         
            </h1>
          </div>
        </div>
        <div className="text-[1.1em] sm:text-[1.4em] mt-6 sm:mt-0">
          <Link to="/about">ABOUT</Link>
        </div>
      </div>
    </div>
  );
};

export default About;
