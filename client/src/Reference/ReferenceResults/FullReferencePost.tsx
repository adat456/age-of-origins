import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllReferences, deleteReference } from "../../Shared/sharedFunctions";
import { referenceInterface } from "../../Shared/interfaces";
import AuthenticatedContext from "../../Shared/AuthenticatedContext";

const FullReferencePost: React.FC = function() {
    const [ currentReference, setCurrentReference ] = useState<referenceInterface | undefined>(undefined);
    const [ buttonsVis, setButtonsVis ] = useState(false);

    const { referenceid } = useParams();

    const authenticated = useContext(AuthenticatedContext);

    const queryClient = useQueryClient();
    const allReferences = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchAllReferences
    });
    const deleteReferenceMutation = useMutation({
        mutationFn: () => deleteReference(currentReference?._id),
        onSuccess: () => queryClient.invalidateQueries("references")
    });

    useEffect(() => {
        if (allReferences.data && referenceid) {
            setCurrentReference(allReferences.data.find(reference => reference._id === referenceid));
        };
    }, [allReferences.data]);

    function generateTagLinks() {
        const tagLinks = currentReference?.tags.map(tag => (
            <Link to={`/reference/tag/${encodeURIComponent(tag)}`} key={tag} className="link">{tag}</Link>
        ));
        return (
            <div className="flex items-center my-4 gap-8">
                <svg width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M2.678 11.422a2.5 2.5 0 0 0 0 3.536l6.364 6.364a2.5 2.5 0 0 0 3.536 0l7.69-7.69A2.5 2.5 0 0 0 21 11.864V4.5A1.5 1.5 0 0 0 19.5 3h-7.365a2.5 2.5 0 0 0-1.768.732l-7.69 7.69zM14.988 7C13.878 7 13 7.832 13 8.988c0 1.157.878 2.012 1.988 2.012C16.121 11 17 10.145 17 8.988 17 7.832 16.12 7 14.988 7z" fill="#E0E3EB"/></svg>
                {tagLinks}
            </div>
        );
    };

    return (
        <article>
            <Link to="/reference" className="link">Back to all reference posts</Link>
            <header className="flex justify-center items-center my-8 gap-8">
                <h2 className="text-offwhite mt-16 mb-8 text-2xl font-bold text-center tracking-wide">{currentReference?.title}</h2>
                {authenticated ?
                    <button type="button" onClick={() => setButtonsVis(!buttonsVis)} className="mt-16 mb-8">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20H20.5M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button> : null
                }
            </header>
            {buttonsVis && authenticated ?
                <div className="flex justify-center gap-16 mt-8 mb-32">
                    <Link to={`/reference/post/${currentReference?._id}/edit`} className="secondary-btn">Edit</Link>
                    <button type="button" onClick={() => deleteReferenceMutation.mutate()} className="secondary-btn">Delete</button>
                </div> : null
            }
            {generateTagLinks()}
            <div className="text-offwhite my-24" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentReference?.body, { USE_PROFILES: { html: true }}) }} />
        </article>
    );
};

export default FullReferencePost;