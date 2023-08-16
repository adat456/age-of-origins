import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { fetchExistingTags, addReference, editReference } from "../Shared/sharedFunctions";

const ReferenceForm: React.FC = function() {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ tag, setTag ] = useState("");
    const [ tagResults, setTagResults ] = useState<string[]>([]);
    const [ tags, setTags ] = useState<string[]>([]);

    const { referenceid } = useParams();

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
        mutate: addReferenceMutation,
        status: addReferenceStatus,
        error: addReferenceError
    } = useMutation({
        mutationFn: () => addReference({ author: "64d69b49a8599d958bc51e57", title, body, tags }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "references", "tags" ]});
        },
    });
    const {
        mutate: editReferenceMutation,
        status: editReferenceStatus,
        error: editReferenceError
    } = useMutation({
        mutationFn: () => editReference({ referenceid, title, body, tags }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "references", "tags" ]});
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

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!referenceid) {
            addReferenceMutation();
        } else {
            editReferenceMutation();
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
                <button type="submit">Post</button>
            </form>
        </>
    );
};

export default ReferenceForm;