import React, { useCallback } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import {
    ElementFragments,
    Link,
    QuickActionButton,
} from '@the-deep/deep-ui';

import FormattedDate from '#rscv/FormattedDate';

import { Assignment } from '#typings';

import _ts from '#ts';

import styles from './styles.scss';

interface AssignmentRendererProps extends Assignment {
    handleClick: (id: number) => void;
    markAsDonePending: boolean;
}

const emptyLink = '#'; // TODO add link when made

function AssignmentItem(props: AssignmentRendererProps) {
    const {
        id,
        handleClick: handleClickFromProps,
        markAsDonePending,
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
                        {props.createdByDetails.displayName}
                    </Link>
                    &nbsp;
                    {_ts('assignment', 'assignedYou')}
                    &nbsp;
                    <Link
                        to={emptyLink}
                        className={styles.link}
                    >
                        {props.contentObjectDetails?.title}
                    </Link>
                    &nbsp;
                    {_ts('assignment', 'in')}
                    &nbsp;
                    <Link
                        to={emptyLink}
                        className={styles.link}
                    >
                        {props.projectDetails?.title}
                    </Link>
                </div>
                <FormattedDate
                    className={styles.createdDate}
                    value={props.createdAt}
                    mode="hh:mm aaa, MMM dd, yyyy"
                />
            </ElementFragments>
        </div>
    );
}
export default AssignmentItem;
