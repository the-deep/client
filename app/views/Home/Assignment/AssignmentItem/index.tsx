import React, { useMemo, useCallback } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { generatePath } from 'react-router-dom';
import {
    Element,
    Link,
    QuickActionButton,
    DateOutput,
} from '@the-deep/deep-ui';

import { Assignment } from '#types';
import generateString from '#utils/string';
import routes from '#base/configs/routes';

import styles from './styles.css';

interface AssignmentItemProps extends Assignment {
    handleClick: (id: number) => void;
    markAsDonePending: boolean;
}

function AssignmentItem(props: AssignmentItemProps) {
    const {
        id,
        handleClick: handleClickFromProps,
        markAsDonePending,
        createdByDetails,
        contentObjectDetails,
        contentObjectType,
        projectDetails,
        createdAt,
    } = props;

    const handleClick = useCallback(() => {
        handleClickFromProps(id);
    }, [id, handleClickFromProps]);

    const contentLink = useMemo(() => {
        if (contentObjectType === 'lead') {
            return (generateString(
                'lead {link}',
                {
                    link: (contentObjectDetails?.id && projectDetails?.id && (
                        <Link
                            to={generatePath(routes.entryEdit.path, {
                                projectId: projectDetails.id,
                                leadId: contentObjectDetails.id,
                            })}
                            className={styles.link}
                        >
                            {contentObjectDetails.title}
                        </Link>
                    )),
                },
            ));
        }
        if (contentObjectType === 'entryreviewcomment' || contentObjectType === 'entrycomment') {
            if (!projectDetails?.id && contentObjectDetails?.lead) {
                return (
                    <span>
                        an entry
                    </span>
                );
            }
            const editEntryLink = {
                pathname: (generatePath(routes.entryEdit.path, {
                    projectId: projectDetails.id,
                    leadId: contentObjectDetails.lead,
                })),
                state: {
                    entryId: contentObjectDetails.entry,
                },
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
        contentObjectType,
        contentObjectDetails,
        projectDetails,
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
                        createdByName: createdByDetails.displayName,
                        linkToItem: contentLink,
                        project: (
                            <Link
                                to={generatePath(
                                    routes.tagging.path,
                                    { projectId: projectDetails?.id },
                                )}
                                className={styles.link}
                            >
                                {projectDetails?.title}
                            </Link>
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
export default AssignmentItem;
