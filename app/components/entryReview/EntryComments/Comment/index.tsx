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
import CommaSeparateItems from '#components/CommaSeparateItems';
import { commentTypeToTextMap } from '#components/entryReview/commentConstants';
import { EntryComment } from '#types';
import EditCommentForm from './EditCommentForm';

import styles from './styles.css';

interface Props {
    className?: string;
    comment: EntryComment;
}

function Comment(props: Props) {
    const {
        className,
        comment: commentFromProps,
    } = props;

    const { user } = useContext(UserContext);
    const [comment, setComment] = useState<EntryComment>(commentFromProps);
    const [
        isEditModalVisible,
        showEditModal,
        hideEditModal,
    ] = useModalState(false);

    const {
        textHistory,
        createdByDetails,
        commentType,
        mentionedUsersDetails,
        createdAt,
    } = comment;
    const [latest] = textHistory;

    const isEditable = useMemo(() => (
        user?.id === createdByDetails?.id.toString() && latest
    ), [user, createdByDetails, latest]);

    const handleSuccess = useCallback((value: EntryComment) => {
        setComment(value);
        hideEditModal();
    }, [hideEditModal]);

    return (
        <Container
            className={_cs(styles.commentContainer, className)}
            headingSize="extraSmall"
            headerActionsContainerClassName={styles.headerActions}
            headerActions={mentionedUsersDetails.length > 0 && (
                <>
                    Assigned to
                    <CommaSeparateItems
                        items={mentionedUsersDetails}
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
                    <span className={styles.userName}>
                        {createdByDetails?.name}
                    </span>
                    &nbsp;
                    {commentType !== 0 && (
                        <span className={styles.details}>
                            {`${commentTypeToTextMap[commentType]} the entry.`}
                        </span>
                    )}
                    {isEditModalVisible ? (
                        <EditCommentForm
                            className={styles.editComment}
                            comment={comment}
                            onEditSuccess={handleSuccess}
                            onEditCancel={hideEditModal}
                        />
                    ) : (latest?.text && (
                        <Card
                            className={styles.comment}
                        >
                            {latest.text}
                        </Card>
                    ))}
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
