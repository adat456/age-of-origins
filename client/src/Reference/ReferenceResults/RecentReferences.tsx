import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { convert } from "html-to-text";
import { fetchRecentReferences } from "../../Shared/sharedFunctions";
import TagNav from "../ReferenceNav/TagNav";

const RecentReferences: React.FC = function() {
    const {
        data: recentReferences,
        error: recentReferencesErr,
        status: recentReferencesStatus
    } = useQuery({
        queryKey: [ "recent-references" ],
        queryFn: fetchRecentReferences
    });

    function generateRecentReferencePosts() {
        const references = recentReferences?.map(ref => {
            const convertedReferenceBody = convert(ref.body);

            return (
                <div key={ref._id}>
                    <h3>{ref.title}</h3>
                    {ref.tags.map(tag => (<div key={tag}>{tag}</div>))}
                    <p>{`${convertedReferenceBody.slice(0, 100)}${convertedReferenceBody.length >= 100 ? "..." : ""}`}</p>
                    <Link to={`/reference/post/${ref._id}`}>See entire post</Link>
                </div>
            );
        });
        return references;
    };

    return (
        <>
            <TagNav />
            <h2>Recent Posts</h2>
            {recentReferencesStatus === "loading" ? <p>Loading recently added reference posts...</p> : null}
            {recentReferencesStatus === "error" ? <p>{recentReferencesErr.message}</p> : null}
            {recentReferencesStatus === "success" ? 
                generateRecentReferencePosts() 
                : null
            }
        </>
    );
};

export default RecentReferences;