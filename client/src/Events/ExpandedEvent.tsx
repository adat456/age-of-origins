import { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { fetchAllEvents, fetchMembers, toggleEventArchival, editEvent, deleteEvent } from "../Shared/sharedFunctions";
import { eventInterface, memberInterface } from "../Shared/interfaces";
import AuthenticatedContext from "../Shared/AuthenticatedContext";

const ExpandedEvent: React.FC = function() {
    const [ event, setEvent ] = useState<eventInterface | undefined>(undefined);
    const [ buttonsVis, setButtonsVis ] = useState(false);
    const [ matchingMembers, setMatchingMembers ] = useState<memberInterface[]>([]);

    const participantSearchRef = useRef<HTMLInputElement>(null);

    const authenticated = useContext(AuthenticatedContext);

    const { eventid } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const allEvents = useQuery({
        queryKey: [ "events" ],
        queryFn: fetchAllEvents,
    });
    const members = useQuery({
        queryKey: [ "members" ],
        queryFn: fetchMembers,
    });
    const toggleArchival = useMutation({
        mutationFn: (eventid: string) => toggleEventArchival(eventid),
        onSuccess: () => {
            queryClient.invalidateQueries("archived-events");
            queryClient.invalidateQueries("unarchived-events");
            queryClient.invalidateQueries("events");
        },
    });
    const editEventMutation = useMutation({
        mutationFn: (data: {eventid: string, title?: string, body?: string, range?: boolean, eventdates?: string[], participation?: string[]}) =>  editEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries("archived-events");
            queryClient.invalidateQueries("unarchived-events");
            queryClient.invalidateQueries("events");
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
        if (allEvents.data) setEvent(allEvents.data.find(event => event._id === eventid));
    }, [allEvents.data]);

    function generateDates(range: boolean, dates: string[]) {
        dates?.sort();
        if (range) {
            return (
                <p className="text-offwhite">{`Dates: ${dates[0]} through ${dates[dates.length - 1]}`}</p>
            );
        } else {
            const commaDelimitedDatesString = dates?.join(", ");
            return (
                <p className="text-offwhite">{`Dates: ${commaDelimitedDatesString}`}</p>
            );
        };  
    };

    function generateParticipants() {
        const filledOutParticipants = event?.participation.map(participantid => members.data?.find(member => member._id === participantid));
        const participants = filledOutParticipants?.
            sort((a, b) => {
                if (a.username.toLowerCase() < b.username.toLowerCase()) {
                    return -1;
                } else if (a.username.toLowerCase() > b.username.toLowerCase()) {
                    return 1;
                };
                return 0;
            }).
            map(participant => {
                if (authenticated) {
                    return (
                        <button key={participant._id} onClick={() => removeParticipant(participant._id)} className="primary-btn flex items-center gap-8">
                            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L18 12" stroke="#E0E3EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <p>{participant.username}</p>
                        </button>
                    );
                } else {
                    return <li key={participant._id} className="text-offwhite list-none">{participant.username}</li>
                };
            });

        if (authenticated) {
            return (
                <div className="flex flex-wrap gap-8 my-16">
                    {participants}
                </div>
            );
        } else {
            return (
                <ul className="grid grid-cols-2 gap-4 my-8">
                    {participants}
                </ul>
            );
        };
    };

    function handleMemberChange(e: React.ChangeEvent<HTMLInputElement>) {
        const cleanedSearch = e.target.value.trim().toLowerCase();
        if (members.data && cleanedSearch) {
            setMatchingMembers(members.data.filter(member => member.username.toLowerCase().includes(cleanedSearch) && !event?.participation.includes(member._id)));
        } else {
            setMatchingMembers([]);
        };
    };

    function generateMatchingMembers() {
        const members = matchingMembers?.
            sort((a, b) => {
                if (a.username.toLowerCase() < b.username.toLowerCase()) {
                    return -1;
                } else if (a.username.toLowerCase() > b.username.toLowerCase()) {
                    return 1;
                };
                return 0;
            }).
            map(member => (
                <button key={member._id} onClick={() => addParticipant(member._id)} className="primary-btn flex items-center gap-8">
                    <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12H20M12 4V20" stroke="#E0E3EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <p>{member.username}</p>
                </button>
        ));
        return members;
    };

    function addParticipant(memberid: string) {
        if (event) {
            editEventMutation.mutate({ eventid: event._id, participation: [...event.participation, memberid]});
            // if participant add was successful, remove from search results
            if (!editEventMutation.isError) setMatchingMembers(matchingMembers.filter(member => member._id !== memberid))
        };
    };
    function removeParticipant(memberid: string) {
        if (event) {
            editEventMutation.mutate({ eventid: event._id, participation: event.participation.filter(participantid => participantid !== memberid)});
            // only add back to search results if participant removal was successful AND there is still a member search going on
            if (participantSearchRef.current?.value.trim() !== "") setMatchingMembers([...matchingMembers, members.data?.find(member => member._id === memberid)])
        };
    };
    
    return (
        <>
            <Link to="/events" className="link">Back to events</Link>
            <header className="flex justify-center items-center my-8 gap-8">
                <h2 className="text-offwhite mt-16 mb-8 text-2xl font-bold text-center tracking-wide">{event?.title}</h2>
                {authenticated ?
                    <button type="button" onClick={() => setButtonsVis(!buttonsVis)} className="mt-16 mb-8">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20H20.5M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6" stroke="#E0E3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button> : null
                }
            </header>
            {buttonsVis && authenticated ?
                <div className="flex justify-center gap-16 mt-8 mb-32">
                    <Link to={`/events/${event?._id}/edit`} className="secondary-btn">Edit</Link>
                    <button type="button" onClick={() => toggleArchival.mutate(event?._id)} className="secondary-btn">{event?.archived ? "Unarchive" : "Archive"}</button>
                    <button type="button" onClick={() => deleteEventMutation.mutate()}className="secondary-btn">Delete</button>
                </div> : null
            }
            {generateDates(event?.range, event?.eventdates)}
            <div className="text-offwhite mt-16" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event?.body, { USE_PROFILES: { html: true }}) }} />
            <section className="my-24">
                <h3 className="text-offwhite my-16 text-xl font-bold text-center tracking-wide">Participants</h3>
                {generateParticipants()}
                {authenticated ?
                    <>
                        <div className="flex justify-between gap-8">
                            <label htmlFor="members" className="text-offwhite">Search</label>
                            <input ref={participantSearchRef} type="text" name="members" id="members" onChange={handleMemberChange} className="input flex-grow" />
                        </div>
                        <div className="flex flex-wrap gap-8 my-16">
                            {generateMatchingMembers()}
                        </div>
                    </> : null
                }
            </section>
        </>
    );
};

export default ExpandedEvent;