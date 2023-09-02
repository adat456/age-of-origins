import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, deleteMember } from "../../Shared/sharedFunctions";
import { memberInterface } from "../../Shared/interfaces";
import AuthenticatedContext from "../../Shared/AuthenticatedContext";
import Graph from "./Graph";
import MemberForm from "../MemberForm";

const MemberSummary: React.FC = function() {
    const [ member, setMember ] = useState<memberInterface | undefined>(undefined);
    const [ buttonsVis, setButtonsVis ] = useState(false);
    const [ memberFormVis, setMemberFormVis ] = useState(false);

    const authenticated = useContext(AuthenticatedContext);

    const { memberid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { pageNum, seeArchived } = location.state;

    const queryClient = useQueryClient();
    const membersData = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers,
    });
    const deleteMemberMutation = useMutation({
        mutationFn: (memberid: string) => deleteMember(memberid),
        onSuccess: () => {
            queryClient.invalidateQueries("members");
            navigate("/members");
        }
    });

    useEffect(() => {
        if (membersData.data && memberid) {
            setMember(membersData.data.find(member => member._id === memberid));
        };
    }, [membersData.data, memberid]);

    useEffect(() => {
        if (memberFormVis) {
            const memberForm = document.querySelector(".member-form-dialog") as HTMLDialogElement;
            memberForm?.showModal();
        };
    }, [memberFormVis]);

    return (
        <>
            <section>
                <Link to="/members" state={{ pageNum, seeArchived }} className="link">Back to members</Link>
                <header className="flex justify-center items-center my-8 gap-8">
                    <h2 className="text-offwhite mt-24 mb-16 text-2xl font-bold tracking-wide text-center">{`${member?.username}`}</h2>
                    {authenticated ?
                        <button type="button" onClick={() => setButtonsVis(!buttonsVis)} className="mt-16 mb-8">
                            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20H20.5M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button> : null
                    }
                </header>
                {buttonsVis && authenticated ?
                    <div className="flex justify-center gap-16 mt-8 mb-32">
                        <button type="button" className="secondary-btn" onClick={() => setMemberFormVis(true)}>Edit</button>
                        <button type="button" onClick={() => deleteMemberMutation.mutate(member?._id)}className="secondary-btn">Delete</button>
                    </div> : null
                }
                <Graph stat="battleRankings" />
                <Graph stat="contributions" />
            </section>
            {memberFormVis ?
                <MemberForm setMemberFormVis={setMemberFormVis} memberid={member?._id} /> : null
            }
        </> 
    );
};

export default MemberSummary;