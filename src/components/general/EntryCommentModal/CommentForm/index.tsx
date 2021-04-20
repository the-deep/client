import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition, ObjectSchema } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import MultiSelectInput from '#rsci/MultiSelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import useProjectMemberListQuery, {
    memberKeySelector,
    memberNameSelector,
} from '#hooks/useProjectMemberListQuery';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import { FaramErrors } from '#typings';

import styles from './styles.scss';

interface Comment {
    text?: string;
    commentType?: number; // eslint-disable-line camelcase
    mentionedUsers?: number[]; // eslint-disable-line camelcase
}

interface Props {
    className?: string;
    onSuccess: () => void;
    entryId?: number;
    projectId: number;
    pristine: boolean;
    setPristine: (value: boolean) => void;
}

function CommentForm(props: Props) {
    const {
        className,
        entryId,
        projectId,
        pristine,
        setPristine,
        onSuccess,
    } = props;

    const [faramValues, setFaramValues] = useState<Comment | undefined>({
        commentType: 0,
    });
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();

    const schema: ObjectSchema = {
        fields: {
            text: [requiredCondition],
            commentType: [requiredCondition],
            mentionedUsers: [requiredCondition],
        },
    };

    const [
        commentPending,
        ,
        ,
        postComment,
    ] = useRequest<unknown>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: faramValues,
        onSuccess: () => {
            onSuccess();
            setFaramErrors(undefined);
            setFaramValues(undefined);
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('entryReview', 'commentHeading'))({ error: errorBody });
        },
    });

    const [
        projectMembersPending,
        projectMembersResponse,
    ] = useProjectMemberListQuery(projectId);

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setPristine(false);
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
        if (newFaramValues?.commentType) {
            setFaramErrors(undefined);
        }
    }, [setPristine]);

    const handleFaramValidationSuccess = useCallback((_, newFaramValues) => {
        if (newFaramValues?.text === '') {
            setFaramValues(oldFaramValues => ({
                ...oldFaramValues,
                text: undefined,
            }));
        }
        setPristine(true);
        postComment();
    }, [setPristine, postComment]);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    return (
        <Faram
            className={_cs(className, styles.comment)}
            onChange={handleFaramChange}
            onValidationFailure={handleFaramValidationFailure}
            onValidationSuccess={handleFaramValidationSuccess}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={commentPending || projectMembersPending}
        >
            <NonFieldErrors
                faramElement
                persistent={false}
            />
            <TextArea
                faramElementName="text"
                label={_ts('entryReview', 'comment')}
                rows={3}
                autoFocus
            />
            <MultiSelectInput
                faramElementName="mentionedUsers"
                label={_ts('entryReview', 'assignees')}
                options={projectMembersResponse?.results}
                keySelector={memberKeySelector}
                labelSelector={memberNameSelector}
            />
            <PrimaryButton
                className={styles.submitButton}
                type="submit"
                disabled={pristine}
                pending={commentPending}
            >
                {_ts('entryReview', 'comment')}
            </PrimaryButton>
        </Faram>
    );
}

export default CommentForm;
