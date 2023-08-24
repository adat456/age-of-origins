import { useEffect, useState } from "react";
import AnnouncementsList from "./Announcements/AnnouncementsList";
import AnnouncementForm from "./Announcements/AnnouncementForm";
import Scoreboard from "./Scoreboard";

const HomeWrapper: React.FC = function() {
    const [ announcementFormVis, setAnnouncementFormVis ] = useState(false);

    useEffect(() => {
        if (announcementFormVis) {
            const announcementFormDialog = document.querySelector(".announcement-form-dialog") as HTMLDialogElement;
            announcementFormDialog?.showModal();
        };
    }, [announcementFormVis]);

    return (
        <main>
            <AnnouncementsList />
            <button type="button" onClick={() => setAnnouncementFormVis(true)}>Add announcement</button>
            <Scoreboard stat="battle" />
            <Scoreboard stat="contribution" />
            {announcementFormVis ?
                <AnnouncementForm setAnnouncementFormVis={setAnnouncementFormVis} /> : null
            }
        </main>
    )
};

export default HomeWrapper;