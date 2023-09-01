import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEvents } from "../Shared/sharedFunctions";
import DOMPurify from "dompurify";
import { eventInterface } from "../Shared/interfaces";
import { add, formatISO, parseISO } from "date-fns";
import AuthenticatedContext from "../Shared/AuthenticatedContext";

const AllEvents: React.FC = function() {
    const [ eventsVis, setEventsVis ] = useState<"upcoming" | "previous" | "archived">("upcoming");
    const [ timeFilter, setTimeFilter ] = useState("");

    const [ photoPath, setPhotoPath ] = useState("");

    const authenticated = useContext(AuthenticatedContext);

    const allEvents = useQuery({
        queryKey: [ "events" ],
        queryFn: fetchAllEvents,
    });

    const todayISO = formatISO(new Date()).slice(0, 10);
    const weekFromTodayISO = add(parseISO(todayISO), { weeks: 1 }).toISOString().slice(0, 10);
    const twoWeeksFromTodayISO = add(parseISO(todayISO), { weeks: 2 }).toISOString().slice(0, 10);
    const monthFromTodayISO = add(parseISO(todayISO), { months: 1 }).toISOString().slice(0, 10);

    function generateDates(range: boolean, dates: string[]) {
        dates?.sort();
        if (range) {
            return (
                <p className="text-offwhite my-8">{`Dates: ${dates[0]} through ${dates[dates.length - 1]}`}</p>
            );
        } else {
            const commaDelimitedDatesString = dates?.join(", ");
            return (
                <p className="text-offwhite my-8">{`Dates: ${commaDelimitedDatesString}`}</p>
            );
        };  
    };

    function generateEventsList() {
        let arrayForGeneratingEvents: eventInterface[] = [];

        // first filter by upcoming, previous, or archived events
        switch (allEvents.data && eventsVis) {
            case "upcoming":
                arrayForGeneratingEvents = allEvents.data.filter(event => event.eventdates.some(date => date >= todayISO) && !event.archived);
                break;
            case "previous":
                arrayForGeneratingEvents = allEvents.data.filter(event => !event.eventdates.some(date => date >= todayISO) && !event.archived);
                break;
            case "archived":
                arrayForGeneratingEvents = allEvents.data.filter(event => event.archived);
                break;
        };

        // then apply any time filters if they are upcoming events
        if (allEvents.data && timeFilter && eventsVis === "upcoming") {
            switch (timeFilter) {
                case "today": 
                    arrayForGeneratingEvents = arrayForGeneratingEvents.filter(event => event.eventdates.includes(todayISO));
                    break;
                case "nextWeek": 
                    arrayForGeneratingEvents = arrayForGeneratingEvents.filter(event => event.eventdates.some(date => date >= todayISO && date <= weekFromTodayISO));
                    break;
                case "nextTwoWeeks": 
                    arrayForGeneratingEvents = arrayForGeneratingEvents.filter(event => event.eventdates.some(date => date >= todayISO && date <= twoWeeksFromTodayISO));
                    break;
                case "nextMonth": 
                    arrayForGeneratingEvents = arrayForGeneratingEvents.filter(event => event.eventdates.some(date => date >= todayISO && date <= monthFromTodayISO));
                    break;
            };
        };

        let events;
        if (arrayForGeneratingEvents.length > 0) {
            events = arrayForGeneratingEvents?.map(event => {
                const ellipses = event.body.length > 200 ? "..." : "";
                
                return (
                    <div key={event._id} className="mb-24">
                        <Link to={`/events/${event._id}`} className="link block mb-8">{event.title}</Link>
                        {generateDates(event.range, event.eventdates)}
                        <div className="text-offwhite" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.body.slice(0, 200) + ellipses, { USE_PROFILES: { html: true }}) }} />
                    </div>
                );
            });
        } else {
            events = <p className="text-offwhite text-center my-16">No matching events found.</p>;
        };
        return events;
    };

    function generateClassesForEventsTab(value: string) {
        if (value === eventsVis) {
            return "py-8 px-16 bg-dark rounded-t text-offwhite font-bold";
        } else {
            return "py-8 px-16 rounded-t hover:bg-dark focus:bg-dark text-offwhite font-bold"
        };
    };

    useEffect(() => {
        // async function getAlbumList() {
        //   try {
        //     const req = await fetch("http://localhost:3001/list-albums");
        //     const res = await req.json();
    
        //     if (req.ok) {
        //       console.log(res);
        //     } else {
        //       throw new Error(res);
        //     };
        //   } catch(err) {
        //     console.error(err.message);
        //   };
        // };
    
        // getAlbumList();
    
        async function getPhotos() {
          try {
            const req = await fetch("http://localhost:3001/view-album/album1");
            const res = await req.json();
    
            if (req.ok) {
              console.log(res);
              setPhotoPath(res[1]);
            } else {
              throw new Error(res);
            };
          } catch(err) {
            console.error(err.message);
          };
        };
    
        getPhotos();
    
        
      }, [])

    return (
        <>  
            <header className="mt-16 flex items-center justify-between">
                <h2 className="text-offwhite my-16 text-2xl font-bold tracking-wide">Events</h2>
                {authenticated ?
                    <Link to="/events/create" className="block bg-red p-[5px] hover:bg-mutedred active:bg-mutedred focus:bg-mutedred rounded">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#E0E3EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link> : null
                }
            </header>
            <div className="flex gap-8">
                <button type="button" onClick={() => setEventsVis("upcoming")} className={generateClassesForEventsTab("upcoming")}>Upcoming</button>
                <button type="button" onClick={() => setEventsVis("previous")} className={generateClassesForEventsTab("previous")}>Previous</button>
                <button type="button" onClick={() => setEventsVis("archived")} className={generateClassesForEventsTab("archived")}>Archived</button>
            </div>
            <div className="bg-dark rounded-b rounded-tr p-16">
                {eventsVis === "upcoming" ?
                    <div className="mb-24 flex items-center">
                        <label htmlFor="timeFilter" className="text-offwhite mr-8">Filter by:</label>
                        <select name="timeFilter" id="timeFilter" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="input flex-grow">
                            <option value=""></option>
                            <option value="today">Today</option>
                            <option value="nextWeek">Next 7 days</option>
                            <option value="nextTwoWeeks">Next 14 days</option>
                            <option value="nextMonth">Next month</option>
                        </select>
                    </div> : null
                }
                {generateEventsList()}
            </div>
            <img src={photoPath} alt="" />
        </>
    );
};

export default AllEvents;