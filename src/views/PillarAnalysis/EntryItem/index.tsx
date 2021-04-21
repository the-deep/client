import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { DraggableContent } from '@the-deep/deep-ui';

import {
    EntryType,
    TabularDataFields,
} from '#typings/entry';
import ExcerptOutput from '#widgetComponents/ExcerptOutput';

import styles from './styles.scss';

interface EntryItem {
    className?: string;
    type: EntryType;

    excerpt?: string; // eslint-disable-line react/no-unused-prop-types
    image?: string; // eslint-disable-line react/no-unused-prop-types
    tabularFieldData?: TabularDataFields; // eslint-disable-line react/no-unused-prop-types

    entryId: number;
    disabled?: boolean;
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

function EntryItem(props: EntryItem) {
    const {
        className,
        type,
        entryId,
        disabled,
    } = props;

    const value = useMemo(() => ({ entryId }), [entryId]);

    return (
        <DraggableContent
            className={_cs(className, styles.entryItem, disabled && styles.disabled)}
            name="entry"
            value={value}
        >
            <ExcerptOutput
                type={entryTypeToExcerptTypeMap[type]}
                value={props[entryTypeToValueMap[type]]}
            />
        </DraggableContent>
    );
}

export default EntryItem;
