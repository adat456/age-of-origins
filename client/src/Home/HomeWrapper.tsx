import { useEffect, useState } from "react";
import AnnouncementsList from "./Announcements/AnnouncementsList";
import AnnouncementForm from "./Announcements/AnnouncementForm";

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
            {announcementFormVis ?
                <AnnouncementForm setAnnouncementFormVis={setAnnouncementFormVis} /> : null
            }
        </main>
    )
};

export default HomeWrapper;