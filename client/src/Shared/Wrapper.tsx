import { Outlet } from "react-router-dom";

const Wrapper: React.FC<{child?: React.ReactNode}> = function({ child }) {
    return (
        <>
            {child}
            <Outlet />
        </>
    );
};

export default Wrapper;