import { Outlet } from "react-router-dom";

const Wrapper: React.FC<{child?: React.ReactNode}> = function({ child }) {

    function scrollToTop() {
        document.documentElement.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
    };

    return (
        <div className="bg-darkest font-sans min-h-screen">
            {child}
            <Outlet />
            <button type="button" className="fixed bottom-24 right-24 z-10 primary-btn shadow-xl rounded-full" onClick={scrollToTop}>
                <svg width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17L12 8" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 11L12 7L8 11" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
    );
};

export default Wrapper;