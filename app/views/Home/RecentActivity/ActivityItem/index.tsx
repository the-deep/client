import React from 'react';
import {
    Element,
    Link,
    DateOutput,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';

import _ts from '#ts';

import styles from './styles.css';

const emptyLink = '#'; // TODO: Add link when made

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
                    src={createdByDisplayPicture}
                />
            )}
            childrenContainerClassName={styles.mainContent}
        >
            <div className={styles.description}>
                <Link
                    to={emptyLink}
                    className={styles.link}
                >
                    {createdByDisplayName}
                </Link>
                &nbsp;
                {(type === 'lead'
                    ? _ts('recentActivity', 'leadAdded')
                    : _ts('recentActivity', 'entryCommentAdded')
                )}
                &nbsp;
                <Link
                    to={emptyLink}
                    className={styles.link}
                >
                    {projectDisplayName}
                </Link>
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
