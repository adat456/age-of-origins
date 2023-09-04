import { useContext } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import AuthenticatedContext from "./AuthenticatedContext";

interface navBarInterface {
    setAuthenticated: React.Dispatch<React.SetStateAction<{id: string, username: string} | null>>
};

const NavBar: React.FC<navBarInterface> = function({ setAuthenticated }) {
    const [ navOpen, setNavOpen ] = useState(false);

    const authenticated = useContext(AuthenticatedContext);

    async function handleLogOut() {
        try {
            const req = await fetch("http://localhost:3001/log-out", { credentials: "include" });
            const res = await req.json();

            if (!req.ok) {
                throw new Error(res);
            } else {
                console.log(res);
                setAuthenticated(null);
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <>
            <header className="flex p-24 mb-16 justify-between items-center shadow-2xl">
                <h1 className="font-alfa text-2xl text-offwhite tracking-widest">AGE OF ORIGINS</h1>
                <button onClick={() => setNavOpen(true)}>
                    <svg width="2rem" height="2rem" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#E0E3EB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h22M5 16h22M5 24h22"/></svg>
                </button>
                {navOpen ? 
                    <div className="fixed z-20 h-full w-full bg-darkest/95" style={{ top: 0, left: 0 }}>
                        <nav className="fixed w-full flex flex-col items-center gap-48" style={{ top: '20%' }}>
                            <button onClick={() => setNavOpen(false)} className="fixed" style={{ top: '1.5rem', right: '1.5rem' }}>
                                <svg width="2.5rem" height="2.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <Link to="/" onClick={() => setNavOpen(false)} className="text-offwhite text-3xl underline underline-offset-[12px] decoration-offwhite decoration-[2px] hover:text-lightest focus:text-lightest hover:decoration-lightest focus:decoration-lightest">Home</Link>
                            <Link to="/events" onClick={() => setNavOpen(false)} className="text-offwhite text-3xl underline underline-offset-[12px] decoration-offwhite decoration-[2px] hover:text-lightest focus:text-lightest hover:decoration-lightest focus:decoration-lightest">Events</Link>
                            <Link to="/reference" onClick={() => setNavOpen(false)} className="text-offwhite text-3xl underline underline-offset-[12px] decoration-offwhite decoration-[2px] hover:text-lightest focus:text-lightest hover:decoration-lightest focus:decoration-lightest">Reference</Link>
                            <Link to="/members" onClick={() => setNavOpen(false)} className="text-offwhite text-3xl underline underline-offset-[12px] decoration-offwhite decoration-[2px] hover:text-lightest focus:text-lightest hover:decoration-lightest focus:decoration-lightest">Members</Link>
                            {!authenticated ?
                                <Link to="/log-in" className="flex gap-8 text-offwhite text-3xl underline underline-offset-[12px] decoration-offwhite decoration-[2px] mt-32 hover:text-lightest focus:text-lightest hover:decoration-lightest focus:decoration-lightest">
                                    <p>Admin Login</p>
                                    <svg width="3rem" height="3rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4H11M3 12H14M14 12L11 15M14 12L11 9" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Link> :
                                <button type="button" onClick={handleLogOut} className="primary-btn mt-32 flex items-center gap-16" >
                                    <p className="text-2xl">Log Out</p>
                                    <svg width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4H11M3 12H14M14 12L11 15M14 12L11 9" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            }
                        </nav>
                    </div>
                    : null
                }
            </header>
        </>
    );
};

export default NavBar;