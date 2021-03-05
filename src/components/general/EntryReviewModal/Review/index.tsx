import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition, ObjectSchema } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import MultiSelectInput from '#rsci/MultiSelectInput';
import RadioInput from '#rsci/RadioInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import {
    FaramErrors, MultiResponse,
} from '#typings';

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

interface Member {
    id: number;
    displayName: string;
}

interface ReviewType {
    id: number;
    label: string;
}

const memberKeySelector = (d: Member) => d.id;
const memberNameSelector = (d: Member) => d.displayName;
const reviewTypeKeySelector = (d: ReviewType) => d.id;
const reviewTypeLabelSelector = (d: ReviewType) => d.label;

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

    const schema: ObjectSchema = {
        fields: {
            text: [],
            comment_type: [requiredCondition],
            mentioned_users: [requiredCondition],
        },
    };

    const [faramValues, setFaramValues] = useState<Review | undefined>();
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();

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
            setFaramValues(undefined);
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('entryReview', 'reviewHeading'))({ error: errorBody });
        },
    });

    const [
        projectMembersPending,
        projectMembersResponse,
    ] = useRequest<MultiResponse<Member>>({
        url: `server://v2/projects/${projectId}/members/`,
        method: 'GET',
        query: {
            fields: ['id', 'display_name'],
        },
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('entryReview', 'reviewHeading'))({ error: errorBody });
        },
    });

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
    }, [setPristine]);

    const handleFaramValidationSuccess = useCallback(() => {
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
            <MultiSelectInput
                faramElementName="mentioned_users"
                label={_ts('entryReview', 'assignees')}
                options={projectMembersResponse?.results}
                keySelector={memberKeySelector}
                labelSelector={memberNameSelector}
            />
            <RadioInput
                className={styles.types}
                faramElementName="comment_type"
                options={reviewTypes}
                keySelector={reviewTypeKeySelector}
                labelSelector={reviewTypeLabelSelector}
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
