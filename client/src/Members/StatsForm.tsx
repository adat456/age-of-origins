import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, fetchCurrentMembersStats, updateStats } from "../Shared/sharedFunctions";

interface statsFormInterface {
    currentMemberId: string | null,
    setCurrentMemberId: React.Dispatch<React.SetStateAction<string | null>>,
    setStatsFormVis: React.Dispatch<React.SetStateAction<boolean>>,
};

const StatsForm: React.FC<statsFormInterface> = function({ currentMemberId, setCurrentMemberId, setStatsFormVis }) {
    const battleInputRef = useRef<HTMLInputElement>(null);
    const contributionInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();
    const { 
            data: membersData, 
            error: fetchMembersErr, 
            status: fetchMembersStatus
        } = useQuery({
            queryKey: [ "members" ],
            queryFn: fetchMembers
    });
    const { 
            data: currentMembersStats, 
            fetchStatus: currentMembersStatsFetchStatus 
        } = useQuery({
            queryKey: [ `${currentMemberId}-stats`, currentMemberId ],
            queryFn: () => fetchCurrentMembersStats(currentMemberId)
    });
    const { 
            mutate: mutateStats, 
            data: updateStatsData, 
            error: updateStatsError, 
            status: updateStatsStatus, 
            reset: resetMutationMsg 
        } = useMutation({
            mutationFn: (data: {memberid: string, battle: number, contribution: number}) => updateStats(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [ `${currentMemberId}-stats` ] })
            },
    });

    function generateMemberOptions() {
        const members = membersData?.map(member => (
            <option key={member._id} value={member._id}>{member.username}</option>
        ));
        return members;
    }; 

    function saveStats() {
        if (currentMemberId) {
            mutateStats({ 
                memberid: currentMemberId, 
                battle: Number(battleInputRef.current?.value),
                contribution: Number(contributionInputRef.current?.value) });
        };
    };

    function closeDialog() {
        setCurrentMemberId(null);
        setStatsFormVis(false);
        const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
        statsFormDialog?.close();
    };

    useEffect(() => {
        if (battleInputRef.current) battleInputRef.current.value = currentMembersStats?.battle;
        if (contributionInputRef.current) contributionInputRef.current.value = currentMembersStats?.contribution;
    }, [currentMembersStats]);

    return (
        <dialog className="stats-form-dialog">
            <form method="POST" className="stats-form" noValidate>
                <h1>Add stats</h1>

                {fetchMembersStatus === "error" ? <p>{fetchMembersErr.message}</p> : null}
                {fetchMembersStatus === "success" ?
                    <>
                        <label htmlFor="currentMemberId">Select alliance member:</label>
                        <select name="currentMemberId" id="currentMemberId" defaultValue={currentMemberId || undefined} onChange={(e) => {setCurrentMemberId(e.target.value); resetMutationMsg()}}>
                            <option value={undefined}></option>
                            {generateMemberOptions()}
                        </select>
                    </> : null
                }

                <div>
                    <label htmlFor="battle">Battle Power</label>
                    <input type="number" id="battle" ref={battleInputRef} defaultValue={currentMembersStatsFetchStatus === "fetching" ? "" : currentMembersStats?.battle} min={1} required />
                </div>
                <div>
                    <label htmlFor="contribution">Total Contribution</label>
                    <input type="number" id="contribution" ref={contributionInputRef} defaultValue={currentMembersStatsFetchStatus === "fetching" ? "" : currentMembersStats?.contribution} min={1} required />
                </div>

                {updateStatsStatus === "loading" ? <p>Saving member's stats...</p> : null}
                {updateStatsStatus === "error" ? <p>{updateStatsError.message}</p> : null}
                {updateStatsStatus === "success" ? <p>{updateStatsData}</p> : null}

                <button type="button" onClick={saveStats}>Save</button>
                <button type="button" onClick={() => {saveStats(); closeDialog();}}>Save and Close</button>
                <button type="button" onClick={closeDialog}>Close</button>
            </form>
        </dialog>
    );
};

export default StatsForm;