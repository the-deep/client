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

    return (
        <div className={_cs(styles.attributesForm, className)}>
            <SelectInput
                className={_cs(styles.attributeInput, itemClassName)}
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
                readOnly={readOnly}
            />
            <div className={itemClassName}>
                <div className={styles.samplingInput}>
                    <NumberInput
                        className={styles.attributeInput}
                        label="Sampling size"
                        name="samplingSize"
                        onChange={onAttributeChange}
                        value={value.samplingSize}
                        error={error?.samplingSize}
                        disabled={disabled}
                        readOnly={readOnly}
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
                        readOnly={readOnly}
                    />
                </div>
            </div>
            <SelectInput
                className={_cs(styles.attributeInput, itemClassName)}
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
                readOnly={readOnly}
            />
            <SelectInput
                className={_cs(styles.attributeInput, itemClassName)}
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
                readOnly={readOnly}
            />
            <SelectInput
                className={_cs(styles.attributeInput, itemClassName)}
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
                readOnly={readOnly}
            />
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
