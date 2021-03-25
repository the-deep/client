import React, { useCallback } from 'react';

import FormattedDate from '#rscv/FormattedDate';
import Button from '#rsca/Button';
import ElementFragments from '#components/ui/ElementFragments';
import Link from '#dui/Link';

import { Assignment } from '#typings/home';

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
                childrenClassName={styles.content}
            >
                <div className={styles.assignmentTitle}>
                    <Link
                        className={styles.link}
                        to={emptyLink}
                    >
                        {props.createdByDetails.displayName}
                    </Link>
                    <div className={styles.text}> {_ts('assignment', 'assignedYou')} </div>
                    <Link
                        className={styles.link}
                        to={emptyLink}
                    >
                        {props.contentObjectDetails?.title}
                    </Link>
                    <div className={styles.text}> {_ts('assignment', 'in')} </div>
                    <Link
                        to={emptyLink}
                        className={styles.link}
                    >
                        {props.projectDetails?.title}
                    </Link>
                </div>
                <div className={styles.dateContainer}>
                    <FormattedDate
                        className={styles.date}
                        value={props.createdAt}
                        mode="hh:mm aaa, MMM dd, yyyy"
                    />
                    <Button
                        transparent
                        iconName="checkCircle"
                        className={styles.button}
                        onClick={handleClick}
                        disabled={markAsDonePending}
                    />
                </div>
            </ElementFragments>
        </div>
    );
}
export default AssignmentItem;
