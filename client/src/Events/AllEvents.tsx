import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllEvents, fetchUnarchivedEvents, fetchArchivedEvents, toggleEventArchival } from "../Shared/sharedFunctions";
import { eventInterface } from "../Shared/interfaces";
import { convert } from "html-to-text";
import { add, formatISO, parseISO } from "date-fns";

const AllEvents: React.FC = function() {
    const [ archivedEventsVis, setArchivedEventsVis ] = useState(false);
    const [ timeFilter, setTimeFilter ] = useState("");

    const queryClient = useQueryClient();
    const archivedEvents = useQuery({
        queryKey: [ "archived-events" ],
        queryFn: fetchArchivedEvents,
        enabled: archivedEventsVis
    });
    const unarchivedEvents = useQuery({
        queryKey: [ "unarchived-events" ],
        queryFn: fetchUnarchivedEvents
    });
    const allEvents = useQuery({
        queryKey: [ "events" ],
        queryFn: fetchAllEvents,
        enabled: !!(unarchivedEvents || archivedEvents),
    });
    const toggleEventArchivalMutation = useMutation({
        mutationFn: (eventid: string) => toggleEventArchival(eventid),
        onSuccess: () => {
            queryClient.invalidateQueries("archived-events")
            queryClient.invalidateQueries("unarchived-events");
        },
    });

    const todayISO = formatISO(new Date()).slice(0, 10);
    const weekFromTodayISO = add(parseISO(todayISO), { weeks: 1 }).toISOString().slice(0, 10);
    const twoWeeksFromTodayISO = add(parseISO(todayISO), { weeks: 2 }).toISOString().slice(0, 10);
    const monthFromTodayISO = add(parseISO(todayISO), { months: 1 }).toISOString().slice(0, 10);

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

    function generateEvents(array: eventInterface[]) {
        if (array.length === 0) return (<p>No events found.</p>);

        let events = null;
        let arrayForGeneratingEvents: eventInterface[] = [];
        if (timeFilter) {
            switch (timeFilter) {
                case "today": 
                    arrayForGeneratingEvents = array.filter(event => event.eventdates.includes(todayISO));
                    break;
                case "nextWeek": 
                    arrayForGeneratingEvents = array.filter(event => event.eventdates.some(date => date >= todayISO && date <= weekFromTodayISO));
                    break;
                case "nextTwoWeeks": 
                    arrayForGeneratingEvents = array.filter(event => event.eventdates.some(date => date >= todayISO && date <= twoWeeksFromTodayISO));
                    break;
                case "nextMonth": 
                    arrayForGeneratingEvents = array.filter(event => event.eventdates.some(date => date >= todayISO && date <= monthFromTodayISO));
                    break;
            };
        } else {
            arrayForGeneratingEvents = [...array];
        };

        events = arrayForGeneratingEvents.map(event => (
            <div key={event._id}>
                <Link to={`/events/${event._id}`}><h2>{event.title}</h2></Link>
                <button type="button" onClick={() => toggleEventArchivalMutation.mutate(event._id)}>{event.archived ? "Unarchive" : "Archive"}</button>
                <p>{convert(event.body)}</p>
                {generateDates(event.range, event.eventdates)}
            </div>
        ));
        return events;
    };

    return (
        <>  
            <button type="button" onClick={() => setArchivedEventsVis(false)}>Recent and Upcoming Events</button>
            <button type="button" onClick={() => setArchivedEventsVis(true)}>Archived Events</button>
            <div>
                <label htmlFor="timeFilter">Filter by:</label>
                <select name="timeFilter" id="timeFilter" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                    <option value=""></option>
                    <option value="today">Today</option>
                    <option value="nextWeek">Next 7 days</option>
                    <option value="nextTwoWeeks">Next 14 days</option>
                    <option value="nextMonth">Next month</option>
                </select>
                {!archivedEventsVis && unarchivedEvents.isSuccess ? 
                    generateEvents(unarchivedEvents.data) : null
                }
                {archivedEventsVis && archivedEvents.isSuccess ? 
                    generateEvents(archivedEvents.data) : null
                }
            </div>
            <Link to="/events/create">Add Event</Link>
        </>
    );
};

export default AllEvents;