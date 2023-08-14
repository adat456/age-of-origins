import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { fetchAnnouncements, addAnnouncement, editAnnouncement, deleteAnnouncement } from "../../Shared/sharedFunctions";

interface announcementFormInterface {
    announcementid?: string,
    setAnnouncementFormVis: React.Dispatch<React.SetStateAction<boolean>>
};

const AnnouncementForm: React.FC<announcementFormInterface> = function({ announcementid, setAnnouncementFormVis }) {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ bodyErr, setBodyErr ] = useState("");
    const [ pinned, setPinned ] = useState(false);

    const queryClient = useQueryClient();
    const {
        data: announcementsData,
    } = useQuery({
        queryKey: [ "announcements" ],
        queryFn: fetchAnnouncements
    });
    useEffect(() => {
        if (announcementsData && announcementid) {
            const matchingAnnouncement = announcementsData.find(announcement => announcement._id === announcementid);
            setTitle(matchingAnnouncement?.title);
            setBody(matchingAnnouncement?.body);
            setPinned(matchingAnnouncement?.pinned);
        };
    }, [announcementsData]);

    const {
            mutate: addAnnouncementMutation,
            error: addAnnouncementErrorMsg,
            status: addAnnouncementStatus
    } = useMutation({
            mutationFn: () => addAnnouncement({ author: "64d69b49a8599d958bc51e57", title, body, pinned }),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: [ "announcements" ] })
    });
    const {
        mutate: editAnnouncementMutation,
        error: editAnnouncementErrorMsg,
        status: editAnnouncementStatus
    } = useMutation({
        mutationFn: () => editAnnouncement({ announcementid, title, body, pinned }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ "announcements" ] })
    });
    const {
        mutate: deleteAnnouncementMutation,
        error: deleteAnnouncementErrorMsg,
        status: deleteAnnouncementStatus
    } = useMutation({
        mutationFn: (announcementid: string) => deleteAnnouncement(announcementid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ "announcements" ]})
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
                setBodyErr("Title required.");
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
            if (addAnnouncementStatus !== "loading") {
                addAnnouncementMutation();
                handleClose();
            };
        } else {
            if (editAnnouncementStatus !== "loading") {
                editAnnouncementMutation();
                handleClose();
            };
        };
    };

    function handleDelete() {
        if (deleteAnnouncementStatus !== "loading") {
            deleteAnnouncementMutation(announcementid);
            handleClose();
        };
    };

    function handleClose() {
        const announcementFormDialog = document.querySelector("announcement-form-dialog") as HTMLDialogElement;
        announcementFormDialog?.close();
        setAnnouncementFormVis(false);
    };

    return (
        <dialog className="announcement-form-dialog">
            <form method="POST" onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="title">Title</label>
                    {titleErr ? <p>{titleErr}</p> : null}
                    <input type="text" id="title" value={title} onChange={handleTextInput}/>
                </div>
                <div>
                    <label htmlFor="body">Body</label>
                    {bodyErr ? <p>{bodyErr}</p> : null}
                    <textarea name="body" id="body" cols={30} rows={10} value={body} onChange={handleTextInput}></textarea>
                </div>
                <div>
                    <input type="checkbox" name="pinned" id="pinned" checked={pinned} onChange={handlePinnedCheckbox} />
                    <label htmlFor="pinned">Pin announcement to top</label>
                </div>
                {announcementid ?
                    addAnnouncementStatus === "error" ?
                        <p>{addAnnouncementErrorMsg.message}</p>
                        : null
                    :
                    editAnnouncementStatus === "error" ?
                        <p>{editAnnouncementErrorMsg.message}</p>
                        : null
                }
                <button type="submit">{announcementid ? "Confirm edits" : "Post"}</button>
                {announcementid ?
                    <button type="button" onClick={handleDelete}>Delete post</button> : null
                }
                <button type="button" onClick={handleClose}>Close</button>
            </form>
        </dialog>
    );
};

export default AnnouncementForm;