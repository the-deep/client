import React from 'react';

import ElementFragments from '#dui/ElementFragments';
import DisplayPicture from '#components/viewer/DisplayPicture';
import Link from '#dui/Link';
import FormattedDate from '#rscv/FormattedDate';

import { RecentActivity } from '#typings/home';
import _ts from '#ts';

import styles from './styles.scss';

const emptyLink = '#'; // TODO: Add link when made

function ActivityItem(props: RecentActivity) {
    const {
        createdByDisplayName,
        projectDisplayName,
        createdAt,
        type,
    } = props;

    return (
        <div className={styles.activityItem}>
            <ElementFragments
                icons={(
                    <DisplayPicture className={styles.displayPicture} />
                )}
                childrenClassName={styles.content}
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
