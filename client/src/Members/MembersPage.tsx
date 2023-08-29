import { Outlet } from "react-router-dom"

const MembersPage: React.FC = function() {

    return (
        <main className="px-24"> 
            <Outlet />
        </main>
    );
};

export default MembersPage;