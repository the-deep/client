import React, { useState, useEffect, useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

import ListView from '#rsu/../v2/View/ListView';
import Pager from '#rscv/Pager';
import Button from '#rsca/Button';
import Header from '#dui/Header';
import LoadingAnimation from '#rscv/LoadingAnimation';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import Card from '#dui/Card';

import {
    Assignment,
    MultiResponse,
} from '#typings';

import _ts from '#ts';

import AssignmentItem from './AssignmentItem';
import styles from './styles.scss';

interface BulkResponse {
    assignmentUpdated: number;
}

const maxItemsPerPage = 5;
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
            {pending && <LoadingAnimation />}
            <Header
                className={styles.header}
                heading={_ts('assignment', 'myAssignments')}
                actions={assignmentsResponse && assignmentsResponse.count > 0 && (
                    <Button
                        transparent
                        className={styles.markButton}
                        onClick={triggerBulkAsDone}
                        disabled={bulkPending}
                    >
                        {_ts('assignment', 'markAllAsDone')}
                    </Button>
                )}
            />
            <Card className={styles.contentContainer}>
                <ListView
                    className={styles.list}
                    data={assignmentsResponse?.results}
                    keySelector={keySelector}
                    renderer={AssignmentItem}
                    rendererParams={rendererParams}
                />
                {assignmentsResponse && assignmentsResponse.count > 0 && (
                    <div className={styles.footer}>
                        <Pager
                            activePage={activePage}
                            itemsCount={assignmentsResponse.count}
                            maxItemsPerPage={maxItemsPerPage}
                            onPageClick={setActivePage}
                            showItemsPerPageChange={false}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}

export default Assignments;
