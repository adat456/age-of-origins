import { memberInterface } from "./interfaces";

// query keys: members, MEMBERID-stats, USERNAME-past-year-stats

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

export async function fetchCurrentMembersStats(memberid: string | null) {
    if (!memberid) return { battle: 0, contribution: 0 };

    const req = await fetch(`http://localhost:3001/fetch-this-weeks-stats/${memberid}`);
    const res = await req.json();
    
    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function fetchPastYearStats(username: string) {
    const req = await fetch(`http://localhost:3001/fetch-past-year-stats/${username}`);
    const res = await req.json();

    if (req.ok) {
        return res;
    } else {
        throw new Error(res);
    };
};

export async function updateStats(data: { memberid: string, battle: number, contribution: number }) {
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