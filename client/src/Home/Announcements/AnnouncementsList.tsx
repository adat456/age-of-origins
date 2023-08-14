import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnnouncements, editAnnouncement } from "../../Shared/sharedFunctions";
import AnnouncementForm from "./AnnouncementForm";

const AnnouncementsList: React.FC = function() {
    const [ announcementFormVis, setAnnouncementFormVis ] = useState(false);
    const [ currentAnnouncementId, setCurrentAnnouncementId ] = useState("");

    const queryClient = useQueryClient();
    const {
        data: announcementsData,
        error: announcementsDataError,
        status: announcementsDataStatus
    } = useQuery({
        queryKey: [ "announcements" ],
        queryFn: fetchAnnouncements
    });
    const {
        mutate: editAnnouncementMutation,
        error: editAnnouncementErrorMsg,
        status: editAnnouncementStatus
    } = useMutation({
        mutationFn: (data: { announcementid: string, pinned: boolean}) => editAnnouncement(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ "announcements" ] })
    });

    function generateAnnouncementList() {
        const announcementList = announcementsData?.map(announcement => (
            <li key={announcement._id}>
                <h3>{announcement.title}</h3>
                <p>{announcement.pinned ? "Pinned" : "Not pinned"}</p>
                <button type="button" onClick={() => editAnnouncementMutation({ announcementid: announcement._id, pinned: !announcement.pinned})}>
                    {announcement.pinned ? "Unpin" : "Pin"}
                </button>
                <p>{`Posted ${new Date(announcement.postdate).toISOString().slice(0, 10)} by ${announcement.author}`}</p>
                <p>{announcement.body}</p>
                <button type="button" onClick={() => prepAnnouncementForm(announcement._id)}>Edit</button>
            </li>
        ));
        return announcementList;
    };

    function prepAnnouncementForm(announcementid: string) {
        setAnnouncementFormVis(true),
        setCurrentAnnouncementId(announcementid);
    };

    useEffect(() => {
        if (announcementFormVis) {
            const announcementFormDialog = document.querySelector(".announcement-form-dialog") as HTMLDialogElement;
            announcementFormDialog?.showModal();
        };
    }, [announcementFormVis]);

    return (
        <>
            <section>
                <h2>Announcements</h2>
                {announcementsDataStatus === "loading" ?
                    <p>Fetching announcements...</p> : null
                }
                {announcementsDataStatus === "error" ?
                    <p>{announcementsDataError.message}</p> : null
                }
                {announcementsDataStatus === "success" ?
                    <ul>
                        {generateAnnouncementList()}
                    </ul>
                    : null
                }
            </section>
            {announcementFormVis ?
                <AnnouncementForm setAnnouncementFormVis={setAnnouncementFormVis} announcementid={currentAnnouncementId} /> : null
            }
        </>
    );
};

export default AnnouncementsList;