import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition, ObjectSchema } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import MultiSelectInput from '#rsci/MultiSelectInput';
import RadioInput from '#rsci/RadioInput';
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

interface Review {
    text?: string;
    comment_type?: number; // eslint-disable-line camelcase
    mentioned_users?: number[]; // eslint-disable-line camelcase
}

interface Props {
    className?: string;
    isControlled: boolean;
    isApproved: boolean;
    onSuccess: () => void;
    entryId: number;
    projectId: number;
    pristine: boolean;
    setPristine: (value: boolean) => void;
}

interface ReviewType {
    id: number;
    label: string;
}

const reviewTypeKeySelector = (d: ReviewType) => d.id;
const reviewTypeLabelSelector = (d: ReviewType) => d.label;

const commentRequiredTypes = [0, 2, 4];

function Review(props: Props) {
    const {
        className,
        isControlled,
        isApproved,
        entryId,
        projectId,
        pristine,
        setPristine,
        onSuccess,
    } = props;

    const [faramValues, setFaramValues] = useState<Review | undefined>();
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();

    const commentRequired = commentRequiredTypes.some(v => v === faramValues?.['comment_type']) ? [requiredCondition] : [];

    const schema: ObjectSchema = {
        fields: {
            text: commentRequired,
            comment_type: [requiredCondition],
            mentioned_users: commentRequired,
        },
    };

    const [
        reviewPending,
        ,
        ,
        postReview,
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
            notifyOnFailure(_ts('entryReview', 'reviewHeading'))({ error: errorBody });
        },
    });

    const [
        projectMembersPending,
        projectMembersResponse,
    ] = useProjectMemberListQuery(projectId);

    const reviewTypes: ReviewType[] = useMemo(() => ([
        { id: 0, label: _ts('entryReview', 'comment') },
        isApproved ? { id: 2, label: _ts('entryReview', 'unapprove') }
            : { id: 1, label: _ts('entryReview', 'approve') },
        isControlled ? { id: 4, label: _ts('entryReview', 'uncontrol') }
            : { id: 3, label: _ts('entryReview', 'control') },
    ]), [isApproved, isControlled]);

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setPristine(false);
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
        if (newFaramValues?.['comment_type']) {
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
        postReview();
    }, [setPristine, postReview]);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    return (
        <Faram
            className={_cs(className, styles.review)}
            onChange={handleFaramChange}
            onValidationFailure={handleFaramValidationFailure}
            onValidationSuccess={handleFaramValidationSuccess}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={reviewPending || projectMembersPending}
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
            <RadioInput
                className={styles.types}
                faramElementName="comment_type"
                options={reviewTypes}
                keySelector={reviewTypeKeySelector}
                labelSelector={reviewTypeLabelSelector}
            />
            <MultiSelectInput
                faramElementName="mentioned_users"
                label={_ts('entryReview', 'assignees')}
                options={projectMembersResponse?.results}
                keySelector={memberKeySelector}
                labelSelector={memberNameSelector}
            />
            <PrimaryButton
                className={styles.submitButton}
                type="submit"
                disabled={pristine}
                pending={reviewPending}
            >
                {_ts('entryReview', 'review')}
            </PrimaryButton>
        </Faram>
    );
}

export default Review;
