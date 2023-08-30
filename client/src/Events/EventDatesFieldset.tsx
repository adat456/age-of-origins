interface eventDatesFieldsetInterface {
    daterange: boolean,
    setDaterange: React.Dispatch<React.SetStateAction<boolean>>,
    individualDateId: number,
    setIndividualDateId: React.Dispatch<React.SetStateAction<number>>,
    individualDates: {id: number, date: string}[],
    setIndividualDates: React.Dispatch<React.SetStateAction<{id: number, date: string}[]>>,
    startDate: string,
    setStartDate: React.Dispatch<React.SetStateAction<string>>,
    endDate: string,
    setEndDate: React.Dispatch<React.SetStateAction<string>>,
};

const EventDatesFieldset: React.FC<eventDatesFieldsetInterface> = function({ daterange, setDaterange, individualDateId, setIndividualDateId, individualDates, setIndividualDates, startDate, setStartDate, endDate, setEndDate }) {
    function generateDateToggle() {
        if (!daterange) {
            return (
                <button type="button" onClick={() => setDaterange(!daterange)} className="flex items-center bg-red h-24 w-48 rounded-3xl">
                    <div className="bg-offwhite h-[18px] w-[18px] rounded-full ml-[3px] mb-[2px]"/>
                </button>
            );
        } else {
            return (
                <button type="button" onClick={() => setDaterange(!daterange)} className="flex items-center justify-end bg-red h-24 w-48 rounded-3xl">
                    <div className="bg-offwhite h-[18px] w-[18px] rounded-full mr-[4px] mb-[2px]"/>
                </button>
            );
        };
    };
    function generateIndividualDateFields() {
        const individualDateFields = individualDates.map((date, index) => (
            <div key={date.id} className="flex gap-8">                                           
                <label htmlFor={`date-${date.id}`} className="text-offwhite">{`Date ${index + 1}:`}</label>
                <input type="date" name="date" value={date.date} id={`date-${date.id}`} onChange={(e) => handleDateFieldChange(date.id, e.target.value)} className="input" />
                <button type="button" onClick={() => handleRemoveDateField(date.id)} className="secondary-btn ml-auto">Delete</button>
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
        <fieldset className="bg-dark p-16 my-24 rounded">
            <legend>Set dates</legend>
            <div className="flex justify-center gap-8 mt-16 mb-24">
                <p className="text-offwhite">Individual dates</p>
                {generateDateToggle()}
                <p className="text-offwhite">Date range</p>
            </div>
            {daterange ?
                <div className="grid grid-cols-2 my-4">
                    <div>
                        <label htmlFor="startdate" className="text-offwhite block mb-4">Start</label>
                        <input type="date" name="startdate" id="startdate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" required />
                    </div>
                    <div>
                        <label htmlFor="enddate" className="text-offwhite block mb-4">End</label>
                        <input type="date" name="enddate" id="enddate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" required />
                    </div>
                </div>
                :
                <div className="flex flex-col">
                    {generateIndividualDateFields()}
                    <button type="button" onClick={handleAddDateField} className="primary-btn mt-16">Add Date</button>
                </div>
            }
        </fieldset>
    );
};  

export default EventDatesFieldset;