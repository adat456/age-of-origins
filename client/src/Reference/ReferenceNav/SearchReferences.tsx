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
        <form>
            <label htmlFor="searchTerm">Search</label>
            <input type="text" name="searchTerm" id="searchTerm" onChange={handleSearchTermChange} />
            <button type="reset" onClick={() => setSearchedReferences(null)}>Clear</button>
        </form>
    );
};

export default SearchReferences;