import React from 'react';

import {
    EntryType,
    TabularDataFields,
} from '#typings/entry';
import ExcerptOutput from '#widgetComponents/ExcerptOutput';

export interface Props {
    type: EntryType;
    excerpt?: string; // eslint-disable-line react/no-unused-prop-types
    image?: string; // eslint-disable-line react/no-unused-prop-types
    tabularFieldData?: TabularDataFields; // eslint-disable-line react/no-unused-prop-types
}

const entryTypeToValueMap: {
    [key in EntryType]: 'excerpt' | 'image' | 'tabularFieldData';
} = {
    excerpt: 'excerpt',
    image: 'image',
    dataSeries: 'tabularFieldData',
};

const entryTypeToExcerptTypeMap: {
    [key in EntryType]: 'text' | 'image' | 'dataSeries';
} = {
    excerpt: 'text',
    image: 'image',
    dataSeries: 'dataSeries',
};

function EntryItem(props: Props) {
    const {
        type,
    } = props;

    return (
        <ExcerptOutput
            type={entryTypeToExcerptTypeMap[type]}
            value={props[entryTypeToValueMap[type]]}
        />
    );
}

export default EntryItem;
