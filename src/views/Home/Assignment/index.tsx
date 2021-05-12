import React, { useState, useCallback, useMemo } from 'react';
import {
    Container,
    Button,
    Pager,
    Card,
} from '@the-deep/deep-ui';

import List from '#rsu/../v2/View/List';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { useRequest, useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

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

    const assignmentsQuery = useMemo(
        () => ({
            is_done: 3, // 1: Unknown | 2: True | 3: False
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        }),
        [activePage],
    );

    const {
        pending,
        response: assignmentsResponse,
        retrigger: getAssignments,
    } = useRequest<MultiResponse<Assignment>>(
        {
            url: 'server://assignments/',
            method: 'GET',
            query: assignmentsQuery,
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('assignment', 'assignmentListFetchFailed'))({ error: errorBody }),
        },
    );

    const {
        pending: markAsDonePending,
        trigger: triggerMarkAsDone,
    } = useLazyRequest<MultiResponse<Assignment>, number>(
        {
            url: ctx => `server://assignments/${ctx}/`,
            method: 'PUT',
            body: { is_done: true },
            onSuccess: () => {
                getAssignments();
            },
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('assignment', 'markAsDoneFailed'))({ error: errorBody }),
        },
    );

    const {
        pending: bulkPending,
        trigger: triggerBulkAsDone,
    } = useLazyRequest<BulkResponse>(
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

    const handleBulkActionClick = useCallback(
        () => {
            triggerBulkAsDone(null);
        },
        [triggerBulkAsDone],
    );

    const rendererParams = useCallback((_: number, info: Assignment) => ({
        ...info,
        handleClick: triggerMarkAsDone,
        markAsDonePending,
    }), [triggerMarkAsDone, markAsDonePending]);

    return (
        <Container
            sub
            heading={_ts('assignment', 'myAssignments')}
            headerActions={(
                assignmentsResponse && assignmentsResponse.count > 0 && (
                    <Button
                        name={undefined}
                        onClick={handleBulkActionClick}
                        disabled={bulkPending}
                        variant="action"
                    >
                        {_ts('assignment', 'markAllAsDone')}
                    </Button>
                )
            )}
            className={styles.assignments}
            footerActions={((assignmentsResponse?.count ?? 0) > maxItemsPerPage) && (
                <Pager
                    activePage={activePage}
                    itemsCount={assignmentsResponse?.count ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                    hidePageNumberLabel
                    hideInfo
                    hidePrevAndNext
                />
            )}
        >
            <Card className={styles.content}>
                {pending && <LoadingAnimation />}
                <List
                    data={assignmentsResponse?.results}
                    keySelector={keySelector}
                    renderer={AssignmentItem}
                    rendererParams={rendererParams}
                />
            </Card>
        </Container>
    );
}

export default Assignments;
