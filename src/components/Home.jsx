import ThreeScene from './ThreeScene';

const Home = () => {
  return (
    <div className="page1 relative z-10">
      <div className="landing h-[120vh] sm:h-[200vh] xs:h-[130vh] flex flex-col justify-between">
        {/* Canvas and header content in a sticky container */}
        <div className="w-full h-screen sticky -z-1 top-0 left-0 flex items-center justify-center">
          <div
            className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[95vw] max-w-[1100px] md:px-2 sm:px-0 pointer-events-none">
            <h1 className="heading whitespace-nowrap text-[2.6em] xs:text-[3em] sm:text-[5em] md:text-[8em] leading-[1.1em] font-bold">
              Making. Ideas. <br /> Work.
              <span className="text-[#F45E2B]">
                Beautiful
              </span>
            </h1>
            <h5 className="text-[1em] xs:text-[1.15em] sm:text-[1.3em] md:text-[1.5em] font-[light]">
              It is time to articulate what frontend development
              <br className="hidden xs:inline sm:inline" /> truly encompasses.
            </h5>
          </div>
          {/* Responsive Canvas, always fills and is behind text */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <ThreeScene />
          </div>
        </div>
        {/* Paragraph is always visible for all device sizes and 
            placed just below the canvas for phones (non-absolute) */}
        <div
          className="w-full flex justify-center items-center px-4 pb-8 md:pb-0 
            md:absolute md:bottom-16 md:left-1/2 md:-translate-x-1/2 md:z-20 md:w-auto md:max-w-[950px] 
            md:pointer-events-none mt-4 xs:mt-8 md:mt-0">
          <p
            className="text-[1.05em] xs:text-[1.18em] sm:text-[1.3em] md:text-[1.9em] para opacity-100 pointer-events-auto text-center tracking-tight max-w-[950px] md:px-8 md:py-6">
            Creative development is the process of turning ideas into real designs or experiences. It blends
            imagination
            with
            problem-solving, testing, and refinement to shape concepts into something meaningful, functional, and
            visually appealing—so people can easily understand, connect with, and use the final outcome.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

