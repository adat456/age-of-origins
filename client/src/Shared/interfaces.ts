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