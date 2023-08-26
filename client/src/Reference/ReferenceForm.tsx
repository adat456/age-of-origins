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
            <button key={tag} onClick={() => {setTags([...tags, tag]); setTagResults(tagResults.filter(existingTag => existingTag !== tag));}}>
                {tag}
            </button>
        ));
        return tagResultsButtons;
    };
    function handleCreateTagClick() {
        const cleanedTag = tag.trim().toLowerCase();
        if (!existingTags.data.includes(cleanedTag)) {
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

        if (!referenceid && !addReferenceMutation.isLoading) {
            addReferenceMutation.mutate();
        } else if (referenceid && !editReferenceMutation.isLoading) {
            editReferenceMutation.mutate();
        };
    };

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
                <button type="button" onClick={() => deleteReferenceMutation.mutate()}>Delete reference</button>
            </form>
        </>
    );
};

export default ReferenceForm;