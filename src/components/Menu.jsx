import React, { useRef, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FaInstagram, FaLinkedin } from 'react-icons/fa'
import gsap from 'gsap';

const menuSoundUrl = '/sounds/click.ogg';
const closeSoundUrl = '/sounds/close.ogg';
const hoverSoundUrl = '/sounds/hover.ogg';

let hoverAudio;
if (typeof window !== "undefined") {
    hoverAudio = new window.Audio(hoverSoundUrl);
    hoverAudio.volume = 1;
}

function playSound(url) {
    if (url === hoverSoundUrl && hoverAudio) {
        try {
            hoverAudio.currentTime = 0;
            hoverAudio.play();
        } catch (e) {}
    } else {
        const audio = new window.Audio(url);
        audio.currentTime = 0;
        audio.play();
    }
}

const menuLinks = [
    { label: 'Work', path: '/work' },
    { label: 'About', path: '/about' },
    { label: 'Play', path: '/play' }
];

const OPEN_ANIMATION_DURATION = 330;
const CLOSE_ANIMATION_DURATION = 260;

const Menu = () => {
    const linksRef = useRef();
    const closeRef = useRef();
    const openRef = useRef();
    const menuTextRef = useRef();
    const [isMenuopen, setisMenuopen] = useState(false);
    const [showLinks, setShowLinks] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Split 'menu' text into span letters on mount
    useEffect(() => {
        if (menuTextRef.current) {
            const text = "menu";
            menuTextRef.current.innerHTML = text
                .split("")
                .map(
                    (l, idx) =>
                        `<span style="display:inline-block">${l === " " ? "&nbsp;" : l}</span>`
                )
                .join("");
        }
    }, []);

    // Menu button hover animation for letters using GSAP
    useEffect(() => {
        const button = document.querySelector('.menu-button');
        if (!button) return;

        // Hover animation handler
        const handleMenuBtnHover = () => {
            if (!menuTextRef.current) return;
            const spans = menuTextRef.current.querySelectorAll('span');
            gsap.to(spans, {
                scale: 1.3,
                fontWeight: "bold",                
                duration: 0.20,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
                stagger: 0.08
            });
        };

        button.addEventListener("mouseenter", handleMenuBtnHover);

        // Clean up
        return () => {
            button.removeEventListener("mouseenter", handleMenuBtnHover);
        };
    }, []);

    useEffect(() => {
        setShowLinks(false);
        setisMenuopen(false);
        const btn = document.querySelector('.menu-button');
        if (btn) btn.style.display = 'block';
    }, [location.pathname]);

    function handleMenuClick() {
        if (!isMenuopen) {
            playSound(menuSoundUrl);
            setisMenuopen(true);
            setTimeout(() => setShowLinks(true), OPEN_ANIMATION_DURATION);
        } else {
            setShowLinks(false);
            playSound(closeSoundUrl);
            setTimeout(() => setisMenuopen(false), CLOSE_ANIMATION_DURATION);
        }
        if (!isMenuopen) {
            document.querySelector('.menu-button').style.display = 'none';
        }
    }

    function handleCloseClick() {
        setShowLinks(false);
        playSound(closeSoundUrl);
        setTimeout(() => setisMenuopen(false), CLOSE_ANIMATION_DURATION);
        setTimeout(() => {
            const btn = document.querySelector('.menu-button');
            if (btn) btn.style.display = 'block';
        }, CLOSE_ANIMATION_DURATION);
    }

    function handleLinkHover() {
        playSound(hoverSoundUrl);
    }

    function handleLinkClick(e, path) {
        e.preventDefault();
        handleCloseClick();
        navigate(path);
    }

    function handleHeadingClick() {
        if (location.pathname === '/') {
            // already home, just close menu if open
            if (isMenuopen) handleCloseClick();
        } else {
            handleCloseClick();
            setTimeout(() => {
                navigate('/');
            }, CLOSE_ANIMATION_DURATION + 1); // ensure close animation
        }
    }

    React.useEffect(() => {
        if (!isMenuopen) {
            const btn = document.querySelector('.menu-button');
            if (btn) btn.style.display = 'block';
        }
    }, [isMenuopen]);

    return (
        <div className='w-full fixed z-9 flex items-center justify-between px-4 py-3'>
            <div>
                <button
                    type="button"
                    className="focus:outline-none"
                    aria-label="Go home"
                    title="Go to homepage"
                    onClick={handleHeadingClick}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer'
                    }}
                    tabIndex={0}
                >
                    <h1 className='text-[1.4rem] font-[regular] text-[#F45E2B]'>
                        SAVYA <span className='font-[thin]'>STUDIO</span>
                    </h1>
                </button>
            </div>

            <div>
                <button 
                    onClick={handleMenuClick} 
                    className='bg-black rounded-full cursor-pointer text-white w-[6rem] h-[2.5rem] menu-button'
                    aria-label="Open menu"
                >
                    <h1 className='absolute top-[1.3rem] right-[2.2rem] font-[thin] flex items-center gap-2'>
                        <span ref={menuTextRef}></span>
                        <span
                            className="w-2 h-2 block rounded-full bg-gradient-to-br from-[#F45E2B] to-[#FDFDFD]"
                        ></span>
                   
                    </h1>
                </button>

                <div
                    ref={openRef}
                    className={`overlay absolute z-50 top-[0.7rem] right-[1rem] bg-black rounded-[1.5rem] text-black transition-all duration-500 overflow-hidden`}
                    style={{
                        width: isMenuopen ? "25rem" : "0",
                        height: isMenuopen ? "40rem" : "0",
                    }}
                >
                    <div
                        style={{
                            opacity: isMenuopen ? 1 : 0,
                            pointerEvents: isMenuopen ? 'auto' : 'none',
                            transition: 'opacity 0.3s'
                        }}
                        className="relative w-full h-full"
                    >
                        <div ref={closeRef} className='text-white absolute top-4 right-4 flex items-center gap-1'>
                            <button 
                                onClick={handleCloseClick} 
                                className='flex items-center gap-1'
                                aria-label="Close menu"
                            >
                                <h1 className='text-[1.3rem] cursor-pointer font-[thin]'>close</h1>
                                <div className='bg-white rounded-full p-2 cursor-pointer'>
                                    <XMarkIcon className="w-6 h-6 text-black" strokeWidth={1.5} />
                                </div>
                            </button>
                        </div>

                        <div className='text-white pt-[12rem] text-[3rem] px-4 font-[thin]'>
                            <ul ref={linksRef}>
                                {menuLinks.map(({ label, path }, idx) => (
                                    <li
                                        key={label}
                                        className='cursor-pointer'
                                        style={{
                                            opacity: showLinks ? 1 : 0,
                                            transform: showLinks
                                                ? 'translateY(0)'
                                                : 'translateY(40px)',
                                            transition: `opacity 0.27s ${0.05 + idx * 0.07}s, transform 0.32s ${0.08 + idx * 0.06}s cubic-bezier(.52,1.44,.67,.82)`
                                        }}
                                    >
                                        <Link
                                            to={path}
                                            onClick={(e) => handleLinkClick(e, path)}
                                            onMouseEnter={handleLinkHover}
                                            onFocus={handleLinkHover}
                                            className="text-inherit hover:text-[#F45E2B] transition-colors duration-200"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social and mail at bottom corners */}
                        {/* Instagram - Bottom Left */}
                        <div
                            className="absolute bottom-7 right-18 transition-opacity duration-500"
                            style={{
                                opacity: showLinks ? 1 : 0,
                                pointerEvents: showLinks ? 'auto' : 'none',
                                transition: 'opacity 0.5s 0.6s'
                            }}
                        >
                            <a
                                href="https://www.instagram.com/1.savya/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="text-white hover:text-[#F45E2B] transition-colors duration-200"
                                tabIndex={showLinks ? 0 : -1}
                            >
                                <FaInstagram className="w-6 h-6" />
                            </a>
                        </div>
                        {/* LinkedIn - Bottom Right */}
                        <div
                            className="absolute bottom-7 right-7 transition-opacity duration-500"
                            style={{
                                opacity: showLinks ? 1 : 0,
                                pointerEvents: showLinks ? 'auto' : 'none',
                                transition: 'opacity 0.5s 0.6s'
                            }}
                        >
                            <a
                                href="https://www.linkedin.com/in/savya-sharma-5641072a3/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="text-white hover:text-[#F45E2B] transition-colors duration-200"
                                tabIndex={showLinks ? 0 : -1}
                            >
                                <FaLinkedin className="w-6 h-6" />
                            </a>
                        </div>
                        {/* Mail - Bottom Center */}
                        <div
                            className="absolute bottom-6 left-4 transition-opacity duration-500 text-center"
                            style={{
                                opacity: showLinks ? 1 : 0,
                                pointerEvents: showLinks ? 'auto' : 'none',
                                transition: 'opacity 0.5s 0.6s'
                            }}
                        >
                            <a
                                href="mailto:savyasharma007@gmail.com"
                                className="text-white hover:text-[#F45E2B] text-[1rem] font-[thin] transition-colors duration-200"
                                tabIndex={showLinks ? 0 : -1}
                            >
                                savyasharma810@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu