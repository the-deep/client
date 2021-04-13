import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';

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
    } = props;

    return (
        <Card className={_cs(className, styles.entryItem)}>
            <ExcerptOutput
                type={entryTypeToExcerptTypeMap[type]}
                value={props[entryTypeToValueMap[type]]}
            />
        </Card>
    );
}

export default EntryItem;
