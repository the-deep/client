import React, { useState, useEffect, useCallback } from 'react';

import { isDefined } from '@togglecorp/fujs';


import ListView from '#rsu/../v2/View/ListView';
import FormattedDate from '#rscv/FormattedDate';
import Pager from '#rscv/Pager';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import {
    ProjectElement,
    MultiResponse,
} from '#typings';

import _ts from '#ts';

import styles from './styles.scss';

interface Assignment {
    id: number;
    createdAt: string;
    projectDetails: ProjectElement;
    createdByDetails: {
        id: number;
        displayName: string;
        email: string;
    };
    contentObjectDetails: {
        id: number;
        title: string;
    };
    isDone: boolean;
    contentObjectType: {
        id: number;
        title: string;
    };
}

interface BulkResponse {
    assignmentUpdated: number;
}

interface AssignmentRendererProps extends Assignment {
    handleClick: (id: number) => void;
    markAsDonePending: boolean;
}

const emptyLink = '#';
const maxItemsPerPage = 5;

function AssignmentRenderer(props: AssignmentRendererProps) {
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
            <a
                className={styles.link}
                href={emptyLink}
            >
                {props.createdByDetails.displayName}
            </a>
            <span> {_ts('assignment', 'assignedYou')} </span>
            <a
                className={styles.link}
                href={emptyLink}
            >
                {props.contentObjectDetails?.title}
            </a>
            <span> {_ts('assignment', 'in')} </span>
            <a
                href={emptyLink}
                className={styles.link}
            >
                {props.projectDetails?.title}
            </a>
            <div className={styles.inline}>
                <FormattedDate
                    className={styles.date}
                    value={props.createdAt}
                    mode="hh:mm aaa, MMM dd, yyyy"
                />
                <Button
                    transparent
                    iconName="checkCircle"
                    className={styles.icon}
                    onClick={handleClick}
                    disabled={markAsDonePending}
                />
            </div>
        </div>
    );
}

const keySelector = (info: Assignment) => info.id;


function Assignments() {
    const [activePage, setActivePage] = useState<number>(1);
    const [selectedAssignment, setSelectedAssignment] = useState<number | undefined>();
    const [
        pending,
        assignmentsResponse,
        ,
        getAssignments,
    ] = useRequest<MultiResponse<Assignment>>(
        {
            url: 'server://assignments/',
            method: 'GET',
            query: {
                is_done: 3, // 1: Unknown | 2: True | 3: False
                offset: (activePage - 1) * maxItemsPerPage,
                limit: maxItemsPerPage,
            },
            autoTrigger: true,
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('assignment', 'assignmentListFetchFailed'))({ error: errorBody }),
        },
    );

    const [
        markAsDonePending,
        ,
        ,
        triggerMarkAsDone,
    ] = useRequest<MultiResponse<Assignment>>(
        {
            url: `server://assignments/${selectedAssignment}/`,
            method: 'PUT',
            body: { is_done: true },
            autoTrigger: false,
            onSuccess: () => {
                getAssignments();
            },
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('assignment', 'markAsDoneFailed'))({ error: errorBody }),
        },
    );

    useEffect(() => {
        if (isDefined(selectedAssignment)) {
            triggerMarkAsDone();
        }
    }, [selectedAssignment, triggerMarkAsDone]);

    const [
        bulkPending,
        ,
        ,
        triggerBulkAsDone,
    ] = useRequest<BulkResponse>(
        {
            url: 'server://assignments/bulk-mark-as-done/',
            method: 'POST',
            body: { is_done: true },
            onSuccess: () => {
                getAssignments();
            },
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('assignment', 'markBulkAsDoneFailed'))({ error: errorBody }),
        },
    );

    const rendererParams = useCallback((_: number, info: Assignment) => ({
        ...info,
        handleClick: setSelectedAssignment,
        markAsDonePending,
    }), [setSelectedAssignment, markAsDonePending]);

    return (
        <div className={styles.assignment}>
            <header className={styles.header}>
                <h2 className={styles.heading}>
                    {_ts('assignment', 'myAssignments')}
                </h2>
                {assignmentsResponse && assignmentsResponse?.count > 0 && (
                    <Button
                        transparent
                        className={styles.markButton}
                        onClick={triggerBulkAsDone}
                        disabled={bulkPending}
                    >
                        {_ts('assignment', 'markAllAsDone')}
                    </Button>
                )}
            </header>
            <div className={styles.content}>
                {pending && (
                    <LoadingAnimation />
                )}
                {assignmentsResponse && assignmentsResponse?.count > 0 && (
                    <div className={styles.contentContainer}>
                        <ListView
                            data={assignmentsResponse?.results}
                            keySelector={keySelector}
                            renderer={AssignmentRenderer}
                            rendererParams={rendererParams}
                        />
                        <Pager
                            activePage={activePage}
                            itemsCount={assignmentsResponse?.count}
                            maxItemsPerPage={maxItemsPerPage}
                            onPageClick={setActivePage}
                            showItemsPerPageChange={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Assignments;
