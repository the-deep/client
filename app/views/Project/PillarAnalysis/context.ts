import React from 'react';
import { Obj } from '@togglecorp/fujs';
import {
    ProjectEntriesForAnalysisQuery,
} from '#generated/types';

export type EntryMin = NonNullable<NonNullable<NonNullable<NonNullable<NonNullable<ProjectEntriesForAnalysisQuery>['project']>['analysisPillar']>['entries']>['results']>[number];

interface ContextProps {
    entries: Obj<EntryMin>;
    setEntries: React.Dispatch<React.SetStateAction<Obj<EntryMin>>>;
}

const context = React.createContext<ContextProps>({
    entries: {},
    setEntries: (value: unknown) => {
        console.warn('Tryping to set entries', value);
    },
});

export default context;
