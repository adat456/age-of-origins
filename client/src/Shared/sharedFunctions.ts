import { announcementInterface, memberInterface, referenceInterface } from "./interfaces";

// query keys: members, MEMBERID-stats, USERNAME-past-year-stats, announcements, tags, recent-references, references, events

/// MEMBERS ///
export async function fetchMembers() {
    const req = await fetch("http://localhost:3001/fetch-members");
    const res = await req.json();

    if (req.ok) {
        return res as memberInterface[];
    } else {
        throw new Error(res);
    };
};

export async function createMember(memberData: { username: string, firstname: string }) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
    };
    const req = await fetch("http://localhost:3001/create-member", reqOptions);
    const res = await req.json();
    
    if (!req.ok) {
        if (res.code) {
            if (res.code === 11000) throw new Error("Duplicate username found. Please enter a different username.");
        } else {
            throw new Error("Unable to add user: ", res);
        };
    };

    return res;
};

/// STATS ///
export async function fetchWeekStats(data: {memberid: string | null, year: number | undefined, week: number | undefined}) {
    const { memberid, year, week } = data;
    if (!memberid) return { battle: 0, contribution: 0 };

    const req = await fetch(`http://localhost:3001/fetch-week-stats/${memberid}/${year}/${week}`);
    const res = await req.json();
    
    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function fetchPastYearStats(memberid: string) {
    const req = await fetch(`http://localhost:3001/fetch-past-year-stats/${memberid}`);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
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
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error("Unable to update stats: ", res)
    };
};

/// ANNOUNCEMENTS ///
export async function fetchAnnouncements() {
    const req = await fetch("http://localhost:3001/fetch-announcements");
    const res = await req.json();

    if (req.ok) {
        return res as announcementInterface[];
    } else {
        throw new Error(res);
    };
};

export async function addAnnouncement(data: {author: string, title: string, body: string, pinned: boolean}) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/add-announcement`, reqOptions);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function editAnnouncement(data: {announcementid: string, title?: string, body?: string, pinned?: boolean}) {
    const reqOptions: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/edit-announcement`, reqOptions);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function deleteAnnouncement(announcementid: string) {
    const req = await fetch(`http://localhost:3001/delete-announcement/${announcementid}`, { method: "DELETE" });
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

/// REFERENCES ///
export async function fetchExistingTags() {
    const req = await fetch("http://localhost:3001/fetch-existing-tags");
    const res = await req.json();

    if (req.ok) {
        return res as string[];
    } else {
        throw new Error(res);
    };
};

export async function fetchRecentReferences() {
    const req = await fetch("http://localhost:3001/fetch-recent-references");
    const res = await req.json();

    if (req.ok) {
        return res as referenceInterface[];
    } else {
        throw new Error(res);
    };
};

export async function fetchAllReferences() {
    const req = await fetch("http://localhost:3001/fetch-all-references");
    const res = await req.json();

    if (req.ok) {
        return res as referenceInterface[];
    } else {
        throw new Error(res);
    };
};

export async function addReference(data: {author: string, title: string, body: string, tags: string[]}) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/add-reference`, reqOptions);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function editReference(data: {referenceid: string, title: string, body: string, tags: string[]}) {
    const reqOptions: RequestInit = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/edit-reference`, reqOptions);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function deleteReference(referenceid: string) {
    console.log(referenceid);
    const req = await fetch(`http://localhost:3001/delete-reference/${referenceid}`, { method: "DELETE" });
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

/// EVENTS ///
export async function addEvent(data: {author: string, title: string, body: string, eventdates: string[]}) {
    const reqOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    const req = await fetch(`http://localhost:3001/add-event`, reqOptions);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

