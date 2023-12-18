import React from 'react';
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
import { _cs, randomString } from '@togglecorp/fujs';
import { IoTrash } from 'react-icons/io5';

import { EnumOptions } from '#types/common';
import {
    GetAttributesOptionsQuery,
    AssessmentRegistryDataCollectionTechniqueTypeEnum,
    AssessmentRegistrySamplingApproachTypeEnum,
    AssessmentRegistryProximityTypeEnum,
    AssessmentRegistryUnitOfAnalysisTypeEnum,
    AssessmentRegistryUnitOfReportingTypeEnum,
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
    className?: string;
    itemClassName?: string;
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
    readOnly?: boolean;
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
        readOnly,
        className,
        itemClassName,
    } = props;

    const error = getErrorObject(riskyError);

    const onAttributeChange = useFormObject(
        index,
        onChange,
        defaultMethodologyAttributeValue,
    );

    const disableOtherFields = value.dataCollectionTechnique === 'SECONDARY_DATA_REVIEW';

    return (
        <div className={_cs(styles.attributesForm, className)}>
            <div className={itemClassName}>
                <SelectInput
                    className={styles.attributeInput}
                    label="Data collection technique"
                    placeholder="Select an option"
                    name="dataCollectionTechnique"
                    options={options?.dataCollectionTechniqueOptions?.enumValues as EnumOptions<
                        AssessmentRegistryDataCollectionTechniqueTypeEnum
                    >}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={value.dataCollectionTechnique}
                    error={error?.dataCollectionTechnique}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            </div>
            <div className={itemClassName}>
                <div className={styles.samplingInput}>
                    <NumberInput
                        className={styles.attributeInput}
                        label="Sampling size"
                        name="samplingSize"
                        onChange={onAttributeChange}
                        error={error?.samplingSize}
                        value={!disableOtherFields ? value.samplingSize : undefined}
                        disabled={disabled || disableOtherFields}
                        readOnly={readOnly}
                    />
                    <SelectInput
                        className={styles.attributeInput}
                        label="Sampling approach"
                        placeholder="Select an option"
                        name="samplingApproach"
                        options={options?.samplingApproach?.enumValues as EnumOptions<
                            AssessmentRegistrySamplingApproachTypeEnum
                        >}
                        keySelector={enumKeySelector}
                        labelSelector={enumLabelSelector}
                        onChange={onAttributeChange}
                        value={!disableOtherFields ? value.samplingApproach : undefined}
                        error={error?.samplingApproach}
                        disabled={disabled || disableOtherFields}
                        readOnly={readOnly}
                    />
                </div>
            </div>
            <div className={itemClassName}>
                <SelectInput
                    className={styles.attributeInput}
                    label="Proximity"
                    placeholder="Select an option"
                    name="proximity"
                    options={options?.proximity?.enumValues as EnumOptions<
                        AssessmentRegistryProximityTypeEnum
                    >}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={!disableOtherFields ? value.proximity : undefined}
                    error={error?.proximity}
                    disabled={disabled || disableOtherFields}
                    readOnly={readOnly}
                />
            </div>
            <div className={itemClassName}>
                <SelectInput
                    className={styles.attributeInput}
                    label="Unit of analysis"
                    placeholder="Select an option"
                    name="unitOfAnalysis"
                    options={options?.unitOfAnanlysis?.enumValues as EnumOptions<
                        AssessmentRegistryUnitOfAnalysisTypeEnum
                    >}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={!disableOtherFields ? value.unitOfAnalysis : undefined}
                    error={error?.unitOfAnalysis}
                    disabled={disabled || disableOtherFields}
                    readOnly={readOnly}
                />
            </div>
            <div className={itemClassName}>
                <SelectInput
                    className={styles.attributeInput}
                    label="Unit of reporting"
                    placeholder="Select an option"
                    name="unitOfReporting"
                    options={options?.unitOfReporting?.enumValues as EnumOptions<
                        AssessmentRegistryUnitOfReportingTypeEnum
                    >}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    onChange={onAttributeChange}
                    value={!disableOtherFields ? value.unitOfReporting : undefined}
                    error={error?.unitOfReporting}
                    disabled={disabled || disableOtherFields}
                    readOnly={readOnly}
                />
            </div>
            <QuickActionButton
                title="Remove Attributes"
                name={index}
                onClick={onRemove}
                className={_cs(styles.removeButton, itemClassName)}
            >
                <IoTrash />
            </QuickActionButton>
        </div>
    );
}

export default MethodologyAttributesInput;
