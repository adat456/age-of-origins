export interface memberInterface {
    _id: string,
    username: string,
    firstname?: string,
    archived: boolean,
    archivedate: string,
    battle: string[],
    contribution: string[],
};

export interface statInterface {
    _id: string,
    year: number,
    week: number,
    score: number,
    member: string | memberInterface,
};

export interface announcementInterface {
    _id: string,
    title: string,
    postdate: string,
    editdate: string,
    author: string,
    body: string,
    pinned: boolean,
};

export interface categoryInterface {
    _id: string,
    name: string
};

export interface referenceInterface {
    _id: string,
    title: string,
    postdate: string,
    editdate: string,
    author: string,
    body: string,
    pinned: string,
    tags: string[],
};

export interface eventInterface {
    _id: string,
    title: string,
    postdate: string,
    editdate: string,
    author: string,
    range: boolean,
    eventdates: string[],
    body: string,
    participation: string[],
    archived: boolean
};