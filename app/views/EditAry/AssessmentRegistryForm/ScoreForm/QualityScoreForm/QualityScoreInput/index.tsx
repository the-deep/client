import React from 'react';
import { ScaleInput, TextInput } from '@the-deep/deep-ui';
import { randomString } from '@togglecorp/fujs';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { AssessmentRegistryRatingType, AssessmentRegistryScoreCriteriaTypeEnum } from '#generated/types';
import { ScoreRatingsType } from '../../../formSchema';

import styles from './styles.css';

type Option = {
    key: AssessmentRegistryRatingType;
    color: string;
    label: string;
}

const optionKeySelector = (option: Option) => option.key;
const optionLabelSelector = (option: Option) => option.label;
const optionColorSelector = (option: Option) => option.color;

const scaleOptions: Option[] = [
    {
        key: 'VERY_POOR',
        color: '#9CC2E5',
        label: 'Very poor',
    },
    {
        key: 'POOR',
        color: '#BDD6EE',
        label: 'Poor',
    },
    {
        key: 'FAIR',
        color: '#DEEAF6',
        label: 'Fair',
    },
    {
        key: 'GOOD',
        color: '#E2EFD9',
        label: 'Good',
    },
    {
        key: 'VERY_GOOD',
        color: '#A8D08D',
        label: 'Very Good',
    },
];

export interface Props {
    scoreCriteria: string;
    value: ScoreRatingsType | undefined;
    name: number | undefined;
    onChange: (value: SetValueArg<ScoreRatingsType>, name: number | undefined) => void;
    error: Error<ScoreRatingsType>;
    scoreType: AssessmentRegistryScoreCriteriaTypeEnum;
}

function QualityScoreInput(props: Props) {
    const {
        scoreCriteria,
        value,
        onChange,
        name,
        scoreType,
        error: riskyError,
    } = props;

    const onScoreRatingChange = useFormObject(name, onChange, {
        clientId: randomString(),
        scoreType,
    });
    const error = getErrorObject(riskyError);

    return (
        <div className={styles.scoreInput}>
            <div className={styles.criteriaHeading}>
                {scoreCriteria}
            </div>
            <ScaleInput
                className={styles.criteriaHeading}
                name="rating"
                value={value?.rating}
                spacing="comfortable"
                onChange={onScoreRatingChange}
                options={scaleOptions}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                colorSelector={optionColorSelector}
                error={error?.rating}
            />
            <TextInput
                className={styles.justification}
                name="reason"
                value={value?.reason}
                onChange={onScoreRatingChange}
                error={error?.reason}
            />
        </div>
    );
}

export default QualityScoreInput;
