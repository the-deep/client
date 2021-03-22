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
    commentType?: number; // eslint-disable-line camelcase
    mentionedUsers?: number[]; // eslint-disable-line camelcase
}

interface Props {
    className?: string;
    isVerified: boolean;
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
        isVerified,
        isApproved,
        entryId,
        projectId,
        pristine,
        setPristine,
        onSuccess,
    } = props;

    const [faramValues, setFaramValues] = useState<Review | undefined>({
        commentType: 0,
    });
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();

    const commentRequired = commentRequiredTypes.some(v => v === faramValues?.['commentType']) ? [requiredCondition] : [];

    const schema: ObjectSchema = {
        fields: {
            text: commentRequired,
            commentType: [requiredCondition],
            mentionedUsers: commentRequired,
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
        isVerified ? { id: 4, label: _ts('entryReview', 'unverify') }
            : { id: 3, label: _ts('entryReview', 'verify') },
    ]), [isApproved, isVerified]);

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setPristine(false);
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
        if (newFaramValues?.['commentType']) {
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
                faramElementName="commentType"
                options={reviewTypes}
                keySelector={reviewTypeKeySelector}
                labelSelector={reviewTypeLabelSelector}
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
                pending={reviewPending}
            >
                {_ts('entryReview', 'review')}
            </PrimaryButton>
        </Faram>
    );
}

export default Review;
