import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllEvents, addEvent, editEvent, deleteEvent } from "../Shared/sharedFunctions";
import AuthenticatedContext from "../Shared/AuthenticatedContext";
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

    const authenticated = useContext(AuthenticatedContext);

    const { eventid } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const allEvents = useQuery({
        queryKey: [ "events" ],
        queryFn: fetchAllEvents
    });
    const addEventMutation = useMutation({
        mutationFn: () => addEvent({
            author: authenticated?.id,
            title, body,
            range: daterange,
            eventdates: daterange ?
                [startDate, endDate] :
                individualDates.map(date => date.date)
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries("events");
            navigate(`/events/${data}`);
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
            queryClient.invalidateQueries("events");
            navigate(`/events/${eventid}`);
        },
    });
    const deleteEventMutation = useMutation({
        mutationFn: () => deleteEvent(eventid),
        onSuccess: () => {
            queryClient.invalidateQueries("events");
            navigate("/events");
        },
    });

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
            const bodyText = DOMPurify.sanitize(body, { USE_PROFILES: { html: true }});
            if (!bodyText.trim()) {
                setBodyErr("Body required without whitespace.");
            } else {
                setBodyErr("");
            };
        };  
    }, [body]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!eventid && !addEventMutation.isLoading) {
            addEventMutation.mutate();
        } else if (eventid && !editEventMutation.isLoading) {
            editEventMutation.mutate();
        };
    };

    function clearAllFields() {
        setTitle("");
        setBody("");
        setDaterange(false);
    };

    return (
        <>
            <Link to="/events" className="link">Back to events</Link>
            <form method="POST" noValidate onSubmit={handleSubmit}>
                <h2 className="text-offwhite text-center text-2xl font-bold tracking-wide mt-24">{eventid ? "Edit event" : "Add event"}</h2>
                <div className="my-8">
                    <label htmlFor="title" className="block text-offwhite mb-4">Name</label>
                    {titleErr ? <p>{titleErr}</p> : null}
                    <input type="text" name="title" id="title" value={title} onChange={handleTitleChange} className="input w-full" required />
                </div>
                <div className="my-8">
                    <label htmlFor="body" className="block text-offwhite mb-4">Description</label>
                    {bodyErr ? <p>{bodyErr}</p> : null}
                    <ReactQuill id="body" value={body} onChange={setBody} placeholder="Start typing here..." />
                </div>
                <EventDatesFieldset daterange={daterange} setDaterange={setDaterange} individualDateId={individualDateId} setIndividualDateId={setIndividualDateId} individualDates={individualDates} setIndividualDates={setIndividualDates} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
                <div className="flex justify-end mt-32 gap-16">
                    <button type="reset" onClick={clearAllFields} className="secondary-btn mr-16">Clear</button>
                    {eventid ? <button type="button" onClick={() => deleteEventMutation.mutate()} className="secondary-btn mr-16">Delete</button> : null}
                    <button type="submit" className="primary-btn">{!eventid ? "Create" : "Submit edits"}</button>
                </div>
            </form>
        </>
    );
};

export default EventForm;