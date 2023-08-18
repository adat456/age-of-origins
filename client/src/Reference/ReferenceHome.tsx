import { Link, Outlet } from "react-router-dom";

const ReferenceHome: React.FC = function() {
    return (
        <>
            <h1>Reference</h1>
            <Outlet />
            <Link to="/reference/create">Create new reference post</Link>
        </>
    );
};

export default ReferenceHome;