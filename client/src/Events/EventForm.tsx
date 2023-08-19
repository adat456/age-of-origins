import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { convert } from "html-to-text";

const EventForm: React.FC = function() {
    const [ title, setTitle ] = useState("");
    const [ titleErr, setTitleErr ] = useState("");
    const [ body, setBody ] = useState("");
    const [ bodyErr, setBodyErr ] = useState("");
    const [ dateRange, setDateRange ] = useState(false);
    const [ individualDateId, setIndividualDateId ] = useState(1);
    const [ individualDates, setIndividualDates ] = useState<number[] | Date[]>([]);
    const [ eventdates, setEventdates ] = useState<Date[]>([]);

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

    function generateIndividualDateFields() {

    };

    function clearAllFields() {
        setTitle("");
        setBody("");
        setDateRange(false);
        setEventdates([]);
    };

    return (
        <form method="POST" noValidate>
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
            {dateRange ?
                <fieldset>
                    <legend>Event date range</legend>
                    <div>
                        <label htmlFor="startdate">Start</label>
                        <input type="date" name="startdate" id="startdate" />
                    </div>
                    <div>
                        <label htmlFor="enddate">End</label>
                        <input type="date" name="enddate" id="enddate" />
                    </div>
                </fieldset>
                :
                <fieldset>
                    <legend>Event dates</legend>
                </fieldset>
            }
            <button type="reset" onClick={clearAllFields}>Clear</button>
            <button type="submit">Create</button>
        </form>
    );
};

export default EventForm;