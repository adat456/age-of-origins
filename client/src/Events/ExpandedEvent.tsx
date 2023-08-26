import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { convert } from "html-to-text";
import { fetchAllEvents, fetchMembers, toggleEventArchival, editEvent, deleteEvent } from "../Shared/sharedFunctions";
import { eventInterface, memberInterface } from "../Shared/interfaces";

const ExpandedEvent: React.FC = function() {
    const [ event, setEvent ] = useState<eventInterface | undefined>(undefined);
    const [ matchingMembers, setMatchingMembers ] = useState<memberInterface[]>([]);

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
                <p>{`Dates: ${dates[0]} through ${dates[dates.length - 1]}`}</p>
            );
        } else {
            const commaDelimitedDatesString = dates?.join(", ");
            return (
                <p>{`Dates: ${commaDelimitedDatesString}`}</p>
            );
        };  
    };

    function generateParticipants() {
        const participants = event?.participation.map(participantid => {
            const matchingParticipant = members.data?.find(member => member._id === participantid);
            return (
                <button key={participantid} onClick={() => removeParticipant(participantid)}>{matchingParticipant?.username}</button>
            );
        });
        return participants;
    };

    function handleMemberChange(e: React.ChangeEvent<HTMLInputElement>) {
        const cleanedSearch = e.target.value.trim().toLowerCase();
        if (members.data && cleanedSearch) {
            setMatchingMembers(members.data.filter(member => member.username.includes(cleanedSearch) && !event?.participation.includes(member._id)));
        } else {
            setMatchingMembers([]);
        };
    };

    function generateMatchingMembers() {
        const members = matchingMembers?.map(member => (
            <button key={member._id} onClick={() => addParticipant(member._id)}>{member.username}</button>
        ));
        return members;
    };

    function addParticipant(memberid: string) {
        if (event) {
            editEventMutation.mutate({ eventid: event._id, participation: [...event.participation, memberid]});
        };
    };
    function removeParticipant(memberid: string) {
        if (event) {
            editEventMutation.mutate({ eventid: event._id, participation: event.participation.filter(participantid => participantid !== memberid)});
        };
    };
    
    return (
        <>
            <h2>{event?.title}</h2>
            <div>
                <Link to={`/events/${event?._id}/edit`}>Edit event</Link>
                <button type="button" onClick={() => deleteEventMutation.mutate()}>Delete</button>
            </div>
            <button type="button" onClick={() => toggleArchival.mutate(event?._id)}>{event?.archived ? "Unarchive" : "Archive"}</button>
            <p>{convert(event?.body)}</p>
            {generateDates(event?.range, event?.eventdates)}
            <div>
                {generateParticipants()}
                <label htmlFor="members">Add members as participants</label>
                <input type="text" name="members" id="members" onChange={handleMemberChange} />
                {generateMatchingMembers()}
            </div>
        </>
    );
};

export default ExpandedEvent;