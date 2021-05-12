import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition, ObjectSchema } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import NonFieldErrors from '#rsci/NonFieldErrors';

import { useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import {
    EntryComment,
    FaramErrors,
} from '#typings';

import styles from './styles.scss';

interface Props {
    className?: string;
    onEditSuccess: (response: EntryComment) => void;
    onEditCancel: () => void;
    comment: EntryComment;
}
interface Comment {
    text?: string;
    commentType?: number;
    mentionedUsers?: number[];
}
function EditCommentForm(props: Props) {
    const {
        className,
        comment,
        onEditSuccess,
        onEditCancel,
    } = props;

    const [pristine, setPristine] = useState<boolean>(true);
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();
    const [faramValues, setFaramValues] = useState<Comment | undefined>({
        text: comment.textHistory[0]?.text,
        commentType: comment.commentType,
        mentionedUsers: comment.mentionedUsers,
    });

    const schema: ObjectSchema = {
        fields: {
            text: [requiredCondition],
        },
    };

    const {
        pending: commentEditPending,
        trigger: editComment,
    } = useLazyRequest<EntryComment>({
        url: `server://v2/entries/${comment.entry}/review-comments/${comment.id}/`,
        method: 'PUT',
        body: ctx => ctx,
        onSuccess: (response) => {
            setPristine(true);
            setFaramValues(undefined);
            onEditSuccess(response);
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('entryReview', 'commentHeading'))({ error: errorBody });
        },
    });

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setPristine(false);
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
    }, [setPristine]);

    const handleFaramValidationSuccess = useCallback((newFaramValues) => {
        editComment(newFaramValues);
    }, [editComment]);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    const handleCancel = useCallback(() => {
        setFaramValues(undefined);
        setPristine(true);
        onEditCancel();
    }, [onEditCancel]);

    return (
        <Faram
            className={_cs(className, styles.editComment)}
            onChange={handleFaramChange}
            onValidationFailure={handleFaramValidationFailure}
            onValidationSuccess={handleFaramValidationSuccess}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={commentEditPending}
        >
            <NonFieldErrors
                faramElement
                persistent={false}
            />
            <TextArea
                faramElementName="text"
                rows={3}
                autoFocus
            />
            <div className={styles.buttons}>
                <DangerButton
                    className={styles.cancelButton}
                    pending={commentEditPending}
                    onClick={handleCancel}
                >
                    {_ts('entryReview', 'editCommentCancel')}
                </DangerButton>
                <PrimaryButton
                    type="submit"
                    disabled={pristine}
                    pending={commentEditPending}
                >
                    {_ts('entryReview', 'editCommentUpdate')}
                </PrimaryButton>
            </div>
        </Faram>
    );
}

export default EditCommentForm;
