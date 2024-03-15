import React, { useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Message,
} from '@the-deep/deep-ui';
import {
    Timeline,
} from '@the-deep/reporting-module-components';

import styles from './styles.css';

type TimelineCacheData = Record<string, string | number | undefined>[] | undefined;

interface Props {
    className?: string;
    contentData: TimelineCacheData | undefined;
}

function TimelineContent(props: Props) {
    const {
        className,
        contentData,
    } = props;

    const transformedData = useMemo(() => (
        contentData?.map(
            (row) => {
                const {
                    title,
                    details,
                    date,
                    category,
                    source,
                    sourceUrl,
                } = row;

                if (!date || !title) {
                    return undefined;
                }

                return ({
                    title: String(title),
                    details: isDefined(details) ? String(details) : String(title),
                    date: String(new Date(date)),
                    category: isDefined(category) ? String(category) : undefined,
                    source: isDefined(source) ? String(source) : undefined,
                    link: isDefined(sourceUrl) ? String(sourceUrl) : undefined,
                });
            },
        ).filter(isDefined)
    ), [contentData]);

    return (
        <div className={_cs(className, styles.timeline)}>
            {(transformedData?.length ?? 0) === 0 && (
                <Message
                    message="Timeline chart has not been properly configured for the selected data."
                />
            )}
            <Timeline
                data={transformedData ?? []}
            />
        </div>
    );
}

export default TimelineContent;
