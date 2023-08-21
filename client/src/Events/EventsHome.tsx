import { Outlet } from "react-router-dom"

const EventsHome: React.FC = function() {
    return (
        <>
            <h1>Events</h1>
            <Outlet />
        </>
    );
};

export default EventsHome;