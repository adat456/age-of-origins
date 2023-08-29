import { useEffect, useState } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
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

    function generateWeekStartAndEnd() {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 6 }).toISOString().slice(0, 10);
        const weekEnd = endOfWeek(today, { weekStartsOn: 6 }).toISOString().slice(0, 10);
        return `${weekStart} - ${weekEnd}`;
    };

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
        <dialog className="stats-form-dialog bg-darkest p-24">
            <form method="POST" className="stats-form" noValidate>
                <h1 className="text-offwhite text-center text-xl font-bold tracking-wide mb-16">Add stats</h1>
                {setCurrentMemberId ?
                    <>
                        {membersData.isError ? <p>{membersData.error}</p> : null}
                        {membersData.isSuccess ?
                            <div className="my-4">
                                <label htmlFor="currentMemberId" className="text-offwhite block mb-4">Alliance member:</label>
                                <select name="currentMemberId" id="currentMemberId" defaultValue={currentMemberId || undefined} onChange={(e) => {setCurrentMemberId(e.target.value); updateStatsMutation.reset()}} className="input">
                                    <option value={undefined}></option>
                                    {generateMemberOptions()}
                                </select>
                            </div> : null
                        }
                    </> : null
                }
                <div className="grid grid-cols-2 my-8">
                    <div>
                        <label htmlFor="statsFormWeek" className="block text-offwhite mb-4">Week:</label>
                        <input type="number" name="statsFormWeek" id="statsFormWeek" value={statsFormWeek} onChange={(e) => setStatsFormWeek(Number(e.target.value))} min={1} max={52} size={2} className="input" required />
                        <p></p>
                    </div>
                    <div>
                        <label htmlFor="statsFormYear" className="block text-offwhite mb-4">Year:</label>
                        <input type="number" name="statsFormYear" id="statsFormYear" value={statsFormYear} onChange={(e) => setStatsFormYear(Number(e.target.value))} min={2020} max={2030} className="input" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 my-8">
                    <div>
                        <label htmlFor="battle" className="block text-offwhite mb-4">Battle Power:</label>
                        <input type="number" id="battle" value={battle} onChange={(e) => setBattle(Number(e.target.value))} min={1} max={99999999} className="input" required />
                    </div>
                    <div>
                        <label htmlFor="contribution" className="text-offwhite mb-4">Contribution:</label>
                        <input type="number" id="contribution" value={contribution} onChange={(e) => setContribution(Number(e.target.value))} min={1} max={99999} className="input mt-4" required />
                    </div>
                </div>
                {updateStatsMutation.isLoading ? <p>Saving member's stats...</p> : null}
                {updateStatsMutation.isError ? <p className="text-red">{updateStatsMutation.error}</p> : null}
                {updateStatsMutation.isSuccess ? <p className="text-offwhite">{updateStatsMutation.data}</p> : null}
                <div className="flex justify-end mt-24">
                    <button type="button" onClick={closeDialog} className="secondary-btn mr-16">Close</button>
                    <button type="button" onClick={saveStats} className="primary-btn">Save</button>
                </div>
            </form>
        </dialog>
    );
};

export default StatsForm;