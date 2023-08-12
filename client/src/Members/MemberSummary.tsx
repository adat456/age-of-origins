import { useParams, Link } from "react-router-dom";

const MemberSummary: React.FC = function() {
    let { username } = useParams();
    if (username) username = decodeURIComponent(username);

    return (
        <section>
            <Link to="/members">Return to all members</Link>
            <h1>{`${username}`}</h1>
        </section>
    );
};

export default MemberSummary;