import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, addCategory, editCategory, deleteCategory } from "../../Shared/sharedFunctions";
import AuthenticatedContext from "../../Shared/AuthenticatedContext";

const Categories: React.FC = function() {
    const [ editingMode, setEditingMode ] = useState(false);
    const [ newCategoryVis, setNewCategoryVis ] = useState(false);
    const [ newCategory, setNewCategory ] = useState("");

    const authenticated = useContext(AuthenticatedContext);

    const queryClient = useQueryClient();
    const categories = useQuery({
        queryKey: [ "categories" ],
        queryFn: fetchCategories
    });
    const addCategoryMutation = useMutation({
        mutationFn: (name: string) => addCategory(name),
        onSuccess: () => {
            queryClient.invalidateQueries("categories")
        },
    });
    const editCategoryMutation = useMutation({
        mutationFn: (data: { categoryid: string, name: string }) => editCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries("categories")
        },
    });
    const deleteCategoryMutation = useMutation({
        mutationFn: (categoryid: string) => deleteCategory(categoryid),
        onSuccess: () => {
            queryClient.invalidateQueries("categories")
        },
    });

    function generateCategoryLinks() {
        let links;
        if (!editingMode) {
            links = categories.data?.map(category => (
                <Link key={category._id} to={`/reference/${encodeURIComponent(category.name)}`}>{category.name}</Link>
            ));
        } else {
            links = categories.data?.map(category => (
                <div key={category._id}>
                    <input type="text" id={category._id} defaultValue={category.name} onChange={handleChange} />
                    <p id={`${category._id}-error`}></p>
                    <button type="button" onClick={() => handleEditCategory(category._id)}>Save</button>
                    <button type="button" onClick={() => deleteCategoryMutation.mutate(category._id)}>Delete</button>
                </div>
            ));
        };
        return links;
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target.value.trim().toLowerCase();
        const categoryid = e.target.getAttribute("id");
        const errMsgField = document.getElementById(`${categoryid}-error`) as HTMLParagraphElement;
        if (!input) {
            errMsgField.textContent = "Category name required.";
        } else {
            if (categories.data?.find(category => category.name.toLowerCase() === input && category._id !== categoryid)) {
                errMsgField.textContent = "Category name must be unique."
            } else {
                errMsgField.textContent = "";
            };
        };
    };
    function handleAddCategory() {
        if (newCategory.trim()) {
            addCategoryMutation.mutate(newCategory.trim().toLowerCase());
            setNewCategory("");
        };
    };
    function handleEditCategory(categoryid: string) {
        const input = document.getElementById(categoryid) as HTMLInputElement;
        const name = input?.value.trim();
        if (name && !editCategoryMutation.isLoading) {
            editCategoryMutation.mutate({ categoryid, name });
        };
    };

    return (
        <>
            <nav>
                <h2 className="text-offwhite">Categories</h2>
                {authenticated ?
                    <button type="button" onClick={() => setEditingMode(!editingMode)} className="secondary-btn">{editingMode ? "Exit edit mode" : "Edit"}</button> : null
                }
                {generateCategoryLinks()}
                {editingMode ? 
                    newCategoryVis ?
                        <div>
                            <button type="button" onClick={() => setNewCategoryVis(false)} className="secondary-btn">New category</button>
                            <label htmlFor="newCategory hidden"></label>
                            <input type="text" id="newCategory" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                            <button type="button" className="primary-btn" onClick={handleAddCategory}>Create</button>
                        </div> :
                        <button type="button" onClick={() => setNewCategoryVis(true)} className="secondary-btn">New category</button> 
                    : null
                }
            </nav>
        </>
    );
};

export default Categories;