import { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnnouncements, editAnnouncement, fetchMembers } from "../../Shared/sharedFunctions";
import AuthenticatedContext from "../../Shared/AuthenticatedContext";
import AnnouncementForm from "./AnnouncementForm";

const AnnouncementsList: React.FC = function() {
    const [ announcementFormVis, setAnnouncementFormVis ] = useState(false);
    const [ currentAnnouncementId, setCurrentAnnouncementId ] = useState("");

    const authenticated = useContext(AuthenticatedContext);

    const queryClient = useQueryClient();
    const allMembers = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers
    });
    const announcements = useQuery({
        queryKey: [ "announcements" ],
        queryFn: fetchAnnouncements
    });
    const editAnnouncementMutation = useMutation({
        mutationFn: (data: { announcementid: string, pinned: boolean}) => editAnnouncement(data),
        onSuccess: () => queryClient.invalidateQueries("announcements")
    });

    function findAuthorUsername(userid: string) {
        if (allMembers.data) {
            const matchingMember = allMembers.data.find(member => member._id === userid);
            if (matchingMember) return matchingMember.username;
        };
    };

    function generateAnnouncementList() {
        if (!announcements.data || !allMembers.data) return;

        const announcementList = announcements.data.map(announcement => (
            <li key={announcement._id} className="p-16 my-16 bg-dark rounded">
                <div className="flex items-center mb-8">
                    <h3 className="mr-8 text-offwhite text-xl font-bold">{announcement.title}</h3>
                    {announcement.pinned ? 
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M6.5 5C6.5 4.44772 6.94772 4 7.5 4H9H15H16.5C17.0523 4 17.5 4.44772 17.5 5C17.5 5.55228 17.0523 6 16.5 6H16.095L16.9132 15H19C19.5523 15 20 15.4477 20 16C20 16.5523 19.5523 17 19 17H16H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V17H8H5C4.44772 17 4 16.5523 4 16C4 15.4477 4.44772 15 5 15H7.08679L7.90497 6H7.5C6.94772 6 6.5 5.55228 6.5 5ZM9.91321 6L9.09503 15H12H14.905L14.0868 6H9.91321Z" fill="#E0E3EB"/></svg> : null
                    }
                    {authenticated ?
                        <div className="ml-auto">
                            <button type="button" onClick={() => editAnnouncementMutation.mutate({ announcementid: announcement._id, pinned: !announcement.pinned})} className="secondary-btn mr-16">
                                {announcement.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button type="button" onClick={() => prepAnnouncementForm(announcement._id)} className="secondary-btn ml-auto">Edit</button>
                        </div> : null
                    }
                </div>
                <p className="text-offwhite text-sm">{`Posted ${new Date(announcement.postdate).toISOString().slice(0, 10)} by ${findAuthorUsername(announcement.author)}`}</p>
                <p className="text-offwhite text-base">{announcement.body}</p>
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
            <section className="mb-48">
                <header className="flex my-16 justify-between">
                    <h2 className="text-offwhite text-2xl font-bold tracking-wide">Announcements</h2>
                    {authenticated ?
                        <button type="button" onClick={() => setAnnouncementFormVis(true)} className="bg-red p-[5px] hover:bg-mutedred active:bg-mutedred focus:bg-mutedred rounded">
                            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button> : null
                    }
                </header>
                {announcements.isLoading ? <p>Fetching announcements...</p> : null}
                {announcements.isError ? <p>{announcements.error}</p> : null}
                {announcements.isSuccess ?
                    <ul>
                        {generateAnnouncementList()}
                    </ul>
                    : null
                }
            </section>
            {announcementFormVis ?
                <AnnouncementForm setAnnouncementFormVis={setAnnouncementFormVis} announcementid={currentAnnouncementId} setCurrentAnnouncementId={setCurrentAnnouncementId} /> : null
            }
        </>
    );
};

export default AnnouncementsList;