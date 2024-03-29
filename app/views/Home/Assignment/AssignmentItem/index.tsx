import React, { useMemo, useCallback } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { generatePath } from 'react-router-dom';
import {
    Element,
    Link,
    QuickActionButton,
    DateOutput,
} from '@the-deep/deep-ui';

import generateString from '#utils/string';
import routes from '#base/configs/routes';
import { GetAssignmentsQuery } from '#generated/types';

import styles from './styles.css';

type Assignment = NonNullable<NonNullable<GetAssignmentsQuery['assignment']>['results']>[number];
interface AssignmentItemProps extends Assignment {
    handleClick: (id: number) => void;
    markAsDonePending: boolean;
}

function AssignmentItem(props: AssignmentItemProps) {
    const {
        id,
        handleClick: handleClickFromProps,
        markAsDonePending,
        createdBy,
        leadType,
        entryType,
        contentType,
        project,
        createdAt,
    } = props;

    const handleClick = useCallback(() => {
        handleClickFromProps(Number(id));
    }, [id, handleClickFromProps]);

    const contentLink = useMemo(() => {
        if (contentType === 'lead') {
            return (generateString(
                'source {link}',
                {
                    link: (leadType?.id && project?.id && (
                        <Link
                            to={generatePath(routes.entryEdit.path, {
                                projectId: project?.id,
                                leadId: leadType?.id,
                            })}
                            className={styles.link}
                        >
                            {leadType?.title}
                        </Link>
                    )),
                },
            ));
        }
        if (contentType === 'entryreviewcomment' || contentType === 'entrycomment') {
            if (!leadType || !project?.id || !leadType?.id) {
                return (
                    <span>
                        an entry
                    </span>
                );
            }
            const editEntryLink = {
                pathname: (generatePath(routes.entryEdit.path, {
                    projectId: project.id,
                    leadId: leadType?.id,
                })),
                state: {
                    // NOTE: Replace this later to clientId
                    entryServerId: entryType?.id,
                    activePage: 'primary',
                },
                hash: '#/primary-tagging',
            };
            return (
                <Link
                    className={styles.link}
                    to={editEntryLink}
                >
                    an entry
                </Link>
            );
        }
        return null;
    }, [
        contentType,
        leadType,
        entryType,
        project,
    ]);

    return (
        <Element
            className={styles.assignmentItem}
            actions={(
                <QuickActionButton
                    name={undefined}
                    className={styles.markAsDoneButton}
                    onClick={handleClick}
                    disabled={markAsDonePending}
                    big
                    title="Mark as done"
                >
                    <IoCheckmarkCircle />
                </QuickActionButton>
            )}
            childrenContainerClassName={styles.mainContent}
        >
            <div className={styles.description}>
                {generateString(
                    '{createdByName} assigned you to {linkToItem} in {project}.',
                    {
                        createdByName: createdBy?.displayName,
                        linkToItem: contentLink,
                        project: (
                            <Link
                                to={generatePath(
                                    routes.tagging.path,
                                    { projectId: project?.id },
                                )}
                                className={styles.link}
                            >
                                {project?.title}
                            </Link>
                        ),
                    },
                )}
            </div>
            <DateOutput
                className={styles.createdDate}
                value={createdAt}
                format="hh:mm aaa, dd MMM, yyyy"
            />
        </Element>
    );
}
export default AssignmentItem;
