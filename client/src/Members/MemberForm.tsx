import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, createMember } from "../Shared/sharedFunctions";

interface memberFormInterface {
    setMemberFormVis?: React.Dispatch<React.SetStateAction<boolean>>
}

const MemberForm: React.FC<memberFormInterface> = function({ setMemberFormVis }) {
    const [ username, setUsername ] = useState("");
    const [ usernameErrMsg, setUsernameErrMsg ] = useState("");
    const [ firstname, setFirstname ] = useState("");

    const queryClient = useQueryClient();
    const { data: membersData } = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const { 
            mutate: addMember, 
            status: addMemberStatus, 
            error: addMemberError, 
            data: addMemberData,
            reset: resetAddMemberMsg
        } = useMutation({
            mutationFn: (memberData: { username: string, firstname: string }) => createMember(memberData),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [ "members" ]});
            },
    });

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const usernameInput = e.target as HTMLInputElement;
        setUsername(usernameInput.value);

        resetAddMemberMsg();

        // check that trimmed username is not am empty string and that there are no duplicate usernames
        const trimmedUsername = usernameInput.value.trim();
        if (trimmedUsername === "") {
            setUsernameErrMsg("Required, must not include whitespace.");
        } else {
            const matchingUsername = membersData?.find(existingMember => existingMember.username.toLowerCase() === trimmedUsername.toLowerCase());
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

        if (!usernameErrMsg && addMemberStatus !== "loading") {
            addMember({ username: trimmedUsername, firstname: trimmedFirstname });
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
        <dialog className="member-form-dialog">
            <form className="member-form" onSubmit={handleAddMember} method="POST" noValidate>
                <h1>Add new member</h1>
                <div>
                    <label htmlFor="username">Username</label>
                    {usernameErrMsg ? <p>{usernameErrMsg}</p> : null}
                    <input type="text" id="username" value={username} onChange={handleUsernameChange} required />
                </div>
                <div>
                    <label htmlFor="firstName">First name</label>
                    <input type="text" id="firstName" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                </div>
                <button type="submit">Submit</button>
                <button type="button" onClick={closeDialog}>Close</button>
                {addMemberStatus === "loading" ? <p>Adding member...</p> : null}
                {addMemberStatus === "error" ? <p>{addMemberError.message}</p> : null}
                {addMemberStatus === "success" ? <p>{addMemberData}</p> : null}
            </form>
        </dialog>
    );
};

export default MemberForm;