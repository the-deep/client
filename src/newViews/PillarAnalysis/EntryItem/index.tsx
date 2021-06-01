import React from 'react';

import {
    EntryType,
    TabularDataFields,
} from '#typings/entry';
import ExcerptOutput from '#widgetComponents/ExcerptOutput';

export interface Props {
    type: EntryType;
    excerpt?: string; // eslint-disable-line react/no-unused-prop-types
    imageDetails?: {
        file?: string;
    }; // eslint-disable-line react/no-unused-prop-types
    tabularFieldData?: TabularDataFields; // eslint-disable-line react/no-unused-prop-types
}

const getEntryValue = (props: Props, entryType: EntryType) => {
    if (entryType === 'image') {
        return props.imageDetails?.file;
    }
    if (entryType === 'dataSeries') {
        return props.tabularFieldData;
    }
    return props.excerpt;
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
            value={getEntryValue(props, type)}
        />
    );
}

export default EntryItem;
