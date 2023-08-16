import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchPastYearStats } from "../Shared/sharedFunctions";
import { statInterface } from "../Shared/interfaces";
import StatsForm from "./StatsForm";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MemberSummary: React.FC = function() {
    // be careful about changing the names of these state variables--many of this component's functions' parameters depend on keeping these names the same
    const [ battleRankingsView, setBattleRankingsView ] = useState<"month" | "quarteryear" | "halfyear" | "year" | string>("month");
    const [ contributionsView, setContributionsView ] = useState<"month" | "quarteryear" | "halfyear" | "year" | string>("month");

    const [ statsFormYear, setStatsFormYear ] = useState<number | undefined>(undefined);
    const [ statsFormWeek, setStatsFormWeek ] = useState<number | undefined>(undefined);
    const [ statsFormVis, setStatsFormVis ] = useState(false);

    const { memberid } = useParams();

    const {
            data: pastYearStats,
            error: pastYearStatsErr,
            status: pastYearStatsStatus,
        } = useQuery({
            queryKey: [ `${memberid}-past-year-stats` ],
            queryFn: () => fetchPastYearStats(memberid)
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

    function generateStatChart(stat: "battleRankings" | "contributions") {
        const truncatedStats = truncateResults(stat);

        const chartLabel = `${stat === "battleRankings" ? "Battle Rankings" : "Contributions"}`;
        const data = {
            labels: truncatedStats?.map(stat => stat.week),
            datasets: [
                {
                    label: chartLabel,
                    data: truncatedStats?.map(stat => stat.score),
                    xAxisID: `${stat}-x-axis`,
                    yAxisID: `${stat}-y-axis`,
                    pointHoverBackgroundColor: "#000",
                    pointHoverRadius: 5,
                }
            ],
        };
        return <Line id={`${stat}-chart`} data={data} options={generateStatChartOptions(stat)}  />;
    };

    function generateStatChartOptions(stat: "battleRankings" | "contributions") {
        return {
            scales: {
            },
        };
    };

    // function handleChartClick(e) {
    //     const lineChart = document
    //     const points = lineChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
    
    //     if (points.length) {
    //         const firstPoint = points[0];
    //         const label = e.target.data.labels[firstPoint.index];
    //         const value = e.target.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
    //     }
    // }

    function prepStatsForm(stat: statInterface) {
        setStatsFormYear(stat.year);
        setStatsFormWeek(stat.week);
        setStatsFormVis(true);
    };

    useEffect(() => {
        if (statsFormVis) {
            const statsFormDialog = document.querySelector(".stats-form-dialog") as HTMLDialogElement;
            statsFormDialog?.showModal();
        };
    }, [statsFormVis]);

    return (
        <>
            <section>
                <Link to="/members">Return to all members</Link>
                {/* <h1>{`${username}`}</h1> */}
                {pastYearStatsStatus === "success" ? 
                    <>
                        <section>
                            <h2>Battle Ranking Summary</h2>
                            {generateStatViewOptions("battleRankings")}
                            <div>
                                {generateStatChart("battleRankings")}
                            </div>
                        </section>
                        <section>
                            <h2>Contributions Summary</h2>
                            {generateStatViewOptions("contributions")}
                            <div>
                                {generateStatChart("contributions")}
                            </div>
                        </section>
                    </> : null
                }
                {pastYearStatsStatus === "error" ? <p>{pastYearStatsErr.message}</p> : null}
            </section>
            {statsFormVis ? <StatsForm year={statsFormYear} week={statsFormWeek} currentMemberId={memberid} setStatsFormVis={setStatsFormVis} /> : null}
        </> 
    );
};

export default MemberSummary;