import React from 'react';
import { ScaleInput, TextInput } from '@the-deep/deep-ui';
import { AssessmentRegistryRatingType } from '#generated/types';

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

function QualityScoreInput() {
    const [scaleValue, setScaleValue] = React.useState();
    const [text, setText] = React.useState<string | undefined>('');

    return (
        <>
            <div className={styles.scoreInput}>
                <div className={styles.criteriaHeading}>
                    Relavance
                </div>
                <ScaleInput
                    className={styles.criteriaHeading}
                    name={undefined}
                    value={scaleValue}
                    onChange={setScaleValue}
                    options={scaleOptions}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    colorSelector={optionColorSelector}
                />
                <TextInput
                    className={styles.justification}
                    name=""
                    value={text}
                    onChange={setText}
                />
            </div>
            <div className={styles.scoreInput}>
                <div className={styles.criteriaHeading}>
                    Relavance
                </div>
                <ScaleInput
                    className={styles.criteriaHeading}
                    name={undefined}
                    value={scaleValue}
                    onChange={setScaleValue}
                    options={scaleOptions}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    colorSelector={optionColorSelector}
                />
                <TextInput
                    className={styles.justification}
                    name=""
                    value={text}
                    onChange={setText}
                />
            </div>
            <div className={styles.scoreInput}>
                <div className={styles.criteriaHeading}>
                    Relavance
                </div>
                <ScaleInput
                    className={styles.criteriaHeading}
                    name={undefined}
                    value={scaleValue}
                    onChange={setScaleValue}
                    options={scaleOptions}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    colorSelector={optionColorSelector}
                />
                <TextInput
                    className={styles.justification}
                    name=""
                    value={text}
                    onChange={setText}
                />
            </div>
        </>
    );
}

export default QualityScoreInput;
