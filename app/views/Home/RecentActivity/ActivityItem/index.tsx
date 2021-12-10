import React from 'react';
import {
    Element,
    DateOutput,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';

import styles from './styles.css';

interface RecentActivityProps {
    projectDisplayName: string;
    createdAt: string;
    createdByDisplayName: string;
    createdByDisplayPicture?: string;
    type: string;
}

interface messageProps {
    createdByDisplayName: string;
    projectDisplayName: string;
    type: string;
}

function ActionMessage(props: messageProps) {
    const {
        createdByDisplayName,
        projectDisplayName,
        type,
    } = props;
    if (type === 'lead') {
        return (
            <>
                <span className={styles.boldText}>
                    {createdByDisplayName}
                </span>
                &nbsp;
                added a source on
                &nbsp;
                <span className={styles.boldText}>
                    {projectDisplayName}
                </span>
            </>
        );
    }
    if (type === 'entry') {
        return (
            <>
                <span className={styles.boldText}>
                    {createdByDisplayName}
                </span>
                &nbsp;
                added an entry on
                &nbsp;
                <span className={styles.boldText}>
                    {projectDisplayName}
                </span>
            </>
        );
    }
    if (type === 'entry-comment') {
        return (
            <div className={styles.description}>
                <span className={styles.boldText}>
                    {createdByDisplayName}
                </span>
                &nbsp;
                added a comment on an entry on
                &nbsp;
                <span className={styles.boldText}>
                    {projectDisplayName}
                </span>
            </div>
        );
    }
    return null;
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
            <ActionMessage
                createdByDisplayName={createdByDisplayName}
                projectDisplayName={projectDisplayName}
                type={type}
            />
            <DateOutput
                className={styles.createdDate}
                value={createdAt}
                format="hh:mm aaa, MMM dd, yyyy"
            />
        </Element>
    );
}
export default ActivityItem;
