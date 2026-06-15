import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Abilities from '../components/Abilities';

const About = () => {
  return (
    <div className="w-full min-h-screen text-white bg-[#151515]">
      <div className="w-full flex flex-col gap-14 justify-center items-center pt-32">
        <h1 className="text-[3.3em] md:text-[3.5em] sm:text-[4.5em] md:text-[6em] lg:text-[7.3em] text-center px-2">
          <span className="text-[#F45E2B] font-[italic]">
            How
          </span>
          I arrived here
        </h1>

        <div
          className="w-[92vw] sm:w-[88vw] md:w-[70vw] lg:w-[55vw] xl:w-[50%] flex flex-col gap-7 text-[1.07em] sm:text-[1.15em] md:text-[1.2em] font-[light] leading-[1.2em] mx-auto sm:px-4">
          <p>
            <span className="text-[#F45E2B] font-semibold">
              As a child, I always dreamed of becoming an abstract artist.&nbsp;
            </span>
            It all started in high school, where there were art competitions. I was really into them, especially
            anything related to painting.
            Creating art like this got me thinking creatively and experimenting with ideas.
          </p>

          <p>
            Then I tried predictable engineering, but slowly I realized that coding wasn't really fun for me.
            That's when I chose frontend development, and I was excited to get started. I quickly got a
            pre-owned laptop and began working on the basics, thinking it would let me explore creativity. By
            the first semester, I was already glad to see how much I had learned in frontend development, all
            thanks to my own preparation.
          </p>

          <p>
            During my Bachelor's studies, I continued making paintings, though I never had the opportunity to
            sell my work. Alongside development, I also spent time researching trends in web development. Toward
            the final months of the year, I became curious and decided to join <a className='text-[#F45E2B]' href="https://fullstacklearning.com" target='_blank'>Full Stack Learning</a>, which reminded me how much I
            enjoy building and creating meaningful things.
          </p>

          <p>
            In 2022, I started studying development seriously and spent a few months at FSL. Due to pressure to
            complete my degree, I had to take a long break from my coding journey. Even then, I continued
            learning and coding alongside my studies. After struggling academically in my second year, I stepped
            away and refocused on coding, eventually taking a drop year with my parents' approval.
          </p>

          <p>
            I'm currently focused on frontend graphics engineering, building visually engaging work while
            exploring how functionality, clarity, and creativity intersect. At heart, I'm still driven by
            curiosity—enjoying the process of figuring things out and refining how things look and work, now
            with better tools at hand.
          </p>
        </div>

        <div
          className="w-full min-h-[50vh] sm:min-h-[65vh] lg:min-h-[70vh] text-[1.07em] sm:text-[1.2em] font-[light] flex flex-col items-center gap-8 sm:gap-12 pt-20 sm:pt-28 lg:pt-32 px-4 sm:px-6">
          <h1 className="text-center text-[1.1em] sm:text-[1.2em] tracking-wide">WHAT DRIVES ME.</h1>
          <div
            className="w-full max-w-[98vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[44vw] xl:max-w-[36vw] leading-[1.25em] flex flex-col gap-10 sm:gap-14 md:gap-16">
            <div className="space-y-3">
              <p>
                I've always enjoyed learning a wide range of things and improving them—particularly refining
                ideas that start out rough or unpolished.
              </p>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Harum facere consequuntur non qui
                et tempora quo earum obcaecati vero nostrum?
              </p>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cupiditate earum voluptate
                accusantium fugiat quia blanditiis natus esse delectus eaque, et, veniam nobis unde
                voluptatem cum repellendus. Reiciendis eius debitis inventore quis in, aliquam vero.
              </p>
            </div>
            <div className="flex text-[#F45E2B]">
              <Link to="/play" className="flex gap-4 items-center text-[1.05em] md:text-[1.13em] group">
                Play
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-7 h-7 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Abilities */}
      <Abilities />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;

