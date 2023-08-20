import { useState } from "react";

interface eventDatesFieldsetInterface {
    dateRange: boolean,
    individualDates: {id: number, date: string}[],
    setIndividualDates: React.Dispatch<React.SetStateAction<{id: number, date: string}[]>>,
    startDate: string,
    setStartDate: React.Dispatch<React.SetStateAction<string>>,
    endDate: string,
    setEndDate: React.Dispatch<React.SetStateAction<string>>,
};

const EventDatesFieldset: React.FC<eventDatesFieldsetInterface> = function({ dateRange, individualDates, setIndividualDates, startDate, setStartDate, endDate, setEndDate }) {
    const [ individualDateId, setIndividualDateId ] = useState(1);

    function generateIndividualDateFields() {
        const individualDateFields = individualDates.map((date, index) => (
            <div key={date.id}>                                           
                <label htmlFor={`date-${date.id}`}>{`Date ${index + 1}`}</label>
                <input type="date" name="date" value={date.date} id={`date-${date.id}`} onChange={(e) => handleDateFieldChange(date.id, e.target.value)} />
                <button type="button" onClick={() => handleRemoveDateField(date.id)}>Delete</button>
            </div>
        ));
        return individualDateFields;
    };
    function handleDateFieldChange(id: number, newDate: string) {
        setIndividualDates(individualDates.map(date => {
            if (date.id === id) {
                return {
                    id,
                    date: newDate
                };
            } else {
                return date;
            };
        }));
    };
    function handleAddDateField() {
        setIndividualDates([...individualDates, {id: individualDateId, date: new Date().toISOString().slice(0, 10)}]);
        setIndividualDateId(individualDateId + 1);
    };
    function handleRemoveDateField(id: number) {
        setIndividualDates(individualDates.filter(date => date.id !== id))
    };

    return (
        <>
            {dateRange ?
                <fieldset>
                    <legend>Event date range</legend>
                    <div>
                        <label htmlFor="startdate">Start</label>
                        <input type="date" name="startdate" id="startdate" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="enddate">End</label>
                        <input type="date" name="enddate" id="enddate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </fieldset>
                :
                <fieldset>
                    <legend>Event dates</legend>
                    {generateIndividualDateFields()}
                    <button type="button" onClick={handleAddDateField}>Add Date</button>
                </fieldset>
            }
        </>
    );
};  

export default EventDatesFieldset;