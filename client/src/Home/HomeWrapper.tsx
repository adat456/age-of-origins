import AnnouncementsList from "./Announcements/AnnouncementsList";
import Scoreboard from "./Scoreboard";

const HomeWrapper: React.FC = function() {
    return (
        <main className="px-24">
            <AnnouncementsList />
            <Scoreboard stat="battle" />
            <Scoreboard stat="contribution" />
        </main>
    );
};

export default HomeWrapper;