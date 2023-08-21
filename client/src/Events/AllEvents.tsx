import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUnarchivedEvents, fetchArchivedEvents } from "../Shared/sharedFunctions";
import { eventInterface } from "../Shared/interfaces";
import { convert } from "html-to-text";

const AllEvents: React.FC = function() {
    const [ archivedEventsVis, setArchivedEventsVis ] = useState(false);
    const [ timeFilter, setTimeFilter ] = useState("");

    const {
        data: archivedEvents,
        status: archivedEventsStatus,
        error: archivedEventsError
    } = useQuery({
        queryKey: [ "archived-events" ],
        queryFn: fetchArchivedEvents,
        enabled: archivedEventsVis
    });
    const {
        data: unarchivedEvents,
        status: unarchivedEventsStatus,
        error: unarchivedEventsError
    } = useQuery({
        queryKey: [ "unarchived-events" ],
        queryFn: fetchUnarchivedEvents
    });

    const todayISO = new Date().toISOString().slice(0, 10);

    function generateDates(range: boolean, dates: string[]) {
        dates?.sort();
        console.log(dates);
        if (range) {
            return (
                <p>{`Dates: ${dates[0]} through ${dates[1]}`}</p>
            );
        } else {
            const commaDelimitedDatesString = dates.join(", ");
            return (
                <p>{`Dates: ${commaDelimitedDatesString}`}</p>
            );
        };  
    };

    function generateEvents(array: eventInterface[]) {
        if (array.length > 0) {
            const events = array.map(event => (
                <div key={event._id}>
                    <h2>{event.name}</h2>
                    <p>{convert(event.body)}</p>
                    {generateDates(event.range, event.eventdates)}
                </div>
            ));
            return events;
        } else {
            return (<p>No events found.</p>);
        };
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
                {!archivedEventsVis && unarchivedEventsStatus === "success" ? 
                    generateEvents(unarchivedEvents) : null
                }
                {archivedEventsVis && archivedEventsStatus === "success" ? 
                    generateEvents(archivedEvents) : null
                }
            </div>
            <Link to="/events/create">Add Event</Link>
        </>
    );
};

export default AllEvents;