import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "../../Shared/sharedFunctions";
import Graph from "./Graph";
import { memberInterface } from "../../Shared/interfaces";

const MemberSummary: React.FC = function() {
    const [ member, setMember ] = useState<memberInterface | undefined>(undefined);

    const { memberid } = useParams();

    const membersData = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers,
    });

    useEffect(() => {
        if (membersData.data && memberid) {
            setMember(membersData.data.find(member => member._id === memberid));
        };
    }, [membersData.data, memberid]);

    return (
        <>
            <section>
                <Link to="/members">Return to all members</Link>
                <h1>{`${member?.username}`}</h1>
                <Graph stat="battleRankings" />
                <Graph stat="contributions" />
            </section>
        </> 
    );
};

export default MemberSummary;