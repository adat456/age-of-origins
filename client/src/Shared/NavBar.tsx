import { Link } from "react-router-dom";

const NavBar: React.FC = function() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/reference">Reference</Link>
            <Link to="/members">Members</Link>
        </nav>
    );
};

export default NavBar;