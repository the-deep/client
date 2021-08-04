import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import ReactMarkdown from 'react-markdown';

import FormattedDate from '#rscv/FormattedDate';
import Avatar from '#newComponents/ui/Avatar';
import CommaSeparateItems from '#components/viewer/CommaSeparateItems';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { EntryComment } from '#typings';
import _ts from '#ts';

import EditCommentForm from './EditCommentForm';
import styles from './styles.scss';

interface Props {
    className?: string;
    comment: EntryComment;
    activeUser: {
        userId: number;
    };
}

const commentTypeToTextMap: {[id: number]: string} = {
    0: _ts('entryReview', 'commented'),
    1: _ts('entryReview', 'verified'),
    2: _ts('entryReview', 'unverified'),
    3: _ts('entryReview', 'controlled'),
    4: _ts('entryReview', 'uncontrolled'),
};

function Comment(props: Props) {
    const {
        className,
        comment: commentFromProps,
        activeUser,
    } = props;

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

    const isEditable = useMemo(() =>
        activeUser.userId === createdByDetails?.id && latest && !editMode,
    [activeUser, createdByDetails, latest, editMode]);

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
        <div
            className={_cs(styles.comment, className)}
        >
            <Avatar
                className={styles.displayPicture}
                src={createdByDetails?.displayPictureUrl}
                name={createdByDetails?.name}
            />
            <div
                className={styles.content}
            >
                <div className={styles.heading}>
                    <span className={styles.detail}>
                        <span className={styles.name}>{createdByDetails?.name}</span>
                        &nbsp;
                        {_ts('entryReview', 'commentType', { commentType: commentTypeToTextMap[commentType] })}
                        &nbsp;
                        <FormattedDate
                            value={createdAt}
                            mode="dd-MMM-yyyy"
                        />
                        &nbsp;
                        {mentionedUsersDetails.length > 0 && _ts('entryReview', 'assignedItTo')}
                        &nbsp;
                        <CommaSeparateItems
                            items={mentionedUsersDetails}
                        />
                        {textHistory.length > 1 && (
                            <span className={styles.modified}>
                                &nbsp;
                                {_ts('entryReview', 'lastModified')}
                                &nbsp;
                                <FormattedDate
                                    value={latest.createdAt}
                                    mode="dd-MMM-yyyy"
                                />
                            </span>
                        )}
                    </span>
                    {isEditable && (
                        <PrimaryButton
                            onClick={handleEditClick}
                            transparent
                            title={_ts('entryReview', 'editComment')}
                            iconName="edit"
                        />
                    )}
                </div>
                {editMode ? (
                    <EditCommentForm
                        comment={comment}
                        onEditSuccess={handleSuccess}
                        onEditCancel={handleCancel}
                    />
                ) : (
                    <div>
                        <ReactMarkdown
                            source={latest?.text}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Comment;
