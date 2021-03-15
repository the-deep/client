import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import ReactMarkdown from 'react-markdown';

import FormattedDate from '#rscv/FormattedDate';
import DisplayPicture from '#components/viewer/DisplayPicture';
import CommaSeparateItems from '#components/viewer/CommaSeparateItems';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { EntryComment } from '#typings';
import _ts from '#ts';

import CommentForm from './CommentForm';
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
    1: _ts('entryReview', 'approved'),
    2: _ts('entryReview', 'unapproved'),
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
        createdByDetail,
        commentType,
        mentionedUsersDetail,
        createdAt,
    } = comment;
    const [latest] = textHistory;

    const isEditable = useMemo(() =>
        activeUser.userId === createdByDetail.id && latest && !editMode,
    [activeUser, createdByDetail, latest, editMode]);

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
            <DisplayPicture
                className={styles.displayPicture}
                url={createdByDetail.displayPicture}
            />
            <div
                className={styles.content}
            >
                <div className={styles.heading}>
                    <span className={styles.detail}>
                        <span className={styles.name}>{createdByDetail.name}</span>
                        <span>
                            &nbsp;
                            {_ts('entryReview', 'commentType', { commentType: commentTypeToTextMap[commentType] })}
                            &nbsp;
                            <FormattedDate
                                value={createdAt}
                                mode="dd-MMM-yyyy"
                            />
                            &nbsp;
                            {mentionedUsersDetail.length > 0 && _ts('entryReview', 'assignedItTo')}
                            &nbsp;
                        </span>
                        <span>
                            <CommaSeparateItems
                                items={mentionedUsersDetail}
                            />
                        </span>
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
                    <CommentForm
                        comment={comment}
                        onEditSuccess={handleSuccess}
                        onEditCancel={handleCancel}
                    />
                ) : (
                    <div>
                        <ReactMarkdown
                            source={latest ? latest.text : undefined}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Comment;
