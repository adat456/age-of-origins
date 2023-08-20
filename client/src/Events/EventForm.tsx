import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { convert } from "html-to-text";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEvent } from "../Shared/sharedFunctions";
import EventDatesFieldset from "./EventDatesFieldset";

const EventForm: React.FC = function() {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ bodyErr, setBodyErr ] = useState("");
    /////////
    const [ dateRange, setDateRange ] = useState(false);
    ///
    const [ individualDateId, setIndividualDateId ] = useState(1);
    const [ individualDates, setIndividualDates ] = useState<{id: number, date: string}[]>([{id: 0, date: new Date().toISOString().slice(0, 10)}]);
    ///
    const [ startDate, setStartDate ] = useState(new Date().toISOString().slice(0, 10));
    const [ endDate, setEndDate ] = useState(new Date().toISOString().slice(0, 10));

    const queryClient = useQueryClient();
    const {
        mutate: addEventMutation,
        status: addEventStatus,
        error: addEventErr
    } = useMutation({
        mutationFn: () => addEvent({
            author: "64d69b49a8599d958bc51e57",
            title, body,
            eventdates: dateRange ?
                [startDate, endDate] :
                individualDates.map(date => date.date)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "events" ]});
        },
    });
    
    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
        if (!e.target.value.trim()) {
            setTitleErr("Title required without whitespaces."); 
        } else {
            setTitleErr("");
        };
    };

    const numBodyChangesRef = useRef(0);
    useEffect(() => {
        if (body && numBodyChangesRef.current === 0) {
            // only changes the ref's current value if there is a change to body (even if it's just a space)
            numBodyChangesRef.current = 1;
        };
        // after the first change, any changes that result in whitespace only result an error
        if (numBodyChangesRef.current > 0) {
            const bodyText = convert(body);
            if (!bodyText.trim()) {
                setBodyErr("Body required without whitespace.");
            } else {
                setBodyErr("");
            };
        };  
    }, [body]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (addEventStatus !== "loading") {
            addEventMutation();
            if (addEventStatus === "success") console.log("success");
        };
    };

    function clearAllFields() {
        setTitle("");
        setBody("");
        setDateRange(false);
    };

    return (
        <form method="POST" noValidate onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Name</label>
                {titleErr ? <p>{titleErr}</p> : null}
                <input type="text" name="title" id="title" value={title} onChange={handleTitleChange} />
            </div>
            <div>
                <label htmlFor="body">Description</label>
                {bodyErr ? <p>{bodyErr}</p> : null}
                <ReactQuill id="body" value={body} onChange={setBody} placeholder="Start typing here..." />
            </div>
            <button type="button" onClick={() => setDateRange(!dateRange)}>{dateRange ? "Setting dates by range" : "Setting dates individually"}</button>
            <EventDatesFieldset dateRange={dateRange} individualDates={individualDates} setIndividualDates={setIndividualDates} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
            <button type="reset" onClick={clearAllFields}>Clear</button>
            <button type="submit">Create</button>
        </form>
    );
};

export default EventForm;