import React, { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import {
    Element,
    DateOutput,
    Link,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';
import generateString from '#utils/string';
import routes from '#base/configs/routes';

import { RecentActivityItemType } from '..';

import styles from './styles.css';

interface RecentActivityProps {
    activity: RecentActivityItemType;
}

function ActivityItem(props: RecentActivityProps) {
    const {
        activity,
    } = props;

    const typeDisplayText = useMemo(() => {
        if (!activity) {
            return undefined;
        }

        const {
            id,
            leadId,
            entryId,
            project,
            type,
        } = activity;

        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: project?.id,
                leadId,
            })),
            state: {
                // TODO: Remove this
                entryServerId: ((type === 'ENTRY') || (type === 'ENTRY_COMMENT')) && entryId,
                activePage: 'primary',
            },
            hash: '#/primary-tagging',
        };
        if (type === 'LEAD' && leadId) {
            return (generateString(
                'a {link} on',
                {
                    link: (
                        <Link
                            className={styles.link}
                            to={generatePath(routes.entryEdit.path, {
                                projectId: project?.id,
                                leadId,
                            })}
                        >
                            lead
                        </Link>
                    ),
                },
            ));
        }
        if (type === 'ENTRY' && id) {
            return (generateString(
                'an {link} on',
                {
                    link: (
                        <Link
                            className={styles.link}
                            to={editEntryLink}
                        >
                            entry
                        </Link>
                    ),
                },
            ));
        }
        if (type === 'ENTRY_COMMENT' && id) {
            return (generateString(
                'an {link} on',
                {
                    link: (
                        <Link
                            className={styles.link}
                            to={editEntryLink}
                        >
                            entry comment
                        </Link>
                    ),
                },
            ));
        }
        return undefined;
    }, [activity]);

    return (
        <Element
            className={styles.activityItem}
            icons={(
                <Avatar
                    className={styles.displayPicture}
                    src={undefined}
                    name={activity?.createdBy?.displayName ?? undefined}
                />
            )}
            childrenContainerClassName={styles.mainContent}
        >
            <div className={styles.description}>
                {generateString(
                    '{createdByDisplayName} added {type} on {project}.',
                    {
                        createdByDisplayName: activity?.createdBy?.displayName,
                        type: typeDisplayText,
                        project: (
                            <Link
                                to={generatePath(
                                    routes.tagging.path,
                                    { projectId: activity?.project?.id },
                                )}
                                className={styles.link}
                            >
                                {activity?.project?.title}
                            </Link>
                        ),
                    },
                )}
            </div>
            <DateOutput
                className={styles.createdDate}
                value={activity?.createdAt}
                format="hh:mm aaa, MMM dd, yyyy"
            />
        </Element>
    );
}
export default ActivityItem;
