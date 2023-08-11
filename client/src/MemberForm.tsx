import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, createMember } from "./sharedFunctions";

const MemberForm: React.FC = function() {
    const [ username, setUsername ] = useState("");
    const [ usernameErrMsg, setUsernameErrMsg ] = useState("");
    const [ firstname, setFirstname ] = useState("");

    const queryClient = useQueryClient();
    const { data: membersData } = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const { mutate: addMember, status: addMemberStatus, error: addMemberError, data: addMemberData } = useMutation({
        mutationFn: (memberData: { username: string, firstname: string }) => createMember(memberData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "members" ]})
            resetAllInputsAndErrs();
        },
    });

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const usernameInput = e.target as HTMLInputElement;
        setUsername(usernameInput.value);

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
        };
    };

    function resetAllInputsAndErrs() {
        setUsername("");
        setFirstname("");
        setUsernameErrMsg("");
    };

    return (
        <form className="member-form" onSubmit={handleAddMember} noValidate>
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
            {addMemberStatus === "loading" ? <p>Adding member...</p> : null}
            {addMemberStatus === "error" ? <p>{addMemberError.message}</p> : null}
            {addMemberStatus === "success" ? <p>{addMemberData}</p> : null}
        </form>
    );
};

export default MemberForm;