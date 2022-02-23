import React, { useState, useCallback, useMemo, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
    DateOutput,
    Container,
    Card,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import UserContext from '#base/context/UserContext';
import CommaSeparatedItems from '#components/CommaSeparatedItems';
import { commentTypeToTextMap } from '#components/entryReview/commentConstants';
import { EntryComment } from '#types';
import EditCommentForm from './EditCommentForm';

import styles from './styles.css';

interface Props {
    className?: string;
    projectId: string;
    comment: EntryComment;
}

function Comment(props: Props) {
    const {
        className,
        comment: commentFromProps,
        projectId,
    } = props;

    const { user } = useContext(UserContext);
    const [comment, setComment] = useState<EntryComment>(commentFromProps);
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
    } = comment;

    const isEditable = useMemo(() => (
        user?.id === createdBy?.id && text
    ), [user, createdBy, text]);

    const handleSuccess = useCallback((value: EntryComment) => {
        setComment(value);
        hideEditModal();
    }, [hideEditModal]);

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
                        keySelector={(mentionedUser) => mentionedUser.id}
                        labelSelector={(mentionedUser) => mentionedUser.displayName ?? '?'}
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
                        <QuickActionButton
                            name="editButton"
                            onClick={showEditModal}
                            title="Edit comment"
                        >
                            <FiEdit2 />
                        </QuickActionButton>
                    )}
                </div>
            </>
        </Container>
    );
}

export default Comment;
