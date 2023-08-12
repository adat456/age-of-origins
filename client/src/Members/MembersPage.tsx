import { useState, useEffect } from "react";
import MembersList from "./MembersList";
import MemberForm from "./MemberForm";

const MembersPage: React.FC = function() {
    const [ memberFormVis, setMemberFormVis ] = useState(false);

    useEffect(() => {
        if (memberFormVis) {
            const memberFormDialog = document.querySelector(".member-form-dialog") as HTMLDialogElement;
            memberFormDialog?.showModal();
        };
    }, [memberFormVis]);

    return (
        <> 
            <MembersList />
            <button type="button" onClick={() => setMemberFormVis(true)}>Add member</button>
            {memberFormVis ? <MemberForm setMemberFormVis={setMemberFormVis} /> : null}
        </>
    );
};

export default MembersPage;