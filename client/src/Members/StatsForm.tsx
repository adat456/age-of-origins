import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, fetchWeekStats, updateStats } from "../Shared/sharedFunctions";

interface statsFormInterface {
    year: number,
    week: number,
    currentMemberId: string | null,
    setCurrentMemberId?: React.Dispatch<React.SetStateAction<string | null>>,
    setStatsFormVis: React.Dispatch<React.SetStateAction<boolean>>,
};

const StatsForm: React.FC<statsFormInterface> = function({ year, week, currentMemberId, setCurrentMemberId, setStatsFormVis }) {
    const [ battle, setBattle ] = useState<number | 0>(0);
    const [ contribution, setContribution ] = useState<number | 0>(0);

    const [ statsFormYear, setStatsFormYear ] = useState(year);
    const [ statsFormWeek, setStatsFormWeek ] = useState(week);

    const queryClient = useQueryClient();
    const membersData  = useQuery({
            queryKey: [ "members", setCurrentMemberId ],
            queryFn: fetchMembers,
            enabled: !!setCurrentMemberId
    });
    const weekStats = useQuery({
            queryKey: [ `${currentMemberId}-stats`, currentMemberId, statsFormWeek, statsFormYear ],
            queryFn: () => fetchWeekStats({memberid: currentMemberId, week: statsFormWeek, year: statsFormYear})
    });
    useEffect(() => {
        if (weekStats.data) {
            setBattle(weekStats.data.battle);
            setContribution(weekStats.data.contribution);
        };
    }, [weekStats.data]);
    const updateStatsMutation = useMutation({
            mutationFn: updateStats,
            onSuccess: () => {
                queryClient.invalidateQueries(`${currentMemberId}-stats`);
                queryClient.invalidateQueries(`${currentMemberId}-past-year-stats`);
            },
    });

    function generateMemberOptions() {
        const members = membersData.data?.map(member => (
            <option key={member._id} value={member._id}>{member.username}</option>
        ));
        return members;
    }; 

    function saveStats() {
        if (currentMemberId) {
            updateStatsMutation.mutate({ 
                memberid: currentMemberId, 
                battle, contribution,
                year: statsFormYear,
                week: statsFormWeek
            });
        };
    };

    function closeDialog() {
        if (setCurrentMemberId) setCurrentMemberId(null);
        setStatsFormVis(false);
        const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
        statsFormDialog?.close();
    };

    return (
        <dialog className="stats-form-dialog">
            <form method="POST" className="stats-form" noValidate>
                <h1>Add stats</h1>
                <div>
                    <div>
                        <label htmlFor="statsFormWeek">Week</label>
                        <input type="number" name="statsFormWeek" id="statsFormWeek" value={statsFormWeek} onChange={(e) => setStatsFormWeek(Number(e.target.value))} min={1} max={52} required />
                    </div>
                    <div>
                        <label htmlFor="statsFormYear">Year</label>
                        <input type="number" name="statsFormYear" id="statsFormYear" value={statsFormYear} onChange={(e) => setStatsFormYear(Number(e.target.value))} min={2020} max={2030} required />
                    </div>
                </div>

                {setCurrentMemberId ?
                    <>
                        {membersData.isError ? <p>{membersData.error}</p> : null}
                        {membersData.isSuccess ?
                            <>
                                <label htmlFor="currentMemberId">Select alliance member:</label>
                                <select name="currentMemberId" id="currentMemberId" defaultValue={currentMemberId || undefined} onChange={(e) => {setCurrentMemberId(e.target.value); updateStatsMutation.reset()}}>
                                    <option value={undefined}></option>
                                    {generateMemberOptions()}
                                </select>
                            </> : null
                        }
                    </> : null
                }

                <div>
                    <label htmlFor="battle">Battle Power</label>
                    <input type="number" id="battle" value={battle} onChange={(e) => setBattle(Number(e.target.value))} min={1} required />
                </div>
                <div>
                    <label htmlFor="contribution">Total Contribution</label>
                    <input type="number" id="contribution" value={contribution} onChange={(e) => setContribution(Number(e.target.value))} min={1} required />
                </div>

                {updateStatsMutation.isLoading ? <p>Saving member's stats...</p> : null}
                {updateStatsMutation.isError ? <p>{updateStatsMutation.error}</p> : null}
                {updateStatsMutation.isSuccess ? <p>{updateStatsMutation.data}</p> : null}

                <button type="button" onClick={saveStats}>Save</button>
                <button type="button" onClick={() => {saveStats(); closeDialog();}}>Save and Close</button>
                <button type="button" onClick={closeDialog}>Close</button>
            </form>
        </dialog>
    );
};

export default StatsForm;