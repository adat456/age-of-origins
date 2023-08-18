import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllReferences } from "../../Shared/sharedFunctions";
import { referenceInterface } from "../../Shared/interfaces";
import { convert } from "html-to-text";
import TagNav from "../ReferenceNav/TagNav";
import SearchReferences from "../ReferenceNav/SearchReferences";

const TaggedReferences: React.FC = function() {
    const [ taggedReferences, setTaggedReferences ] = useState<referenceInterface[]>([]);
    const [ searchedReferences, setSearchedReferences ] = useState<referenceInterface[] | null>(null);

    const { tag } = useParams();

    const {
        data: allReferences,
        error: allReferencesErr,
        status: allReferencesStatus
    } = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchAllReferences
    });

    useEffect(() => {
        if (allReferences && tag) {
            const decodedTag = decodeURIComponent(tag);
            setTaggedReferences(allReferences.filter(ref => ref.tags.includes(decodedTag)));
        };
    }, [allReferences, tag]);

    function generateReferences(referencesArr: referenceInterface[]) {
        const references = referencesArr?.map(ref => {
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
            <h2>{`${tag}: ${taggedReferences?.length} posts`}</h2>
            {allReferencesStatus === "loading" ? <p>Loading tagged reference posts...</p> : null}
            {allReferencesStatus === "error" ? <p>{allReferencesErr.message}</p> : null}
            {allReferencesStatus === "success" ? 
                <>
                    <SearchReferences references={taggedReferences} setSearchedReferences={setSearchedReferences} />
                    {!searchedReferences ?
                        generateReferences(taggedReferences) :
                        searchedReferences.length > 0 ?
                            generateReferences(searchedReferences)
                            : 
                            <p>No posts found.</p>
                    }
                </>
                : null
            }
        </>
    );
};

export default TaggedReferences;