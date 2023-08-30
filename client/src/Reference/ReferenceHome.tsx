import { Outlet } from "react-router-dom";

const ReferenceHome: React.FC = function() {
    return (
        <main className="px-24">
            <Outlet />
        </main>
    );
};

export default ReferenceHome;