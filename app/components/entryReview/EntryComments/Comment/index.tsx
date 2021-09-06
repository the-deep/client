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
                    {createdByDetails?.name}
                    &nbsp;
                    <span className={styles.details}>
                        {`${commentTypeToTextMap[commentType]} the entry on`}
                    </span>
                </>
            )}
            headerActions={(
                <>
                    <DateOutput
                        value={createdAt}
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
            )}
            footerContentClassName={styles.footerContent}
            footerContent={mentionedUsersDetails.length > 0 && (
                <>
                    Assigned to
                    &nbsp;
                    <CommaSeparateItems
                        className={styles.users}
                        items={mentionedUsersDetails}
                    />
                </>
            )}
            footerActionsContainerClassName={styles.footerActions}
            footerActions={textHistory.length > 1 && (
                <span className={styles.modified}>
                    &nbsp;
                    Last modified on
                    &nbsp;
                    <DateOutput
                        value={latest.createdAt}
                    />
                </span>
            )}
        >
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
        </Container>
    );
}

export default Comment;
