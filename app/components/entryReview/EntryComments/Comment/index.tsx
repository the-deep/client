import React, { useState, useCallback, useMemo, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
    DateOutput,
    Container,
    Card,
    QuickActionConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';
import {
    IoTrashBinOutline,
} from 'react-icons/io5';
import { gql, useMutation } from '@apollo/client';
import { useModalState } from '#hooks/stateManagement';
import UserContext from '#base/context/UserContext';
import CommaSeparatedItems from '#components/CommaSeparatedItems';
import { commentTypeToTextMap } from '#components/entryReview/commentConstants';
import {
    ReviewCommentsQuery,
} from '#generated/types';
import EditCommentForm from './EditCommentForm';

import styles from './styles.css';

const DELETE_REVIEW_COMMENT = gql`
mutation DeleteComment(
    $projectId: ID!,
    $id: ID!,
) {
    project(id: $projectId) {
        id
        entryReviewCommentDelete(id: $id) {
            result {
                id
                entry
                text
                mentionedUsers {
                  id
                  displayName
                }
            }
            errors
            ok
        }
    }
}
`;

type CommentItem = NonNullable<NonNullable<NonNullable<NonNullable<ReviewCommentsQuery>['project']>['reviewComments']>['results']>[number];

interface Props {
    className?: string;
    projectId: string;
    comment: CommentItem;
}

type MentionedUserType = NonNullable<CommentItem['mentionedUsers']>[number];

const handleKeySelector = (value: MentionedUserType) => (value.id);
const handleLabelSelector = (value: MentionedUserType) => (value.displayName ?? value.id);

function Comment(props: Props) {
    const {
        className,
        comment: commentFromProps,
        projectId,
    } = props;

    const { user } = useContext(UserContext);
    const alert = useAlert();
    const [comment, setComment] = useState<CommentItem>(commentFromProps);
    const [
        isEditModalVisible,
        showEditModal,
        hideEditModal,
    ] = useModalState(false);

    const {
        text,
        createdBy,
        commentType,
        mentionedUsers,
        createdAt,
        id: commentID,
    } = comment;

    const isEditable = useMemo(() => (
        user?.id === createdBy?.id && text
    ), [user, createdBy, text]);

    const [
        deleteEntry,
        { loading: deleteCommentPending },
    ] = useMutation(
        DELETE_REVIEW_COMMENT,
        {
            refetchQueries: ['ReviewComments'],
            onCompleted: (response) => {
                const {
                    ok,
                } = response.project.entryReviewCommentDelete;
                if (ok) {
                    alert.show(
                        'Successfully deleted comment.',
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to delete comment.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete comment.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSuccess = useCallback((value: CommentItem) => {
        setComment(value);
        hideEditModal();
    }, [hideEditModal]);

    const handleDeleteComment = useCallback((commentId: string | undefined) => {
        deleteEntry({
            variables: {
                projectId,
                id: commentId,
            },
        });
    }, [
        deleteEntry,
        projectId,
    ]);

    return (
        <Container
            className={_cs(styles.commentContainer, className)}
            headingSize="extraSmall"
            headerActionsContainerClassName={styles.headerActions}
            headerActions={mentionedUsers.length > 0 && (
                <>
                    Assigned to
                    <CommaSeparatedItems
                        className={styles.assignees}
                        items={mentionedUsers}
                        keySelector={handleKeySelector}
                        labelSelector={handleLabelSelector}
                    />
                </>
            )}
            contentClassName={styles.content}
        >
            <>
                <div className={_cs(
                    styles.commentSection,
                    isEditModalVisible && styles.inline,
                )}
                >
                    <div className={styles.userAction}>
                        <span className={styles.userName}>
                            {createdBy?.displayName}
                        </span>
                        &nbsp;
                        {commentType && (
                            <span className={styles.details}>
                                {`${commentTypeToTextMap[commentType]} the entry.`}
                            </span>
                        )}
                    </div>
                    {isEditModalVisible ? (
                        <EditCommentForm
                            className={styles.editComment}
                            comment={comment}
                            projectId={projectId}
                            onEditSuccess={handleSuccess}
                            onEditCancel={hideEditModal}
                        />
                    ) : (
                        <Card
                            className={styles.comment}
                        >
                            {text}
                        </Card>
                    )}
                </div>
                <div className={styles.info}>
                    <DateOutput
                        className={styles.date}
                        value={createdAt}
                        format="hh:mm aaa, MMM dd, yyyy"
                    />
                    {isEditable && !isEditModalVisible && (
                        <div className={styles.commentAction}>
                            <QuickActionButton
                                name="editButton"
                                onClick={showEditModal}
                                title="Edit comment"
                            >
                                <FiEdit2 />
                            </QuickActionButton>

                            <QuickActionConfirmButton
                                name={undefined}
                                onConfirm={() => handleDeleteComment(commentID)}
                                message="Are you sure you want to delete the comment?"
                                disabled={deleteCommentPending}
                            >
                                <IoTrashBinOutline />
                            </QuickActionConfirmButton>
                        </div>
                    )}
                </div>
            </>
        </Container>
    );
}

export default Comment;
