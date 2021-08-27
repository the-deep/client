import React, { useState, useCallback, useMemo, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
    DateOutput,
    Container,
    Card,
} from '@the-deep/deep-ui';

import UserContext from '#base/context/UserContext';
import CommaSeparateItems from '#components/CommaSeparateItems';

import { EntryComment } from '#types';
import EditCommentForm from './EditCommentForm';
import styles from './styles.css';

interface Props {
    className?: string;
    comment: EntryComment;
}

const commentTypeToTextMap: { [id: number]: string } = {
    0: 'commented',
    1: 'verified',
    2: 'unverified',
    3: 'controlled',
    4: 'uncontrolled',
};

function Comment(props: Props) {
    const {
        className,
        comment: commentFromProps,
    } = props;

    const { user } = useContext(UserContext);
    const [comment, setComment] = useState<EntryComment>(commentFromProps);
    const [editMode, setEditMode] = useState<boolean>(false);

    const {
        textHistory,
        createdByDetails,
        commentType,
        mentionedUsersDetails,
        createdAt,
    } = comment;
    const [latest] = textHistory;

    const isEditable = useMemo(() => (
        user?.id === createdByDetails?.id.toString() && latest && !editMode
    ), [user, createdByDetails, latest, editMode]);

    const handleEditClick = useCallback(() => {
        setEditMode(true);
    }, []);

    const handleCancel = useCallback(() => {
        setEditMode(false);
    }, []);

    const handleSuccess = useCallback((value: EntryComment) => {
        setComment(value);
        setEditMode(false);
    }, []);

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
                            onClick={handleEditClick}
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
            {editMode ? (
                <EditCommentForm
                    className={styles.comment}
                    comment={comment}
                    onEditSuccess={handleSuccess}
                    onEditCancel={handleCancel}
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
