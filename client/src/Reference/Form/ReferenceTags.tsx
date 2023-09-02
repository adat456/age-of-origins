import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExistingTags } from "../../Shared/sharedFunctions";
    
interface referenceTagsInterface {
    tag: string,
    setTag: React.Dispatch<React.SetStateAction<string>>,
    tagResults: string[],
    setTagResults: React.Dispatch<React.SetStateAction<string[]>>,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
}

const ReferenceTags: React.FC<referenceTagsInterface> = function({ tag, setTag, tagResults, setTagResults, tags, setTags }) {
    const tagSearchRef = useRef<HTMLInputElement>(null);

    const existingTags = useQuery({
        queryKey: [ "tags" ],
        queryFn: fetchExistingTags
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

    return (
        <fieldset className="my-24">
            {generateAddedTags()}
            <label htmlFor="tag" className="text-offwhite block mb-4 mt-16">Find/Add Tags</label>
            <div className="flex gap-8 items-center">
                <input type="text" ref={tagSearchRef} id="tag" value={tag} onChange={handleTagChange} className="input flex-grow" />
                <button type="button" onClick={handleCreateTagClick} className="primary-btn">Create tag</button>
            </div>
            {generateTagResults()}
        </fieldset>
    )
};

export default ReferenceTags;