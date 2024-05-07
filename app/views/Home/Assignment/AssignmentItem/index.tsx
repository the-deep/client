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

import { Assignment } from '..';
import styles from './styles.css';

interface AssignmentItemProps extends Assignment {
    handleClick: (id: string) => void;
    markAsDonePending: boolean;
}

function AssignmentItem(props: AssignmentItemProps) {
    const {
        id,
        handleClick: handleClickFromProps,
        markAsDonePending,
        createdBy,
        contentData,
        project,
        createdAt,
    } = props;

    const handleClick = useCallback(() => {
        handleClickFromProps(id);
    }, [id, handleClickFromProps]);

    const contentLink = useMemo(() => {
        if (contentData?.contentType === 'LEAD') {
            return (generateString(
                'source {link}',
                {
                    link: (contentData?.lead?.id && project?.id && (
                        <Link
                            to={generatePath(routes.entryEdit.path, {
                                projectId: project?.id,
                                leadId: contentData?.lead?.id,
                            })}
                            className={styles.link}
                        >
                            {contentData?.lead?.title}
                        </Link>
                    )),
                },
            ));
        }
        if (contentData?.contentType === 'ENTRY_REVIEW_COMMENT') {
            if (
                !contentData?.entryReviewComment
                || !project?.id
                || !contentData?.entryReviewComment?.entryId
            ) {
                return (
                    <span>
                        an entry
                    </span>
                );
            }
            const editEntryLink = {
                pathname: (generatePath(routes.entryEdit.path, {
                    projectId: project.id,
                    leadId: contentData?.entryReviewComment?.leadId,
                })),
                state: {
                    entryServerId: contentData?.entryReviewComment?.entryId,
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
        contentData,
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
