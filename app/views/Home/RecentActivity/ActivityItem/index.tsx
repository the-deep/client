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
        const editEntryLink = {
            pathname: (generatePath(routes.entryEdit.path, {
                projectId: activity?.project?.id,
                // TODO: Remove this
                leadId: activity?.leadId ?? '1',
            })),
            state: {
                // TODO: Remove this
                entryServerId: ((activity?.type === 'ENTRY')
                     || (activity?.type === 'ENTRY_COMMENT')) && activity?.leadId,
                activePage: 'primary',
            },
            hash: '#/primary-tagging',
        };
        if (activity?.type === 'LEAD') {
            return (generateString(
                'a {link} on',
                {
                    link: (
                        <Link
                            className={styles.link}
                            to={generatePath(routes.entryEdit.path, {
                                projectId: activity?.project?.id,
                                leadId: '1',
                            })}
                        >
                            lead
                        </Link>
                    ),
                },
            ));
        }
        if (activity?.type === 'ENTRY') {
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
        if (activity?.type === 'ENTRY_COMMENT') {
            return (generateString(
                'an {link} on',
                {
                    link: (
                        <Link
                            className={styles.link}
                            to={generatePath(routes.entryEdit.path, {
                                projectId: activity?.project?.id,
                                leadId: '1',
                                entryId: '1',
                            })}
                        >
                            entry comment
                        </Link>
                    ),
                },
            ));
        }
        return undefined;
    }, [
        activity?.type,
        activity?.project?.id,
        activity?.leadId,
    ]);

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
