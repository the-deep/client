import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition, ObjectSchema } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import MultiSelectInput from '#rsci/MultiSelectInput';
import RadioInput from '#rsci/RadioInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';

import {
    FaramErrors,
} from '#typings';

import styles from './styles.scss';

interface Props {
    className?: string;
    isControlled: boolean;
    isAssigned: boolean;
}
interface FaramValues {}
interface Member {
    id: number;
    name: string;
}

interface ReviewType {
    id: number;
    label: string;
}

const members: Member[] = [
    { id: 1, name: 'sameer' },
    { id: 2, name: 'navin' },
    { id: 3, name: 'rishi' },
];

const memberKeySelector = (d: Member) => d.id;
const memberNameSelector = (d: Member) => d.name;
const reviewTypeKeySelector = (d: ReviewType) => d.id;
const reviewTypeLabelSelector = (d: ReviewType) => d.label;

function Review(props: Props) {
    const {
        className,
        isControlled,
        isAssigned,
    } = props;

    const schema: ObjectSchema = {
        fields: {
            comment: [],
            assignees: [],
            reviewType: [requiredCondition],
        },
    };
    const [faramValues, setFaramValues] = useState<FaramValues>();
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();
    const [pristine, setPristine] = useState<boolean>(true);

    const reviewTypes: ReviewType[] = useMemo(() => ([
        { id: 1, label: 'comment' },
        isAssigned ? { id: 2, label: 'remove assignment' } : { id: 2, label: 'assign' },
        isControlled ? { id: 3, label: 'remove control' } : { id: 3, label: 'control' },
    ]), [isAssigned, isControlled]);

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setPristine(false);
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((_, finalValues) => {
        setPristine(true);
    }, []);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    const pending = false;
    return (
        <Faram
            className={_cs(className, styles.review)}
            onChange={handleFaramChange}
            onValidationFailure={handleFaramValidationFailure}
            onValidationSuccess={handleFaramValidationSuccess}
            schema={schema}
            value={faramValues}
            error={faramErrors}
        >
            <NonFieldErrors
                faramElement
            />
            <TextArea
                faramElementName="comment"
                label="Comment"
                rows={4}
                autoFocus
            />
            <MultiSelectInput
                faramElementName="assignees"
                label="Assignees"
                options={members}
                keySelector={memberKeySelector}
                labelSelector={memberNameSelector}
            />
            <RadioInput
                className={styles.types}
                faramElementName="reviewType"
                options={reviewTypes}
                keySelector={reviewTypeKeySelector}
                labelSelector={reviewTypeLabelSelector}
            />
            <PrimaryButton
                className={styles.submitButton}
                type="submit"
                disabled={pristine}
                pending={pending}
            >
                Review
            </PrimaryButton>
        </Faram>
    );
}

export default Review;
