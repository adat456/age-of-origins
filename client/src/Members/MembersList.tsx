import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getYear, getWeek } from "date-fns";
import { fetchMembers, toggleMemberArchival } from "../Shared/sharedFunctions";
import { memberInterface } from "../Shared/interfaces";
import AuthenticatedContext from "../Shared/AuthenticatedContext";
import StatsForm from "./StatsForm";
import MemberForm from "./MemberForm";

const MembersList: React.FC = function() {
    const [ seeArchived, setSeeArchived ] = useState(false);
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ memberFormVis, setMemberFormVis ] = useState(false);
    const [ currentMemberId, setCurrentMemberId ] = useState<string | null>(null);
    const [ statsFormVis, setStatsFormVis ] = useState(false);

    const authenticated = useContext(AuthenticatedContext);

    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

    const queryClient = useQueryClient();
    const toggleArchival = useMutation({
        mutationFn: (memberid: string) => toggleMemberArchival(memberid),
        onSuccess: () => queryClient.invalidateQueries("members")
    });
    const members = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const activeMembers = members.data?.filter(member => !member.archived)
    const pagesOfActiveMembers = Math.ceil(activeMembers?.length/10);
    const archivedMembers = members.data?.filter(member => member.archived)
    const pagesOfArchivedMembers = Math.ceil(archivedMembers?.length/10);

    function sliceArrForCurrentPage(membersArr: memberInterace[], page: number, totalPages: number) {
        if (page >= 1 && page <= totalPages) {
            const startPage = (currentPage * 10) - 10;
            const afterEndPage = currentPage * 10;
            const slicedData = membersArr.slice(startPage, afterEndPage);
            return slicedData;
        };
    };

    function generateMembers() {
        let data: memberInterface[];
        if (!seeArchived) {
            data = sliceArrForCurrentPage(activeMembers, currentPage, pagesOfActiveMembers);
        } else {
            data = sliceArrForCurrentPage(archivedMembers, currentPage, pagesOfArchivedMembers);
        };
        const membersArr = data?.map(member => (
            <li key={member._id} className="flex items-center bg-dark p-16 my-16 rounded">
                <div className="mr-auto flex gap-8">
                    <Link to={`/members/${member._id}`} state={{ pageNum: currentPage, seeArchived }} className="link">{member.username}</Link>
                    {member.archived ? <p className="text-lightest">{`(archived ${member.archivedate.slice(0, 10)})`}</p> : null}
                </div>
                {authenticated ?
                    <div className="ml-auto flex gap-16">
                        {!member.archived ?
                            <button type="button" onClick={() => {setCurrentMemberId(member._id); setStatsFormVis(true);}} className="secondary-btn">Add stats</button> : null
                        }
                        <button type="button" onClick={() => toggleArchival.mutate(member._id)}>
                            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5303 17.5303C12.3897 17.671 12.1989 17.75 12 17.75C11.8011 17.75 11.6103 17.671 11.4697 17.5303L8.96967 15.0303C8.67678 14.7374 8.67678 14.2626 8.96967 13.9697C9.26256 13.6768 9.73744 13.6768 10.0303 13.9697L11.25 15.1893V11C11.25 10.5858 11.5858 10.25 12 10.25C12.4142 10.25 12.75 10.5858 12.75 11V15.1893L13.9697 13.9697C14.2626 13.6768 14.7374 13.6768 15.0303 13.9697C15.3232 14.2626 15.3232 14.7374 15.0303 15.0303L12.5303 17.5303Z" fill="#A3AAC2"/><path fillRule="evenodd" clipRule="evenodd" d="M12.0574 1.25H11.9426C9.63423 1.24999 7.82519 1.24998 6.41371 1.43975C4.96897 1.63399 3.82895 2.03933 2.93414 2.93414C2.03933 3.82895 1.63399 4.96897 1.43975 6.41371C1.24998 7.82519 1.24999 9.63422 1.25 11.9426V12H1.26092C1.25 12.5788 1.25 13.2299 1.25 13.9664V14.0336C1.25 15.4053 1.24999 16.4807 1.32061 17.3451C1.39252 18.2252 1.54138 18.9523 1.87671 19.6104C2.42799 20.6924 3.30762 21.572 4.38956 22.1233C5.04769 22.4586 5.7748 22.6075 6.65494 22.6794C7.51927 22.75 8.59469 22.75 9.96637 22.75H14.0336C15.4053 22.75 16.4807 22.75 17.3451 22.6794C18.2252 22.6075 18.9523 22.4586 19.6104 22.1233C20.6924 21.572 21.572 20.6924 22.1233 19.6104C22.4586 18.9523 22.6075 18.2252 22.6794 17.3451C22.75 16.4807 22.75 15.4053 22.75 14.0336V13.9664C22.75 13.2302 22.75 12.5787 22.7391 12H22.75V11.9426C22.75 9.63423 22.75 7.82519 22.5603 6.41371C22.366 4.96897 21.9607 3.82895 21.0659 2.93414C20.1711 2.03933 19.031 1.63399 17.5863 1.43975C16.1748 1.24998 14.3658 1.24999 12.0574 1.25ZM4.38956 5.87671C3.82626 6.16372 3.31781 6.53974 2.88197 6.98698C2.89537 6.85884 2.91012 6.73444 2.92637 6.61358C3.09825 5.33517 3.42514 4.56445 3.9948 3.9948C4.56445 3.42514 5.33517 3.09825 6.61358 2.92637C7.91356 2.75159 9.62177 2.75 12 2.75C14.3782 2.75 16.0864 2.75159 17.3864 2.92637C18.6648 3.09825 19.4355 3.42514 20.0052 3.9948C20.5749 4.56445 20.9018 5.33517 21.0736 6.61358C21.0899 6.73445 21.1046 6.85884 21.118 6.98698C20.6822 6.53975 20.1737 6.16372 19.6104 5.87671C18.9523 5.54138 18.2252 5.39252 17.3451 5.32061C16.4807 5.24999 15.4053 5.25 14.0336 5.25H9.96645C8.59472 5.25 7.51929 5.24999 6.65494 5.32061C5.7748 5.39252 5.04769 5.54138 4.38956 5.87671ZM5.07054 7.21322C5.48197 7.00359 5.9897 6.87996 6.77708 6.81563C7.57322 6.75058 8.58749 6.75 10 6.75H14C15.4125 6.75 16.4268 6.75058 17.2229 6.81563C18.0103 6.87996 18.518 7.00359 18.9295 7.21322C19.7291 7.62068 20.3793 8.27085 20.7868 9.07054C20.9964 9.48197 21.12 9.9897 21.1844 10.7771C21.2494 11.5732 21.25 12.5875 21.25 14C21.25 15.4125 21.2494 16.4268 21.1844 17.2229C21.12 18.0103 20.9964 18.518 20.7868 18.9295C20.3793 19.7291 19.7291 20.3793 18.9295 20.7868C18.518 20.9964 18.0103 21.12 17.2229 21.1844C16.4268 21.2494 15.4125 21.25 14 21.25H10C8.58749 21.25 7.57322 21.2494 6.77708 21.1844C5.9897 21.12 5.48197 20.9964 5.07054 20.7868C4.27085 20.3793 3.62068 19.7291 3.21322 18.9295C3.00359 18.518 2.87996 18.0103 2.81563 17.2229C2.75058 16.4268 2.75 15.4125 2.75 14C2.75 12.5875 2.75058 11.5732 2.81563 10.7771C2.87996 9.9897 3.00359 9.48197 3.21322 9.07054C3.62068 8.27085 4.27085 7.62069 5.07054 7.21322Z" fill="#A3AAC2"/></svg>
                        </button>
                    </div>
                    : null
                }
            </li>
        ));
        return membersArr;
    };

    const location = useLocation();
    useEffect(() => {
        if (location.state && location.state.pageNum && location.state.seeArchived) {
            setCurrentPage(location.state.pageNum); 
            setSeeArchived(location.state.seeArchived);
        };
    }, [location.state])

    useEffect(() => {
        if (memberFormVis) {
            const memberFormDialog = document.querySelector(".member-form-dialog") as HTMLDialogElement;
            memberFormDialog?.showModal();
        };
    }, [memberFormVis]);

    useEffect(() => {
        if (statsFormVis) {
            const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
            statsFormDialog?.showModal();
        };
    }, [statsFormVis]);

    return (
        <>
            <header className="flex items-center justify-between mt-16 mb-4">
                <h2 className="text-offwhite my-16 text-2xl font-bold tracking-wide">{`All Members (${members.data?.length})`}</h2>
                {authenticated ?
                    <button type="button" onClick={() => setMemberFormVis(true)} className="bg-red p-[5px] hover:bg-mutedred active:bg-mutedred focus:bg-mutedred rounded">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button> : null
                }
            </header>
            <div className="flex justify-center">
                <input type="checkbox" name="seeArchived" id="seeArchived" checked={seeArchived} onChange={(e) => {setSeeArchived(e.target.checked); setCurrentPage(1);}} />
                <label htmlFor="seeArchived" className="text-offwhite ml-8">See archived members</label>
            </div>
            <div className="flex justify-between my-16">
                {(seeArchived ? archivedMembers?.length : activeMembers?.length) > 0 && currentPage !== 1 ?
                    <button type="button" onClick={() => setCurrentPage(currentPage - 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><path d="M3.446,10.052 C2.866,9.471 2.866,8.53 3.446,7.948 L9.89,1.506 C10.471,0.924 11.993,0.667 11.993,2.506 L11.993,15.494 C11.993,17.395 10.472,17.076 9.89,16.495 L3.446,10.052 L3.446,10.052 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
                {(seeArchived ? archivedMembers?.length : activeMembers?.length) > 10 ? <p className="text-offwhite">{`Page ${currentPage}`}</p> : null}
                {(seeArchived ? archivedMembers?.length : activeMembers?.length) > 0 && currentPage !== (seeArchived ? pagesOfArchivedMembers : pagesOfActiveMembers) ?
                    <button type="button" onClick={() => setCurrentPage(currentPage + 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" ><g  fillRule="evenodd"><path d="M6.113,15.495 C5.531,16.076 4.01,16.395 4.01,14.494 L4.01,1.506 C4.01,-0.333 5.531,-0.076 6.113,0.506 L12.557,6.948 C13.137,7.529 13.137,8.47 12.557,9.052 L6.113,15.495 L6.113,15.495 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
            </div>
            <ul>
                {members.isLoading ? <p>Loading list of members...</p> : null}
                {members.isError ? <p>{members.error}</p> : null}
                {members.isSuccess && (seeArchived ? archivedMembers?.length : activeMembers?.length) > 0 ? 
                    generateMembers() : 
                    <p className="text-offwhite text-center">No members found.</p>
                }
            </ul>
            <div className="flex justify-between my-16">
                {(seeArchived ? archivedMembers?.length : activeMembers?.length) > 0 && currentPage !== 1 ?
                    <button type="button" onClick={() => setCurrentPage(currentPage - 1)} className="primary-btn">
                        <svg width="1rem" height="1rem" viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><path d="M3.446,10.052 C2.866,9.471 2.866,8.53 3.446,7.948 L9.89,1.506 C10.471,0.924 11.993,0.667 11.993,2.506 L11.993,15.494 C11.993,17.395 10.472,17.076 9.89,16.495 L3.446,10.052 L3.446,10.052 Z" fill="#E0E3EB"></path></g></svg>
                    </button> : null
                }
                {(seeArchived ? archivedMembers?.length : activeMembers?.length) > 10 ? <p className="text-offwhite">{`Page ${currentPage}`}</p> : null}
                {(seeArchived ? archivedMembers?.length : activeMembers?.length) > 0 && currentPage !== (seeArchived ? pagesOfArchivedMembers : pagesOfActiveMembers) ?
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