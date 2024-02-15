import React from 'react';
import { NumberInput } from '@the-deep/deep-ui';
import { randomString } from '@togglecorp/fujs';
import {
    Error,
    getErrorObject,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { SubDimensionMetaInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import { AssessmentRegistrySectorTypeEnum, AssessmentRegistrySummaryFocusDimensionTypeEnum } from '#generated/types';

import styles from './styles.css';

interface Props {
    name?: number;
    value?:SubDimensionMetaInputType;
    onChange: (value: SetValueArg<SubDimensionMetaInputType>, name?: number) => void;
    error: Error<SubDimensionMetaInputType>;
    sector: AssessmentRegistrySectorTypeEnum;
    dimension?: AssessmentRegistrySummaryFocusDimensionTypeEnum;
}

function SummaryDimensionMetaInput(props: Props) {
    const {
        name,
        value,
        onChange,
        error: riskyError,
        sector,
        dimension,
    } = props;

    const error = getErrorObject(riskyError);
    const onValueChange = useFormObject(name, onChange, {
        clientId: randomString(),
        sector,
    });

    return (
        <>
            {dimension === 'IMPACT' && (
                <NumberInput
                    className={styles.inputMetadata}
                    inputSectionClassName={styles.inputSection}
                    label="Total people affected"
                    placeholder="write your number here"
                    name="totalPeopleAffected"
                    onChange={onValueChange}
                    value={value?.totalPeopleAffected}
                    error={error?.totalPeopleAffected}
                    disabled={false}
                />
            )}
            {dimension === 'HUMANITARIAN_CONDITIONS' && (
                <div className={styles.metaInput}>
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        label="Total Moderate"
                        placeholder="write your number here"
                        name="totalModerate"
                        onChange={onValueChange}
                        error={error?.totalModerate}
                        value={value?.totalModerate}
                        disabled={false}
                    />
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="write your number here"
                        label="Total Severe"
                        name="totalSevere"
                        onChange={onValueChange}
                        value={value?.totalSevere}
                        error={error?.totalSevere}
                        disabled={false}
                    />
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="write your number here"
                        label="Total Critical"
                        name="totalCritical"
                        onChange={onValueChange}
                        value={value?.totalCritical}
                        error={error?.totalCritical}
                        disabled={false}
                    />
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        label="Total in need"
                        placeholder="write your number here"
                        name="totalInNeed"
                        onChange={onValueChange}
                        value={value?.totalInNeed}
                        error={error?.totalInNeed}
                        disabled={false}
                    />
                </div>
            )}
        </>
    );
}
export default SummaryDimensionMetaInput;
