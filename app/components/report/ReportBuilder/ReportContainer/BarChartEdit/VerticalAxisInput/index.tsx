import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    Container,
    SelectInput,
    ColorInput,
    TextInput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { IoTrash } from 'react-icons/io5';

import {
    NewEnumEntity,
    newEnumKeySelector,
    newEnumLabelSelector,
} from '#utils/common';
import {
    AnalysisReportAggregationTypeEnum,
    AnalysisReportVariableType,
} from '#generated/types';
import {
    type FinalVerticalAxisType,
} from '../../../../schema';

import styles from './styles.css';

type VerticalAxisType = FinalVerticalAxisType;

const columnKeySelector = (item: AnalysisReportVariableType) => item.clientId ?? '';
const columnLabelSelector = (item: AnalysisReportVariableType) => item.name ?? '';

const defaultVerticalAxis = (): VerticalAxisType => ({
    clientId: randomString(),
});

interface Props {
    value: VerticalAxisType;
    onChange: (
        value: SetValueArg<VerticalAxisType>,
        index: number,
    ) => void | undefined;
    onRemove: (index: number) => void;
    index: number;
    error: Error<VerticalAxisType> | undefined;
    aggregationTypeOptions: NewEnumEntity<AnalysisReportAggregationTypeEnum>[];
    columns: AnalysisReportVariableType[] | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

function VerticalAxisInput(props: Props) {
    const {
        value,
        onChange,
        index,
        error: riskyError,
        onRemove,
        aggregationTypeOptions,
        columns,
        disabled,
        readOnly,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultVerticalAxis,
    );

    return (
        <Container
            className={styles.verticalAxisInput}
            heading={`Item: ${index + 1}`}
            headingSize="extraSmall"
            headerActions={!readOnly && (
                <QuickActionButton
                    title="Remove Attributes"
                    name={index}
                    onClick={onRemove}
                    disabled={disabled}
                >
                    <IoTrash />
                </QuickActionButton>
            )}
            contentClassName={styles.verticalAxisItemContent}
        >
            <TextInput
                label="Label"
                name="label"
                value={value?.label}
                onChange={onFieldChange}
                error={error?.label}
                disabled={disabled}
            />
            <SelectInput
                label="Column"
                name="field"
                value={value?.field}
                onChange={onFieldChange}
                keySelector={columnKeySelector}
                labelSelector={columnLabelSelector}
                error={error?.field}
                options={columns}
                disabled={disabled}
            />
            <SelectInput
                label="Aggregation"
                name="aggregationType"
                value={value?.aggregationType}
                onChange={onFieldChange}
                error={error?.aggregationType}
                keySelector={newEnumKeySelector}
                labelSelector={newEnumLabelSelector}
                options={aggregationTypeOptions}
            />
            <ColorInput
                value={value?.color}
                name="color"
                onChange={onFieldChange}
            />
        </Container>
    );
}

export default VerticalAxisInput;
