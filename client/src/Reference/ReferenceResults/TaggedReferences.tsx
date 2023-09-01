import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { fetchAllReferences } from "../../Shared/sharedFunctions";
import { referenceInterface } from "../../Shared/interfaces";
import AuthenticatedContext from "../../Shared/AuthenticatedContext";
import TagNav from "../ReferenceNav/TagNav";
import SearchReferences from "../ReferenceNav/SearchReferences";

const TaggedReferences: React.FC = function() {
    const [ taggedReferences, setTaggedReferences ] = useState<referenceInterface[]>([]);
    const [ searchedReferences, setSearchedReferences ] = useState<referenceInterface[] | null>(null);

    const { tag } = useParams();

    const authenticated = useContext(AuthenticatedContext);

    const allReferences = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchAllReferences
    });

    useEffect(() => {
        if (allReferences.data && tag) {
            const decodedTag = decodeURIComponent(tag);
            setTaggedReferences(allReferences.data.filter(ref => ref.tags.includes(decodedTag)));
        };
    }, [allReferences.data, tag]);

    function generateReferences(referencesArr: referenceInterface[]) {
        const references = referencesArr?.map(ref => {
            const ellipses = ref.body.length > 200 ? "..." : "";

            return (
                <div key={ref._id} className="py-16 border-b-2 border-light/25">
                    <Link to={`/reference/post/${ref._id}`} className="link font-bold tracking-wide">{ref.title}</Link>
                    <div className="flex items-center my-4 gap-8">
                        <svg width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M2.678 11.422a2.5 2.5 0 0 0 0 3.536l6.364 6.364a2.5 2.5 0 0 0 3.536 0l7.69-7.69A2.5 2.5 0 0 0 21 11.864V4.5A1.5 1.5 0 0 0 19.5 3h-7.365a2.5 2.5 0 0 0-1.768.732l-7.69 7.69zM14.988 7C13.878 7 13 7.832 13 8.988c0 1.157.878 2.012 1.988 2.012C16.121 11 17 10.145 17 8.988 17 7.832 16.12 7 14.988 7z" fill="#E0E3EB"/></svg>
                        {ref.tags.map(tag => (<Link key={tag} to={`/reference/tag/${encodeURIComponent(tag)}`} className="link">{tag}</Link>))}
                    </div>
                    <div className="text-offwhite my-8" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ref.body.slice(0, 200) + ellipses, { USE_PROFILES: { html: true }}) }} />
                </div>
            );
        });
        return references;
    };

    return (
        <>
            <header className="mt-16 flex items-center justify-between">
                <h2 className="text-offwhite text-2xl font-bold tracking-wide my-16">Reference</h2>
                {authenticated ?
                    <Link to="/reference/create" className="block bg-red p-[5px] hover:bg-mutedred active:bg-mutedred focus:bg-mutedred rounded">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link> : null
                }
            </header>
            <TagNav />
            <h3 className="text-offwhite text-xl font-bold tracking-wide mt-24 mb-8 text-center">{`${tag} (${taggedReferences?.length})`}</h3>
            {allReferences.isLoading ? <p>Loading tagged reference posts...</p> : null}
            {allReferences.isError ? <p>{allReferences.error}</p> : null}
            {allReferences.isSuccess ? 
                <>
                    <SearchReferences references={taggedReferences} setSearchedReferences={setSearchedReferences} />
                    {!searchedReferences ?
                        generateReferences(taggedReferences) :
                        searchedReferences.length > 0 ?
                            generateReferences(searchedReferences)
                            : 
                            <p className="text-offwhite text-center my-16">No posts found.</p>
                    }
                </>
                : null
            }
        </>
    );
};

export default TaggedReferences;