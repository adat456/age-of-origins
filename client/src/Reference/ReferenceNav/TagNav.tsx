import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchExistingTags } from "../../Shared/sharedFunctions";

const TagNav: React.FC = function() {
    const existingTags = useQuery({
        queryKey: [ "tags" ],
        queryFn: fetchExistingTags,
    });

    function generateTagLinks() {
        const tagLinks = existingTags.data?.map(tag => (
            <Link key={tag} to={`/reference/tag/${encodeURIComponent(tag)}`}>{tag}</Link>
        ));
        return tagLinks;
    };

    return (
        <nav>
            {existingTags.isLoading ? <p>Loading tags...</p> : null}
            {existingTags.isError ? <p>{existingTags.error}</p> : null}
            {existingTags.isSuccess ? 
                <>
                    {generateTagLinks()}
                </> : null}
        </nav>
    );
};

export default TagNav;