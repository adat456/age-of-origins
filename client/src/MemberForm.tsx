import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MemberForm: React.FC = function() {
    const [ username, setUsername ] = useState("");
    const [ usernameErrMsg, setUsernameErrMsg ] = useState("");
    const [ firstname, setFirstname ] = useState("");

    const queryClient = useQueryClient();
    const { mutate: addMember, status: addMemberStatus, error: addMemberError, data: addMemberData } = useMutation({
        mutationFn: async (memberData: { username: string, firstname: string }) => {
            const reqOptions: RequestInit = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(memberData),
            };
            const req = await fetch("http://localhost:3001/create-member", reqOptions);
            const res = await req.json();
            
            if (!req.ok) {
                if (res.code) {
                    if (res.code === 11000) throw new Error("Duplicate username found. Please enter a different username.");
                } else {
                    throw new Error("Unable to add user: ", res);
                };
            };

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "members" ]})
            resetAllInputsAndErrs();
        },
    });

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const usernameInput = e.target as HTMLInputElement;
        setUsername(usernameInput.value);
        if (usernameInput.value.trim() === "") {
            setUsernameErrMsg("Required, must not include whitespace.");
        } else {
            setUsernameErrMsg("");
        };
    };

    function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        const trimmedFirstname = firstname.trim();

        if (trimmedUsername && addMemberStatus !== "loading") {
            addMember({ username: trimmedUsername, firstname: trimmedFirstname });
        };
    };

    function resetAllInputsAndErrs() {
        setUsername("");
        setFirstname("");
        setUsernameErrMsg("");
    };

    useEffect(() => {
        console.log(addMemberStatus);
        if (addMemberStatus === "success") console.log(addMemberData);
        if (addMemberStatus === "error") console.log(addMemberError);
    }, [addMemberStatus]);

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