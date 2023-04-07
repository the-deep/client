import React from 'react';
import { Obj } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import { Entry } from '.';

export function transformEntry(entry: Entry) {
    return removeNull({
        ...entry,
        lead: entry?.lead?.id,
        image: entry.image?.id,
        attributes: entry.attributes?.map((attribute) => ({
            ...attribute,
            // NOTE: we don't need this on form
            geoSelectedOptions: undefined,
        })),
    });
}

interface ContextProps {
    entries: Obj<Entry>;
    setEntries: React.Dispatch<React.SetStateAction<Obj<Entry>>>;
}

const context = React.createContext<ContextProps>({
    entries: {},
    setEntries: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('Trying to set entries', value);
    },
});

export default context;
