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
            <div key={populatedStat._id}>
                <p>{`${index + 1}`}</p>
                {populatedStat.member ? <p>{populatedStat.member.username}</p> : null}
                <p>{populatedStat.score}</p>
            </div>
        ));
        return scores;
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
        <aside>
            <h2>{stat === "battle" ? "Top Battle Power" : "Top Contribution"}</h2>
            <p>{`${startOfWeek(scoreboardDate, { weekStartsOn: 6 }).toISOString().slice(5, 10)} - ${lastDayOfWeek(scoreboardDate, { weekStartsOn: 6 }).toISOString().slice(5, 10)}`}</p>
            <button type="button" onClick={() => handleWeekChange("backward")}>Previous Week</button>
            <button type="button" onClick={() => handleWeekChange("forward")}>Next Week</button>
            {generateScores()}
            {location.pathname === "/" ?
                stat === "battle" ?
                    <Link to="/battle-rankings">See entire battle scoreboard</Link> :
                    <Link to="/contribution-rankings">See entire contribution scoreboard</Link> 
                : null
            }
        </aside>
    );
};

export default Scoreboard;