import { useState, useEffect } from "react";
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

    const { referenceid } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const {
        data: existingTags,
        status: existingTagsStatus,
        error: existingTagsError
    } = useQuery({
        queryKey: [ "tags" ],
        queryFn: fetchExistingTags
    });
    const {
        data: allReferencesData,
        status: allReferencesStatus,
        error: allReferencesError
    } = useQuery({
        queryKey: [ "references" ],
        queryFn: fetchAllReferences
    });
    useEffect(() => {
        if (referenceid && allReferencesData) {
            const matchingReference = allReferencesData.find(reference => reference._id === referenceid);
            if (matchingReference) {
                setTitle(matchingReference.title);
                setBody(matchingReference.body);
                setTags(matchingReference.tags);
            };
        };
    }, [allReferencesData, referenceid])
    const {
        mutate: addReferenceMutation,
        status: addReferenceStatus,
        data: newlyAddedReferenceId,
        error: addReferenceError
    } = useMutation({
        mutationFn: () => addReference({ author: "64d69b49a8599d958bc51e57", title, body, tags }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [ "references", "tags" ]});
        },
    });
    const {
        mutate: editReferenceMutation,
        status: editReferenceStatus,
        error: editReferenceError
    } = useMutation({
        mutationFn: () => editReference({ referenceid, title, body, tags }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [ "references", "tags" ]});
            navigate(`/reference/post/${referenceid}`);
        },
    });
    const {
        mutate: deleteReferenceMutation
    } = useMutation({
        mutationFn: () => deleteReference(referenceid),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [ "references" ]});
            navigate("/reference");
        },
    });

    function handleTagChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTag(e.target.value);

        const cleanedValue = e.target.value.trim().toLowerCase();
        if (existingTags && cleanedValue) {
            setTagResults(existingTags.filter(tag => tag.includes(cleanedValue)));
        } else {
            setTagResults([]);
        };
    };
    function generateTagResults() {
        const tagResultsButtons = tagResults.map(tag => (
            <button key={tag} onClick={() => {setTags([...tags, tag]); setTagResults(tagResults.filter(existingTag => existingTag !== tag));}}>
                {tag}
            </button>
        ));
        return tagResultsButtons;
    };
    function handleCreateTagClick() {
        const cleanedTag = tag.trim().toLowerCase();
        if (!existingTags?.includes(cleanedTag)) {
            setTags([...tags, tag.trim().toLowerCase()]);
            setTag("");
        } else {

        };
    };
    function generateAddedTags() {
        const addedTags = tags.map(tag => (
            <button key={tag} onClick={() => setTags(tags.filter(addedTag => addedTag !== tag))}>
                {tag}
            </button>
        ));
        return addedTags;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!referenceid) {
            addReferenceMutation();
        } else {
            editReferenceMutation();
        };
    };
    // the new id of a new post does not automatically return, so useEffect listens for it before navigating to the post
    useEffect(() => {
        if (newlyAddedReferenceId) navigate(`/reference/post/${newlyAddedReferenceId}`);
    }, [newlyAddedReferenceId]);

    return (
        <>
            <Link to="/reference">Back to all reference posts</Link>
            <form method="POST" onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="title">Title</label>
                    <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <ReactQuill value={body} onChange={setBody} placeholder="Start typing here..." />
                <div>
                    {generateAddedTags()}
                    <label htmlFor="tag">Find or add tags</label>
                    <input type="text" id="tag" value={tag} onChange={handleTagChange} />
                    <button type="button" onClick={handleCreateTagClick}>Create tag</button>
                    {generateTagResults()}
                </div>
                <button type="submit">{!referenceid ? "Post" : "Save edits"}</button>
                <button type="button" onClick={deleteReferenceMutation}>Delete reference</button>
            </form>
        </>
    );
};

export default ReferenceForm;