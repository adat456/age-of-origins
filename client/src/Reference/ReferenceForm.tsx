import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { fetchExistingTags, fetchAllReferences, addReference, editReference, deleteReference } from "../Shared/sharedFunctions";

const ReferenceForm: React.FC = function() {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ tag, setTag ] = useState("");
    const [ tagResults, setTagResults ] = useState<string[]>([]);
    const [ tags, setTags ] = useState<string[]>([]);

    const tagSearchRef = useRef<HTMLInputElement>(null);

    const { referenceid } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const existingTags = useQuery({
        queryKey: [ "tags" ],
        queryFn: fetchExistingTags
    });
    const allReferences = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchAllReferences
    });
    useEffect(() => {
        if (referenceid && allReferences.data) {
            const matchingReference = allReferences.data.find(reference => reference._id === referenceid);
            if (matchingReference) {
                setTitle(matchingReference.title);
                setBody(matchingReference.body);
                setTags(matchingReference.tags);
            };
        };
    }, [allReferences.data, referenceid])
    const addReferenceMutation = useMutation({
        mutationFn: () => addReference({ author: "64d69b49a8599d958bc51e57", title, body, tags }),
        onSuccess: (data) => {
            queryClient.invalidateQueries("references");
            queryClient.invalidateQueries("tags");
            navigate(`/reference/post/${data}`)
        },
    });
    const editReferenceMutation = useMutation({
        mutationFn: () => editReference({ referenceid, title, body, tags }),
        onSuccess: () => {
            queryClient.invalidateQueries("references");
            queryClient.invalidateQueries("tags");
            navigate(`/reference/post/${referenceid}`);
        },
    });
    const deleteReferenceMutation = useMutation({
        mutationFn: () => deleteReference(referenceid),
        onSuccess: () => {
            queryClient.invalidateQueries("references");
            queryClient.invalidateQueries("tags");
            navigate("/reference");
        },
    });

    function generateAddedTags() {
        const addedTags = tags.map(tag => (
            <button key={tag} onClick={() => removeTag(tag)} className="primary-btn flex items-center gap-8">
                <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L18 12" stroke="#E0E3EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p>{tag}</p>
            </button>
        ));
        return (
            <div className="flex flex-wrap items-center my-4 gap-8">
                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M2.678 11.422a2.5 2.5 0 0 0 0 3.536l6.364 6.364a2.5 2.5 0 0 0 3.536 0l7.69-7.69A2.5 2.5 0 0 0 21 11.864V4.5A1.5 1.5 0 0 0 19.5 3h-7.365a2.5 2.5 0 0 0-1.768.732l-7.69 7.69zM14.988 7C13.878 7 13 7.832 13 8.988c0 1.157.878 2.012 1.988 2.012C16.121 11 17 10.145 17 8.988 17 7.832 16.12 7 14.988 7z" fill="#E0E3EB"/></svg>
                {addedTags}
            </div>
        );
    };
    function handleTagChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTag(e.target.value);

        const cleanedValue = e.target.value.trim().toLowerCase();
        if (existingTags && cleanedValue) {
            setTagResults(existingTags.data.filter(tag => tag.includes(cleanedValue)));
        } else {
            setTagResults([]);
        };
    };
    function generateTagResults() {
        const tagResultsButtons = tagResults.map(tag => (
            <button key={tag} onClick={() => addTag(tag)} className="primary-btn flex items-center gap-8">
                <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12H20M12 4V20" stroke="#E0E3EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p>{tag}</p>
            </button>
        ));
        return (
            <div className="flex flex-wrap gap-8 my-8">
                {tagResultsButtons}
            </div>
        );
    };
    function addTag(tag: string) {
        setTags([...tags, tag]); 
        setTagResults(tagResults.filter(existingTag => existingTag !== tag));
    };
    function removeTag(tag: string) {
        setTags(tags.filter(addedTag => addedTag !== tag));
        if (tagSearchRef.current?.value.trim() !== "") setTagResults([...tagResults, tag])
    };
    function handleCreateTagClick() {
        const cleanedTag = tag.trim().toLowerCase();
        if (!existingTags.data.includes(cleanedTag)) {
            setTags([...tags, tag.trim().toLowerCase()]);
            setTag("");
        } else {

        };
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!referenceid && !addReferenceMutation.isLoading) {
            addReferenceMutation.mutate();
        } else if (referenceid && !editReferenceMutation.isLoading) {
            editReferenceMutation.mutate();
        };
    };

    return (
        <>
            <Link to="/reference" className="link">Back to all reference posts</Link>
            <form method="POST" onSubmit={handleSubmit} noValidate>
                <h2 className="text-offwhite text-center text-2xl font-bold tracking-wide mt-24">{referenceid ? "Edit post" : "Add post"}</h2>
                <div className="my-8">
                    <label htmlFor="title" className="block text-offwhite mb-4">Title</label>
                    <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="input w-full" required />
                </div>
                <div className="my-8">
                    <label htmlFor="body" className="block text-offwhite mb-4">Body</label>
                    <ReactQuill value={body} onChange={setBody} placeholder="Start typing here..." />
                </div>
                <div className="my-16">
                    <label htmlFor="image" className="block text-offwhite mb-4">Attach images:</label>
                    <input type="file" id="image" name="image" accept=".png, .jpg, .jpeg, .heif" multiple />
                </div>
                <fieldset className="my-24">
                    {generateAddedTags()}
                    <label htmlFor="tag" className="text-offwhite block mb-4 mt-16">Find/Add Tags</label>
                    <div className="flex gap-8 items-center">
                        <input type="text" ref={tagSearchRef} id="tag" value={tag} onChange={handleTagChange} className="input flex-grow" />
                        <button type="button" onClick={handleCreateTagClick} className="primary-btn">Create tag</button>
                    </div>
                    {generateTagResults()}
                </fieldset>
                <div className="flex flex-col mt-24 gap-16">
                    {referenceid ?
                        <button type="button" onClick={() => deleteReferenceMutation.mutate()} className="secondary-btn">Delete</button> : null
                    }
                    <button type="submit" className="primary-btn">{!referenceid ? "Post" : "Save edits"}</button>
                </div>
                
            </form>
        </>
    );
};

export default ReferenceForm;