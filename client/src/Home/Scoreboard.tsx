import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getYear, getWeek, startOfWeek, lastDayOfWeek, addWeeks, subWeeks } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMembersBattle, fetchAllMembersContribution } from "../Shared/sharedFunctions";

interface scoreboardInterface {
    stat: "battle" | "contribution"
};

const Scoreboard: React.FC<scoreboardInterface> = function({ stat }) {
    const [ scoreboardDate, setScoreboardDate ] = useState(new Date());
    const [ year, setYear ] = useState(getYear(new Date()));
    const [ week, setWeek ] = useState(getWeek(new Date(), { weekStartsOn: 6 }));

    const location = useLocation();

    const allMembersStats = useQuery({
        queryKey: stat === "battle" ? [ "all-members-battle", year, week ] : [ "all-members-contribution", year, week ],
        queryFn: stat === "battle" ? () => fetchAllMembersBattle({year, week}) : () => fetchAllMembersContribution({year, week}),
    });

    function getTopFiveScores() {
        if (allMembersStats.data) return allMembersStats.data.slice(0, 5);
    };

    function generateScores() {
        const scoreset = location.pathname === "/" ? getTopFiveScores() : allMembersStats.data;
        const scores = scoreset?.map((populatedStat, index: number) => (
            <li key={populatedStat._id} className="flex items-center border-b-2 border-light/25 py-8">
                <div className="bg-light p-8 mr-16 rounded text-offwhite">{`${index + 1}`}</div>
                {populatedStat.member ? <p className="text-offwhite">{populatedStat.member.username}</p> : null}
                <p className="text-offwhite ml-auto">{populatedStat.score}</p>
            </li>
        ));
        return (
            <ul>
                {scores}
                {location.pathname === "/" ? null : <p className="block text-offwhite text-center my-16">End of scoreboard</p>}
            </ul>
        );
    };

    function handleWeekChange(direction: string) {
        if (direction === "backward") {
            if (week === 1) {
                setWeek(52);
                setYear(year - 1);
            } else {
                setWeek(week - 1);
            };
            setScoreboardDate(subWeeks(scoreboardDate, 1));
        } else if (direction === "forward") {
            if (week === 52) {
                setWeek(1);
                setYear(year + 1);
            } else {
                setWeek(week + 1);
            };
            setScoreboardDate(addWeeks(scoreboardDate, 1));
        };
    };

    return (
        <aside className={location.pathname === "/" ? "my-32" : "m-24"}>
            {location.pathname === "/" ? null : <Link to="/" className="link block mb-24">Back to dash</Link>}
            <header className="flex justify-between mb-16">
                <button type="button" onClick={() => handleWeekChange("backward")} className="primary-btn">
                    <svg width="1rem" height="1rem" viewBox="0 0 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M3.446,10.052 C2.866,9.471 2.866,8.53 3.446,7.948 L9.89,1.506 C10.471,0.924 11.993,0.667 11.993,2.506 L11.993,15.494 C11.993,17.395 10.472,17.076 9.89,16.495 L3.446,10.052 L3.446,10.052 Z" fill="#E0E3EB"></path></g></svg>
                </button>
                <div>
                    <h2 className="text-offwhite text-xl font-bold text-center tracking-wide">{stat === "battle" ? "Top Battle Power" : "Top Contribution"}</h2>
                    <p className="text-offwhite text-base text-center">{`${startOfWeek(scoreboardDate, { weekStartsOn: 6 }).toISOString().slice(5, 10)} - ${lastDayOfWeek(scoreboardDate, { weekStartsOn: 6 }).toISOString().slice(5, 10)}`}</p>
                </div>
                <button type="button" onClick={() => handleWeekChange("forward")} className="primary-btn">
                    <svg width="1rem" height="1rem" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" ><g  fillRule="evenodd"><path d="M6.113,15.495 C5.531,16.076 4.01,16.395 4.01,14.494 L4.01,1.506 C4.01,-0.333 5.531,-0.076 6.113,0.506 L12.557,6.948 C13.137,7.529 13.137,8.47 12.557,9.052 L6.113,15.495 L6.113,15.495 Z" fill="#E0E3EB"></path></g></svg>
                </button>
            </header>
            {allMembersStats.data?.length > 0 ?
                generateScores():
                <p className="block text-offwhite text-center my-16">No data available for this week.</p>
            }
            {location.pathname === "/" && allMembersStats.data?.length > 0 ?
                stat === "battle" ?
                    <Link to="/battle-rankings" className="link my-8 block text-right">See entire battle scoreboard</Link> :
                    <Link to="/contribution-rankings" className="link my-8 block text-right">See entire contribution scoreboard</Link> 
                : null
            }
        </aside>
    );
};

export default Scoreboard;