import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "./sharedFunctions";
import StatsForm from "./StatsForm";

const MembersList: React.FC = function() {
    const [ statsFormVis, setStatsFormVis ] = useState(false);
    const [ currentMemberId, setCurrentMemberId ] = useState<string | null>(null);

    const { data: membersData, error: membersErr, status: fetchMembersStatus } = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });

    function generateMembers() {
        const members = membersData?.map(member => (
            <li key={member._id}>
                <p>{member.username}</p>
                <button type="button" onClick={() => {setCurrentMemberId(member._id); setStatsFormVis(true);}}>Add stats</button>
            </li>
        ));
        return members;
    };

    useEffect(() => {
        if (statsFormVis) {
            const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
            statsFormDialog?.showModal();
        };
    }, [statsFormVis]);

    return (
        <>
            <button type="button" onClick={() => setStatsFormVis(true)}>Add stats for all members</button>
            <ul>
                {fetchMembersStatus === "loading" ? <p>Loading list of members...</p> : null}
                {fetchMembersStatus === "error" ? <p>{membersErr.message}</p> : null}
                {fetchMembersStatus === "success" ? generateMembers() : null}
            </ul>
            {statsFormVis ? <StatsForm currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId} setStatsFormVis={setStatsFormVis} /> : null}
        </>
    );
};

export default MembersList;