import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line, getElementsAtEvent } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query"
import { fetchPastYearStats } from "../../Shared/sharedFunctions";
import { statInterface } from "../../Shared/interfaces";
import StatsForm from "../StatsForm";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface graphInterface {
    stat: "battleRankings" | "contributions",
};

const Graph: React.FC<graphInterface> = function({ stat }) {
    const [ statView, setStatView ] = useState<"month" | "quarteryear" | "halfyear" | "year" | string>("month");
    const [ statsFormYear, setStatsFormYear ] = useState<number | undefined>(undefined);
    const [ statsFormWeek, setStatsFormWeek ] = useState<number | undefined>(undefined);
    const [ statsFormVis, setStatsFormVis ] = useState(false);

    const chartRef = useRef<ChartJS>(null);

    const { memberid } = useParams();

    const pastYearStats = useQuery({
        queryKey: [ `${memberid}-past-year-stats` ],
        queryFn: () => fetchPastYearStats(memberid)
    });

    function generateStatViewOptions() {
        const options = ["month", "quarteryear", "halfyear", "year"];
        const optionLabels = ["Past month", "Past 3 months", "Past 6 months", "Past year"];

        const optionRadios = options.map((option, index) => (
            <div key={`${stat}-${option}`}>
                <input type="radio" name={statView} id={`${stat}-${option}`} value={option} checked={statView === option} onChange={(e) => setStatView(e.target.value)} />
                <label htmlFor={`${stat}-${option}`}>{optionLabels[index]}</label>
            </div>
        ));
        return (
            <form>
                {optionRadios}
            </form>
        );
    };

    function truncateResults() {
        if (pastYearStats.data) {
            let truncatedStats: statInterface[] | null = null;
            switch (statView) {
                case "month":
                    truncatedStats = pastYearStats.data[stat].slice(-4);
                    break;
                case "quarteryear":
                    truncatedStats = pastYearStats.data[stat].slice(-13);
                    break;
                case "halfyear":
                    truncatedStats = pastYearStats.data[stat].slice(-26);
                    break;
                case "year":
                    truncatedStats = pastYearStats.data[stat];
                    break;
            };
            return truncatedStats;
        };
    };

    function generateStatChart() {
        const truncatedStats = truncateResults();

        const data = {
            labels: truncatedStats?.map(stat => stat.week),
            datasets: [
                {
                    data: truncatedStats?.map(stat => stat.score)
                }
            ],
        };
        return <Line ref={chartRef} id={`${stat}-chart`} data={data} onClick={handleChartClick} options={{
            elements: {
                point: {
                    hoverRadius: 5,
                    hoverBackgroundColor: "#000",
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Week Number"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: stat === "battleRankings" ? "Ranking" : "Contribution",
                     }
                }
            }
        }} />;
    };

    function handleChartClick(e: React.MouseEvent<HTMLCanvasElement>) {
        if (chartRef.current) {
            const pointElement = getElementsAtEvent(chartRef.current, e);
            if (pointElement.length > 0) {
                const truncatedStats = truncateResults();
                const pointIndex = pointElement[0].element.$context.parsed.x;

                if (truncatedStats && pointIndex) prepStatsForm(truncatedStats[pointIndex]);
            };
        };
    };

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
                <h2>{`${stat === "battleRankings" ? "Battle Ranking" : "Contribution"} Summary`}</h2>
                <div>
                    {pastYearStats.status === "loading" ? <p>Loading graph...</p> : null}
                    {pastYearStats.status === "success" ? generateStatChart() : null}
                </div>
                {generateStatViewOptions()}
            </section>
            {pastYearStats.status === "error" ? <p>{pastYearStats.error}</p> : null}
            {statsFormVis ? <StatsForm year={statsFormYear} week={statsFormWeek} currentMemberId={memberid} setStatsFormVis={setStatsFormVis} /> : null}
        </>
    )
};

export default Graph;