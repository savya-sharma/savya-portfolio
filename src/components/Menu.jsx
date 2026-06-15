import React, { useRef, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// Replace these with your actual sound file paths (e.g., in public/sounds/)
const menuSoundUrl = '/sounds/click.ogg';
const closeSoundUrl = '/sounds/close.ogg';
const hoverSoundUrl = '/sounds/hover.ogg';

// Use a single hover audio element to avoid overlapping playback issues
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
        } catch (e) {
            // ignore autoplay interruption errors gracefully
        }
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
    const [isMenuopen, setisMenuopen] = useState(false);
    const [showLinks, setShowLinks] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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
            // Show links after menu opens a bit (animation), so they "come from button to top"
            setTimeout(() => setShowLinks(true), OPEN_ANIMATION_DURATION);
        } else {
            // Hide links first, then close menu
            setShowLinks(false);
            playSound(closeSoundUrl);
            // Wait for link disappear animation, then close menu
            setTimeout(() => setisMenuopen(false), CLOSE_ANIMATION_DURATION);
            // Optionally, restore menu-button after closing menu
        }
        if (!isMenuopen) {
            document.querySelector('.menu-button').style.display = 'none';
        }
    }

    function handleCloseClick() {
        // Same as closing via menu button
        setShowLinks(false);
        playSound(closeSoundUrl);
        setTimeout(() => setisMenuopen(false), CLOSE_ANIMATION_DURATION);
        // Optionally, restore menu-button after closing menu
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

    // Show menu-button after closing is done
    React.useEffect(() => {
        if (!isMenuopen) {
            const btn = document.querySelector('.menu-button');
            if (btn) btn.style.display = 'block';
        }
    }, [isMenuopen]);

    // Animate links coming "from button to top". Use transitions and stagger.
    return (
        <div className='w-full flex items-center justify-between px-4 py-3'>
            <div>
                <h1 className='text-[1.4rem] font-[light]'>SAVYASTUDIO</h1>
            </div>

            <div>
                <button 
                    onClick={handleMenuClick} 
                    className='bg-black cursor-pointer text-white w-[5rem] h-[2rem] menu-button'
                    aria-label="Open menu"
                >
                    <h1 className='absolute top-[0.8rem] right-[1.5rem] flex items-center gap-2'>
                        menu
                        <span className='w-2 h-2 bg-white block'></span>
                    </h1>
                </button>

                <div
                    ref={openRef}
                    className={`overlay absolute z-50 top-[0.7rem] right-[1rem] bg-black rounded-lg text-black transition-all duration-500 overflow-hidden`}
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
                    >
                        <div ref={closeRef} className='text-white font-[light] absolute top-4 right-4 flex items-center gap-1'>
                            <button 
                                onClick={handleCloseClick} 
                                className='flex items-center gap-1'
                                aria-label="Close menu"
                            >
                                <h1 className='text-[1.3rem] cursor-pointer'>close</h1>
                                <div className='bg-white rounded-full p-2 cursor-pointer'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                        <div className='text-white pt-[12rem] text-[3rem] px-4 font-[light]'>
                            <ul ref={linksRef} className=''>
                                {menuLinks.map(({ label, path }, idx) => (
                                    <li
                                        key={label}
                                        className='cursor-pointer'
                                        style={{
                                            opacity: showLinks ? 1 : 0,
                                            transform: showLinks
                                                ? 'translateY(0)'
                                                : 'translateY(40px)',
                                            // Stagger animation for open and close
                                            transition: `opacity 0.27s ${0.05 + idx * 0.07}s, transform 0.32s ${0.08 + idx * 0.06}s cubic-bezier(.52,1.44,.67,.82)`
                                        }}
                                    >
                                        <Link
                                            to={path}
                                            onClick={(e) => handleLinkClick(e, path)}
                                            onMouseEnter={handleLinkHover}
                                            onFocus={handleLinkHover}
                                            className="text-inherit"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu