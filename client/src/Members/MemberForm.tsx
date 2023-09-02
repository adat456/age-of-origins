import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, createMember, editMember, deleteMember } from "../Shared/sharedFunctions";

interface memberFormInterface {
    setMemberFormVis?: React.Dispatch<React.SetStateAction<boolean>>
}

const MemberForm: React.FC<memberFormInterface> = function({ setMemberFormVis }) {
    const [ username, setUsername ] = useState("");
    const [ usernameErrMsg, setUsernameErrMsg ] = useState("");
    const [ firstname, setFirstname ] = useState("");

    const queryClient = useQueryClient();
    const members = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const addMemberMutation = useMutation({
        mutationFn: (memberData: { username: string, firstname: string }) => createMember(memberData),
        onSuccess: () => queryClient.invalidateQueries("members")
    });

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const usernameInput = e.target as HTMLInputElement;
        setUsername(usernameInput.value);

        addMemberMutation.reset();

        // check that trimmed username is not am empty string and that there are no duplicate usernames
        const trimmedUsername = usernameInput.value.trim();
        if (trimmedUsername === "") {
            setUsernameErrMsg("Required, must not include whitespace.");
        } else {
            const matchingUsername = members.data?.find(existingMember => existingMember.username.toLowerCase() === trimmedUsername.toLowerCase());
            if (matchingUsername) {
                setUsernameErrMsg("This username already exists. Please enter a different username.");
            } else {
                setUsernameErrMsg("");
            };
        };
    };

    function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        const trimmedFirstname = firstname.trim();

        if (!usernameErrMsg && !addMemberMutation.isLoading) {
            addMemberMutation.mutate({ username: trimmedUsername, firstname: trimmedFirstname });
            resetFields();
        };
    };

    function resetFields() {
        setUsername("");
        setFirstname("");
    };

    function closeDialog() {
        setMemberFormVis(false);
        const memberFormDialog = document.querySelector(".member-form-dialog") as HTMLDialogElement;
        memberFormDialog?.close();
    };

    return (
        <dialog className="member-form-dialog bg-darkest p-24">
            <form className="member-form" onSubmit={handleAddMember} method="POST" noValidate>
                <h1 className="text-offwhite text-center text-xl font-bold tracking-wide mb-16">Add new member</h1>
                <div className="my-8">
                    <label htmlFor="username" className="text-offwhite block mb-4">Username</label>
                    {usernameErrMsg ? <p>{usernameErrMsg}</p> : null}
                    <input type="text" id="username" value={username} onChange={handleUsernameChange} required />
                </div>
                <div className="my-8">
                    <label htmlFor="firstName" className="text-offwhite block mb-4">First name</label>
                    <input type="text" id="firstName" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                </div>
                <div className="flex justify-end mt-24">
                    <button type="button" onClick={closeDialog} className="secondary-btn mr-16">Close</button>
                    <button type="submit" className="primary-btn">Submit</button>
                </div>
                {addMemberMutation.isLoading ? <p>Adding member...</p> : null}
                {addMemberMutation.isError ? <p>{addMemberMutation.error}</p> : null}
                {addMemberMutation.isSuccess ? <p>{addMemberMutation.data}</p> : null}
            </form>
        </dialog>
    );
};

export default MemberForm;