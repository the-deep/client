import React from 'react';
import { IoTrash } from 'react-icons/io5';
import {
    NumberInput,
    QuickActionButton,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';
import {
    GetAttributesOptionsQuery,
} from '#generated/types';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';

import { MethodologyAttributesType } from '../../formSchema';

import styles from './styles.css';

const defaultMethodologyAttributeValue = (): MethodologyAttributesType => ({
    clientId: randomString(),
});

interface Props {
    value: MethodologyAttributesType;
    onChange: (
        value: SetValueArg<MethodologyAttributesType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    index: number;
    error: Error<MethodologyAttributesType> | undefined;
    options: GetAttributesOptionsQuery | undefined;
    disabled?: boolean;
    readonly?: boolean;
}

function MethodologyAttributesInput(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
        options,
        disabled,
        readonly,
    } = props;

    const error = getErrorObject(riskyError);

    const onAttributeChange = useFormObject(
        index,
        onChange,
        defaultMethodologyAttributeValue,
    );

    return (
        <div className={styles.attributesForm}>
            <SelectInput
                className={styles.attributeInput}
                label="Data collection technique"
                placeholder="Select an option"
                name="dataCollectionTechnique"
                options={options?.dataCollectionTechniqueOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.dataCollectionTechnique}
                error={error?.dataCollectionTechnique}
                disabled={disabled}
                readOnly={readonly}
            />
            <div className={styles.samplingInput}>
                <NumberInput
                    className={styles.attributeInput}
                    label="Sampling size"
                    name="samplingSize"
                    onChange={onAttributeChange}
                    value={value.samplingSize}
                    error={error?.samplingSize}
                    disabled={disabled}
                    readOnly={readonly}
                />
                <SelectInput
                    className={styles.attributeInput}
                    label="Sampling approach"
                    placeholder="Select an option"
                    name="samplingApproach"
                    options={options?.samplingApproach?.enumValues}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={value.samplingApproach}
                    error={error?.samplingApproach}
                    disabled={disabled}
                    readOnly={readonly}
                />
            </div>
            <SelectInput
                className={styles.attributeInput}
                label="Proximity"
                placeholder="Select an option"
                name="proximity"
                options={options?.proximity?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.proximity}
                error={error?.proximity}
                disabled={disabled}
                readOnly={readonly}
            />
            <SelectInput
                className={styles.attributeInput}
                label="Unit of analysis"
                placeholder="Select an option"
                name="unitOfAnalysis"
                options={options?.unitOfAnanlysis?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.unitOfAnalysis}
                error={error?.unitOfAnalysis}
                disabled={disabled}
                readOnly={readonly}
            />
            <SelectInput
                className={styles.attributeInput}
                label="Unit of reporting"
                placeholder="Select an option"
                name="unitOfReporting"
                options={options?.unitOfReporting?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                onChange={onAttributeChange}
                value={value.unitOfReporting}
                error={error?.unitOfReporting}
                disabled={disabled}
                readOnly={readonly}
            />
            <QuickActionButton
                title="Remove Attributes"
                name={index}
                onClick={onRemove}
                className={styles.removeButton}
            >
                <IoTrash />
            </QuickActionButton>
        </div>
    );
}

export default MethodologyAttributesInput;
