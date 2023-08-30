import { Link } from "react-router-dom";
import { useState } from "react";

const NavBar: React.FC = function() {
    const [ navOpen, setNavOpen ] = useState(false);

    return (
        <>
            <header className="flex p-24 mb-16 justify-between items-center shadow-2xl">
                <h1 className="font-alfa text-2xl text-offwhite tracking-widest">AGE OF ORIGINS</h1>
                <button onClick={() => setNavOpen(true)}>
                    <svg width="2rem" height="2rem" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#E0E3EB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h22M5 16h22M5 24h22"/></svg>
                </button>
            </header>
            {navOpen ? 
                <div className="fixed inset-0 z-20 h-full w-full bg-darkest/95">
                    <nav className="flex flex-col items-center gap-48">
                        <button onClick={() => setNavOpen(false)}>Close</button>
                        <Link to="/" onClick={() => setNavOpen(false)} className="text-offwhite text-4xl pb-8 border-b-2 border-offwhite">Home</Link>
                        <Link to="/events" onClick={() => setNavOpen(false)} className="text-offwhite text-4xl pb-8 border-b-2 border-offwhite">Events</Link>
                        <Link to="/reference" onClick={() => setNavOpen(false)} className="text-offwhite text-4xl pb-8 border-b-2 border-offwhite">Reference</Link>
                        <Link to="/members" onClick={() => setNavOpen(false)} className="text-offwhite text-4xl pb-8 border-b-2 border-offwhite">Members</Link>
                    </nav>
                </div>
                : null
            }
        </>
    );
};

export default NavBar;