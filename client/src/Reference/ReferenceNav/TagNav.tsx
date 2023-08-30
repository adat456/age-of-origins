import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchExistingTags } from "../../Shared/sharedFunctions";

const TagNav: React.FC = function() {
    const [ expandedTags, setExpandedTags ] = useState(false);
    const [ letterFilter, setLetterFilter ] = useState<string | "All" | "Untagged" >("");

    const existingTags = useQuery({
        queryKey: [ "tags" ],
        queryFn: fetchExistingTags,
    });

    function generateTagLetterFilters() {
        // generating object with arrays for each (uppercase) letter, and adding tags to the appropriate array
        let tagHierarchy = {};
        for (let i = 65; i <= 90; i++) {
            const uppercaseLetter = (String.fromCharCode(i));
            tagHierarchy[uppercaseLetter] = []
        };
        existingTags.data.forEach(tag => {
            const firstLetter = tag.toUpperCase().slice(0, 1);
            tagHierarchy[firstLetter] = [...tagHierarchy[firstLetter], tag];
        });

        // select only letters that have tags that start with them
        let tagLetters = [];
        for (const [key, values] of Object.entries(tagHierarchy)) {
            if (values.length > 0) tagLetters.push(key);
        };
        
        if (tagLetters.length > 0) {
            return (
                <div className="flex flex-wrap gap-8 my-16">
                    {tagLetters.map(letter => <button key={letter} type="button" onClick={() => setLetterFilter(letter)} className="secondary-btn py-4 px-8">{letter}</button>)}
                    {/* <button type="button" onClick={() => setLetterFilter("All")} className="secondary-btn py-4 px-8">All</button>
                    <button type="button" onClick={() => setLetterFilter("Untagged")} className="secondary-btn py-4 px-8">Untagged</button> */}
                </div>
            );
        } else {
            return <p className="text-offwhite text-center">No tags have been created.</p>
        };
    };

    function generateTagLinks() {
        const filteredTags = existingTags.data?.filter(tag => tag.slice(0, 1).toUpperCase() === letterFilter);
        const tagLinks = filteredTags?.map(tag => (
            <Link key={tag} to={`/reference/tag/${encodeURIComponent(tag)}`} className="link block py-4 px-8">{tag}</Link>
        ));
        return (
            <div className="flex flex-wrap gap-8 mt-16 mb-8">
                {tagLinks}
            </div>
        );
    };

    return (
        <nav className="w-100 p-8 pt-16 rounded bg-dark mb-16">
            <div className="flex justify-center items-center gap-16">
                <p className="text-offwhite">{`${expandedTags ? "Collapse tags" : "Expand tags"}`}</p>
                <button type="button" onClick={() => setExpandedTags(!expandedTags)} className="block bg-red hover:bg-mutedred active:bg-mutedred focus:bg-mutedred rounded">
                    {expandedTags ?
                        <svg width="1.8rem" height="1.8rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 15L12 10L7 15" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> :
                        <svg width="1.8rem" height="1.8rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10L12 15L17 10" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                </button>
            </div>
            {expandedTags ?
                <>
                    {generateTagLetterFilters()}
                    {existingTags.isLoading ? <p>Loading tags...</p> : null}
                    {existingTags.isError ? <p>{existingTags.error}</p> : null}
                    {existingTags.isSuccess ? 
                        generateTagLinks() : null
                    }
                </> : null
            }
            
        </nav>
    );
};

export default TagNav;