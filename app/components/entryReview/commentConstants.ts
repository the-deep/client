export enum EntryAction {
    COMMENT = 0,
    VERIFY = 1,
    UNVERIFY = 2,
    CONTROL = 3,
    UNCONTROL = 4,
}

export const commentTypeToTextMap: { [id: string]: string } = {
    COMMENT: 'commented',
    VERIFY: 'verified',
    UNVERIFY: 'unverified',
    CONTROL: 'controlled',
    UNCONTROL: 'uncontrolled',
};
