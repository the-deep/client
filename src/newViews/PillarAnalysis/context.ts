import React from 'react';
import { Obj } from '@togglecorp/fujs';
import { EntryFields } from '#typings';

export type EntryFieldsMin = Pick<
    EntryFields,
    'id' | 'excerpt' | 'droppedExcerpt' | 'image' | 'entryType' | 'tabularFieldData'
>;

interface ContextProps {
    entries: Obj<EntryFieldsMin>;
    setEntries: React.Dispatch<React.SetStateAction<Obj<EntryFieldsMin>>>;
}

const context = React.createContext<ContextProps>({
    entries: {},
    setEntries: (value: unknown) => {
        console.warn('Tryping to set entries', value);
    },
});

export default context;
