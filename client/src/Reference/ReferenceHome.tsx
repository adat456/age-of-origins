import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentReferences } from "../Shared/sharedFunctions";
import { convert } from "html-to-text";

const ReferenceHome: React.FC = function() {
    const {
        data: recentReferences,
        error: recentReferencesErr,
        status: recentReferencesStatus
    } = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchRecentReferences
    });

    function generateRecentReferencePosts() {
        const references = recentReferences?.map(ref => {
            const convertedReferenceBody = convert(ref.body);

            return (
                <div key={ref._id}>
                    <h2>{ref.title}</h2>
                    {ref.tags.map(tag => (<div key={tag}>{tag}</div>))}
                    <p>{`${convertedReferenceBody.slice(0, 100)}${convertedReferenceBody.length >= 100 ? "..." : ""}`}</p>
                    <Link to={`/reference/${ref._id}`}>See entire post</Link>
                </div>
            );
        });
        return references;
    };

    return (
        <>
            <h1>Reference</h1>
            {generateRecentReferencePosts()}
            <Link to="/reference/create">Create new reference post</Link>
        </>
    );
};

export default ReferenceHome;