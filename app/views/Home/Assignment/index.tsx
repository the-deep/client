import React, { useState, useCallback, useMemo } from 'react';
import {
    Container,
    Button,
    Pager,
    Card,
    PendingMessage,
    List,
} from '@the-deep/deep-ui';
import { MdPlaylistAddCheck } from 'react-icons/md';
import { IoCheckmarkDone } from 'react-icons/io5';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';

import {
    Assignment,
    MultiResponse,
} from '#types';

import _ts from '#ts';

import AssignmentItem from './AssignmentItem';
import styles from './styles.css';

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
            failureHeader: _ts('assignment', 'assignmentListFetchFailed'),
        },
    );

    const {
        pending: markAsDonePending,
        trigger: triggerMarkAsDone,
    } = useLazyRequest<MultiResponse<Assignment>, number>(
        {
            url: (ctx) => `server://assignments/${ctx}/`,
            method: 'PUT',
            body: { is_done: true },
            onSuccess: () => {
                getAssignments();
            },
            failureHeader: _ts('assignment', 'markAsDoneFailed'),
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
            failureHeader: _ts('assignment', 'markBulkAsDoneFailed'),
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
            heading={_ts('assignment', 'myAssignments')}
            headerActions={(
                assignmentsResponse && assignmentsResponse.count > 0 && (
                    <Button
                        name={undefined}
                        onClick={handleBulkActionClick}
                        disabled={bulkPending}
                        variant="action"
                        title={_ts('assignment', 'markAllAsDone')}
                    >
                        <IoCheckmarkDone />
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
                {pending && <PendingMessage />}
                {(assignmentsResponse?.results ?? []).length > 0 ? (
                    <List
                        data={assignmentsResponse?.results}
                        keySelector={keySelector}
                        renderer={AssignmentItem}
                        rendererParams={rendererParams}
                    />
                ) : (
                    <div className={styles.emptyMessage}>
                        <MdPlaylistAddCheck className={styles.icon} />
                        <div className={styles.text}>
                            {/* FIXME: use strings with appropriate wording */}
                            You do not have any assignments
                        </div>
                    </div>
                )}
            </Card>
        </Container>
    );
}

export default Assignments;
