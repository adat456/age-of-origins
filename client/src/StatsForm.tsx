import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, updateStats } from "./sharedFunctions";

interface statsFormInterface {
    currentMemberId: string | null,
    setCurrentMemberId: React.Dispatch<React.SetStateAction<string | null>>,
    setStatsFormVis: React.Dispatch<React.SetStateAction<boolean>>,
};

const StatsForm: React.FC<statsFormInterface> = function({ currentMemberId, setCurrentMemberId, setStatsFormVis }) {
    const [ battle, setBattle ] = useState(0);
    const [ contribution, setContribution ] = useState(0);

    const queryClient = useQueryClient();

    const { data: membersData, error: membersErr, status: fetchMembersStatus } = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const { mutate: mutateStats, data: updateStatsData, error: updateStatsError, status: updateStatsStatus } = useMutation({
        mutationFn: (data: {memberid: string, battle: number, contribution: number}) => updateStats(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "stats" ] })
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
            mutateStats({ memberid: currentMemberId, battle, contribution });
        };
    };

    function closeDialog() {
        setCurrentMemberId(null);
        setStatsFormVis(false);
        const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
        statsFormDialog?.close();
    };

    return (
        <dialog className="stats-form-dialog">
            <form method="POST" className="stats-form">
                <h1>Add stats</h1>
                <label htmlFor="currentMemberId">Select alliance member:</label>
                <select name="currentMemberId" id="currentMemberId" defaultValue={currentMemberId || undefined} onChange={(e) => setCurrentMemberId(e.target.value)}>
                    <option value={undefined}></option>
                    {generateMemberOptions()}
                </select>
                <div>
                    <label htmlFor="battle">Battle Power</label>
                    <input type="number" id="battle" value={battle} onChange={(e) => setBattle(Number(e.target.value))} required />
                </div>
                <div>
                    <label htmlFor="contribution">Total Contribution</label>
                    <input type="number" id="contribution" value={contribution} onChange={(e) => setContribution(Number(e.target.value))} required />
                </div>

                {updateStatsStatus === "loading" ? <p>Saving member's stats...</p> : null}
                {updateStatsStatus === "error" ? <p>{updateStatsError.message}</p> : null}
                {updateStatsStatus === "success" ? <p>{updateStatsData}</p> : null}
                
                <button type="button" onClick={saveStats}>Save</button>
                <button type="button" onClick={() => {saveStats(); closeDialog();}}>Save and Close</button>
            </form>
        </dialog>
    );
};

export default StatsForm;