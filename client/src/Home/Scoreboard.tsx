import { getYear, getWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMembersBattle, fetchAllMembersContribution } from "../Shared/sharedFunctions";

interface scoreboardInterface {
    stat: "battle" | "contribution"
};

const Scoreboard: React.FC<scoreboardInterface> = function({ stat }) {
    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

    const allMembersStats = useQuery({
        queryKey: stat === "battle" ? [ "all-members-battle" ] : [ "all-members-contribution" ],
        queryFn: stat === "battle" ? () => fetchAllMembersBattle({year, week}) : () => fetchAllMembersContribution({year, week}),
    });

    function generateScores() {
        const scores = allMembersStats.data?.map(populatedStat => (
            <div key={populatedStat._id}>
                <p>{populatedStat.member.username}</p>
                <p>{populatedStat.score}</p>
            </div>
        ));
        return scores;
    };

    return (
        <aside>
            <h2>{stat === "battle" ? "Top Battle Power" : "Top Contribution"}</h2>
            {generateScores()}
        </aside>
    );
};

export default Scoreboard;