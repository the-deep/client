import React, { useState, useCallback, useMemo } from 'react';
import {
    Container,
    ConfirmButton,
    Pager,
    ListView,
} from '@the-deep/deep-ui';
import { IoCheckmarkDone } from 'react-icons/io5';
import { gql, useQuery } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import { useLazyRequest } from '#base/utils/restRequest';
import { MultiResponse } from '#types';
import {
    GetAssignmentsQuery,
    GetAssignmentsQueryVariables,
} from '#generated/types';
import _ts from '#ts';

import AssignmentItem from './AssignmentItem';
import styles from './styles.css';

const GET_ASSIGNMENTS = gql`
    query GetAssignments(
        $isDone: Boolean,
        $page: Int,
        $pageSize: Int,
    ) {
        assignment(
        isDone: $isDone,
        page: $page,
        pageSize: $pageSize,
        ) {
            results {
                id
                createdAt
                isDone
                createdBy {
                    displayName
                    id
                    emailDisplay
                }
                project {
                    id
                    title
                    isPrivate
                }
                contentType
                leadType {
                    title
                    id
                }
                entryType {
                    id
                }
            }
            totalCount
        }
    }
`;

    interface BulkResponse {
    assignmentUpdated: number;
}

const maxItemsPerPage = 5;
type Assignment = NonNullable<NonNullable<GetAssignmentsQuery['assignment']>['results']>[number];
const keySelector = (info: Assignment) => Number(info.id);

function Assignments() {
    const [page, setPage] = useState<number>(1);

    const variables = useMemo(
        () => ({
            is_done: false, // 1: Unknown | 2: True | 3: False
            page,
            pageSize: maxItemsPerPage,
        }), [page],
    );

    const {
        loading,
        data,
        refetch: getAssignments,
    } = useQuery<GetAssignmentsQuery, GetAssignmentsQueryVariables>(
        GET_ASSIGNMENTS,
        {
            variables,
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
            failureMessage: _ts('assignment', 'markAsDoneFailed'),
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
            failureMessage: _ts('assignment', 'markBulkAsDoneFailed'),
        },
    );

    const handleBulkActionClick = useCallback(
        () => {
            triggerBulkAsDone(null);
        },
        [triggerBulkAsDone],
    );

    const rendererParams = useCallback(
        (
            _: number,
            info: Assignment,
        ) => ({
            ...info,
            handleClick: triggerMarkAsDone,
            markAsDonePending,
        }),
        [triggerMarkAsDone, markAsDonePending],
    );

    const assignmentsResponse = removeNull(data?.assignment);
    const assignmentCount = assignmentsResponse?.totalCount ?? 0;

    return (
        <Container
            heading={_ts('assignment', 'myAssignments')}
            headerActions={(
                assignmentsResponse && assignmentCount > 0 && (
                    <ConfirmButton
                        name={undefined}
                        onConfirm={handleBulkActionClick}
                        message="Are you sure you want to clear all your assignments? This cannot be undone."
                        disabled={bulkPending}
                        variant="action"
                        title={_ts('assignment', 'markAllAsDone')}
                    >
                        <IoCheckmarkDone />
                    </ConfirmButton>
                )
            )}
            className={styles.assignments}
            footerActions={(assignmentCount > maxItemsPerPage) && (
                <Pager
                    activePage={page}
                    itemsCount={assignmentCount}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setPage}
                    itemsPerPageControlHidden
                    infoVisibility="hidden"
                    pagesControlLabelHidden
                    pageNextPrevControlHidden
                />
            )}
            contentClassName={styles.content}
        >
            <ListView
                className={styles.assignmentList}
                data={assignmentsResponse?.results}
                keySelector={keySelector}
                renderer={AssignmentItem}
                rendererParams={rendererParams}
                emptyMessage="You do not have any assignments."
                pending={loading}
                errored={false}
                // NOTE: Nothing to filter here
                filtered={false}
                messageIconShown
                messageShown
            />
        </Container>
    );
}

export default Assignments;
