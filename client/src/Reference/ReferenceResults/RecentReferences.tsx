import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { convert } from "html-to-text";
import { fetchRecentReferences } from "../../Shared/sharedFunctions";
import TagNav from "../ReferenceNav/TagNav";

const RecentReferences: React.FC = function() {
    const recentReferences = useQuery({
        queryKey: [ "recent-references" ],
        queryFn: fetchRecentReferences
    });

    function generateRecentReferencePosts() {
        const references = recentReferences.data?.map(ref => {
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
            {recentReferences.isLoading ? <p>Loading recently added reference posts...</p> : null}
            {recentReferences.isError ? <p>{recentReferences.error}</p> : null}
            {recentReferences.isSuccess ? generateRecentReferencePosts() : null}
        </>
    );
};

export default RecentReferences;