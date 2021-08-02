import React from 'react';
import { Obj } from '@togglecorp/fujs';
import { Entry } from '#newViews/Tagging/types';

export type EntryFieldsMin = Pick<
    Entry,
    'id' | 'excerpt' | 'droppedExcerpt' | 'imageDetails' | 'entryType' | 'tabularFieldData' | 'createdAt'
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
