// query keys: members, MEMBERID-stats, USERNAME-past-year-stats, all-members-battle, all-members-contribution, announcements, tags, recent-references, references, events, archived-events, unarchived-events

/// MEMBERS ///
export async function fetchMembers() {
    const req = await fetch("http://localhost:3001/fetch-members");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function createMember(memberData: { username: string, firstname: string }) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
    };
    const req = await fetch("http://localhost:3001/create-member", reqOptions);
    
    if (!req.ok) {
        const res = await req.json();
        if (res.code) {
            if (res.code === 11000) throw new Error("Duplicate username found. Please enter a different username.");
        } else {
            throw new Error("Unable to add user: ", res);
        };
    };

    return req.json();
};

/// STATS ///
export async function fetchAllMembersBattle(data: {year: number, week: number}) {
    const req = await fetch(`http://localhost:3001/fetch-all-members-stats/battle/${data.year}/${data.week}`);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json());
    };
};

export async function fetchAllMembersContribution(data: {year: number, week: number}) {
    const req = await fetch(`http://localhost:3001/fetch-all-members-stats/contribution/${data.year}/${data.week}`);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json());
    };
};

export async function fetchWeekStats(data: {memberid: string | null, year: number | undefined, week: number | undefined}) {
    const { memberid, year, week } = data;
    if (!memberid) return { battle: 0, contribution: 0 };

    const req = await fetch(`http://localhost:3001/fetch-week-stats/${memberid}/${year}/${week}`);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json());
    };
};

export async function fetchPastYearStats(memberid: string) {
    const req = await fetch(`http://localhost:3001/fetch-past-year-stats/${memberid}`);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json());
    };
};

// for both adding and updating stats
export async function updateStats(data: { memberid: string, battle?: number, contribution?: number, year: number, week: number }) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch("http://localhost:3001/update-stats", reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

/// ANNOUNCEMENTS ///
export async function fetchAnnouncements() {
    const req = await fetch("http://localhost:3001/fetch-announcements");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function addAnnouncement(data: {author: string, title: string, body: string, pinned: boolean}) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/add-announcement`, reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function editAnnouncement(data: {announcementid: string, title?: string, body?: string, pinned?: boolean}) {
    const reqOptions: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/edit-announcement`, reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function deleteAnnouncement(announcementid: string) {
    const req = await fetch(`http://localhost:3001/delete-announcement/${announcementid}`, { method: "DELETE" });
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

/// REFERENCES ///
export async function fetchExistingTags() {
    const req = await fetch("http://localhost:3001/fetch-existing-tags");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function fetchRecentReferences() {
    const req = await fetch("http://localhost:3001/fetch-recent-references");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function fetchAllReferences() {
    const req = await fetch("http://localhost:3001/fetch-all-references");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function addReference(data: {author: string, title: string, body: string, tags: string[]}) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/add-reference`, reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function editReference(data: {referenceid: string, title: string, body: string, tags: string[]}) {
    const reqOptions: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/edit-reference`, reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function deleteReference(referenceid: string) {
    console.log(referenceid);
    const req = await fetch(`http://localhost:3001/delete-reference/${referenceid}`, { method: "DELETE" });
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

/// EVENTS ///
export async function fetchAllEvents() {
    const req = await fetch("http://localhost:3001/fetch-events/all");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function fetchUnarchivedEvents() {
    const req = await fetch("http://localhost:3001/fetch-events/false");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function fetchArchivedEvents() {
    const req = await fetch("http://localhost:3001/fetch-events/true");
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function addEvent(data: {author: string, title: string, body: string, range: boolean, eventdates: string[]}) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/add-event`, reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function toggleEventArchival(eventid: string) {
    const req = await fetch(`http://localhost:3001/toggle-event-archival/${eventid}`, { method: "PATCH" });
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};

export async function editEvent(data: {eventid: string, title?: string, body?: string, range?: boolean, eventdates?: string[], participation?: string[]}) {
    const reqOptions: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/edit-event`, reqOptions);
    if (req.ok) {
        return req.json();
    } else {
        throw new Error(await req.json())
    };
};