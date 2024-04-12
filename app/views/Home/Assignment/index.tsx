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

import _ts from '#ts';
import {
    AssignmentBulkStatusMarkAsDoneMutation,
    AssignmentBulkStatusMarkAsDoneMutationVariables,
    AssignmentUpdateMutation,
    AssignmentUpdateMutationVariables,
    GetAssignmentsQuery,
    GetAssignmentsQueryVariables,
} from '#generated/types';

import AssignmentItem from './AssignmentItem';
import styles from './styles.css';

const GET_ASSIGNMENTS = gql`
    query GetAssignments(
        $isDone: Boolean,
        $page: Int,
        $pageSize: Int,
    ) {
        assignments(
        isDone: $isDone,
        page: $page,
        pageSize: $pageSize,
        ) {
            results {
                id
                createdAt
                createdBy {
                    displayName
                    id
                    emailDisplay
                }
                project {
                    id
                    title
                }
                isDone
                objectId
                contentData {
                    contentType
                    lead {
                        id
                        title
                    }
                    entryReviewComment {
                        entryId
                        leadId
                        id
                    }
                }
            }
            totalCount
        }
    }
`;

const UPDATE_ASSIGNMENT_STATUS = gql`
    mutation AssignmentUpdate(
        $data: AssignmentInputType!,
        $id: ID!
    ) {
        assignmentUpdate(data: $data, id: $id) {
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
    mutation AssignmentBulkStatusMarkAsDone {
        assignmentBulkStatusMarkAsDone {
            ok
            errors
        }
    }
`;

const maxItemsPerPage = 5;
export type Assignment = NonNullable<NonNullable<GetAssignmentsQuery['assignments']>['results']>[number];
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
    ] = useMutation<AssignmentUpdateMutation, AssignmentUpdateMutationVariables>(
        UPDATE_ASSIGNMENT_STATUS,
        {
            onCompleted: (response) => {
                const { ok } = removeNull(response?.assignmentUpdate);
                if (ok) {
                    alert.show(
                        'Successfully marked as read.',
                        { variant: 'success' },
                    );
                    getAssignments();
                } else {
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
        AssignmentBulkStatusMarkAsDoneMutation,
        AssignmentBulkStatusMarkAsDoneMutationVariables
    >(
        UPDATE_ASSIGNMENT_BULK_STATUS,
        {
            onCompleted: (response) => {
                const { ok } = removeNull(response?.assignmentBulkStatusMarkAsDone);
                if (ok) {
                    alert.show(
                        'Successfully marked all as read.',
                        { variant: 'success' },
                    );
                    getAssignments();
                } else {
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

    const handleAssignmentStatusUpdate = useCallback(
        (id: string) => {
            triggerAssignmentStatusUpdate({
                variables: {
                    id,
                    data: {
                        isDone: true,
                    },
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

    const assignmentsResponse = removeNull(data?.assignments);
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
                        onConfirm={triggerBulkAction}
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
