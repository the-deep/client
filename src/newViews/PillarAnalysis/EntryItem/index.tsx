import React from 'react';

import { TabularDataFields } from '#typings/entry';
import ExcerptOutput from './ExcerptOutput';

export interface Props {
    type: 'image' | 'excerpt' | 'dataSeries';
    excerpt?: string;
    imageDetails?: {
        file?: string;
    };
    tabularFieldData?: TabularDataFields;
}

function EntryItem(props: Props) {
    if (props.type === 'image') {
        return (
            <ExcerptOutput
                type="image"
                image={props?.imageDetails?.file}
            />
        );
    }
    if (props.type === 'excerpt') {
        return (
            <ExcerptOutput
                type="excerpt"
                value={props.excerpt}
            />
        );
    }
    if (props.type === 'dataSeries') {
        return (
            <ExcerptOutput
                type="dataSeries"
                dataSeries={props.tabularFieldData}
            />
        );
    }
    return null;
}

export default EntryItem;
