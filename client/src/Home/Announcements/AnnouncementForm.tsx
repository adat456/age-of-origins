import { useState, useEffect, useContext } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { fetchAnnouncements, addAnnouncement, editAnnouncement, deleteAnnouncement } from "../../Shared/sharedFunctions";
import AuthenticatedContext from "../../Shared/AuthenticatedContext";
import ErrorMessage from "../../Shared/ErrorMessage";

interface announcementFormInterface {
    announcementid?: string,
    setAnnouncementFormVis: React.Dispatch<React.SetStateAction<boolean>>,
    setCurrentAnnouncementId: React.Dispatch<React.SetStateAction<string>>
};

const AnnouncementForm: React.FC<announcementFormInterface> = function({ announcementid, setAnnouncementFormVis, setCurrentAnnouncementId }) {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ bodyErr, setBodyErr ] = useState("");
    const [ pinned, setPinned ] = useState(false);

    const authenticated = useContext(AuthenticatedContext);

    const queryClient = useQueryClient();
    const announcements = useQuery({
        queryKey: [ "announcements" ],
        queryFn: fetchAnnouncements
    });
    useEffect(() => {
        if (announcements.data && announcementid) {
            const matchingAnnouncement = announcements.data.find(announcement => announcement._id === announcementid);
            setTitle(matchingAnnouncement?.title);
            setBody(matchingAnnouncement?.body);
            setPinned(matchingAnnouncement?.pinned);
        };
    }, [announcements.data]);

    const addAnnouncementMutation = useMutation({
            mutationFn: () => addAnnouncement({ author: authenticated?.id, title, body, pinned }),
            onSuccess: () => queryClient.invalidateQueries("announcements")
    });
    const editAnnouncementMutation = useMutation({
        mutationFn: () => editAnnouncement({ announcementid, title, body, pinned }),
        onSuccess: () => queryClient.invalidateQueries("announcements")
    });
    const deleteAnnouncementMutation = useMutation({
        mutationFn: (announcementid: string) => deleteAnnouncement(announcementid),
        onSuccess: () => queryClient.invalidateQueries("announcements")
    });

    function handleTextInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const input = e.target as HTMLInputElement;
        const inputId = input.id;

        if (inputId === "title") {
            setTitle(input.value);
            if (input.value.trim() === "") {
                setTitleErr("Title required.");
            } else {
                setTitleErr("");
            };
        } else if (inputId === "body") {
            setBody(input.value);
            if (input.value.trim() === "") {
                setBodyErr("Body required.");
            } else {
                setBodyErr("");
            };
        };
    };

    function handlePinnedCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
        const checkbox = e.target as HTMLInputElement;
        if (checkbox?.checked) {
            setPinned(true);
        } else {
            setPinned(false);
        };
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!title || !body) return;

        if (!announcementid) {
            if (!addAnnouncementMutation.isLoading) {
                addAnnouncementMutation.mutate();
                handleClose();
            };
        } else {
            if (!editAnnouncementMutation.isLoading) {
                editAnnouncementMutation.mutate();
                handleClose();
            };
        };
    };

    function handleDelete() {
        if (!deleteAnnouncementMutation.isLoading && announcementid) {
            deleteAnnouncementMutation.mutate(announcementid);
            handleClose();
        };
    };

    function handleClose() {
        const announcementFormDialog = document.querySelector("announcement-form-dialog") as HTMLDialogElement;
        announcementFormDialog?.close();
        setAnnouncementFormVis(false);
        setCurrentAnnouncementId("");
    };

    return (
        <dialog className="announcement-form-dialog bg-darkest p-24 rounded sm:p-32 sm:w-6/12">
            <form method="POST" onSubmit={handleSubmit} noValidate>
                <h1 className="text-offwhite text-center text-xl font-bold tracking-wide mb-16">{announcementid ? "Edit announcement" : "Add announcement"}</h1>
                <div className="my-8 md:my-16">
                    <label htmlFor="title" className="text-offwhite block mb-4">Title</label>
                    {titleErr ? <ErrorMessage msg={titleErr} /> : null}
                    <input type="text" id="title" value={title} onChange={handleTextInput} className="input w-full" required />
                </div>
                <div className="my-8 md:my-16">
                    <label htmlFor="body" className="text-offwhite block mb-4">Body</label>
                    {bodyErr ? <ErrorMessage msg={bodyErr} /> : null}
                    <textarea name="body" id="body" cols={30} rows={10} value={body} onChange={handleTextInput} className="input w-full" required />
                </div>
                <div>
                    <input type="checkbox" name="pinned" id="pinned" checked={pinned} onChange={handlePinnedCheckbox} />
                    <label htmlFor="pinned" className="text-offwhite ml-8">Pin announcement to top</label>
                </div>
                {announcementid ?
                    addAnnouncementMutation.isError ?
                        <p>{addAnnouncementMutation.error}</p>
                        : null
                    :
                    editAnnouncementMutation.isError ?
                        <p>{editAnnouncementMutation.error}</p>
                        : null
                }
                {deleteAnnouncementMutation.isError ?
                    <p>{deleteAnnouncementMutation.error}</p> : null
                }
                <div className="flex justify-end mt-24 gap-16">
                    <button type="button" onClick={handleClose} className="secondary-btn">Close</button>
                    {announcementid ?
                        <button type="button" onClick={handleDelete} className="secondary-btn">Delete post</button> : null
                    }
                    <button type="submit" className="primary-btn">{announcementid ? "Confirm edits" : "Post"}</button>
                </div>
            </form>
        </dialog>
    );
};

export default AnnouncementForm;