export interface memberInterface {
    _id: string,
    username: string,
    firstname?: string,
    battle: string[],
    contribution: string[],
};

export interface statInterface {
    _id: string,
    year: number,
    week: number,
    score: number,
    member: string,
};

export interface eventInterface {
    _id: string,
    name: string,
    dates: string[],
    expectations: string,
    participants: string[]
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