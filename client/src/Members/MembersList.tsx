import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getYear, getWeek } from "date-fns";
import { fetchMembers } from "../Shared/sharedFunctions";
import StatsForm from "./StatsForm";
import MemberForm from "./MemberForm";

const MembersList: React.FC = function() {
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ memberFormVis, setMemberFormVis ] = useState(false);
    const [ statsFormVis, setStatsFormVis ] = useState(false);

    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

    const members = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const pagesOfMembers = Math.ceil(members.data?.length/10);

    function sliceMembersArrForCurrentPage(page: number, totalPages: number) {
        if (members.data && page >= 1 && page <= totalPages) {
            const startPage = (currentPage * 10) - 10;
            const afterEndPage = currentPage * 10;
            const slicedData = members.data.slice(startPage, afterEndPage);
            return slicedData;
        };
    };

    function generateMembers() {
        let data = sliceMembersArrForCurrentPage(currentPage, pagesOfMembers);
        const membersArr = data?.map(member => (
            <li key={member._id} className="flex items-center justify-between bg-dark p-16 my-16 rounded">
                <Link to={`/members/${member._id}`} state={{ pageNum: currentPage }} className="link">{member.username}</Link>
                <button type="button" onClick={() => {setCurrentMemberId(member._id); setStatsFormVis(true);}} className="secondary-btn">Add stats</button>
            </li>
        ));
        return membersArr;
    };

    const location = useLocation();
    useEffect(() => {
        if (location.state && location.state.pageNum) setCurrentPage(location.state.pageNum); 
    }, [location.state])

    useEffect(() => {
        if (memberFormVis) {
            const memberFormDialog = document.querySelector(".member-form-dialog") as HTMLDialogElement;
            memberFormDialog?.showModal();
        };
    }, [memberFormVis]);
    const [ currentMemberId, setCurrentMemberId ] = useState<string | null>(null);

    useEffect(() => {
        if (statsFormVis) {
            const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
            statsFormDialog?.showModal();
        };
    }, [statsFormVis]);

    return (
        <>
            <header className="flex items-center justify-between my-16">
                <h2 className="text-offwhite my-16 text-2xl font-bold tracking-wide">{`All Members (${members.data?.length})`}</h2>
                <button type="button" onClick={() => setMemberFormVis(true)} className="bg-red p-[5px] hover:bg-mutedred active:bg-mutedred focus:bg-mutedred rounded">
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
            </header>
            <div className="flex justify-between my-16">
                {currentPage !== 1 ?
                    <button type="button" onClick={() => setCurrentPage(currentPage - 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M3.446,10.052 C2.866,9.471 2.866,8.53 3.446,7.948 L9.89,1.506 C10.471,0.924 11.993,0.667 11.993,2.506 L11.993,15.494 C11.993,17.395 10.472,17.076 9.89,16.495 L3.446,10.052 L3.446,10.052 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
                <p className="text-offwhite">{`Page ${currentPage}`}</p>
                {currentPage !== pagesOfMembers ?
                    <button type="button" onClick={() => setCurrentPage(currentPage + 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" ><g  fillRule="evenodd"><path d="M6.113,15.495 C5.531,16.076 4.01,16.395 4.01,14.494 L4.01,1.506 C4.01,-0.333 5.531,-0.076 6.113,0.506 L12.557,6.948 C13.137,7.529 13.137,8.47 12.557,9.052 L6.113,15.495 L6.113,15.495 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
            </div>
            <ul>
                {members.isLoading ? <p>Loading list of members...</p> : null}
                {members.isError ? <p>{members.error}</p> : null}
                {members.isSuccess ? generateMembers() : null}
            </ul>
            <div className="flex justify-between my-16">
                {currentPage !== 1 ?
                    <button type="button" onClick={() => setCurrentPage(currentPage - 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M3.446,10.052 C2.866,9.471 2.866,8.53 3.446,7.948 L9.89,1.506 C10.471,0.924 11.993,0.667 11.993,2.506 L11.993,15.494 C11.993,17.395 10.472,17.076 9.89,16.495 L3.446,10.052 L3.446,10.052 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
                <p className="text-offwhite">{`Page ${currentPage}`}</p>
                {currentPage !== pagesOfMembers ?
                    <button type="button" onClick={() => setCurrentPage(currentPage + 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" ><g  fillRule="evenodd"><path d="M6.113,15.495 C5.531,16.076 4.01,16.395 4.01,14.494 L4.01,1.506 C4.01,-0.333 5.531,-0.076 6.113,0.506 L12.557,6.948 C13.137,7.529 13.137,8.47 12.557,9.052 L6.113,15.495 L6.113,15.495 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
            </div>
            {memberFormVis ? <MemberForm setMemberFormVis={setMemberFormVis} /> : null}
            {statsFormVis ? <StatsForm year={year} week={week} currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId} setStatsFormVis={setStatsFormVis} /> : null}
        </>
    );
};

export default MembersList;