import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { convert } from "html-to-text";
import { fetchAllReferences } from "../../Shared/sharedFunctions";
import { referenceInterface } from "../../Shared/interfaces";

const FullReferencePost: React.FC = function() {
    const [ currentReference, setCurrentReference ] = useState<referenceInterface | undefined>(undefined);

    const { referenceid } = useParams();

    const {
        data: allReferences,
        status: allReferencesStatus,
        error: allReferencesErr
    } = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchAllReferences
    });

    useEffect(() => {
        console.log(allReferences)
        if (allReferences && referenceid) {
            setCurrentReference(allReferences.find(reference => reference._id === referenceid));
        };
    }, [allReferences]);

    function generateTagLinks() {
        const tagLinks = currentReference?.tags.map(tag => (
            <Link to={`/reference/tag/${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>
        ));
        return tagLinks;
    };

    return (
        <>
            <Link to="/reference">Back to all reference posts</Link>
            <article>
                <h1>{currentReference?.title}</h1>
                {generateTagLinks()}
                <p>{convert(currentReference?.body)}</p>
            </article>
            <Link to={`/reference/post/${currentReference?._id}/edit`}>Edit post</Link>
        </>
    );
};

export default FullReferencePost;