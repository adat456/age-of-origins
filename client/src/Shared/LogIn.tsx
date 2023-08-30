import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../Shared/ErrorMessage";

interface logInInterface {
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
};

const LogIn: React.FC<logInInterface> = function({ setAuthenticated }) {
    const [ username, setUsername ] = useState("");
    const [ usernameErr, setUsernameErr ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ passwordVis, setPasswordVis ] = useState(false);
    const [ passwordErr, setPasswordErr ] = useState("");
    const [ topErr, setTopErr ] = useState("");

    const passwordRef = useRef<HTMLInputElement>(null);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const field = e.target.getAttribute("id");
        const input = e.target.value;
        const cleanedInput = input.trim();

        if (field === "username") {
            setUsername(input);
            if (cleanedInput === "") {
                setUsernameErr("Username required.");
            } else {
                setUsernameErr("");
            };
        } else if (field === "password") {
            setPassword(input);
            if (cleanedInput === "") {
                setPasswordErr("Password required.");
            } else {
                setPasswordErr("");
            };
        };
    };

    function togglePasswordVis() {
        if (passwordVis) {
            passwordRef.current?.setAttribute("type", "password");
        } else {
            passwordRef.current?.setAttribute("type", "text");
        };
        setPasswordVis(!passwordVis);
    };

    const navigate = useNavigate();
    async function handleLogIn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!usernameErr && !passwordErr && username.trim() && password.trim()) {
            try {
                const reqOptions: RequestInit = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                    credentials: "include"
                };
                const req = await fetch("http://localhost:3001/log-in", reqOptions);
                const res = await req.json();

                if (!req.ok) {
                    setTopErr(res);
                    throw new Error(res);
                } else {
                    console.log(res);
                    setAuthenticated(true);
                    navigate("/");
                };
            } catch(err) {
                console.log(err.message);
            };
        } else {
            setTopErr("Please fix all errors.");
        };
    };

    return (
        <main className="bg-darkest min-h-screen px-48 flex flex-col items-center justify-center relative">
            <img src="/splatterOne.png" alt="Blood spatter" className="fixed opacity-40 top-20" style={{ top: "4rem", right: "-1rem" }} />
            <div className="mb-32">   
                <h1 className="font-alfa text-5xl text-offwhite tracking-widest text-center leading-tight pb-8 border-offwhite border-b-2">AGE OF ORIGINS</h1>
                <p className="font-alfa text-2xl text-offwhite tracking-widest text-center mt-16">TKO</p>
            </div>
            {topErr ? <ErrorMessage msg={topErr} /> : null}
            <form onSubmit={handleLogIn} noValidate>
                <div className="my-16">
                    <label htmlFor="username" className="block text-offwhite mb-4">Username</label>
                    {usernameErr ? <ErrorMessage msg={usernameErr} /> : null}
                    <input type="text" name="username" id="username" value={username} onChange={handleInputChange} className="input w-full" required />
                </div>
                <div className="my-16">
                    <label htmlFor="password" className="block text-offwhite mb-4">Password</label>
                    {passwordErr ? <ErrorMessage msg={passwordErr} /> : null}
                    <div className="flex items-center gap-8">
                        <input ref={passwordRef} type="password" name="password" id="password" value={password} onChange={handleInputChange} className="input flex-grow" required />
                        <button type="button" onClick={togglePasswordVis}>
                            {passwordVis ?
                                <svg width="2rem" height="2rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#E0E3EB" strokeLinejoin="round" strokeWidth="1.8" d="M3 12c5.4-8 12.6-8 18 0-5.4 8-12.6 8-18 0z"/><path stroke="#E0E3EB" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> :
                                <svg width="2rem" height="2rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#E0E3EB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10a13.358 13.358 0 0 0 3 2.685M21 10a13.358 13.358 0 0 1-3 2.685m-8 1.624L9.5 16.5m.5-2.19a10.59 10.59 0 0 0 4 0m-4 0a11.275 11.275 0 0 1-4-1.625m8 1.624.5 2.191m-.5-2.19a11.275 11.275 0 0 0 4-1.625m0 0 1.5 1.815M6 12.685 4.5 14.5"/></svg>
                            }
                        </button>
                    </div>
                </div>
                <button type="submit" className="primary-btn w-full mt-16">Log In</button>
                <Link to="/" className="link block text-center mt-16">Back to site</Link>
            </form>
        </main>
    );
};

export default LogIn;