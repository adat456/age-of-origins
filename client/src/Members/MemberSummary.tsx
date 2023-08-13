import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPastYearStats } from "../Shared/sharedFunctions";
import { statInterface } from "../Shared/interfaces";

const MemberSummary: React.FC = function() {
    // be careful about changing the names of these state variables--many of this component's functions' parameters depend on keeping these names the same
    const [ battleRankingsView, setBattleRankingsView ] = useState<"month" | "quarteryear" | "halfyear" | "year" | string>("month");
    const [ contributionsView, setContributionsView ] = useState<"month" | "quarteryear" | "halfyear" | "year" | string>("month");

    let { username } = useParams();
    if (username) username = decodeURIComponent(username);

    const {
            data: pastYearStats,
            error: pastYearStatsErr,
            status: pastYearStatsStatus,
        } = useQuery({
            queryKey: [ `${username}-past-year-stats` ],
            queryFn: () => fetchPastYearStats(username)
    });

    function generateStatViewOptions(stat: "battleRankings" | "contributions") {
        const options = ["month", "quarteryear", "halfyear", "year"];
        const optionLabels = ["Past month", "Past 3 months", "Past 6 months", "Past year"];

        const viewStateVariable = stat === "battleRankings" ? battleRankingsView : contributionsView;
        const viewStateVariableSetter = stat === "battleRankings" ? setBattleRankingsView : setContributionsView;

        const optionRadios = options.map((option, index) => (
            <div key={`${stat}-${option}`}>
                <input type="radio" name={viewStateVariable} id={`${stat}-${option}`} value={option} checked={viewStateVariable === option} onChange={(e) => viewStateVariableSetter(e.target.value)} />
                <label htmlFor={`${stat}-${option}`}>{optionLabels[index]}</label>
            </div>
        ));
        return (
            <form>
                {optionRadios}
            </form>
        );
    };

    function truncateResults(stat: "battleRankings" | "contributions") {
        if (pastYearStats) {
            const viewStateVariable = stat === "battleRankings" ? battleRankingsView : contributionsView;

            let truncatedStats: statInterface[] | null = null;
            switch (viewStateVariable) {
                case "month":
                    truncatedStats = pastYearStats[stat].slice(-4);
                    break;
                case "quarteryear":
                    truncatedStats = pastYearStats[stat].slice(-13);
                    break;
                case "halfyear":
                    truncatedStats = pastYearStats[stat].slice(-26);
                    break;
                case "year":
                    truncatedStats = pastYearStats[stat];
                    break;
            };
            return truncatedStats;
        };
    };

    function generateStatSummary(stat: "battleRankings" | "contributions") {
        const truncatedStats = truncateResults(stat);
        if (truncatedStats) {
            const statSummary = truncatedStats.map(stat => (
                <div key={stat._id}>
                    <p>{`Week ${stat.week}, ${stat.year}`}</p>
                    <p>{stat.score}</p>
                </div>
            ));
            return statSummary;
        };
    };

    return (
        <section>
            <Link to="/members">Return to all members</Link>
            <h1>{`${username}`}</h1>
            {pastYearStatsStatus === "success" ? 
                <>
                    <section>
                        <h2>Battle Ranking Summary</h2>
                        {generateStatViewOptions("battleRankings")}
                        {generateStatSummary("battleRankings")}
                    </section>
                    <section>
                        <h2>Contributions Summary</h2>
                        {generateStatViewOptions("contributions")}
                        {generateStatSummary("contributions")}
                    </section>
                </> : null
            }
            {pastYearStatsStatus === "error" ? <p>{pastYearStatsErr.message}</p> : null}
        </section>
    );
};

export default MemberSummary;