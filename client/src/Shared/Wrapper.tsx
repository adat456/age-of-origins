import { Outlet } from "react-router-dom";

const Wrapper: React.FC<{child?: React.ReactNode}> = function({ child }) {
    return (
        <div className="bg-darkest font-sans">
            {child}
            <Outlet />
        </div>
    );
};

export default Wrapper;