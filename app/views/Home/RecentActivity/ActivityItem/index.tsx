import React from 'react';
import {
    Element,
    DateOutput,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';
import generateString from '#utils/string';

import styles from './styles.css';

interface RecentActivityProps {
    projectDisplayName: string;
    createdAt: string;
    createdByDisplayName: string;
    createdByDisplayPicture?: string;
    type: string;
}

function ActivityItem(props: RecentActivityProps) {
    const {
        createdAt,
        createdByDisplayName,
        createdByDisplayPicture,
        projectDisplayName,
        type,
    } = props;

    return (
        <Element
            className={styles.activityItem}
            icons={(
                <Avatar
                    className={styles.displayPicture}
                    src={createdByDisplayPicture ?? undefined}
                    name={createdByDisplayName}
                />
            )}
            childrenContainerClassName={styles.mainContent}
        >
            <div className={styles.description}>
                {generateString(
                    '{createdByDisplayName} added {article} {type} on {projectDisplayName}',
                    {
                        createdByDisplayName: (
                            <span className={styles.boldText}>
                                {createdByDisplayName}
                            </span>
                        ),
                        article: (type === 'lead' ? 'a' : 'an'),
                        type,
                        projectDisplayName: (
                            <span className={styles.boldText}>
                                {projectDisplayName}
                            </span>
                        ),
                    },
                )}
            </div>
            <DateOutput
                className={styles.createdDate}
                value={createdAt}
                format="hh:mm aaa, MMM dd, yyyy"
            />
        </Element>
    );
}
export default ActivityItem;
