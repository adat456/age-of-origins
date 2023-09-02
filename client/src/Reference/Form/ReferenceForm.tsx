import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { fetchAllReferences, fetchReferenceImages, addReference, editReference, deleteReference } from "../../Shared/sharedFunctions";
import ReferenceTags from "./ReferenceTags";
import ExistingFormImage from "./ExistingFormImage";

const ReferenceForm: React.FC = function() {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ tag, setTag ] = useState("");
    const [ tagResults, setTagResults ] = useState<string[]>([]);
    const [ tags, setTags ] = useState<string[]>([]);
    const [ existingImages, setExistingImages ] = useState<string[]>([]);
    const [ files, setFiles ] = useState<FileList | null>(null);

    const { referenceid } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
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
    }, [allReferences.data, referenceid]);
    const referenceImages = useQuery({
        queryKey: [ `reference-${referenceid}-images` ],
        queryFn: () => fetchReferenceImages(referenceid),
        enabled: !!referenceid
    });
    useEffect(() => {
        if (referenceImages.data) setExistingImages(referenceImages.data);
    }, [referenceImages.data]);
    const addReferenceMutation = useMutation({
        mutationFn: (data: FormData) => addReference(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries("references");
            queryClient.invalidateQueries("tags");
            navigate(`/reference/post/${data}`)
        },
    });
    const editReferenceMutation = useMutation({
        mutationFn: (data: FormData) => editReference(data),
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

    function generateExistingImages() {
        const imagesArr = existingImages?.map(image => <ExistingFormImage key={image} src={image} referenceid={referenceid} />);
        return imagesArr;
    };

    function generateAddedFileNames() {
        let fileNames = [];
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                fileNames.push(<li key={files[i].name} className="text-offwhite">{files[i].name}</li>);
            };
        };
        return (
            <ul>
                {fileNames}
            </ul>
        );
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!referenceid && !addReferenceMutation.isLoading) {
            const formData = new FormData();
            formData.append("author", "64d69b49a8599d958bc51e57");
            formData.append("title", title);
            formData.append("body", body);
            formData.append("tags", tags);
            for (let i = 0; i < files?.length; i++) {
                formData.append("images", files[i]);
            };

            addReferenceMutation.mutate(formData);
        } else if (referenceid && !editReferenceMutation.isLoading) {
            const formData = new FormData();
            formData.append("referenceid", referenceid);
            formData.append("title", title);
            formData.append("body", body);
            formData.append("tags", tags);
            for (let i = 0; i < files?.length; i++) {
                formData.append("images", files[i]);
            };

            editReferenceMutation.mutate(formData);
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
                    <ReactQuill value={body} id="body" name="body" onChange={setBody} placeholder="Start typing here..." />
                </div>
                <div className="my-16">
                    <p className="text-offwhite">Images:</p>
                    {generateExistingImages()}
                </div>
                <div className="my-16">
                    <label htmlFor="images" className="block text-offwhite mb-4">Attach images:</label>
                    <input type="file" id="images" name="images" accept=".png, .jpg, .jpeg, .heif" multiple onChange={(e) => setFiles(e.target.files)} />
                    <ul>
                        {generateAddedFileNames()}
                    </ul>
                </div>
                <ReferenceTags tag={tag} setTag={setTag} setTags={setTags} tags={tags} tagResults={tagResults} setTagResults={setTagResults} />
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