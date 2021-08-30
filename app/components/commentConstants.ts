export enum EntryAction {
    COMMENT = 0,
    VERIFY = 1,
    UNVERIFY = 2,
    CONTROL = 3,
    UNCONTROL = 4,
}

export const commentTypeToTextMap: { [id: number]: string } = {
    0: 'commented',
    1: 'verified',
    2: 'unverified',
    3: 'controlled',
    4: 'uncontrolled',
};
