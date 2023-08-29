import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "../../Shared/sharedFunctions";
import Graph from "./Graph";
import { memberInterface } from "../../Shared/interfaces";

const MemberSummary: React.FC = function() {
    const [ member, setMember ] = useState<memberInterface | undefined>(undefined);

    const { memberid } = useParams();
    const location = useLocation();
    const { pageNum } = location.state;

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
                <Link to="/members" state={{ pageNum }} className="link">Back to members</Link>
                <h2 className="text-offwhite mt-24 mb-16 text-2xl font-bold tracking-wide text-center">{`${member?.username}`}</h2>
                <Graph stat="battleRankings" />
                <Graph stat="contributions" />
            </section>
        </> 
    );
};

export default MemberSummary;