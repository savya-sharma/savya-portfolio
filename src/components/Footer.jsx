const Footer = () => {
  return (
    <div
      className="page6 flex flex-col justify-end pb-13 text-white text-center w-full min-h-[72vh] sm:min-h-[95vh] bg-black">
      <div
        className="flex flex-col items-center justify-between gap-24 sm:gap-38 pt-16 sm:pt-[10vw] md:pt-[7vw] w-full px-4">
        <p className="font-[light] opacity-[.6] text-[1em] sm:text-[1.1em] leading-tight text-center">
          I'm a solo frontend developer building interactive,<br className="hidden md:inline" /> creative experiences.<br
            className="block sm:hidden" /> Let's collaborate on your next project.
        </p>

        <div className="w-full flex flex-col items-center">
          <h2 className="text-[3em] md:text-[4em] sm:text-[7em] md:text-[10em] leading-none text-center break-words">
            Open for collaboration.
          </h2>

          <div
            className="text-[1em] md:text-[1.1em] sm:text-[1.2em] font-[light] flex flex-col md:flex-row justify-center items-center gap-4 xs:gap-8 mt-6">
            <a href="mailto:savyasharma810@gmail.com?subject=Let's%20Work%20Together" className="hover:underline">Email</a>
            <a className="hover:underline" href="https://www.linkedin.com/in/savya-sharma-5641072a3/">LinkedIn</a>
            <a className="text-[#F45E2B] hover:underline" href="https://www.instagram.com/1.savya/">1.Savya</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

