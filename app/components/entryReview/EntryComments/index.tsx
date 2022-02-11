import React, { useCallback, useState, useMemo } from 'react';
import {
    isNotDefined,
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Pager,
    QuickActionButton,
    ListView,
    Kraken,
    Modal,
    useSortState,
} from '@the-deep/deep-ui';
import {
    IoChatboxOutline,
} from 'react-icons/io5';

import {
    MultiResponse,
    EntryComment,
    EntryReviewSummary,
} from '#types';
import {
    ReviewCommentsQuery,
    ReviewCommentsQueryVariables,
    EntryReviewCommentOrderingEnum,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';
import { useRequest } from '#base/utils/restRequest';

import Comment from './Comment';
import CommentForm from './CommentForm';
import styles from './styles.css';

const REVIEW_COMMENTS = gql`
    query ReviewComments(
        $projectId: ID!,
        $ordering: [EntryReviewCommentOrderingEnum!],
        $page: Int,
        $pageSize: Int,
        $entry: ID,
        ) {
        project(id: $projectId) {
            reviewComments (
                entry: $entry,
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
            ) {
                page
                pageSize
                totalCount
                results {
                    commentType
                    commentTypeDisplay
                    createdAt
                    createdBy {
                        displayName
                        id
                        organization
                    }
                    entry
                    id
                    text
                    mentionedUsers {
                        displayName
                        id
                    }
                }
            }
        }
    }
`;

export interface Props {
    className?: string;
    activityCount?: number;
    entryId: string;
    projectId: string;
    onEntryCommentAdd?: () => void;
}

interface MultiResponseWithSummary<T> extends MultiResponse<T> {
    summary: EntryReviewSummary;
}

const commentKeySelector = (d: EntryComment) => d.id;
const maxItemsPerPage = 50;
const defaultSorting = {
    name: 'CREATED_AT',
    direction: 'Descending',
};

function EntryComments(props: Props) {
    const {
        className,
        entryId,
        projectId,
        activityCount = 0,
        onEntryCommentAdd,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [
        isCommentModalShown,
        showCommentModal,
        hideCommentModal,
    ] = useModalState(false);

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? `ASC_${validSorting.name}`
        : `DESC_${validSorting.name}`;

    const {
        pending: commentsPending,
        response: commentsResponse,
        // retrigger: getComments,
    } = useRequest<MultiResponseWithSummary<EntryComment>>({
        skip: !isCommentModalShown,
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'GET',
        preserveResponse: true,
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
    });
    console.log('REST DATA comments:>>', commentsResponse);

    const commentVariables = useMemo(
        (): ReviewCommentsQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                entry: entryId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering: [ordering as EntryReviewCommentOrderingEnum],
            } : undefined
        ),
        [projectId, entryId]);

    const {
        previousData,
        data: reviewComments = previousData,
        loading: reviewCommentsPending,
        refetch: getComments,
    } = useQuery<ReviewCommentsQuery, ReviewCommentsQueryVariables>(
        REVIEW_COMMENTS,
        {
            skip: !isCommentModalShown,
            variables: commentVariables,
        },
    );
    console.log('GQL data for comments::>>', reviewComments);

    const handleEntryCommentSave = useCallback(() => {
        getComments();
        if (onEntryCommentAdd) {
            onEntryCommentAdd();
        }
    }, [getComments, onEntryCommentAdd]);

    const commentRendererParams = useCallback((_, comment: EntryComment) => ({
        comment,
        projectId,
    }), [projectId]);

    return (
        <>
            <QuickActionButton
                title="Entry comments"
                className={_cs(styles.commentButton, className)}
                onClick={showCommentModal}
                name={entryId}
            >
                <IoChatboxOutline />
                {activityCount > 0 && (
                    <div className={styles.commentCount}>
                        {activityCount}
                    </div>
                )}
            </QuickActionButton>
            {isCommentModalShown && (
                <Modal
                    className={styles.entryCommentModal}
                    heading="Entry Comments"
                    freeHeight
                    onCloseButtonClick={hideCommentModal}
                    bodyClassName={styles.modalBody}
                    footerActions={(
                        <Pager
                            activePage={activePage}
                            itemsCount={commentsResponse?.count ?? 0}
                            maxItemsPerPage={maxItemsPerPage}
                            onActivePageChange={setActivePage}
                            itemsPerPageControlHidden
                            hidePageNumberLabel
                            hideInfo
                            hidePrevAndNext
                        />
                    )}
                >
                    <ListView
                        data={commentsResponse?.results}
                        className={styles.commentList}
                        keySelector={commentKeySelector}
                        rendererParams={commentRendererParams}
                        renderer={Comment}
                        pending={commentsPending}
                        filtered={false}
                        errored={false}
                        emptyIcon={(
                            <Kraken
                                variant="work"
                            />
                        )}
                        emptyMessage="No comments found"
                        messageIconShown
                        messageShown
                    />
                    <CommentForm
                        entryId={entryId}
                        projectId={projectId}
                        onSave={handleEntryCommentSave}
                    />
                </Modal>
            )}
        </>
    );
}

export default EntryComments;
