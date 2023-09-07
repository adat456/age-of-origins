import AnnouncementsList from "./Announcements/AnnouncementsList";
import Scoreboard from "./Scoreboard";

const HomeWrapper: React.FC = function() {
    return (
        <main className="px-24 sm:px-48 md:grid md:grid-cols-2 md:gap-48">
            <AnnouncementsList />
            <Scoreboard stat="battle" />
            <Scoreboard stat="contribution" />
        </main>
    );
};

export default HomeWrapper;