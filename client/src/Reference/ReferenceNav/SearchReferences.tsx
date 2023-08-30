import { referenceInterface } from "../../Shared/interfaces";

interface searchReferencesInterface {
    references: referenceInterface[],
    setSearchedReferences: React.Dispatch<React.SetStateAction<referenceInterface[] | null>>,
};

const SearchReferences: React.FC<searchReferencesInterface> = function({ references, setSearchedReferences }) {
    function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
        const cleanedSearchTerm = e.target.value.trim().toLowerCase();
        if (cleanedSearchTerm) {
            setSearchedReferences(references.filter(ref => (ref.title.includes(cleanedSearchTerm) || ref.body.includes(cleanedSearchTerm))));
        } else {
            setSearchedReferences(null);
        };
    };

    return (
        <form className="flex gap-8 items-center">
            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <label htmlFor="searchTerm" className="hidden">Search</label>
            <input type="text" name="searchTerm" id="searchTerm" onChange={handleSearchTermChange} className="input flex-grow" />
            <button type="reset" onClick={() => setSearchedReferences(null)} className="primary-btn">Clear</button>
        </form>
    );
};

export default SearchReferences;