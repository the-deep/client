import React from 'react';
import {
    ElementFragments,
    Link,
} from '@the-deep/deep-ui';

import Avatar from '#newComponents/ui/Avatar';
import FormattedDate from '#rscv/FormattedDate';

import _ts from '#ts';

import styles from './styles.scss';

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
        <div className={styles.activityItem}>
            <ElementFragments
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
                    {type === 'lead'
                        ? _ts('recentActivity', 'leadAdded')
                        : _ts('recentActivity', 'entryCommentAdded')
                    }
                    &nbsp;
                    <Link
                        to={emptyLink}
                        className={styles.link}
                    >
                        {projectDisplayName}
                    </Link>
                </div>
                <FormattedDate
                    className={styles.createdDate}
                    value={createdAt}
                    mode="hh:mm aaa, MMM dd, yyyy"
                />
            </ElementFragments>
        </div>
    );
}
export default ActivityItem;
