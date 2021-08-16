import React, { useCallback } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import {
    ElementFragments,
    Link,
    QuickActionButton,
    DateOutput,
} from '@the-deep/deep-ui';

import { Assignment } from '#types';

import _ts from '#ts';

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
        <div className={styles.assignmentItem}>
            <ElementFragments
                actions={(
                    <QuickActionButton
                        name={undefined}
                        className={styles.markAsDoneButton}
                        onClick={handleClick}
                        disabled={markAsDonePending}
                        big
                    >
                        <IoCheckmarkCircle />
                    </QuickActionButton>
                )}
                childrenContainerClassName={styles.mainContent}
            >
                <div className={styles.description}>
                    <Link
                        to={emptyLink}
                        className={styles.link}
                    >
                        {createdByDetails.displayName}
                    </Link>
                    &nbsp;
                    {_ts('assignment', 'assignedYou')}
                    &nbsp;
                    <Link
                        to={emptyLink}
                        className={styles.link}
                    >
                        {contentObjectDetails?.title}
                    </Link>
                    &nbsp;
                    {_ts('assignment', 'in')}
                    &nbsp;
                    <Link
                        to={emptyLink}
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
            </ElementFragments>
        </div>
    );
}
export default AssignmentItem;
