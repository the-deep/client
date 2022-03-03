export enum EntryAction {
    COMMENT = 0,
    VERIFY = 1,
    UNVERIFY = 2,
    CONTROL = 3,
    UNCONTROL = 4,
}

export type EntryActionType = 'COMMENT' | 'VERIFY' | 'UNVERIFY' | 'CONTROL' | 'UNCONTROL';

export const commentTypeToTextMap: { [id in EntryActionType as string]: string } = {
    COMMENT: 'commented',
    VERIFY: 'verified',
    UNVERIFY: 'unverified',
    CONTROL: 'controlled',
    UNCONTROL: 'uncontrolled',
};
