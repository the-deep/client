import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Pager,
    QuickActionButton,
    ListView,
    Kraken,
    Modal,
} from '@the-deep/deep-ui';
import {
    IoChatboxOutline,
} from 'react-icons/io5';

import {
    EntryComment,
} from '#types';
import {
    ReviewCommentsQuery,
    ReviewCommentsQueryVariables,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';

import Comment from './Comment';
import CommentForm from './CommentForm';
import styles from './styles.css';

const REVIEW_COMMENTS = gql`
    query ReviewComments(
        $projectId: ID!,
        $ordering: [EntryReviewCommentOrderingEnum!],
        $page: Int,
        $pageSize: Int,
        $entry: ID!,
        ) {
        project(id: $projectId) {
            id
            entry(id: $entry) {
                id
                createdBy {
                    id
                    displayName
                }
            }
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
                        organization
                        displayPictureUrl
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

const commentKeySelector = (d: EntryComment) => d.id;
const maxItemsPerPage = 50;

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

    const commentVariables = useMemo(
        (): ReviewCommentsQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                entry: entryId,
                page: activePage,
                pageSize: maxItemsPerPage,
            } : undefined
        ),
        [
            projectId,
            entryId,
            activePage,
        ],
    );

    const {
        data: commentsResponse,
        loading: commentsPending,
        refetch: getComments,
    } = useQuery<ReviewCommentsQuery, ReviewCommentsQueryVariables>(
        REVIEW_COMMENTS,
        {
            skip: !isCommentModalShown,
            variables: commentVariables,
        },
    );

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

    const commentAssignee = commentsResponse?.project?.entry?.createdBy;

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
                            itemsCount={commentsResponse?.project?.reviewComments?.totalCount ?? 0}
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
                        data={commentsResponse?.project?.reviewComments?.results}
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
                    {commentsResponse && (
                        <CommentForm
                            entryId={entryId}
                            projectId={projectId}
                            commentAssignee={commentAssignee}
                            onSave={handleEntryCommentSave}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default EntryComments;
