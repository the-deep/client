import React, { useCallback } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { generatePath } from 'react-router-dom';
import {
    Element,
    Link,
    QuickActionButton,
    DateOutput,
} from '@the-deep/deep-ui';

import { Assignment } from '#types';

import _ts from '#ts';
import routes from '#base/configs/routes';

import styles from './styles.css';

// TODO add link when made
const emptyLink = '#';

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
        projectDetails,
        createdAt,
    } = props;

    const handleClick = useCallback(() => {
        handleClickFromProps(id);
    }, [id, handleClickFromProps]);

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
                {createdByDetails.displayName}
                &nbsp;
                {_ts('assignment', 'assignedYou')}
                &nbsp;
                <Link
                    to={emptyLink} // TODO: Add path to edit entries flow
                    className={styles.link}
                >
                    {contentObjectDetails?.title}
                </Link>
                &nbsp;
                {_ts('assignment', 'in')}
                &nbsp;
                <Link
                    to={generatePath(routes.tagging.path, { projectId: projectDetails?.id })}
                    className={styles.link}
                >
                    {projectDetails?.title}
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
export default AssignmentItem;
