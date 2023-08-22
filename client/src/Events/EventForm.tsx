import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { convert } from "html-to-text";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllEvents, addEvent, editEvent } from "../Shared/sharedFunctions";
import EventDatesFieldset from "./EventDatesFieldset";

const EventForm: React.FC = function() {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ bodyErr, setBodyErr ] = useState("");
    /////////
    const [ daterange, setDaterange ] = useState(false);
    ///
    const [ individualDateId, setIndividualDateId ] = useState(1);
    const [ individualDates, setIndividualDates ] = useState<{id: number, date: string}[]>([{id: 0, date: new Date().toISOString().slice(0, 10)}]);
    ///
    const [ startDate, setStartDate ] = useState(new Date().toISOString().slice(0, 10));
    const [ endDate, setEndDate ] = useState(new Date().toISOString().slice(0, 10));

    const { eventid} = useParams();

    const queryClient = useQueryClient();
    const allEvents = useQuery({
        queryKey: [ "events" ],
        queryFn: fetchAllEvents
    });
    const {
        mutate: addEventMutation,
        status: addEventStatus,
        error: addEventErr
    } = useMutation({
        mutationFn: () => addEvent({
            author: "64d69b49a8599d958bc51e57",
            title, body,
            range: daterange,
            eventdates: daterange ?
                [startDate, endDate] :
                individualDates.map(date => date.date)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "events" ]});
        },
    });
    const editEventMutation = useMutation({
        mutationFn: () => editEvent({ 
            eventid, title, body, 
            range: daterange, 
            eventdates: daterange ?
            [startDate, endDate] :
            individualDates.map(date => date.date)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "events" ]});
        },
    })

    useEffect(() => {
        if (eventid && allEvents.data) {
            const editingEvent = allEvents.data.find(event => event._id === eventid);
            if (editingEvent) {
                setTitle(editingEvent.title);
                setBody(editingEvent.body);
                if (editingEvent.range) {
                    // if range, set date type to range, and grab the first and last dates (because the range was expanded with date-fns during the query)
                    setDaterange(true);
                    setStartDate(editingEvent.eventdates[0]);
                    setEndDate(editingEvent.eventdates[editingEvent.eventdates.length - 1]);
                } else {
                    // if not range, set date type to individual, recreate the dates array with an id, and set the date id accordingly for any dates that might be added 
                    setDaterange(false);
                    setIndividualDates(editingEvent.eventdates.map((date, index) => ({id: index, date})));
                    setIndividualDateId(editingEvent.eventdates.length)
                };
            };
        };
    }, [eventid, allEvents.data]);
    
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

        if (!eventid && addEventStatus !== "loading") {
            addEventMutation();
        } else if (eventid && editEventMutation.status !== "loading") {
            editEventMutation.mutate();
        };
    };

    function clearAllFields() {
        setTitle("");
        setBody("");
        setDaterange(false);
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
            <button type="button" onClick={() => setDaterange(!daterange)}>{daterange ? "Setting dates by range" : "Setting dates individually"}</button>
            <EventDatesFieldset daterange={daterange} individualDateId={individualDateId} setIndividualDateId={setIndividualDateId} individualDates={individualDates} setIndividualDates={setIndividualDates} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
            <button type="reset" onClick={clearAllFields}>Clear</button>
            <button type="submit">{!eventid ? "Create" : "Submit edits"}</button>
        </form>
    );
};

export default EventForm;