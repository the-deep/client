import React, { useState, useCallback, useMemo } from 'react';
import {
    Container,
    ConfirmButton,
    Pager,
    ListView,
    useAlert,
} from '@the-deep/deep-ui';
import { IoCheckmarkDone } from 'react-icons/io5';
import { gql, useMutation, useQuery } from '@apollo/client';
import { removeNull } from '@togglecorp/toggle-form';

import {
    AssignmentBulkStatusUpdateMutation,
    AssignmentBulkStatusUpdateMutationVariables,
    AssignmentStatusUpdateMutation,
    AssignmentStatusUpdateMutationVariables,
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

const UPDATE_ASSIGNMENT_STATUS = gql`
    mutation AssignmentStatusUpdate(
        $id: ID!,
        $isDone: Boolean!,
    ) {
        assignmentStatusUpdate(id: $id, isDone: $isDone) {
            ok
            errors
            result {
                id
                isDone
            }
        }
    }
`;

const UPDATE_ASSIGNMENT_BULK_STATUS = gql`
    mutation AssignmentBulkStatusUpdate(
        $isDone: Boolean!,
    ) {
        assignmentBulkStatusUpdate(isDone: $isDone) {
            ok
            errors
            result {
                id
                isDone
            }
        }
    }
`;

const maxItemsPerPage = 5;
export type Assignment = NonNullable<NonNullable<GetAssignmentsQuery['assignment']>['results']>[number];
const keySelector = (info: Assignment) => info.id;

function Assignments() {
    const [page, setPage] = useState<number>(1);
    const alert = useAlert();

    const variables = useMemo(
        () => ({
            isDone: false,
            page,
            pageSize: maxItemsPerPage,
        }),
        [page],
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

    const [
        triggerAssignmentStatusUpdate,
        { loading: assignmentStatusUpdatePending },
    ] = useMutation<AssignmentStatusUpdateMutation, AssignmentStatusUpdateMutationVariables>(
        UPDATE_ASSIGNMENT_STATUS,
        {
            onCompleted: (response) => {
                const { ok, errors } = removeNull(response?.assignmentStatusUpdate);
                if (ok) {
                    alert.show(
                        'Successfully marked as read.',
                        { variant: 'success' },
                    );
                    getAssignments();
                }

                if (errors) {
                    alert.show(
                        'Failed to mark as read.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to mark as read.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        triggerBulkAction,
        { loading: bulkActionPending },
    ] = useMutation<
        AssignmentBulkStatusUpdateMutation,
        AssignmentBulkStatusUpdateMutationVariables
    >(
        UPDATE_ASSIGNMENT_BULK_STATUS,
        {
            onCompleted: (response) => {
                const { ok, errors } = removeNull(response?.assignmentBulkStatusUpdate);
                if (ok) {
                    alert.show(
                        'Successfully marked all as read.',
                        { variant: 'success' },
                    );
                    getAssignments();
                }

                if (errors) {
                    alert.show(
                        'Failed to mark all as read.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to mark all as read.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleBulkActionClick = useCallback(
        () => {
            triggerBulkAction({
                variables: {
                    isDone: true,
                },
            });
        },
        [triggerBulkAction],
    );

    const handleAssignmentStatusUpdate = useCallback(
        (id: string) => {
            triggerAssignmentStatusUpdate({
                variables: {
                    id,
                    isDone: true,
                },
            });
        },
        [triggerAssignmentStatusUpdate],
    );

    const rendererParams = useCallback(
        (
            _: string,
            info: Assignment,
        ) => ({
            ...info,
            handleClick: handleAssignmentStatusUpdate,
            markAsDonePending: assignmentStatusUpdatePending,
        }),
        [handleAssignmentStatusUpdate, assignmentStatusUpdatePending],
    );

    const assignmentsResponse = removeNull(data?.assignment);
    const assignmentCount = assignmentsResponse?.totalCount ?? 0;

    return (
        <Container
            className={styles.assignments}
            contentClassName={styles.content}
            heading={_ts('assignment', 'myAssignments')}
            headerActions={(
                assignmentsResponse && assignmentCount > 0 && (
                    <ConfirmButton
                        name={undefined}
                        onConfirm={handleBulkActionClick}
                        message="Are you sure you want to clear all your assignments? This cannot be undone."
                        disabled={bulkActionPending}
                        variant="action"
                        title={_ts('assignment', 'markAllAsDone')}
                    >
                        <IoCheckmarkDone />
                    </ConfirmButton>
                )
            )}
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
