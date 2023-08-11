import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "./sharedFunctions";

const MembersList: React.FC = function() {
    const { data: membersData, error: membersErr, status: fetchMembersStatus } = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });

    function generateMembers() {
        const members = membersData?.map(member => (
            <li key={member._id}>
                <p>{member.username}</p>
            </li>
        ));
        return members;
    };

    return (
        <ul>
            {fetchMembersStatus === "loading" ? <p>Loading list of members...</p> : null}
            {fetchMembersStatus === "error" ? <p>{membersErr.message}</p> : null}
            {fetchMembersStatus === "success" ? generateMembers() : null}
        </ul>
    );
};

export default MembersList;