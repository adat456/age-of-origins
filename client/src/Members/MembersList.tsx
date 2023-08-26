import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getYear, getWeek } from "date-fns";
import { fetchMembers } from "../Shared/sharedFunctions";
import StatsForm from "./StatsForm";

const MembersList: React.FC = function() {
    const [ statsFormVis, setStatsFormVis ] = useState(false);
    const [ currentMemberId, setCurrentMemberId ] = useState<string | null>(null);

    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

    const members = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });

    function generateMembers() {
        const membersArr = members.data?.map(member => (
            <li key={member._id}>
                <p>{member.username}</p>
                <Link to={`/members/${member._id}`}>View summary</Link>
                <button type="button" onClick={() => {setCurrentMemberId(member._id); setStatsFormVis(true);}}>Add stats</button>
            </li>
        ));
        return membersArr;
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
                {members.isLoading ? <p>Loading list of members...</p> : null}
                {members.isError ? <p>{members.error}</p> : null}
                {members.isSuccess ? generateMembers() : null}
            </ul>
            {statsFormVis ? <StatsForm year={year} week={week} currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId} setStatsFormVis={setStatsFormVis} /> : null}
        </>
    );
};

export default MembersList;