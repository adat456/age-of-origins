import { Outlet } from "react-router-dom"

const EventsHome: React.FC = function() {
    return (
        <main className="px-24">
            <Outlet />
        </main>
    );
};

export default EventsHome;