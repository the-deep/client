import React from 'react';
import {
    ElementFragments,
    Link,
} from '@the-deep/deep-ui';

import DisplayPicture from '#components/viewer/DisplayPicture';
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
                    <DisplayPicture
                        className={styles.displayPicture}
                        url={createdByDisplayPicture}
                    />
                )}
                childrenContainerClassName={styles.content}
            >
                <div className={styles.activityTitle}>
                    <Link
                        className={styles.link}
                        to={emptyLink}
                    >
                        {createdByDisplayName}
                    </Link>
                    <div className={styles.actionType}>
                        {type === 'lead'
                            ? _ts('recentActivity', 'leadAdded')
                            : _ts('recentActivity', 'entryCommentAdded')
                        }
                    </div>
                    <Link
                        className={styles.link}
                        to={emptyLink}
                    >
                        {projectDisplayName}
                    </Link>
                </div>
                <FormattedDate
                    className={styles.date}
                    value={createdAt}
                    mode="hh:mm aaa, MMM dd, yyyy"
                />
            </ElementFragments>
        </div>
    );
}
export default ActivityItem;
