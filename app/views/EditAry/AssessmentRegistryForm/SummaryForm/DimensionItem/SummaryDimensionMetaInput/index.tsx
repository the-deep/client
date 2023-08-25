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
    className?: string;
    name?: number;
    value?:SubDimensionMetaInputType;
    onChange: (value: SetValueArg<SubDimensionMetaInputType>, name?: number) => void;
    error: Error<SubDimensionMetaInputType>;
    sector?: AssessmentRegistrySectorTypeEnum;
    dimension?: AssessmentRegistrySummaryFocusDimensionTypeEnum;
}

function SummaryDimensionMetaInput(props: Props) {
    const {
        className,
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
        focus: sector,
    });

    return (
        <>
            {dimension === 'IMPACT' && (
                <NumberInput
                    className={styles.inputMetadata}
                    inputSectionClassName={styles.inputSection}
                    placeholder="Total people assessed"
                    name="totalPeopleAffected"
                    onChange={onValueChange}
                    value={value?.totalPeopleAffected}
                    disabled={false}
                />
            )}
            {dimension === 'HUMANITARIAN_CONDITIONS' && (
                <div className={styles.metaInput}>
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="Total Moderate:"
                        name="totalPeopleAffected"
                        onChange={onValueChange}
                        value={value?.totalPeopleAffected}
                        disabled={false}
                    />
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="Total Severe:"
                        name="totalPeopleAffected"
                        onChange={onValueChange}
                        value={value?.totalPeopleAffected}
                        disabled={false}
                    />
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="Total Critical:"
                        name="totalPeopleAffected"
                        onChange={onValueChange}
                        value={value?.totalPeopleAffected}
                        disabled={false}
                    />
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        placeholder="Total in need:"
                        name="totalPeopleAffected"
                        onChange={onValueChange}
                        value={value?.totalPeopleAffected}
                        disabled={false}
                    />
                </div>
            )}
        </>
    );
}
export default SummaryDimensionMetaInput;
