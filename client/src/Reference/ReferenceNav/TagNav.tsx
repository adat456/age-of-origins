import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchExistingTags } from "../../Shared/sharedFunctions";

const TagNav: React.FC = function() {
    const {
        data: existingTags,
        error: existingTagsErr,
        status: existingTagsStatus
    } = useQuery({
        queryKey: [ "tags" ],
        queryFn: fetchExistingTags,
    });

    function generateTagLinks() {
        const tagLinks = existingTags?.map(tag => (
            <Link key={tag} to={`/reference/tag/${encodeURIComponent(tag)}`}>{tag}</Link>
        ));
        return tagLinks;
    };

    return (
        <nav>
            {existingTagsStatus === "loading" ? <p>Loading tags...</p> : null}
            {existingTagsStatus === "error" ? <p>{existingTagsErr.message}</p> : null}
            {existingTagsStatus === "success" ? generateTagLinks() : null}
        </nav>
    );
};

export default TagNav;