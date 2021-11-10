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
            headerClassName={styles.header}
            headingSize="extraSmall"
            headingContainerClassName={styles.headingContainer}
            headingClassName={styles.heading}
            heading={(
                <>
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
                            className={styles.comment}
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
                </>
            )}
            footerActionsContainerClassName={styles.footerActions}
            footerActions={mentionedUsersDetails.length > 0 && (
                <>
                    Assigned to
                    <CommaSeparateItems
                        className={styles.users}
                        items={mentionedUsersDetails}
                    />
                </>
            )}
            contentClassName={styles.content}
        >
            <>
                <DateOutput
                    className={styles.date}
                    value={createdAt}
                    format="MMM dd, yyyy . hh:mm aaa"
                />
                {isEditable && (
                    <QuickActionButton
                        className={styles.button}
                        name="editButton"
                        onClick={showEditModal}
                        title="Edit comment"
                    >
                        <FiEdit2 />
                    </QuickActionButton>
                )}
            </>
        </Container>
    );
}

export default Comment;
