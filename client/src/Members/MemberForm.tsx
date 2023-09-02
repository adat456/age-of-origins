import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, createMember, editMember, deleteMember } from "../Shared/sharedFunctions";

interface memberFormInterface {
    setMemberFormVis: React.Dispatch<React.SetStateAction<boolean>>,
    memberid?: string,
};

const MemberForm: React.FC<memberFormInterface> = function({ setMemberFormVis, memberid }) {
    const [ username, setUsername ] = useState("");
    const [ usernameErrMsg, setUsernameErrMsg ] = useState("");
    const [ firstname, setFirstname ] = useState("");

    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const members = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    useEffect(() => {
        if (members.data && memberid) {
            const matchingMember = members.data.find(member => member._id === memberid);
            setUsername(matchingMember.username);
            setFirstname(matchingMember.firstname);
        };
    }, [members.data, memberid]);
    const addMemberMutation = useMutation({
        mutationFn: (memberData: { username: string, firstname: string }) => createMember(memberData),
        onSuccess: () => queryClient.invalidateQueries("members")
    });
    const editMemberMutation = useMutation({
        mutationFn: (memberData: { memberid: string, username: string, firstname: string }) => editMember(memberData),
        onSuccess: () => queryClient.invalidateQueries("members")
    });
    const deleteMemberMutation = useMutation({
        mutationFn: () => deleteMember(memberid),
        onSuccess: () => {
            queryClient.invalidateQueries("members");
            navigate("/members");
        }
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
            const matchingUsername = members.data?.find(existingMember => existingMember.username.toLowerCase() === trimmedUsername.toLowerCase() && existingMember._id !== memberid);
            if (matchingUsername) {
                setUsernameErrMsg("This username already exists. Please enter a different username.");
            } else {
                setUsernameErrMsg("");
            };
        };
    };

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        const trimmedFirstname = firstname.trim();

        if (!memberid && !usernameErrMsg && !addMemberMutation.isLoading) {
            addMemberMutation.mutate({ username: trimmedUsername, firstname: trimmedFirstname });
            resetFields();
        };
        if (memberid && !usernameErrMsg && !editMemberMutation.isLoading) {
            editMemberMutation.mutate({ memberid, username: trimmedUsername, firstname: trimmedFirstname });
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
            <form className="member-form" onSubmit={handleSubmit} method="POST" noValidate>
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
                    {memberid ?
                        <button type="button" onClick={() => deleteMemberMutation.mutate()}className="secondary-btn">Delete member</button> : null
                    }
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